import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';
// @sparticuz/chromium-min does NOT bundle the binary — it downloads it at runtime
// from the URL passed to executablePath(). This keeps the function under Vercel's 50MB limit.
import chromium from '@sparticuz/chromium-min';
import { load } from 'cheerio';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import puppeteerCore from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { ParsedConversation, getConversationStats } from './parse-chat';
import { creatorName, creatorUrl, siteHost, siteUrl } from './branding';
import { renderMathSource } from './math-renderer';

export type PdfTiming = {
  htmlGenerationMs: number;
  chromiumLaunchMs: number;
  pageRenderMs: number;
  pdfGenerateMs: number;
};

export type PdfFailureStage = 'deadline' | 'html_generation' | 'chromium_launch' | 'page_render' | 'pdf_generation';

export type PdfDeadline = {
  at: number;
  remainingMs: () => number;
};

const MESSAGE_RENDER_CONCURRENCY = 2;

const defaultTiming = (): PdfTiming => ({
  htmlGenerationMs: 0,
  chromiumLaunchMs: 0,
  pageRenderMs: 0,
  pdfGenerateMs: 0
});

let sharedBrowserPromise: Promise<Browser> | null = null;
let cachedLaunchOptions: { options: any; serverless: boolean } | null = null;

function escapeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeMessageHtml(html: string): string {
  if (!html) return '';

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<(?:meta|link|canvas|template)[^>]*>/gi, '')
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br/><br/>')
    .replace(/(?:\s*<p>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>\s*)+/gi, '')
    .trim();
}

export function restoreRenderedMathSource(html: string): string {
  if (!html) return '';

  const $ = load(`<div id="root">${html}</div>`, undefined, false);
  const root = $('#root');

  // ChatGPT may return already-rendered KaTeX. Removing it loses the original
  // TeX, so recover the source annotation before the Markdown pass.
  root.find('.katex-display').each((_, element) => {
    const source = $(element).find('annotation[encoding="application/x-tex"]').first().text();
    if (source) $(element).replaceWith(`$$${source}$$`);
  });
  root.find('.katex').each((_, element) => {
    if ($(element).closest('.katex-display').length > 0) return;
    const source = $(element).find('annotation[encoding="application/x-tex"]').first().text();
    if (source) $(element).replaceWith(`$${source}$`);
  });

  // MathJax output has the same source in an annotation. Preserve it too.
  root.find('.MathJax_Display, .MathJax').each((_, element) => {
    const source = $(element).find('annotation[encoding="application/x-tex"]').first().text();
    if (source) $(element).replaceWith($(element).hasClass('MathJax_Display') ? `$$${source}$$` : `$${source}$`);
  });

  root.find('math, annotation, semantics').remove();

  return root.html()?.trim() || '';
}

function stylizeAcademicHtml(html: string): string {
  if (!html) return '';

  const $ = load(`<div id="root">${html}</div>`, undefined, false);
  const root = $('#root');

  root.find('p').each((_, element) => {
    const node = $(element);
    const text = node.text().replace(/\s+/g, ' ').trim();

    const stepMatch = text.match(/^Step\s+(\d+)\s*[:.-]?\s*(.*)$/i);
    if (stepMatch) {
      const stepNumber = stepMatch[1];
      const stepTitle = stepMatch[2] || '';
      const wrapper = $('<div class="step-card"></div>');
      wrapper.append(`<div class="step-kicker">STEP ${escapeHtml(stepNumber)}</div>`);
      if (stepTitle) {
        wrapper.append(`<div class="step-title">${escapeHtml(stepTitle)}</div>`);
      }
      node.replaceWith(wrapper);
      return;
    }

    const labelMatch = text.match(/^(Notice|Explanation|Result|Therefore|Simplify|Solve|Answer)\s*[:.-]?\s*(.*)$/i);
    if (labelMatch && labelMatch[2]) {
      const label = labelMatch[1];
      const body = labelMatch[2];
      node.replaceWith(`<div class="callout"><div class="callout-label">${escapeHtml(label)}</div><div class="callout-body">${escapeHtml(body)}</div></div>`);
    }
  });

  root.find('.katex-display').each((_, element) => {
    const node = $(element);
    const parent = node.parent();

    if (!parent.hasClass('math-block')) {
      parent.addClass('math-block');
    }

    if (!parent.hasClass('math-block--display')) {
      parent.addClass('math-block--display');
    }
  });

  root.find('.math-block--display').each((_, element) => {
    const node = $(element);
    if (node.find('.katex-display').length > 0 && !node.hasClass('math-block--result')) {
      const text = node.text().replace(/\s+/g, ' ').trim();
      if (/^(result|therefore|answer|conclusion|final)/i.test(text)) {
        node.addClass('math-block--result');
      }
    }
  });

  return root.html()?.trim() || '';
}

