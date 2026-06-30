const ALLOWED_CHAT_HOSTS = ['chat.openai.com', 'chatgpt.com', 'shareg.pt', 'share.openai.com'];

export function isAllowedChatHost(hostname: string) {
  const host = hostname.toLowerCase();
  return ALLOWED_CHAT_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

export function parseAndValidateChatUrl(input: unknown): { ok: true; url: URL } | { ok: false; reason: string } {
  if (!input || typeof input !== 'string') {
    return { ok: false, reason: 'Empty or invalid input' };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, reason: 'Empty or invalid input' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'Malformed URL' };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, reason: 'URL must use HTTPS' };
  }

  if (!isAllowedChatHost(parsed.hostname)) {
    return { ok: false, reason: 'URL is not a supported ChatGPT share link' };
  }

  if (!parsed.pathname || parsed.pathname.length < 2) {
    return { ok: false, reason: 'URL path looks malformed' };
  }

  return { ok: true, url: parsed };
}

export function validateChatGptShareUrl(input: unknown): { ok: true; url: string } | { ok: false; reason: string } {
  const result = parseAndValidateChatUrl(input);
  if (!result.ok) {
    return result;
  }

  return { ok: true, url: result.url.toString() };
}
