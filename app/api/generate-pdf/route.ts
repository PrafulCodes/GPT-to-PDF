import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { validateChatGptShareUrl } from '../../../lib/validate-url';
import { fetchChatPage } from '../../../lib/fetch-chat';
import { parseChatHtml } from '../../../lib/parse-chat';
import { generatePdf } from '../../../lib/generate-pdf';
import { incrementPdfGeneratedCount } from '../../../lib/pdf-stats';

export async function POST(req: NextRequest) {
  try {
    console.log('1. request received');
    const body = await req.json();
    const urlInput = body?.url;

    const valid = validateChatGptShareUrl(urlInput);
    if ('reason' in valid) {
      console.log('2. URL validated: invalid', valid.reason);
      return new Response(JSON.stringify({ error: valid.reason }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    console.log('2. URL validated');

    const fetched = await fetchChatPage(valid.url, 12000);
    console.log('3. chat fetched');

    if ('reason' in fetched) {
      console.error('PDF Generation Error: fetchChatPage failed', fetched.reason);
      return new Response(JSON.stringify({ error: true, message: 'Failed to fetch shared page', detail: fetched.reason }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const parsed = parseChatHtml(fetched.html);
    console.log('4. parsed');
    if (parsed.messages.length === 0) {
      console.error('PDF Generation Error: parseChatHtml returned 0 messages');
      return new Response(
        JSON.stringify({ error: true, message: 'Failed to parse conversation messages from structured source' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('5. generating html');
    console.log('6. launching browser (generatePdf will handle launch)');
    const pdfResult = await generatePdf(parsed, 30000);

    if ('reason' in pdfResult) {
      console.error('PDF Generation Error:', pdfResult.reason);
      return new Response(JSON.stringify({ error: true, message: String(pdfResult.reason) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('9. pdf success');

    try {
      await incrementPdfGeneratedCount();
    } catch (e) {
      console.warn('incrementPdfGeneratedCount failed', e);
    }

    const fileName = `gpt-conversation-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;

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
    console.error('message:', err?.message);
    console.error('stack:', err?.stack);
    return new Response(JSON.stringify({ error: true, message: err?.message ?? String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
