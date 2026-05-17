export async function fetchChatPage(url: string, timeoutMs = 10000): Promise<{ ok: true; html: string } | { ok: false; status: number; reason: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'GPT-to-PDF/1.0 (fetch)',
        Accept: 'text/html,application/xhtml+xml'
      },
      signal: controller.signal
    });
    clearTimeout(id);

    if (!res.ok) {
      return { ok: false, status: res.status, reason: `Fetch failed with ${res.status}` };
    }

    const html = await res.text();
    return { ok: true, html };
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      return { ok: false, status: 0, reason: 'Fetch timed out' };
    }
    return { ok: false, status: 0, reason: String(err?.message ?? err) };
  }
}
