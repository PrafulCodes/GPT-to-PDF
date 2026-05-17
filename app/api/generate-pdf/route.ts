import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { validateChatGptShareUrl } from '../../../lib/validate-url';
import { fetchChatPage } from '../../../lib/fetch-chat';
import { parseChatHtml } from '../../../lib/parse-chat';
import { generatePdf } from '../../../lib/generate-pdf';
import { incrementPdfGeneratedCount } from '../../../lib/pdf-stats';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urlInput = body?.url;

    const valid = validateChatGptShareUrl(urlInput);
    if ('reason' in valid) {
      return new Response(JSON.stringify({ error: valid.reason }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const fetched = await fetchChatPage(valid.url, 12000);

    if ('reason' in fetched) {
      return new Response(JSON.stringify({ error: 'Failed to fetch shared page', detail: fetched.reason }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const parsed = parseChatHtml(fetched.html);
    if (parsed.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse conversation messages from structured source' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pdfResult = await generatePdf(parsed, 30000);

    if ('reason' in pdfResult) {
      return new Response(JSON.stringify({ error: 'PDF generation failed', detail: pdfResult.reason }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
      await incrementPdfGeneratedCount();
    } catch {
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
    return new Response(JSON.stringify({ error: 'Internal server error', detail: String(err?.message ?? err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
