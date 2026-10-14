import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPdfDeadline,
  buildHtml,
  generatePdf,
  markdownToHtml,
  normalizeLatexDelimiters,
  renderMessagesHtml,
  restoreRenderedMathSource
} from './generate-pdf';
import { renderMath, renderMathSource } from './math-renderer';
import { getConversationStats } from './parse-chat';
import { bytesToMegabytes, getPdfGenerationStats } from './pdf-stats';
import {
  formatElapsedTime,
  getExportErrorMessage,
  getLoadingNotice
} from '../components/HeroInputCard';

test('normalizes all supported delimiter styles without changing TeX', () => {
  const source = String.raw`\(\frac{a+b}{c+d}\) and \[\sum_{n=1}^{\infty}\frac{1}{n^2}\]`;
  const normalized = normalizeLatexDelimiters(source);

  assert.equal(normalized, String.raw`$\frac{a+b}{c+d}$ and $$
\sum_{n=1}^{\infty}\frac{1}{n^2}
$$`);
});

test('recovers TeX from already-rendered KaTeX HTML', () => {
  const rendered = '<p>Before <span class="katex"><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">\\frac{a}{b}</annotation></semantics></math></span></span> after</p>';

  assert.match(restoreRenderedMathSource(rendered), /\$\\frac\{a\}\{b\}\$/);
});

test('renders advanced and multiline expressions as KaTeX', async () => {
  const html = await markdownToHtml(String.raw`
Inline: $\alpha + \beta + \gamma$.

$$
\begin{align}
\sum_{n=1}^{\infty} \frac{1}{n^2} &= \frac{\pi^2}{6} \\
\det\begin{pmatrix}a & b\\c & d\end{pmatrix} &= ad-bc
\end{align}
$$
`);

  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-display"|mjx-container/);
  assert.doesNotMatch(html, /katex-error/);
  assert.match(html, /π|alpha/);
  assert.doesNotMatch(html, /<hr\b/i);
});

test('keeps literal LaTeX in fenced code blocks', async () => {
  const html = await markdownToHtml('```latex\n\\frac{a}{b}\n```');

  assert.match(html, /<pre><code class="language-latex">\\frac\{a\}\{b\}/);
  assert.doesNotMatch(html, /class="katex"/);
});

test('renders the minimal reproduction fixture and removes ChatGPT writing wrappers', async () => {
  const fixture = String.raw`:::writing{variant="standard" title="Math"}
Inline: \(E = mc^2\)

\[\frac{a+b}{\sqrt{x^2+1}}\]

\[\sum_{n=1}^{\infty}\frac{1}{n^2}\]

\[\begin{aligned}f(x)&=x^2+1\\g(x)&=\frac{1}{x+1}\end{aligned}\]
:::`;
  const html = await markdownToHtml(fixture);

  assert.equal((html.match(/class="katex-display"/g) || []).length, 3);
  assert.equal((html.match(/class="katex-error"/g) || []).length, 0);
  assert.doesNotMatch(html, /:::writing|variant="standard"/);
});

test('does not rewrite LaTeX-looking inline code', async () => {
  const html = await markdownToHtml('Use `\\(E = mc^2\\)` as a literal example.');

  assert.match(html, /<code>\\\(E = mc\^2\\\)<\/code>/);
  assert.doesNotMatch(html, /class="katex"/);
});

test('preserves legitimate Markdown horizontal rules', async () => {
  const html = await markdownToHtml('Before\n\n---\n\nAfter');

  assert.match(html, /<hr>/);
});

test('routes unsupported KaTeX environments to MathJax without duplication', () => {
  const rendered = renderMathSource(String.raw`\begin{align}f(x)&=x^2+1\\g(x)&=x+1\end{align}`, true);

  assert.equal(rendered.engine, 'mathjax');
  assert.match(rendered.html, /mjx-container/);
});

test('records the selected math engine in generated markup', async () => {
  const html = await markdownToHtml(String.raw`Inline $\alpha+\beta$`);

  assert.match(html, /math-engine-katex/);
  assert.doesNotMatch(html, /GPTPDFMATH\d+TOKEN/);
});

test('renders multiline inline math and standalone equation environments', async () => {
  const html = await markdownToHtml(String.raw`Inline: \(
a + b
\)

\begin{equation}x^2 + y^2\end{equation}`);

  assert.match(html, /class="math-expression math-engine-katex"/);
  assert.match(html, /class="math-block math-block--display math-engine-mathjax"/);
  assert.doesNotMatch(html, /\\begin\{equation\}/);
});

test('does not mistake ordinary currency for inline math', async () => {
  const html = await markdownToHtml('Prices are $5 and $10 today.');

  assert.doesNotMatch(html, /math-expression|katex/);
  assert.match(html, /\$5/);
});

