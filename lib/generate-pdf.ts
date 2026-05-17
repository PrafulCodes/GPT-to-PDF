import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';
let sparticuz: any = null;
let PuppeteerCore: any = null;
import { ParsedConversation } from './parse-chat';

export type PdfTiming = {
  htmlGenerationMs: number;
  chromiumLaunchMs: number;
  pageRenderMs: number;
  pdfGenerateMs: number;
};

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

function buildHtml(conv: ParsedConversation) {
  const messagesHtml = conv.messages
    .map((m) => {
      const cls = m.role === 'user' ? 'msg user' : 'msg assistant';
      return `<section class="${cls}"><div class="header">${m.role.toUpperCase()}</div><div class="body">${m.html}</div></section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ChatGPT Conversation Export</title>
  <style>
    :root{
      --bg: #ffffff;
      --text: #0f172a;
      --muted: #6b7280;
      --edge: #e6eef8;
    }

    html,body{height:100%}
    body{
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color:var(--text);
      background:var(--bg);
      margin:0;
      padding:22px;
      -webkit-font-smoothing:antialiased;
    }

    .container{max-width:900px;margin:0 auto}

    header.doc{
      padding:18px 0 8px;
      margin-bottom:18px;
    }
    .title{font-size:28px;font-weight:700;line-height:1.1;margin:0;color:var(--text)}
    .submeta{display:flex;gap:12px;align-items:center;margin-top:8px;color:var(--muted);font-size:12px}
    .divider{height:1px;background:linear-gradient(90deg, transparent, var(--edge), transparent);margin:18px 0;border-radius:2px}

    .msg{
      border-radius:10px;
      padding:14px;
      margin-bottom:16px;
      box-shadow:0 6px 18px rgba(12,20,36,0.06);
      border:1px solid rgba(12,20,36,0.04);
      background:linear-gradient(180deg, #fff, #fbfdff);
      break-inside:avoid;
      page-break-inside:avoid;
      -webkit-column-break-inside: avoid;
      -webkit-page-break-inside: avoid;
    }

    .msg.user{background:linear-gradient(180deg,#fbfdff,#f8fcff);border-left:6px solid rgba(37,99,235,0.12)}
    .msg.assistant{background:linear-gradient(180deg,#ffffff,#fbfdff);border-left:6px solid rgba(15,23,42,0.03)}

    .msg .header{font-weight:600;font-size:12px;color:var(--text);margin-bottom:8px;letter-spacing:0.6px}
    .msg .body{font-size:14px;line-height:1.58;color:var(--text)}

    .msg .body p{margin:0 0 12px}
    .msg .body h1, .msg .body h2, .msg .body h3{margin:12px 0;font-weight:700}
    .msg .body h1{font-size:20px}
    .msg .body h2{font-size:18px}
    .msg .body h3{font-size:16px}
    .msg .body ul, .msg .body ol{padding-left:20px;margin:0 0 12px}
    .msg .body blockquote{border-left:4px solid var(--edge);padding-left:12px;color:var(--muted);margin:0 0 12px;background:rgba(15,23,42,0.02);border-radius:6px;padding:10px}

    pre{background:#0f1724;color:#e6eef8;padding:14px;border-radius:8px;overflow:auto;font-size:12px;line-height:1.45;margin:0 0 12px}
    pre, code{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace}
    code{background:rgba(12,20,36,0.03);padding:2px 6px;border-radius:6px}
    pre{page-break-inside:avoid;break-inside:avoid}

    table{border-collapse:collapse;width:100%;margin:8px 0 12px}
    table th{background:#f8fafc;padding:10px;text-align:left;border-bottom:1px solid var(--edge);font-weight:600}
    table td{padding:10px;border-bottom:1px solid #eef2f7}

    footer.pdf-foot{position:fixed;left:0;right:0;bottom:12mm;text-align:center;font-size:11px;color:var(--muted);opacity:0.6}
    footer.pdf-foot a{color:var(--muted);text-decoration:none;border-bottom:1px dotted rgba(107,114,128,0.25)}

    @media (max-width:420px){
      body{padding:12px}
      .container{padding:0}
      .title{font-size:20px}
      .msg{padding:12px}
      pre{font-size:11px}
    }

    @page{size:A4;margin:18mm}
  </style>
</head>
<body>
  <div class="container">
    <header class="doc">
      <div class="title">${escapeHtml(conv.title || 'ChatGPT Conversation Export')}</div>
      <div class="submeta">
        <div>Generated on: ${new Date().toLocaleString()}</div>
        <div>•</div>
        <div>Source: Shared ChatGPT link</div>
      </div>
      <div class="divider" aria-hidden="true"></div>
    </header>

    <main>
      ${messagesHtml}
    </main>
  </div>

  <footer class="pdf-foot">GPT to PDF — Made by <a href="https://www.linkedin.com/in/praful-mohite" target="_blank" rel="noopener">Praful Mohite</a></footer>
</body>
</html>`;
}

async function getLaunchOptions() {
  // Defer loading runtime-only modules to avoid bundler/runtime issues
  const req: any = eval('require');

  // Detect environment: prefer Vercel detection for production serverless
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);

  if (cachedLaunchOptions && cachedLaunchOptions.serverless === isVercel) return cachedLaunchOptions.options;

  // Load sparticuz only when we intend to use it (production/serverless)
  if (isVercel && !sparticuz) {
    try {
      sparticuz = req('@sparticuz/chromium');
    } catch (e) {
      sparticuz = null;
    }
  }

  // Load puppeteer-core when on Vercel to avoid shipping full Chromium bundle
  if (isVercel && !PuppeteerCore) {
    try {
      PuppeteerCore = req('puppeteer-core');
    } catch (e) {
      PuppeteerCore = null;
    }
  }

  let launchOptions: any = {
    defaultViewport: { width: 900, height: 1120 },
    ignoreHTTPSErrors: true
  };

  const fs = req('fs');

  const isServerless = isVercel; // explicit naming

  if (isServerless && sparticuz) {
    // Try to use sparticuz's chromium when available in serverless (Vercel)
    const execPath = await sparticuz.executablePath();
    const execExists = !!execPath && typeof execPath === 'string' && fs.existsSync(execPath);
    if (execExists) {
      // Use puppeteer-core with sparticuz executable
      launchOptions = {
        ...launchOptions,
        args: Array.isArray(sparticuz.args) ? sparticuz.args : [],
        executablePath: execPath,
        headless: 'new'
      };
    } else {
      // sparticuz present but binary missing — fallback to puppeteer-core without executablePath
      console.warn('[PDF] sparticuz executablePath invalid, falling back to puppeteer-core default');
      launchOptions = { ...launchOptions, headless: 'new' };
    }
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
      launchOptions = { ...launchOptions, executablePath: found, headless: 'new' };
    } else {
      // Use bundled Chromium shipped with puppeteer
      launchOptions = { ...launchOptions, headless: 'new' };
    }
  }

  cachedLaunchOptions = { options: launchOptions, serverless: isVercel };
  return launchOptions;
}

