import assert from 'node:assert/strict';
import test from 'node:test';
import {
  markdownToHtml,
  normalizeLatexDelimiters,
  restoreRenderedMathSource
} from './generate-pdf';

test('normalizes all supported delimiter styles without changing TeX', () => {
  const source = String.raw`\(\frac{a+b}{c+d}\) and \[\sum_{n=1}^{\infty}\frac{1}{n^2}\]`;
  const normalized = normalizeLatexDelimiters(source);

  assert.equal(normalized, String.raw`$\frac{a+b}{c+d}$ and $$\sum_{n=1}^{\infty}\frac{1}{n^2}$$`);
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
  assert.match(html, /class="katex-display"/);
  assert.doesNotMatch(html, /katex-error/);
  assert.match(html, /π|alpha/);
});

test('keeps literal LaTeX in fenced code blocks', async () => {
  const html = await markdownToHtml('```latex\n\\frac{a}{b}\n```');

  assert.match(html, /<pre><code class="language-latex">\\frac\{a\}\{b\}/);
  assert.doesNotMatch(html, /class="katex"/);
});