export function normalizeMarkdownSource(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripChatWritingWrappers(source: string): string {
  let insideWritingWrapper = false;
  const lines: string[] = [];

  for (const line of source.split('\n')) {
    if (!insideWritingWrapper && /^\s*:::writing(?:\s*\{[^}\r\n]*\})?\s*$/.test(line)) {
      insideWritingWrapper = true;
      continue;
    }
    if (insideWritingWrapper && /^\s*:::\s*$/.test(line)) {
      insideWritingWrapper = false;
      continue;
    }
    lines.push(line);
  }

  return lines.join('\n');
}

function protectMarkdownCode(source: string): { source: string; restore: (value: string) => string } {
  const protectedValues: string[] = [];
  const token = (index: number) => `CHATGPT_PDF_CODE_${index}_TOKEN`;
  const protectedSource = source.replace(/(`{3,}|~{3,})[\s\S]*?\1|`[^`\n]+`/g, (value) => {
    const index = protectedValues.push(value) - 1;
    return token(index);
  });

  return {
    source: protectedSource,
    restore: (value) => value.replace(/CHATGPT_PDF_CODE_(\d+)_TOKEN/g, (_match, index: string) => protectedValues[Number(index)] || '')
  };
}

/**
 * Converts LaTeX delimiter styles that remark-parse would destroy via
 * CommonMark backslash-escape processing into remark-math's expected
 * $$ / $ syntax BEFORE the markdown processor sees the string.
 *
 * Must run AFTER HTML→Markdown extraction and BEFORE remarkParse.
 *
 * Handles:
 *   \[...\]   →  $$...$$   (display / block math)
 *   \(...\)   →  $...$     (inline math)
 *
 * Leaves existing $$...$$ and $...$ untouched.
 * Uses non-greedy matching with dotAll so multiline equations are captured.
 */
function normalizeLatexEnvironments(source: string): string {
  return source.replace(/(\$\$|(?<!\$)\$)([\s\S]*?)\1/g, (_match, delimiter: string, content: string) => {
    const normalized = content
      .replace(/\\begin\{(?:equation|equation\*)\}/g, '')
      .replace(/\\end\{(?:equation|equation\*)\}/g, '')
      .replace(/\\begin\{gather\*?\}/g, '\\begin{gathered}')
      .replace(/\\end\{gather\*?\}/g, '\\end{gathered}');
    return delimiter === '$$'
      ? `$$\n${normalized.trim()}\n$$`
      : `$${normalized}$`;
  });
}

function findDelimitedMath(source: string, start: number, delimiter: string) {
  const end = source.indexOf(delimiter, start);
  if (end < 0) return null;
  const content = source.slice(start, end);
  if (!content.trim()) return null;
  return { end: end + delimiter.length, content };
}

function renderMathTokens(source: string) {
  const tokens: Array<{ token: string; html: string }> = [];
  let output = '';
  let index = 0;

  const addToken = (content: string, displayMode: boolean) => {
    const token = `GPTPDFMATH${tokens.length}TOKEN`;
    const rendered = renderMathSource(content.trim(), displayMode);
    tokens.push({
      token,
      html: displayMode
        ? `<div class="math-block math-block--display math-engine-${rendered.engine}">${rendered.html}</div>`
        : `<span class="math-expression math-engine-${rendered.engine}">${rendered.html}</span>`
    });
    output += displayMode ? `\n\n${token}\n\n` : token;
  };

  while (index < source.length) {
    if (source.startsWith('$$', index)) {
      const match = findDelimitedMath(source, index + 2, '$$');
      if (match) {
        addToken(match.content, true);
        index = match.end;
        continue;
      }
    }
    if (source.startsWith('\\[', index)) {
      const match = findDelimitedMath(source, index + 2, '\\]');
      if (match) {
        addToken(match.content, true);
        index = match.end;
        continue;
      }
    }
    if (source.startsWith('\\(', index)) {
      const match = findDelimitedMath(source, index + 2, '\\)');
      if (match) {
        addToken(match.content, false);
        index = match.end;
        continue;
      }
    }
    if (source[index] === '$' && source[index - 1] !== '\\' && source[index + 1] !== '$') {
      const match = findDelimitedMath(source, index + 1, '$');
      if (match && !/^\s*\d/.test(match.content)) {
        addToken(match.content, false);
        index = match.end;
        continue;
      }
    }
    const environment = source.slice(index).match(/^\\begin\{([a-zA-Z*]+)\}/);
    if (environment) {
      const endDelimiter = `\\end{${environment[1]}}`;
      const end = source.indexOf(endDelimiter, index + environment[0].length);
      if (end >= 0) {
        addToken(source.slice(index, end + endDelimiter.length), true);
        index = end + endDelimiter.length;
        continue;
      }
    }
    output += source[index++];
  }

  return { source: output, tokens };
}

export function normalizeLatexDelimiters(source: string): string {
  const protectedCode = protectMarkdownCode(source);
  source = protectedCode.source;

  // Display math: \[...\]  →  $$...$$
  // Non-greedy, dotAll (s flag), handles multiline equations
  source = source.replace(/\\\[([\s\S]*?)\\\]/g, (_match, inner) => `$$\n${inner.trim()}\n$$`);

  // Inline math: \(...\)  →  $...$
  source = source.replace(/\\\(([\s\S]*?)\\\)/g, (_match, inner) => `$${inner}$`);

  return protectedCode.restore(normalizeLatexEnvironments(source));
}

function collectMarkdownFromNode(node: any, $: ReturnType<typeof load>, state?: { orderedIndex: number }): string {
  if (!node) return '';

  if (node.type === 'text') {
    return node.data || '';
  }

  if (node.type !== 'tag') return '';

  const tagName = String(node.tagName || '').toLowerCase();
  if (/^(script|style|noscript|iframe|svg|canvas|template|meta|link)$/i.test(tagName)) return '';

  const childNodes = $(node).contents().toArray();
  const children = childNodes.map((child) => collectMarkdownFromNode(child, $, state)).filter(Boolean);
  const joinedChildren = children.join('');

  switch (tagName) {
    case 'br':
      return '\n';
    case 'p':
    case 'div':
    case 'section':
    case 'article':
    case 'header':
    case 'footer':
    case 'main':
      return `${joinedChildren}\n\n`;
    case 'strong':
    case 'b':
      return `**${joinedChildren.trim()}**`;
    case 'em':
    case 'i':
      return `*${joinedChildren.trim()}*`;
    case 'code':
      return `\`${joinedChildren.trim()}\``;
    case 'pre': {
      const codeText = $(node).find('code').first().text() || $(node).text() || '';
      const normalized = normalizeMarkdownSource(codeText);
      return `\n\n\`\`\`\n${normalized}\n\`\`\`\n\n`;
    }
    case 'blockquote':
      return `\n\n${joinedChildren.split('\n').map((line) => (line.trim() ? `> ${line}` : '>')).join('\n')}\n\n`;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = Number(tagName.slice(1));
      return `\n\n${'#'.repeat(Math.min(Math.max(level, 1), 6))} ${joinedChildren.trim()}\n\n`;
    }
    case 'li':
      return `${joinedChildren.trim()}\n`;
    case 'ul':
      return `\n${$(node).children('li').toArray().map((li) => `- ${collectMarkdownFromNode(li, $, state).trim()}`).join('\n')}\n\n`;
    case 'ol': {
      let index = 1;
      const items = $(node).children('li').toArray().map((li) => `${index++}. ${collectMarkdownFromNode(li, $, state).trim()}`);
      return `\n${items.join('\n')}\n\n`;
    }
    case 'table': {
      const rows = $(node).find('tr').toArray();
      if (rows.length === 0) return `${joinedChildren}\n\n`;

      const lines = rows.map((row) => {
        const cells = $(row).children('th,td').toArray().map((cell) => collectMarkdownFromNode(cell, $, state).trim().replace(/\n+/g, ' '));
        return `| ${cells.join(' | ')} |`;
      });

      if (lines.length > 1) {
        const separator = `| ${$(rows[0]).children('th,td').toArray().map(() => '---').join(' | ')} |`;
        lines.splice(1, 0, separator);
      }

      return `\n\n${lines.join('\n')}\n\n`;
    }
    case 'td':
    case 'th':
      return joinedChildren.replace(/\s+/g, ' ').trim();
    default:
      return joinedChildren;
  }
}

function htmlToMarkdownSource(html: string): string {
  if (!html) return '';

  const $ = load(`<div id="root">${html}</div>`, undefined, false);
  const root = $('#root');
  const parts = root.contents().toArray().map((node) => collectMarkdownFromNode(node, $)).join('');

  return normalizeMarkdownSource(parts)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const source = stripChatWritingWrappers(normalizeMarkdownSource(markdown));
  if (!source) return '';

  const normalizedSource = normalizeLatexDelimiters(source);
  const protectedCode = protectMarkdownCode(normalizedSource);
  const tokenized = renderMathTokens(protectedCode.source);
  const tokenizedSource = tokenized.source;

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeStringify)
    .process(protectedCode.restore(tokenizedSource));

  let html = String(file);
  for (const mathToken of tokenized.tokens) {
    const escapedToken = mathToken.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const displayPattern = new RegExp(`<p>\\s*${escapedToken}\\s*</p>`, 'g');
    html = html.replace(displayPattern, mathToken.html);
    html = html.replace(new RegExp(escapedToken, 'g'), mathToken.html);
  }

  return html;
}

