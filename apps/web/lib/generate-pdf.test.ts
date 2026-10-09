import assert from 'node:assert/strict';
import test from 'node:test';
import {
  markdownToHtml,
  normalizeLatexDelimiters,
  restoreRenderedMathSource
} from './generate-pdf';
import { renderMathSource } from './math-renderer';

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
