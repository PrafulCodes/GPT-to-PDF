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
      // Strip images and SVG to avoid large render artifacts in PDF and speed rendering
      const bodyHtml = (m.html || '').replace(/<img[\s\S]*?>/gi, '').replace(/<svg[\s\S]*?<\/svg>/gi, '');
      return `<section class="${cls}"><div class="header">${m.role.toUpperCase()}</div><div class="body">${bodyHtml}</div></section>`;
    })
    .join('\n');

  // Minimal, performance-optimized HTML for PDF rendering:
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(conv.title || 'ChatGPT Conversation Export')}</title>
  <style>
    /* Minimal reset and system font stack to avoid external font loading */
    html,body{margin:0;padding:18px;color:#0b1220;font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif;font-size:13px}
    .container{max-width:800px;margin:0 auto}
    header{margin-bottom:12px}
    .title{font-weight:700;font-size:18px;margin:0 0 6px}
    .meta{font-size:11px;color:#6b7280;margin-bottom:8px}
    .msg{padding:10px;margin-bottom:10px;border-left:4px solid #e5e7eb}
    .msg.user{border-left-color:#c7e0ff}
    .msg .header{font-weight:600;font-size:11px;margin-bottom:6px}
    .msg .body{font-size:13px;line-height:1.5;color:#0b1220}
    pre{background:#0b1220;color:#e6eef8;padding:8px;border-radius:6px;overflow:auto;font-size:12px}
    table{border-collapse:collapse;width:100%}
    table th, table td{padding:8px;border-bottom:1px solid #eef2f7;font-size:13px}
    footer{font-size:11px;color:#6b7280;margin-top:12px;text-align:center}
    @page{size:A4;margin:18mm}
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
    <footer>GPT to PDF — Made by Praful Mohite</footer>
  </div>
</body>
</html>`;
}

async function getLaunchOptions() {
  // Defer loading runtime-only modules to avoid bundler/runtime issues
  const req: any = eval('require');

  // Detect environment: prefer Vercel detection for production serverless
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
  const runtimeLabel = isVercel ? 'vercel' : 'local';

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
    console.log('[Vercel PDF]', JSON.stringify({ environment: runtimeLabel, runtime: 'nodejs', executablePath: execPath || null, launchResult: execExists ? 'valid' : 'invalid' }));
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

      let browser: Browser;
      if (Boolean(process.env.VERCEL || process.env.VERCEL_URL) && PuppeteerCore) {
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
    timing.htmlGenerationMs = Date.now() - htmlStart;

    const launchStart = Date.now();
    const browser = await getSharedBrowser();
    timing.chromiumLaunchMs = Date.now() - launchStart;

    page = await browser.newPage();

    const renderStart = Date.now();
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: Math.max(10000, timeoutMs)
    });
    timing.pageRenderMs = Date.now() - renderStart;

    // Measure font readiness without blocking long
    try {
      await page.evaluate(() => (document as any).fonts ? (document as any).fonts.ready : Promise.resolve());
    } catch (e) {
      // ignore
    }

    const pdfStart = Date.now();
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
      scale: 0.95,
      preferCSSPageSize: false
    });
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