async function markdownToAcademicHtml(markdown: string): Promise<string> {
  const rendered = await markdownToHtml(markdown);
  return stylizeAcademicHtml(rendered);
}

let cachedKatexCss: string | null = null;

function getKatexCss(): string {
  if (cachedKatexCss !== null) return cachedKatexCss;

  try {
    const cssPath = require.resolve('katex/dist/katex.min.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    const cssDirectory = path.dirname(cssPath);

    // page.setContent() creates an about:blank document, so relative font
    // URLs in KaTeX's stylesheet otherwise fail to load in Chromium.
    cachedKatexCss = css.replace(/url\((['"]?)(fonts\/[^)'"]+)\1\)/g, (match, _quote: string, relativePath: string) => {
      const fontPath = path.join(cssDirectory, relativePath);
      if (!fs.existsSync(fontPath)) return match;

      const extension = path.extname(fontPath).toLowerCase();
      const mimeType = extension === '.woff2'
        ? 'font/woff2'
        : extension === '.woff'
          ? 'font/woff'
          : 'font/ttf';
      const font = fs.readFileSync(fontPath).toString('base64');
      return `url(data:${mimeType};base64,${font})`;
    });
  } catch {
    cachedKatexCss = '';
  }

  return cachedKatexCss;
}

// Load once at module init (sync, small file) so both buildHtml and generatePdf share it.
let _faviconDataUrl: string | null = null;
function getFaviconDataUrl(): string {
  if (_faviconDataUrl !== null) return _faviconDataUrl;
  try {
    const filePath = path.join(process.cwd(), 'public', 'favicon.png');
    const icon = fs.readFileSync(filePath);
    _faviconDataUrl = `data:image/png;base64,${icon.toString('base64')}`;
  } catch {
    _faviconDataUrl = '';
  }
  return _faviconDataUrl;
}

export function createPdfDeadline(durationMs: number): PdfDeadline {
  const at = Date.now() + durationMs;
  return {
    at,
    remainingMs: () => Math.max(0, at - Date.now())
  };
}

function assertDeadline(deadline: PdfDeadline) {
  if (deadline.remainingMs() <= 0) {
    throw new Error('PDF generation exceeded the safe execution budget');
  }
}

async function renderMessageHtml(message: ParsedConversation['messages'][number], deadline: PdfDeadline) {
  assertDeadline(deadline);
  const cls = message.role === 'user' ? 'msg user' : 'msg assistant';
  // Strip images and SVG to avoid large render artifacts in PDF and speed rendering
  const restoredMathHtml = restoreRenderedMathSource((message.html || '').replace(/<img[\s\S]*?>/gi, ''));
  const cleanedHtml = sanitizeMessageHtml(restoredMathHtml);
  const markdownSource = htmlToMarkdownSource(cleanedHtml);
  const bodyHtml = await markdownToAcademicHtml(markdownSource);
  assertDeadline(deadline);
  return `<section class="${cls}"><div class="header">${message.role.toUpperCase()}</div><div class="body">${bodyHtml}</div></section>`;
}

export async function renderMessagesHtml(
  messages: ParsedConversation['messages'],
  deadline: PdfDeadline,
  concurrency = MESSAGE_RENDER_CONCURRENCY,
  renderMessage: (message: ParsedConversation['messages'][number], deadline: PdfDeadline) => Promise<string> = renderMessageHtml
) {
  const sections = new Array<string>(messages.length);
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(concurrency, messages.length || 1));

  async function worker() {
    while (true) {
      assertDeadline(deadline);
      const index = nextIndex++;
      if (index >= messages.length) return;
      sections[index] = await renderMessage(messages[index], deadline);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return sections.join('\n');
}

export async function buildHtml(conv: ParsedConversation, deadline: PdfDeadline) {
  // faviconDataUrl no longer embedded in body — it's used in the PDF footerTemplate instead.
  const messagesHtml = await renderMessagesHtml(conv.messages, deadline);
  assertDeadline(deadline);

  // Minimal, performance-optimized HTML for PDF rendering:
  // NOTE: The pdf-footer is intentionally removed from HTML — branding is
  // injected via Puppeteer's footerTemplate which renders inside the @page
  // bottom margin. This guarantees zero content overlap on every page.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(conv.title || 'ChatGPT Conversation Export')}</title>
  <style>
    ${getKatexCss()}
    /* Minimal reset and system font stack to avoid external font loading */
    html,body{margin:0;padding:14px 18px 18px;color:#0b1220;font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif;font-size:13px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    a{color:inherit;text-decoration:none}
    /* Content container — max-width with auto side margins */
    .container{max-width:800px;margin:0 auto}
    header{margin-bottom:12px}
    .title{font-weight:700;font-size:18px;margin:0 0 6px}
    .meta{font-size:11px;color:#6b7280;margin-bottom:8px}
    .msg{padding:16px 16px 14px;margin-bottom:16px;border-left:4px solid #cbd5e1;border-radius:14px;background:#ffffff;box-shadow:0 1px 0 rgba(15,23,42,0.04)}
    .msg.user{border-left-color:#c7e0ff}
    .msg.user{background:#f8fbff}
    .msg.assistant{background:#ffffff}
    .msg .header{font-weight:700;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:10px}
    .msg .body{font-size:13.5px;line-height:1.7;color:#0f172a;white-space:normal;overflow-wrap:anywhere;word-break:break-word}
    .msg .body :where(p,ul,ol,blockquote,pre,table,figure,h1,h2,h3,h4,h5,h6){margin:0 0 0.9em}
    .msg .body :where(p,ul,ol,blockquote,pre,table,figure,h1,h2,h3,h4,h5,h6):last-child{margin-bottom:0}
    .msg .body :where(ul,ol){padding-left:1.5em}
    .msg .body :where(li){margin:0.2em 0}
    .msg .body :where(pre){background:#f8fafc;color:#0b1220;padding:12px 14px;border-radius:10px;overflow:auto;font-size:12.5px;line-height:1.6;border:1px solid #e2e8f0;white-space:pre-wrap}
    .msg .body :where(code){font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;font-size:0.95em}
    .msg .body :where(blockquote){padding:12px 14px;border-left:3px solid #c7e0ff;color:#334155;background:#f8fbff;border-radius:0 10px 10px 0}
    .msg .body :where(table){border-collapse:collapse;width:100%;margin:1rem 0}
    .msg .body :where(th, td){padding:9px 10px;border:1px solid #e5e7eb;font-size:13px;vertical-align:top}
    .msg .body :where(hr){border:0;border-top:1px solid #e5e7eb;margin:1rem 0}
    .msg .body :where(.step-card){margin:1.75rem 0 1rem;padding:12px 14px;border-left:4px solid #2563eb;background:#f8fafc;border-radius:12px}
    .msg .body :where(.step-kicker){font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#2563eb;margin-bottom:6px}
    .msg .body :where(.step-title){font-size:15px;line-height:1.5;font-weight:600;color:#0f172a}
    .msg .body :where(.callout){margin:1rem 0;padding:10px 12px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0}
    .msg .body :where(.callout-label){font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:#64748b;margin-bottom:4px}
    .msg .body :where(.callout-body){font-size:13px;line-height:1.65;color:#0f172a}
    .msg .body :where(.math-block){background:#f8fafc;border:0;border-radius:12px;padding:16px 14px;margin:1rem 0;text-align:center;overflow-x:auto;break-inside:avoid;page-break-inside:avoid;font-size:1.15em}
    .msg .body :where(.math-block--result){border-color:#cbd5e1;background:#f1f5f9;box-shadow:inset 0 0 0 1px rgba(148,163,184,0.12)}
    .msg .body :where(.katex-display){margin:0;overflow-x:auto;page-break-inside:avoid;break-inside:avoid;font-size:1.1em}
    .msg .body :where(.katex,.katex *){word-break:normal;overflow-wrap:normal}
    .msg .body :where(.katex){white-space:nowrap;font-size:1em}
    .msg .body :where(.katex-display > .katex){display:block}
    .msg .body :where(pre,.katex-display,.math-block){break-inside:avoid;page-break-inside:avoid}
    /* NOTE: No @page rule here — margins are controlled exclusively by Puppeteer's
       page.pdf() options so there is a single authoritative source of truth.
       The bottom margin is sized to exactly hold the footerTemplate height,
       guaranteeing content can never collide with the footer. */
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title">${escapeHtml(conv.title || 'ChatGPT Conversation Export')}</div>
      <div class="meta">Generated: ${new Date().toISOString()} • Source: Shared ChatGPT link</div>
    </header>
    <main>
      ${messagesHtml}
    </main>
  </div>
</body>
</html>`;
}

async function getLaunchOptions() {
  // Detect environment: prefer Vercel detection for production serverless
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);

  if (cachedLaunchOptions && cachedLaunchOptions.serverless === isVercel) return cachedLaunchOptions.options;

  let launchOptions: any = {
    defaultViewport: { width: 900, height: 1120 },
    ignoreHTTPSErrors: true,
    // Keep Puppeteer's protocol deadline aligned with the route's 55s absolute
    // budget. The outer deadline remains authoritative and fails sooner.
    protocolTimeout: 55_000
  };

  const fs = require('fs');

  if (isVercel) {
    // chromium-min requires a hosted binary URL.
    // Set CHROMIUM_REMOTE_EXEC_PATH on Vercel to the GitHub releases tar URL for v133:
    // https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar
    const remoteUrl = process.env.CHROMIUM_REMOTE_EXEC_PATH ||
      'https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar';

    const executablePath = await chromium.executablePath(remoteUrl);

    if (!executablePath) {
      throw new Error('Chromium executablePath missing — check CHROMIUM_REMOTE_EXEC_PATH env var');
    }

    launchOptions = {
      ...launchOptions,
      args: chromium.args,
      executablePath,
      headless: true
    };
  } else {
    // Local development: prefer puppeteer's bundled Chromium (no executablePath)
    // Probe common local Chrome installs if present, but do not require them.
    const possible = [
      process.env.CHROME_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium'
    ].filter(Boolean);

    let found: string | null = null;
    for (const p of possible) {
      try {
        if (p && fs.existsSync(p)) {
          found = p;
          break;
        }
      } catch {}
    }

    if (found) {
      // Use system Chrome if available (local)
      launchOptions = { ...launchOptions, executablePath: found, headless: true };
    } else {
      // Use bundled Chromium shipped with puppeteer
      launchOptions = { ...launchOptions, headless: true };
    }
  }

  cachedLaunchOptions = { options: launchOptions, serverless: isVercel };
  return launchOptions;
}


async function getSharedBrowser(): Promise<Browser> {
  if (!sharedBrowserPromise) {
    sharedBrowserPromise = (async () => {
      const launchOptions = await getLaunchOptions();

      let browser: any;
      if (Boolean(process.env.VERCEL || process.env.VERCEL_URL)) {
        // Use puppeteer-core in serverless environments
        browser = await puppeteerCore.launch(launchOptions as any);
      } else {
        // Local development: use full puppeteer (bundled Chromium)
        browser = await puppeteer.launch(launchOptions as any);
      }

      browser.on('disconnected', () => {
        sharedBrowserPromise = null;
      });
      return browser;
    })();
  }

  try {
    return await sharedBrowserPromise;
  } catch (error) {
    sharedBrowserPromise = null;
    throw error;
  }
}

// Expose a helper to pre-warm the shared browser (launch in background)
export function prewarmBrowser() {
  // Kick off the sharedBrowserPromise but don't await it here
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const p = getSharedBrowser();
    // intentionally not awaited
    return p;
  } catch (e) {
    return null;
  }
}

export async function generatePdf(
  conv: ParsedConversation,
  timeoutMs = 30000,
  deadline = createPdfDeadline(timeoutMs)
): Promise<
  { ok: true; buffer: Buffer; timing: PdfTiming } |
  { ok: false; reason: string; stage: PdfFailureStage; timing: PdfTiming }
> {
  const timing = defaultTiming();
  const start = Date.now();
  let page: Page | null = null;
  let stage: PdfFailureStage = 'html_generation';

  const runWithDeadline = async <T>(
    operation: Promise<T>,
    operationStage: PdfFailureStage,
    cleanupLateResult?: (value: T) => Promise<void>
  ): Promise<T> => {
    stage = operationStage;
    const remaining = deadline.remainingMs();
    if (remaining <= 0) throw new Error('PDF generation exceeded the safe execution budget');

    let timer: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    if (cleanupLateResult) {
      void operation.then((value) => {
        if (timedOut) {
          void cleanupLateResult(value).catch(() => {});
        }
      }).catch(() => {});
    }
    const deadlinePromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        reject(new Error('PDF generation exceeded the safe execution budget'));
      }, remaining);
    });

    try {
      return await Promise.race([operation, deadlinePromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  try {
    const htmlStart = Date.now();
    stage = 'html_generation';
    // Resolve favicon once (cached after first call) so footerTemplate can embed it.
    const faviconDataUrl = getFaviconDataUrl();
    const html = await buildHtml(conv, deadline);
    timing.htmlGenerationMs = Date.now() - htmlStart;

    const launchStart = Date.now();
    const browser = await runWithDeadline(getSharedBrowser(), 'chromium_launch');
    timing.chromiumLaunchMs = Date.now() - launchStart;

    page = await runWithDeadline(browser.newPage(), 'chromium_launch', async (latePage) => {
      await latePage.close();
    });

    const renderStart = Date.now();
    await runWithDeadline(page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: Math.max(1000, deadline.remainingMs())
    }), 'page_render');
    timing.pageRenderMs = Date.now() - renderStart;

    await runWithDeadline(page.evaluate(async () => {
      if (document.fonts) await document.fonts.ready;
      const mathErrors = document.querySelectorAll('.katex-error, mjx-merror');
      if (mathErrors.length > 0) {
        throw new Error(`KaTeX failed to render ${mathErrors.length} expression(s)`);
      }
    }), 'page_render');
    await runWithDeadline(page.waitForFunction(
      () => !document.fonts || document.fonts.status === 'loaded',
      { timeout: Math.max(1000, Math.min(deadline.remainingMs(), 15000)) }
    ), 'page_render');

    const pdfStart = Date.now();

    // Footer template: rendered inside the reserved margin-bottom zone by Chromium.
    // Because Chromium physically reserves the bottom margin for this template,
    // content is GUARANTEED to stop before the footer — no z-index tricks needed.
    // The favicon is embedded as a data-URL so no external fetch is required.
    const footerFaviconTag = faviconDataUrl
      ? `<img src="${faviconDataUrl}" style="width:14px;height:14px;border-radius:3px;opacity:0.55;flex-shrink:0" alt="" />`
      : '';

    // IMPORTANT: footerTemplate MUST use inline styles only (no class names).
    // The -webkit-print-color-adjust and font-size on the wrapper are required
    // for Chromium to render footer content correctly.
    const footerTemplate = `
      <div style="
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 5px 10mm 0 10mm;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 9px;
        color: rgba(11,18,32,0.42);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        border-top: 0.5px solid rgba(11,18,32,0.10);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <span style="display:inline-flex;align-items:center;gap:5px;">
            ${footerFaviconTag}
            <span style="font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">GPT to PDF</span>
          </span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;font-size:8.5px;">
          <span style="display:flex;align-items:center;gap:4px;">
            <span>Made by</span>
            <a href="${creatorUrl}" style="color:#1D4ED8;font-weight:600;text-decoration:none;display:inline;"><span>${creatorName}</span></a>
          </span>
          <a href="${siteUrl}" style="color:rgba(11,18,32,0.42);text-decoration:none;display:inline;">${siteHost}</a>
        </div>
      </div>
    `;

    const pdf = await runWithDeadline(page.pdf({
      format: 'A4',
      printBackground: true,
      // top/left/right margins: content breathing room.
      // bottom: sized to hold the footerTemplate (≈20mm) including branding lines + spacing.
      // This is the ONLY margin declaration — the HTML has no @page rule.
      margin: { top: '14mm', bottom: '20mm', left: '10mm', right: '10mm' },
      scale: 0.95,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      timeout: Math.max(1000, Math.min(deadline.remainingMs(), 55_000)),
      // Header is empty — we only need the footer.
      headerTemplate: '<span></span>',
      footerTemplate
    }), 'pdf_generation');
    timing.pdfGenerateMs = Date.now() - pdfStart;

    await page.close();
    page = null;

    return { ok: true, buffer: Buffer.from(pdf), timing };
  } catch (err: any) {
    try {
      if (page) await page.close();
    } catch (_) {}

    const elapsed = Date.now() - start;
    if (elapsed > timeoutMs || String(err?.message ?? err).includes('safe execution budget')) {
      return { ok: false, reason: 'PDF generation exceeded the safe execution budget', stage: 'deadline', timing };
    }

    return { ok: false, reason: String(err?.message ?? err), stage, timing };
  }
}
