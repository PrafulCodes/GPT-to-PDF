import { load } from 'cheerio';

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'unknown';
  html: string;
};

export type ParsedConversation = {
  title: string;
  messages: Message[];
  stats?: ConversationStats;
};

export type ConversationStats = {
  messages: number;
  equations: number;
  codeBlocks: number;
  tables: number;
  blockquotes: number;
};

export function getConversationStats(messages: Message[]): ConversationStats {
  const source = messages.map((message) => message.html).join('\n');
  const count = (pattern: RegExp) => (source.match(pattern) || []).length;
  return {
    messages: messages.length,
    equations:
      count(/\\\([\s\S]*?\\\)/g) +
      count(/\\\[[\s\S]*?\\\]/g) +
      count(/\$\$[\s\S]*?\$\$/g) +
      count(/(?<!\\)\$(?!\$)[^\n$]+?(?<!\\)\$(?!\$)/g) +
      count(/\\begin\{(?:align|aligned|gather|equation)\*?\}/g),
    codeBlocks: (source.match(/<pre\b/gi) || []).length,
    tables: (source.match(/<table\b/gi) || []).length,
    blockquotes: (source.match(/<blockquote\b/gi) || []).length
  };
}

const JUNK_TEXT_PATTERNS = [
  /original custom instructions no longer available/i,
  /custom instructions no longer available/i,
  /share chatgpt link/i,
  /shared chatgpt link/i,
  /^generated:\s*/i
];

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToSafeHtml(text: string): string {
  const normalized = normalizePlainText(text);
  if (!normalized) return '';

  return normalized
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

function normalizePlainText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/(?:\n\s*){3,}/g, '\n\n')
    .trim();
}

function containsJunkText(text: string): boolean {
  const normalized = normalizePlainText(text);
  if (!normalized) return false;
  return JUNK_TEXT_PATTERNS.some((pattern) => pattern.test(normalized));
}

function stripJunkFromHtml(html: string): string {
  if (!html) return '';

  const $ = load(`<div id="root">${html}</div>`, undefined, false);
  const root = $('#root');

  root.find('script, noscript, style, iframe, template, svg, canvas, meta, link').remove();
  root.find('[hidden], [aria-hidden="true"], [data-hidden="true"]').remove();

  root.find('*').each((_, element) => {
    const node = $(element);
    const text = normalizePlainText(node.text());

    if (containsJunkText(text)) {
      node.remove();
      return;
    }

    if (!text && node.children().length === 0 && !/^(br|hr|img|table|thead|tbody|tr|td|th|pre|code)$/i.test((element as any).tagName || '')) {
      node.remove();
    }
  });

  root.find('br').each((_, element) => {
    const parent = $(element).parent();
    const siblings = parent.contents().toArray();
    const index = siblings.indexOf(element);
    const prev = siblings[index - 1];
    const next = siblings[index + 1];

    const prevIsBr = Boolean(prev && prev.type === 'tag' && (prev as any).tagName === 'br');
    const nextIsBr = Boolean(next && next.type === 'tag' && (next as any).tagName === 'br');
    if (prevIsBr && nextIsBr) {
      $(element).remove();
    }
  });

  return root.html()?.trim() || '';
}

function buildMessagesFromCandidates($: ReturnType<typeof load>, candidates: any[]): Message[] {
  const messages: Message[] = [];

  for (const el of candidates) {
    const role = detectRole(el, $);
    const contentSelectors = [
      '[data-message-content]',
      '[data-testid="conversation-turn-content"]',
      '.markdown',
      '.prose',
      '.message-content'
    ];

    let html = '';
    for (const selector of contentSelectors) {
      const found = $(el).find(selector).first();
      if (found && found.length > 0) {
        html = found.html() || found.text() || '';
        if (html) break;
      }
    }

    if (!html) {
      html = $(el).html() || $(el).text() || '';
    }

    const cleaned = stripJunkFromHtml(html);
    if (!cleaned) continue;

    messages.push({ role, html: cleaned });
  }

  return messages;
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
    .map((text: string) => normalizePlainText(text))
    .filter((text: string) => Boolean(text) && !containsJunkText(text));

  return textParts.join('\n\n').trim();
}

function findConversationNode(value: any, seen = new Set<any>()): any {
  if (!value || typeof value !== 'object' || seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value.linear_conversation)) return value;
  if (Array.isArray(value.messages) && value.messages.some((item: any) => item?.author?.role || item?.role)) return value;

  for (const child of Object.values(value)) {
    const found = findConversationNode(child, seen);
    if (found) return found;
  }

  return null;
}

function parseFromStructuredHydration(html: string): ParsedConversation | null {
  const payload = extractHydrationPayload(html);
  if (!payload) return null;

  try {
    const root = decodeReferenceTable(payload);
    const data = findConversationNode(root?.loaderData || root);

    const title =
      (typeof data?.title === 'string' && data.title.trim()) ||
      (typeof data?.meta?.pageTitle === 'string' && data.meta.pageTitle.trim()) ||
      (typeof root?.meta?.pageTitle === 'string' && root.meta.pageTitle.trim()) ||
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

    return { title, messages, stats: getConversationStats(messages) };
  } catch {
    return null;
  }
}

function cleanupCheerio($: ReturnType<typeof load>) {
  // remove scripts/styles
  $('script, noscript, style, iframe, template, svg, canvas, meta, link').remove();
  $('[hidden], [aria-hidden="true"], [data-hidden="true"]').remove();
}

function detectRole(el: any, $: ReturnType<typeof load>): Message['role'] {
  const attrRole = ($(el).attr('data-message-author-role') || $(el).attr('data-testid') || '').toLowerCase();
  if (attrRole.includes('assistant')) return 'assistant';
  if (attrRole.includes('user')) return 'user';

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
  const $ = load(html);
  cleanupCheerio($);

  const title = $('meta[property="og:title"]').attr('content')?.trim() || $('title').first().text() || 'ChatGPT Conversation Export';

  const selector = '[data-message-author-role], [data-testid*="conversation-turn"]';
  const rawCandidates = $(selector).toArray();
  const topLevelCandidates = rawCandidates.filter((candidate, index) => {
    return !rawCandidates.some((other, otherIndex) => {
      if (index === otherIndex) return false;
      return $.contains(other, candidate);
    });
  });

  const domMessages = buildMessagesFromCandidates($, topLevelCandidates);

  if (domMessages.length > 0) {
    const messages = domMessages.filter((message) => !containsJunkText(message.html));

    if (messages.length > 0) {
      const normalized = messages.map((message, index) => {
        if (message.role !== 'unknown') return message;
        const role: Message['role'] = index % 2 === 0 ? 'user' : 'assistant';
        return { ...message, role };
      });

      return { title, messages: normalized, stats: getConversationStats(normalized) };
    }
  }

  // Fallback: decode structured hydration when the rendered DOM is unavailable.
  const structured = parseFromStructuredHydration(html);
  if (structured) return structured;

  return { title, messages: [], stats: getConversationStats([]) };
}
