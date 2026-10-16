import { isAllowedChatHost, parseAndValidateChatUrl } from './validate-url';
import { logSecurityEvent } from './security';

const MAX_REDIRECTS = 3;
export const MAX_HTML_BYTES = 8 * 1024 * 1024;
export const CHAT_PAGE_TOO_LARGE_REASON = 'Fetched page is too large to export. Try a shorter conversation.';

function isRedirect(status: number) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function resolveRedirectUrl(location: string, from: URL) {
  try {
    return new URL(location, from);
  } catch {
    return null;
  }
}

export async function readHtmlWithCap(response: Response, signal: AbortSignal) {
  const declaredLengthHeader = response.headers.get('content-length');
  const declaredLength = declaredLengthHeader ? Number(declaredLengthHeader) : null;

  if (declaredLength !== null && Number.isFinite(declaredLength) && declaredLength > MAX_HTML_BYTES) {
    await response.body?.cancel('body too large').catch(() => {});
    logSecurityEvent('warn', 'FETCH_BODY_LIMIT_EXCEEDED', {
      maxBytes: MAX_HTML_BYTES,
      declaredBytes: declaredLength,
      receivedBytes: 0,
      source: 'content-length'
    });
    return { ok: false as const, status: 413, reason: CHAT_PAGE_TOO_LARGE_REASON };
  }

  if (!response.body) {
    return { ok: false as const, status: 502, reason: 'Empty response body' };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      if (signal.aborted) {
        await reader.cancel('aborted').catch(() => {});
        return { ok: false as const, status: 0, reason: 'Fetch timed out' };
      }

      const { value, done } = await reader.read();
      if (done) break;

      const chunk = value || new Uint8Array(0);
      const nextTotal = total + chunk.byteLength;

      if (nextTotal > MAX_HTML_BYTES) {
        await reader.cancel('body too large').catch(() => {});
        logSecurityEvent('warn', 'FETCH_BODY_LIMIT_EXCEEDED', {
          maxBytes: MAX_HTML_BYTES,
          declaredBytes: declaredLength,
          receivedBytes: nextTotal,
          source: 'stream'
        });
        return { ok: false as const, status: 413, reason: CHAT_PAGE_TOO_LARGE_REASON };
      }

      total = nextTotal;
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true as const, html: new TextDecoder().decode(body) };
}

export async function fetchChatPage(url: string, timeoutMs = 10000): Promise<{ ok: true; html: string } | { ok: false; status: number; reason: string }> {
  const startValidation = parseAndValidateChatUrl(url);
  if (!startValidation.ok) {
    return { ok: false, status: 400, reason: startValidation.reason };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let currentUrl = startValidation.url;
  const visited = new Set<string>();

  try {
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      const normalizedCurrent = currentUrl.toString();
      if (visited.has(normalizedCurrent)) {
        logSecurityEvent('warn', 'REDIRECT_LIMIT_EXCEEDED', { url: normalizedCurrent, reason: 'loop_detected' });
        return { ok: false, status: 400, reason: 'Redirect loop detected' };
      }

      visited.add(normalizedCurrent);

      const res = await fetch(normalizedCurrent, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'GPT-to-PDF/1.0 (fetch)',
          Accept: 'text/html,application/xhtml+xml'
        },
        signal: controller.signal
      });

      if (isRedirect(res.status)) {
        const location = res.headers.get('location');
        if (!location) {
          return { ok: false, status: 502, reason: 'Redirect missing location header' };
        }

        const nextUrl = resolveRedirectUrl(location, currentUrl);
        if (!nextUrl) {
          return { ok: false, status: 400, reason: 'Invalid redirect target' };
        }

        if (nextUrl.protocol !== 'https:' || !isAllowedChatHost(nextUrl.hostname)) {
          logSecurityEvent('warn', 'REDIRECT_DOMAIN_BLOCKED', {
            from: normalizedCurrent,
            to: nextUrl.toString()
          });
          return { ok: false, status: 400, reason: 'Redirect target is not allowed' };
        }

        currentUrl = nextUrl;
        continue;
      }

      if (!res.ok) {
        return { ok: false, status: res.status, reason: `Fetch failed with ${res.status}` };
      }

      const body = await readHtmlWithCap(res, controller.signal);
      if (!body.ok) {
        return { ok: false, status: body.status, reason: body.reason };
      }

      return { ok: true, html: body.html };
    }

    logSecurityEvent('warn', 'REDIRECT_LIMIT_EXCEEDED', { url: currentUrl.toString(), maxRedirects: MAX_REDIRECTS });
    return { ok: false, status: 400, reason: 'Too many redirects' };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { ok: false, status: 0, reason: 'Fetch timed out' };
    }

    return { ok: false, status: 0, reason: String(err?.message ?? err) };
  } finally {
    clearTimeout(timeoutId);
  }
}
