import { isAllowedChatHost, parseAndValidateChatUrl } from './validate-url';
import { logSecurityEvent } from './security';

const MAX_REDIRECTS = 3;
export const MAX_FETCH_ATTEMPTS = 3;
export const MAX_RETRY_DELAY_MS = 3000;
const RETRY_BASE_DELAY_MS = 200;
export const MAX_HTML_BYTES = 8 * 1024 * 1024;
export const CHAT_PAGE_TOO_LARGE_REASON = 'Fetched page is too large to export. Try a shorter conversation.';

export type FetchErrorCategory =
  | 'UPSTREAM_RATE_LIMITED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'REDIRECT_ERROR'
  | 'INVALID_RESPONSE'
  | 'RESPONSE_TOO_LARGE'
  | 'ACCESS_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'INVALID_URL';

export type FetchChatFailure = {
  ok: false;
  status: number;
  reason: string;
  category: FetchErrorCategory;
  attempt: number;
  retriesExhausted: boolean;
  durationMs: number;
};

export type FetchChatOptions = {
  sleep?: (delayMs: number) => Promise<void>;
  random?: () => number;
  signal?: AbortSignal;
};

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

function isTransientStatus(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function categoryForStatus(status: number): FetchErrorCategory {
  if (status === 429) return 'UPSTREAM_RATE_LIMITED';
  if (status === 401 || status === 403) return 'ACCESS_DENIED';
  if (status === 404 || status === 410) return 'RESOURCE_NOT_FOUND';
  if (status >= 500) return 'UPSTREAM_UNAVAILABLE';
  return 'INVALID_RESPONSE';
}

function parseRetryAfter(value: string | null) {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(MAX_RETRY_DELAY_MS, seconds * 1000);

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return Math.min(MAX_RETRY_DELAY_MS, Math.max(0, timestamp - Date.now()));
}

function retryDelay(attempt: number, retryAfter: number | null, random: () => number) {
  if (retryAfter !== null) return retryAfter;
  const exponential = Math.min(MAX_RETRY_DELAY_MS, RETRY_BASE_DELAY_MS * (2 ** (attempt - 1)));
  return Math.min(MAX_RETRY_DELAY_MS, Math.floor(exponential * (0.75 + random() * 0.5)));
}

function defaultSleep(delayMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}

function failure(
  category: FetchErrorCategory,
  status: number,
  reason: string,
  attempt: number,
  startedAt: number,
  retriesExhausted = false
): FetchChatFailure {
  return {
    ok: false,
    status,
    reason,
    category,
    attempt,
    retriesExhausted,
    durationMs: Date.now() - startedAt
  };
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

export async function fetchChatPage(
  url: string,
  timeoutMs = 10000,
  options: FetchChatOptions = {}
): Promise<
  | { ok: true; html: string; status: number; contentType: string | null; finalUrl: string; bytes: number; attempts: number }
  | FetchChatFailure
> {
  const startedAt = Date.now();
  const startValidation = parseAndValidateChatUrl(url);
  if (!startValidation.ok) {
    return failure('INVALID_URL', 400, startValidation.reason, 0, startedAt);
  }

  const sleep = options.sleep || defaultSleep;
  const random = options.random || Math.random;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    if (options.signal?.aborted) {
      return failure('UPSTREAM_TIMEOUT', 0, 'Fetch cancelled', attempt, startedAt);
    }

    const remainingMs = timeoutMs - (Date.now() - startedAt);
    if (remainingMs <= 0) {
      return failure('UPSTREAM_TIMEOUT', 0, 'Fetch timed out', attempt, startedAt, attempt > 1);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), remainingMs);
    const abortAttempt = () => controller.abort();
    options.signal?.addEventListener('abort', abortAttempt, { once: true });
    let currentUrl = startValidation.url;
    const visited = new Set<string>();
    let retryAfter: number | null = null;
    let lastTransientStatus = 503;
    let lastTransientCategory: FetchErrorCategory = 'UPSTREAM_UNAVAILABLE';

    try {
      for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
        const normalizedCurrent = currentUrl.toString();
        if (visited.has(normalizedCurrent)) {
          logSecurityEvent('warn', 'REDIRECT_LIMIT_EXCEEDED', { reason: 'loop_detected' });
          return failure('REDIRECT_ERROR', 400, 'Redirect loop detected', attempt, startedAt);
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
            await res.body?.cancel('redirect missing location').catch(() => {});
            return failure('REDIRECT_ERROR', 502, 'Redirect missing location header', attempt, startedAt);
          }

          const nextUrl = resolveRedirectUrl(location, currentUrl);
          if (!nextUrl) {
            await res.body?.cancel('invalid redirect').catch(() => {});
            return failure('REDIRECT_ERROR', 400, 'Invalid redirect target', attempt, startedAt);
          }

          if (nextUrl.protocol !== 'https:' || !isAllowedChatHost(nextUrl.hostname)) {
            await res.body?.cancel('redirect target not allowed').catch(() => {});
            logSecurityEvent('warn', 'REDIRECT_DOMAIN_BLOCKED', {
              fromHost: currentUrl.hostname,
              toHost: nextUrl.hostname
            });
            return failure('REDIRECT_ERROR', 400, 'Redirect target is not allowed', attempt, startedAt);
          }

          currentUrl = nextUrl;
          continue;
        }

        if (!res.ok) {
          retryAfter = parseRetryAfter(res.headers.get('retry-after'));
          await res.body?.cancel('upstream failure').catch(() => {});
          if (!isTransientStatus(res.status)) {
            return failure(categoryForStatus(res.status), res.status, `Fetch failed with ${res.status}`, attempt, startedAt);
          }
          lastTransientStatus = res.status;
          lastTransientCategory = categoryForStatus(res.status);
          break;
        }

        const body = await readHtmlWithCap(res, controller.signal);
        if (!body.ok) {
          if (body.status === 413) {
            return failure('RESPONSE_TOO_LARGE', body.status, body.reason, attempt, startedAt);
          }
          if (body.status === 0) {
            lastTransientStatus = 0;
            lastTransientCategory = 'UPSTREAM_TIMEOUT';
            if (Date.now() - startedAt >= timeoutMs) {
              return failure('UPSTREAM_TIMEOUT', 0, body.reason, attempt, startedAt, attempt > 1);
            }
            break;
          }
          return failure('INVALID_RESPONSE', body.status, body.reason, attempt, startedAt);
        }

        if (!body.html.trim()) {
          return failure('INVALID_RESPONSE', 502, 'Empty response body', attempt, startedAt);
        }

        return {
          ok: true,
          html: body.html,
          status: res.status,
          contentType: res.headers.get('content-type'),
          finalUrl: normalizedCurrent,
          bytes: new TextEncoder().encode(body.html).byteLength,
          attempts: attempt
        };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        if (options.signal?.aborted) {
          return failure('UPSTREAM_TIMEOUT', 0, 'Fetch cancelled', attempt, startedAt);
        }
        if (Date.now() - startedAt >= timeoutMs) {
          return failure('UPSTREAM_TIMEOUT', 0, 'Fetch timed out', attempt, startedAt, attempt > 1);
        }
        lastTransientStatus = 0;
        lastTransientCategory = 'UPSTREAM_TIMEOUT';
      } else {
        retryAfter = null;
        if (attempt === MAX_FETCH_ATTEMPTS) {
          return failure('NETWORK_ERROR', 0, String(err?.message ?? err), attempt, startedAt, true);
        }
      }
    } finally {
      clearTimeout(timeoutId);
      options.signal?.removeEventListener('abort', abortAttempt);
    }

    if (attempt === MAX_FETCH_ATTEMPTS) {
      return failure(lastTransientCategory, lastTransientStatus, 'Upstream request failed after retries', attempt, startedAt, true);
    }

    const remainingAfterAttempt = timeoutMs - (Date.now() - startedAt);
    const delayMs = retryDelay(attempt, retryAfter, random);
    if (remainingAfterAttempt <= delayMs) {
      return failure('UPSTREAM_TIMEOUT', 0, 'Fetch timed out before retry', attempt, startedAt, true);
    }

    await sleep(delayMs);
  }

  return failure('UPSTREAM_UNAVAILABLE', 503, 'Upstream request failed after retries', MAX_FETCH_ATTEMPTS, startedAt, true);
}