async function getSharedBrowser(): Promise<Browser> {
  if (!sharedBrowserPromise) {
    sharedBrowserPromise = (async () => {
      const launchOptions = await getLaunchOptions();
      const usingServerless = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
      // Log chosen strategy
      console.log('[PDF] Environment:', usingServerless ? 'vercel' : 'local');
      console.log('[PDF] Launch strategy:', usingServerless ? 'puppeteer-core/@sparticuz' : 'puppeteer');
      console.log('[PDF] Launch executable:', launchOptions.executablePath ? launchOptions.executablePath : 'bundled');

      let browser: Browser;
      if (usingServerless && PuppeteerCore) {
        // Use puppeteer-core in serverless environments
        browser = await PuppeteerCore.launch(launchOptions as any);
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

export async function generatePdf(
  conv: ParsedConversation,
  timeoutMs = 30000
): Promise<
  { ok: true; buffer: Buffer; timing: PdfTiming } |
  { ok: false; reason: string; timing: PdfTiming }
> {
  const timing = defaultTiming();
  const start = Date.now();
  let page: Page | null = null;

  try {
    const htmlStart = Date.now();
    const html = buildHtml(conv);
    console.log('generate-pdf: html generated, length:', html.length);
    timing.htmlGenerationMs = Date.now() - htmlStart;

    const launchStart = Date.now();
    const browser = await getSharedBrowser();
    console.log('generate-pdf: browser acquired');
    timing.chromiumLaunchMs = Date.now() - launchStart;

    page = await browser.newPage();
    console.log('generate-pdf: new page created');

    const renderStart = Date.now();
    console.log('generate-pdf: setting page content');
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: Math.max(10000, timeoutMs)
    });
    console.log('generate-pdf: page content set');
    timing.pageRenderMs = Date.now() - renderStart;

    const pdfStart = Date.now();
    console.log('generate-pdf: generating pdf');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', bottom: '18mm', left: '12mm', right: '12mm' }
    });
    console.log('generate-pdf: pdf generated, size:', pdf.length);
    timing.pdfGenerateMs = Date.now() - pdfStart;

    await page.close();
    page = null;

    return { ok: true, buffer: pdf, timing };
  } catch (err: any) {
    try {
      if (page) await page.close();
    } catch (_) {}

    const elapsed = Date.now() - start;
    if (elapsed > timeoutMs) {
      return { ok: false, reason: 'PDF generation timed out', timing };
    }

    return { ok: false, reason: String(err?.message ?? err), timing };
  }
}
