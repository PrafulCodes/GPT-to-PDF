import { load } from 'cheerio';

export const PARSER_VERSION = '3.0.0';

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

export const PAGE_CLASSIFICATIONS = [
  'VALID_CONVERSATION',
  'AUTH_REQUIRED',
  'ACCESS_DENIED',
  'EXPIRED_OR_UNAVAILABLE',
  'CAPTCHA_OR_CHALLENGE',
  'UPSTREAM_ERROR_PAGE',
  'EMPTY_CONVERSATION',
  'UNSUPPORTED_FORMAT'
] as const;

export type PageClassification = (typeof PAGE_CLASSIFICATIONS)[number];

export type ParserDiagnostics = {
  parserVersion: string;
  classification: PageClassification;
  strategiesAttempted: string[];
  successfulStrategy: string | null;
  domCandidateCount: number;
  extractedMessageCount: number;
  hydrationPayloadCount: number;
  structuredNodeFound: boolean;
  fallbackAttempts: string[];
  failureClassification: string | null;
  parseDurationMs: number;
  unsupportedRoleCount: number;
  partialExtraction: boolean;
  upstreamStatus?: number;
  contentType?: string | null;
};

export type ParseChatOptions = {
  upstreamStatus?: number;
  contentType?: string | null;
};

export type ParseChatResult =
  | {
      ok: true;
      conversation: ParsedConversation;
      classification: 'VALID_CONVERSATION';
      diagnostics: ParserDiagnostics;
      warnings: string[];
    }
  | {
      ok: false;
      classification: Exclude<PageClassification, 'VALID_CONVERSATION'>;
      diagnostics: ParserDiagnostics;
      errorCode: 'AUTH_REQUIRED' | 'ACCESS_DENIED' | 'EXPIRED_OR_UNAVAILABLE' | 'CAPTCHA_OR_CHALLENGE' | 'UPSTREAM_ERROR_PAGE' | 'EMPTY_CONVERSATION' | 'UNSUPPORTED_FORMAT';
      message: string;
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

const MAX_HYDRATION_CHUNKS = 32;
const MAX_REFERENCE_NODES = 100_000;
const MAX_TRAVERSAL_DEPTH = 80;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function textToSafeHtml(text: string): string {
  const normalized = normalizePlainText(text);
  if (!normalized) return '';

  return normalized
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
    .join('');
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
    if (prevIsBr && nextIsBr) $(element).remove();
  });

  return root.html()?.trim() || '';
}

function detectRole(el: any, $: ReturnType<typeof load>): Message['role'] {
  const attrRole = ($(el).attr('data-message-author-role') || $(el).attr('data-testid') || '').toLowerCase();
  if (attrRole.includes('assistant')) return 'assistant';
  if (attrRole.includes('user')) return 'user';
  if (attrRole.includes('system')) return 'system';

  const aria = $(el).attr('aria-label') || '';
  if (/assistant/i.test(aria)) return 'assistant';
  if (/user|you/i.test(aria)) return 'user';

  const cls = ($(el).attr('class') || '').toLowerCase();
  if (cls.includes('assistant') || cls.includes('response') || cls.includes('ai')) return 'assistant';
  if (cls.includes('user') || cls.includes('message-user') || cls.includes('from-user')) return 'user';

  const txt = $(el).text().slice(0, 80);
  if (/^assistant[:\-]/i.test(txt)) return 'assistant';
  if (/^user[:\-]|^you[:\-]/i.test(txt)) return 'user';
  return 'unknown';
}

const CONTENT_SELECTORS = [
  '[data-message-content]',
  '[data-testid="conversation-turn-content"]',
  '.markdown',
  '.prose',
  '.message-content'
];

function buildMessagesFromCandidates($: ReturnType<typeof load>, candidates: any[]): Message[] {
  const messages: Message[] = [];

  for (const el of candidates) {
    const role = detectRole(el, $);
    let html = '';

    for (const selector of CONTENT_SELECTORS) {
      const found = $(el).find(selector).first();
      if (found.length > 0) {
        html = found.html() || found.text() || '';
        if (html) break;
      }
    }

    if (!html) html = $(el).html() || $(el).text() || '';

    const cleaned = stripJunkFromHtml(html);
    if (cleaned) messages.push({ role, html: cleaned });
  }

  return messages;
}

