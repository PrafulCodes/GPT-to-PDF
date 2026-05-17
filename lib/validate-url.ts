export function validateChatGptShareUrl(input: unknown): { ok: true; url: string } | { ok: false; reason: string } {
  if (!input || typeof input !== 'string') {
    return { ok: false, reason: 'Empty or invalid input' };
  }

  let urlStr = input.trim();
  try {
    const url = new URL(urlStr);

    const host = url.hostname.toLowerCase();

    const allowed = [
      'chat.openai.com',
      'chatgpt.com',
      'shareg.pt',
      'share.openai.com'
    ];

    const isAllowed = allowed.some(a => host === a || host.endsWith('.' + a));
    if (!isAllowed) {
      return { ok: false, reason: 'URL is not a supported ChatGPT share link' };
    }

    // basic path check
    if (!url.pathname || url.pathname.length < 2) {
      return { ok: false, reason: 'URL path looks malformed' };
    }

    return { ok: true, url: url.toString() };
  } catch (err) {
    return { ok: false, reason: 'Malformed URL' };
  }
}
