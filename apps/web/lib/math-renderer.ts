import katex from 'katex';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';

export type MathEngine = 'katex' | 'mathjax';

export type MathRenderResult = {
  html: string;
  engine: MathEngine;
};

export class MathRenderError extends Error {
  readonly category = 'math-rendering-failed';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'MathRenderError';
  }
}

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const mathjaxDocument = mathjax.document('', {
  InputJax: new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'none' })
});

function renderWithMathJax(source: string, displayMode: boolean): MathRenderResult {
  const node = mathjaxDocument.convert(source, { display: displayMode });
  return {
    html: adaptor.outerHTML(node),
    engine: 'mathjax'
  };
}

export function renderMath(source: string, displayMode: boolean): MathRenderResult {
  if (/\\begin\{(?:align|gather|equation)\*?\}/.test(source)) {
    return renderWithMathJax(source, displayMode);
  }

  try {
    return {
      html: katex.renderToString(source, {
        displayMode,
        throwOnError: true,
        output: 'htmlAndMathml',
        strict: 'warn'
      }),
      engine: 'katex'
    };
  } catch (katexError) {
    try {
      return renderWithMathJax(source, displayMode);
    } catch (mathjaxError) {
      throw new MathRenderError('Both KaTeX and MathJax failed to render an expression', {
        cause: mathjaxError ?? katexError
      });
    }
  }
}

export function renderMathSource(
  source: string,
  displayMode: boolean,
  render: (source: string, displayMode: boolean) => MathRenderResult = renderMath
): MathRenderResult {
  return render(source, displayMode);
}