function extractHydrationPayloads(html: string): string[] {
  const chunks: string[] = [];
  const re = /streamController\.enqueue\((\"(?:\\.|[^\"])*\")\)/g;
  let match: RegExpExecArray | null = null;

  while (chunks.length < MAX_HYDRATION_CHUNKS && (match = re.exec(html)) !== null) {
    try {
      const decoded = JSON.parse(match[1]) as string;
      if (decoded.trim().startsWith('[')) chunks.push(decoded);
    } catch {
      // Ignore malformed chunks and continue with independently valid chunks.
    }
  }

  return chunks.sort((a, b) => b.length - a.length);
}

function decodeReferenceTable(payload: string): any {
  const table = JSON.parse(payload) as any[];
  if (!Array.isArray(table) || table.length > MAX_REFERENCE_NODES) throw new Error('Unsupported hydration table');

  const memo = new Map<number, any>();
  const resolving = new Set<number>();

  const resolveRef = (value: any, depth: number): any => {
    if (depth > MAX_TRAVERSAL_DEPTH) throw new Error('Hydration traversal limit exceeded');
    if (Number.isInteger(value) && value >= 0 && value < table.length) return resolveNode(value, depth + 1);
    if (Array.isArray(value)) return value.map((child) => resolveRef(child, depth + 1));
    if (value && typeof value === 'object') {
      const output: Record<string, any> = {};
      for (const [key, child] of Object.entries(value)) {
        output[key] = resolveRef(child, depth + 1);
      }
      return output;
    }
    return value;
  };

  const resolveNode = (index: number, depth: number): any => {
    if (memo.has(index)) return memo.get(index);
    if (resolving.has(index)) return null;
    resolving.add(index);

    const item = table[index];
    let output: any = item;

    if (Array.isArray(item)) {
      output = item.map((value) => resolveRef(value, depth + 1));
    } else if (item && typeof item === 'object') {
      output = {};
      for (const [key, value] of Object.entries(item)) {
        const outputKey = key.startsWith('_') && /^_\d+$/.test(key)
          ? String(resolveRef(Number(key.slice(1)), depth + 1))
          : key;
        output[outputKey] = resolveRef(value, depth + 1);
      }
    }

    resolving.delete(index);
    memo.set(index, output);
    return output;
  };

  return resolveNode(0, 0);
}

function extractMessageText(message: any): string {
  const content = message?.content;
  const parts = Array.isArray(content?.parts)
    ? content.parts
    : Array.isArray(message?.parts)
      ? message.parts
      : null;

  const values = parts
    ? parts.map((part: any) => typeof part === 'string' ? part : part && typeof part.text === 'string' ? part.text : '')
    : [
        typeof content === 'string' ? content : '',
        typeof message?.text === 'string' ? message.text : ''
      ];

  return values
    .map((text: string) => normalizePlainText(text))
    .filter((text: string) => Boolean(text) && !containsJunkText(text))
    .join('\n\n')
    .trim();
}

function findConversationNode(value: any, seen = new Set<any>(), depth = 0): any {
  if (!value || typeof value !== 'object' || seen.has(value) || depth > MAX_TRAVERSAL_DEPTH) return null;
  seen.add(value);

  if (Array.isArray(value.linear_conversation)) return value;
  if (Array.isArray(value.messages) && value.messages.some((item: any) => item?.author?.role || item?.role)) return value;

  for (const child of Object.values(value)) {
    const found = findConversationNode(child, seen, depth + 1);
    if (found) return found;
  }

  return null;
}

function structuredMessages(data: any): Message[] {
  const entries = Array.isArray(data?.linear_conversation)
    ? data.linear_conversation.map((turn: any) => turn?.message || turn)
    : Array.isArray(data?.messages)
      ? data.messages
      : [];

  return entries
    .map((message: any) => {
      const role = message?.author?.role || message?.role;
      if (role !== 'user' && role !== 'assistant' && role !== 'system') return null;
      const text = extractMessageText(message);
      return text ? { role, html: textToSafeHtml(text) } : null;
    })
    .filter((message: Message | null): message is Message => Boolean(message));
}

function parseFromStructuredHydration(html: string) {
  const payloads = extractHydrationPayloads(html);
  for (const payload of payloads) {
    try {
      const root = decodeReferenceTable(payload);
      const data = findConversationNode(root?.loaderData || root) ||
        (Array.isArray(root) ? findConversationNode(root[0]) : null);
      if (!data) continue;

      const messages = structuredMessages(data);
      if (messages.length > 0) {
        const title =
          (typeof data.title === 'string' && data.title.trim()) ||
          (typeof data.meta?.pageTitle === 'string' && data.meta.pageTitle.trim()) ||
          (typeof root?.meta?.pageTitle === 'string' && root.meta.pageTitle.trim()) ||
          'ChatGPT Conversation Export';
        return { title, messages };
      }
    } catch {
      // Continue through independently valid hydration chunks.
    }
  }

  return null;
}

function getTitle($: ReturnType<typeof load>) {
  return $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').first().text().trim() ||
    'ChatGPT Conversation Export';
}

function hasConversationSignals($: ReturnType<typeof load>, html: string) {
  return $('[data-message-author-role], [data-testid*="conversation-turn"]').length > 0 ||
    /streamController\.enqueue\(/.test(html);
}

function classifyPageStructure(html: string, options: ParseChatOptions): PageClassification {
  const $ = load(html);
  const title = $('title').first().text().trim();
  const bodyText = normalizePlainText($('body').text());
  const hasConversation = hasConversationSignals($, html);

  if (options.upstreamStatus === 401 || options.upstreamStatus === 407) return 'AUTH_REQUIRED';
  if (options.upstreamStatus === 403) return 'ACCESS_DENIED';
  if (options.upstreamStatus === 404 || options.upstreamStatus === 410) return 'EXPIRED_OR_UNAVAILABLE';
  if (options.upstreamStatus !== undefined && options.upstreamStatus >= 500) return 'UPSTREAM_ERROR_PAGE';

  const hasCaptchaStructure = $('[data-sitekey], [data-captcha], iframe[src*="captcha" i], iframe[src*="challenge" i], form[action*="challenge" i]').length > 0;
  if (hasCaptchaStructure) return 'CAPTCHA_OR_CHALLENGE';

  const hasLoginStructure = $('input[type="password"], form[action*="login" i], form[action*="auth" i], a[href*="/login" i], a[href*="/auth" i]').length > 0;
  if (hasLoginStructure && !hasConversation) return 'AUTH_REQUIRED';

  const hasAccessDeniedStructure = $('[data-error-code="access_denied"], [data-testid*="access-denied" i], [role="alert"]').filter((_, el) => /access|denied|forbidden|permission/i.test($(el).text())).length > 0;
  if (hasAccessDeniedStructure && !hasConversation) return 'ACCESS_DENIED';

  const hasUpstreamErrorStructure = $('body > .error, body > #error, [data-error], [data-error-code]').length > 0;
  if (hasUpstreamErrorStructure && !hasConversation) return 'UPSTREAM_ERROR_PAGE';

  if (!bodyText && !html.trim()) return 'EMPTY_CONVERSATION';
  if (/expired|conversation (?:not found|unavailable)|page not found/i.test(title) && !hasConversation) return 'EXPIRED_OR_UNAVAILABLE';
  return hasConversation ? 'UNSUPPORTED_FORMAT' : 'EMPTY_CONVERSATION';
}

function createDiagnostics(classification: PageClassification, options: ParseChatOptions): ParserDiagnostics {
  return {
    parserVersion: PARSER_VERSION,
    classification,
    strategiesAttempted: [],
    successfulStrategy: null,
    domCandidateCount: 0,
    extractedMessageCount: 0,
    hydrationPayloadCount: 0,
    structuredNodeFound: false,
    fallbackAttempts: [],
    failureClassification: null,
    parseDurationMs: 0,
    unsupportedRoleCount: 0,
    partialExtraction: false,
    upstreamStatus: options.upstreamStatus,
    contentType: options.contentType
  };
}

function errorMessage(classification: Exclude<PageClassification, 'VALID_CONVERSATION'>) {
  switch (classification) {
    case 'AUTH_REQUIRED': return 'This shared link requires authentication.';
    case 'ACCESS_DENIED': return 'This shared link is not accessible.';
    case 'EXPIRED_OR_UNAVAILABLE': return 'This shared conversation is expired or unavailable.';
    case 'CAPTCHA_OR_CHALLENGE': return 'The conversation is protected by an upstream challenge.';
    case 'UPSTREAM_ERROR_PAGE': return 'ChatGPT returned an upstream error page.';
    case 'EMPTY_CONVERSATION': return 'The shared conversation contains no exportable messages.';
    case 'UNSUPPORTED_FORMAT': return 'The shared conversation format is not supported.';
  }
}

export function classifyChatPage(html: string, options: ParseChatOptions = {}): PageClassification {
  return classifyPageStructure(html, options);
}

export function parseChatHtmlDetailed(html: string, options: ParseChatOptions = {}): ParseChatResult {
  const startedAt = Date.now();
  const initialClassification = classifyPageStructure(html, options);
  const diagnostics = createDiagnostics(initialClassification, options);

  if (initialClassification === 'AUTH_REQUIRED' ||
      initialClassification === 'ACCESS_DENIED' ||
      initialClassification === 'EXPIRED_OR_UNAVAILABLE' ||
      initialClassification === 'CAPTCHA_OR_CHALLENGE' ||
      initialClassification === 'UPSTREAM_ERROR_PAGE') {
    diagnostics.failureClassification = initialClassification;
    diagnostics.parseDurationMs = Date.now() - startedAt;
    return { ok: false, classification: initialClassification, errorCode: initialClassification, diagnostics, message: errorMessage(initialClassification) };
  }

  const $ = load(html);
  $('script, noscript, style, iframe, template, svg, canvas, meta, link').remove();
  $('[hidden], [aria-hidden="true"], [data-hidden="true"]').remove();

  diagnostics.strategiesAttempted.push('dom');
  const selector = '[data-message-author-role], [data-testid*="conversation-turn"]';
  const rawCandidates = $(selector).toArray();
  diagnostics.domCandidateCount = rawCandidates.length;
  const topLevelCandidates = rawCandidates.filter((candidate, index) =>
    !rawCandidates.some((other, otherIndex) => index !== otherIndex && $.contains(other, candidate))
  );
  const domMessages = buildMessagesFromCandidates($, topLevelCandidates);
  diagnostics.unsupportedRoleCount = domMessages.filter((message) => message.role === 'unknown').length;
  const domPartialExtraction = domMessages.length < topLevelCandidates.length;

  let conversation: ParsedConversation | null = null;
  if (domMessages.length > 0) {
    conversation = { title: getTitle($), messages: domMessages, stats: getConversationStats(domMessages) };
    diagnostics.successfulStrategy = 'dom';
  } else {
    diagnostics.fallbackAttempts.push('structured_hydration');
    diagnostics.strategiesAttempted.push('structured_hydration');
    diagnostics.hydrationPayloadCount = extractHydrationPayloads(html).length;
    const structured = parseFromStructuredHydration(html);
    if (structured) {
      diagnostics.structuredNodeFound = true;
      diagnostics.successfulStrategy = 'structured_hydration';
      conversation = { title: structured.title, messages: structured.messages, stats: getConversationStats(structured.messages) };
    }
  }

  diagnostics.extractedMessageCount = conversation?.messages.length || 0;
  diagnostics.partialExtraction = Boolean(conversation && domPartialExtraction);
  diagnostics.parseDurationMs = Date.now() - startedAt;

  if (!conversation || conversation.messages.length === 0) {
    const classification: Exclude<PageClassification, 'VALID_CONVERSATION'> =
      initialClassification === 'UNSUPPORTED_FORMAT' ? 'UNSUPPORTED_FORMAT' : 'EMPTY_CONVERSATION';
    diagnostics.classification = classification;
    diagnostics.failureClassification = classification;
    return { ok: false, classification, errorCode: classification, diagnostics, message: errorMessage(classification) };
  }

  diagnostics.classification = 'VALID_CONVERSATION';
  return {
    ok: true,
    classification: 'VALID_CONVERSATION',
    conversation,
    diagnostics,
    warnings: [
      ...(diagnostics.unsupportedRoleCount > 0 ? ['One or more message roles could not be identified.'] : []),
      ...(diagnostics.partialExtraction ? ['Some message candidates did not contain exportable content.'] : [])
    ]
  };
}

export function parseChatHtml(html: string): ParsedConversation {
  const result = parseChatHtmlDetailed(html);
  return result.ok ? result.conversation : {
    title: 'ChatGPT Conversation Export',
    messages: [],
    stats: getConversationStats([])
  };
}
