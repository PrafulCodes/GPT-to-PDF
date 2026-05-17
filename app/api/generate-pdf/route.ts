import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

import { validateChatGptShareUrl } from '../../../lib/validate-url';
import { fetchChatPage } from '../../../lib/fetch-chat';
import { parseChatHtml } from '../../../lib/parse-chat';
import { generatePdf } from '../../../lib/generate-pdf';
import { incrementPdfGeneratedCount } from '../../../lib/pdf-stats';
import { createPdfFileName } from '../../../lib/pdf-filename';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urlInput = body?.url;

    const valid = validateChatGptShareUrl(urlInput);
    if ('reason' in valid) {
      return new Response(JSON.stringify({ error: valid.reason }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { prewarmBrowser } = require('../../../lib/generate-pdf');
      prewarmBrowser();
    } catch (e) {
      // ignore
    }

    const fetched = await fetchChatPage(valid.url, 12000);

    if ('reason' in fetched) {
      console.error('PDF Generation Error: fetchChatPage failed', fetched.reason);
      return new Response(JSON.stringify({ error: true, message: 'PDF generation failed. Please try again.' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const parsed = parseChatHtml(fetched.html);
    if (parsed.messages.length === 0) {
      console.error('PDF Generation Error: parseChatHtml returned 0 messages');
      return new Response(
        JSON.stringify({ error: true, message: 'PDF generation failed. Please try again.' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pdfResult = await generatePdf(parsed, 30000);

    if ('reason' in pdfResult) {
      console.error('PDF Generation Error:', pdfResult.reason);
      return new Response(JSON.stringify({ error: true, message: 'PDF generation failed. Please try again.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
      await incrementPdfGeneratedCount();
    } catch (e) {
      console.error('PDF Generation Error: incrementPdfGeneratedCount failed', e);
    }

    const fileName = createPdfFileName(parsed.title);

    return new Response(new Uint8Array(pdfResult.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err: any) {
    console.error('PDF Generation Error:', err);
    return new Response(JSON.stringify({ error: true, message: 'PDF generation failed. Please try again.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
