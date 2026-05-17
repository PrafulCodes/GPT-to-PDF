import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';
// @sparticuz/chromium-min does NOT bundle the binary — it downloads it at runtime
// from the URL passed to executablePath(). This keeps the function under Vercel's 50MB limit.
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { ParsedConversation } from './parse-chat';
import { creatorName, creatorUrl, siteHost, siteUrl } from './branding';

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

function getFaviconDataUrl() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'favicon.png');
    const icon = fs.readFileSync(filePath);
    return `data:image/png;base64,${icon.toString('base64')}`;
  } catch {
    return '';
  }
}

function buildHtml(conv: ParsedConversation) {
  const faviconDataUrl = getFaviconDataUrl();
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
    html,body{margin:0;padding:18px 18px 44px;color:#0b1220;font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif;font-size:13px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    a{color:inherit;text-decoration:none}
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
    .pdf-footer{position:fixed;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:center;z-index:2;pointer-events:none}
    .pdf-footer-card{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #d9e2ef;border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 8px 22px rgba(15,23,42,.08);backdrop-filter:blur(8px);pointer-events:auto}
    .pdf-footer-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#64748b}
    .pdf-footer-link{font-size:11px;font-weight:700;color:#0f172a}
    .pdf-footer-divider{color:#cbd5e1}
    .brand-watermark{position:fixed;top:16mm;right:12mm;display:flex;align-items:center;gap:8px;opacity:.12;pointer-events:none}
    .brand-watermark img{width:30px;height:30px;border-radius:8px}
    .brand-watermark span{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#0b1220}
    .page-mark{position:fixed;bottom:24mm;right:12mm;display:flex;align-items:center;gap:8px;opacity:.22;pointer-events:none}
    .page-mark img{width:18px;height:18px;border-radius:4px}
    .page-mark span{font-size:10px;color:#6b7280}
    @page{size:A4;margin:18mm}
  </style>
</head>
<body>
  <div class="brand-watermark">
    ${faviconDataUrl ? `<img src="${faviconDataUrl}" alt="" aria-hidden="true" />` : ''}
    <span>GPT to PDF</span>
  </div>
  <div class="container">
    <header>
      <div class="title">${escapeHtml(conv.title || 'ChatGPT Conversation Export')}</div>
      <div class="meta">Generated: ${new Date().toISOString()} • Source: Shared ChatGPT link</div>
    </header>
    <main>
      ${messagesHtml}
    </main>
    <footer class="pdf-footer" aria-label="PDF branding">
      <div class="pdf-footer-card">
        <span class="pdf-footer-label">Made by</span>
        <a class="pdf-footer-link" href="${creatorUrl}">${escapeHtml(creatorName)}</a>
        <span class="pdf-footer-divider" aria-hidden="true">•</span>
        <a class="pdf-footer-link" href="${siteUrl}">${escapeHtml(siteHost)}</a>
      </div>
    </footer>
  </div>
  <div class="page-mark">
    ${faviconDataUrl ? `<img src="${faviconDataUrl}" alt="" aria-hidden="true" />` : ''}
    <span>${escapeHtml(conv.title || 'ChatGPT Conversation Export')}</span>
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
    ignoreHTTPSErrors: true
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