test('recovers MathJax source before sanitizing its SVG output', () => {
  const rendered = renderMath(String.raw`\begin{align}a&=b\\c&=d\end{align}`, true);
  const restored = restoreRenderedMathSource(
    `<div class="MathJax_Display"><annotation encoding="application/x-tex">\\begin{align}a&amp;=b\\\\c&amp;=d\\end{align}</annotation>${rendered.html}</div>`
  );

  assert.match(restored, /\$\$[\s\S]*\\begin\{align\}/);
});

test('includes local math fonts and print-safe equation rules in the PDF document', async () => {
  const html = await buildHtml(
    { title: 'Print fixture', messages: [{ role: 'assistant', html: '<p>$$\\frac{a}{b}$$</p>' }] },
    createPdfDeadline(10_000)
  );

  assert.match(html, /@font-face/);
  assert.match(html, /page-break-inside:avoid/);
  assert.match(html, /break-inside:avoid/);
  assert.match(html, /data:font\//);
});

test('reports content-preservation statistics without message contents', () => {
  const stats = getConversationStats([
    { role: 'assistant', html: '<p>\\(x^2\\)</p><pre><code>x</code></pre><table><tr><td>x</td></tr></table>' }
  ]);

  assert.deepEqual(stats, { messages: 1, equations: 1, codeBlocks: 1, tables: 1, blockquotes: 0 });
});

test('converts PDF bytes to decimal megabytes consistently', () => {
  assert.equal(bytesToMegabytes(1_000_000), 1);
  assert.equal(bytesToMegabytes(2_500_000), 2.5);
});

test('does not present an in-memory counter when persistent stats are unavailable', async () => {
  assert.equal(await getPdfGenerationStats(), null);
});

test('renders large conversations with bounded workers and preserves message order', async () => {
  const messages = Array.from({ length: 80 }, (_, index) => ({
    role: index % 2 === 0 ? 'user' as const : 'assistant' as const,
    html: `<p>Message ${index}</p>`
  }));

  const rendered = await renderMessagesHtml(messages, createPdfDeadline(10_000));
  const positions = Array.from(rendered.matchAll(/Message (\d+)/g), (match) => Number(match[1]));

  assert.deepEqual(positions, messages.map((_, index) => index));
});

test('stops rendering when the export deadline expires', async () => {
  await assert.rejects(
    () => renderMessagesHtml([{ role: 'user', html: '<p>Too late</p>' }], createPdfDeadline(-1)),
    /safe execution budget/
  );
});

test('reports an expired PDF deadline before launching Chromium', async () => {
  const result = await generatePdf(
    { title: 'Expired', messages: [{ role: 'user', html: '<p>Too late</p>' }] },
    30_000,
    createPdfDeadline(-1)
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.stage, 'deadline');
    assert.match(result.reason, /safe execution budget/);
  }
});

test('propagates rendering failures instead of producing a partial document', async () => {
  await assert.rejects(
    () => renderMessagesHtml(
      [{ role: 'assistant', html: '<p>Broken $$\\notacommand$$</p>' }],
      createPdfDeadline(10_000),
      1,
      async () => {
        throw new Error('rendering failed');
      }
    ),
    /rendering failed/
  );
});

test('isolates concurrent conversation renders and preserves each result order', async () => {
  const conversations = Array.from({ length: 3 }, (_, conversationIndex) =>
    Array.from({ length: 25 }, (_, messageIndex) => ({
      role: 'assistant' as const,
      html: `<p>Conversation ${conversationIndex} message ${messageIndex}</p>`
    }))
  );

  const rendered = await Promise.all(
    conversations.map((messages) => renderMessagesHtml(messages, createPdfDeadline(10_000)))
  );

  rendered.forEach((html, conversationIndex) => {
    const positions = Array.from(
      html.matchAll(new RegExp(`Conversation ${conversationIndex} message (\\d+)`, 'g')),
      (match) => Number(match[1])
    );
    assert.deepEqual(positions, Array.from({ length: 25 }, (_, index) => index));
  });
});

test('formats elapsed export time for immediate and long-running states', () => {
  assert.equal(formatElapsedTime(0), '0s');
  assert.equal(formatElapsedTime(9), '9s');
  assert.equal(formatElapsedTime(65), '1m 05s');
});

test('shows delayed long-conversation and extended-wait notices without fake progress', () => {
  assert.equal(getLoadingNotice(3), null);
  assert.equal(
    getLoadingNotice(4),
    "This conversation is very long. We're processing it into a PDF, which may take a little longer."
  );
  assert.equal(
    getLoadingNotice(10),
    'Still working — please keep this page open while your PDF is prepared.'
  );
});

test('uses actionable server errors and a safe fallback for failed exports', () => {
  assert.equal(getExportErrorMessage({
    message: 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
  }), 'This conversation is too large to safely export within the time limit. Try a shorter conversation.');
  assert.equal(getExportErrorMessage({ error: true }), 'PDF generation failed. Please try again.');
  assert.equal(getExportErrorMessage(null, 'Retry later.'), 'Retry later.');
});
