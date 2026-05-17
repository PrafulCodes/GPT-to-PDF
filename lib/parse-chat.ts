import { load } from 'cheerio';

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'unknown';
  html: string;
};

export type ParsedConversation = {
  title: string;
  messages: Message[];
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToSafeHtml(text: string): string {
  const escaped = escapeHtml(text.trim());
  const withBreaks = escaped.replace(/\r\n?/g, '\n').replace(/\n/g, '<br/>');
  return `<p>${withBreaks}</p>`;
}

function extractHydrationPayload(html: string): string | null {
  const chunks: string[] = [];
  const re = /streamController\.enqueue\((\"(?:\\.|[^\"])*\")\)/g;

  let match: RegExpExecArray | null = null;
  while ((match = re.exec(html)) !== null) {
    const quoted = match[1];
    try {
      const decoded = JSON.parse(quoted) as string;
      if (decoded.trim().startsWith('[')) {
        chunks.push(decoded);
      }
    } catch {
      // ignore malformed chunk and continue
    }
  }

  if (chunks.length === 0) return null;

  // The initial hydration table is the largest JSON-array chunk.
  chunks.sort((a, b) => b.length - a.length);
  return chunks[0] ?? null;
}

function decodeReferenceTable(payload: string): any {
  const table = JSON.parse(payload) as any[];
  const memo = new Map<number, any>();

  const resolveRef = (value: any): any => {
    if (Number.isInteger(value)) {
      const idx = value as number;
      if (idx < 0) return null;
      if (idx < table.length) return resolveNode(idx);
    }
    return value;
  };

  const resolveNode = (index: number): any => {
    if (memo.has(index)) return memo.get(index);

    const item = table[index];

    if (Array.isArray(item)) {
      const out: any[] = [];
      memo.set(index, out);
      for (const v of item) out.push(resolveRef(v));
      return out;
    }

    if (item && typeof item === 'object') {
      const out: Record<string, any> = {};
      memo.set(index, out);

      for (const [k, v] of Object.entries(item)) {
        if (k.startsWith('_') && /^_\d+$/.test(k)) {
          const realKey = String(resolveRef(Number(k.slice(1))));
          out[realKey] = resolveRef(v);
        } else {
          out[k] = resolveRef(v);
        }
      }

      return out;
    }

    return item;
  };

  return resolveNode(0);
}

function extractMessageText(message: any): string {
  const parts = message?.content?.parts;
  if (!Array.isArray(parts)) return '';

  const textParts = parts
    .map((p: any) => {
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object' && typeof p.text === 'string') return p.text;
      return '';
    })
    .filter(Boolean);

  return textParts.join('\n\n').trim();
}

function parseFromStructuredHydration(html: string): ParsedConversation | null {
  const payload = extractHydrationPayload(html);
  if (!payload) return null;

  try {
    const root = decodeReferenceTable(payload);
    const routeData = root?.loaderData?.['routes/share.$shareId.($action)'];
    const data = routeData?.serverResponse?.data;

    const title =
      (typeof data?.title === 'string' && data.title.trim()) ||
      (typeof routeData?.meta?.pageTitle === 'string' && routeData.meta.pageTitle.trim()) ||
      'ChatGPT Conversation Export';

    const turns = Array.isArray(data?.linear_conversation) ? data.linear_conversation : [];
    const messages: Message[] = [];

    for (const turn of turns) {
      const message = turn?.message;
      const role = message?.author?.role;
      if (role !== 'user' && role !== 'assistant') continue;

      const text = extractMessageText(message);
      if (!text) continue;

      messages.push({ role, html: textToSafeHtml(text) });
    }

    if (messages.length === 0) return null;

    return { title, messages };
  } catch {
    return null;
  }
}

function cleanupCheerio($: ReturnType<typeof load>) {
  // remove scripts/styles
  $('script, noscript, style, iframe').remove();
}

function detectRole(el: any, $: ReturnType<typeof load>): Message['role'] {
  // aria labels
  const aria = $(el).attr('aria-label') || '';
  if (/assistant/i.test(aria)) return 'assistant';
  if (/user|you/i.test(aria)) return 'user';

  // classes
  const cls = ($(el).attr('class') || '').toLowerCase();
  if (cls.includes('assistant') || cls.includes('response') || cls.includes('ai')) return 'assistant';
  if (cls.includes('user') || cls.includes('message-user') || cls.includes('from-user')) return 'user';

  // look for labels inside
  const txt = $(el).text().slice(0, 80);
  if (/^assistant[:\-]/i.test(txt)) return 'assistant';
  if (/^user[:\-]|^you[:\-]/i.test(txt)) return 'user';

  return 'unknown';
}

export function parseChatHtml(html: string): ParsedConversation {
  // Primary strategy: decode structured hydration payload instead of scraping rendered UI.
  const structured = parseFromStructuredHydration(html);
  if (structured) return structured;

  const $ = load(html);
  cleanupCheerio($);

  // Title heuristics
  const title = $('title').first().text() || 'ChatGPT Conversation Export';

  // Try to find obvious container
  let container = $('main, article').first();
  if (!container || container.length === 0) {
    container = $('body');
  }

  // Fallback selectors are intentionally narrow to avoid UI controls.
  const candidates = container.find('[data-message-author-role], article[data-testid*="conversation-turn"]');

  const messages: Message[] = [];

  if (candidates && candidates.length > 0) {
    candidates.each((i, el) => {
      const role = detectRole(el, $);
      const inner = $(el).html() || $(el).text();
      messages.push({ role, html: inner });
    });
  }

  // No broad child-splitting fallback: that tends to capture page chrome controls.

  // Normalize unknown roles by alternating if many unknowns
  const unknowns = messages.filter(m => m.role === 'unknown');
  if (unknowns.length === messages.length) {
    // assume conversation alternating: user, assistant, user...
    messages.forEach((m, idx) => {
      m.role = idx % 2 === 0 ? 'user' : 'assistant';
    });
  } else {
    // map remaining unknowns to assistant for readability
    messages.forEach(m => {
      if (m.role === 'unknown') m.role = 'assistant';
    });
  }

  return { title, messages };
}
