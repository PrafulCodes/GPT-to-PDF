import { NextRequest } from 'next/server';
import { z } from 'zod';
import { trackExportEvent } from '@repo/analytics';

export const runtime = 'nodejs';
export const maxDuration = 60;

import { validateChatGptShareUrl } from '../../../lib/validate-url';
import { fetchChatPage } from '../../../lib/fetch-chat';
import { parseChatHtml } from '../../../lib/parse-chat';
import { generatePdf } from '../../../lib/generate-pdf';
import { incrementPdfGeneratedCount } from '../../../lib/pdf-stats';
import { createPdfFileName } from '../../../lib/pdf-filename';
import { acquirePdfConcurrencySlot, enforceGenerateRateLimits } from '../../../lib/abuse-protection';
import {
  getClientIp,
  getRequestFingerprint,
  getUserAgent,
  logSecurityEvent,
  readJsonBodyWithLimit
} from '../../../lib/security';

const MAX_REQUEST_BODY_BYTES = 100 * 1024;

const generatePdfSchema = z.object({
  url: z.string().trim().min(1).max(2048)
}).strict();

function jsonError(status: number, payload: Record<string, unknown>, headers?: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);
  const fingerprint = getRequestFingerprint(ip, userAgent);
  const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
  const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
  const referrer = req.headers.get('referer') || 'Direct';

  // Helper function to send analytics data in the background (fire-and-forget)
  const logEvent = (
    success: boolean,
    failureReason?: string | null,
    failureStage?: string | null,
    httpStatus?: number | null,
    pdfSize?: number | null
  ) => {
    const duration = (Date.now() - startTime) / 1000;
    trackExportEvent({
      success,
      failureReason,
      failureStage,
      httpStatus,
      pdfSize,
      chatSource: 'chatgpt-shared',
      referrer,
      userAgent,
      country,
      city,
      generationDuration: duration
    }).catch(err => {
      console.error('[Analytics] Failed to write event to background:', err);
    });
  };

  const rateLimit = await enforceGenerateRateLimits(ip, fingerprint);
  if (!rateLimit.success) {
    logSecurityEvent('warn', 'RATE_LIMIT_EXCEEDED', {
      route: '/api/generate-pdf',
      ip,
      limit: rateLimit.limit,
      remaining: rateLimit.remaining
    });

    logEvent(false, 'Rate Limited', 'rate_limiting', 429);

    return jsonError(
      429,
      { error: 'Rate limit exceeded' },
      {
        'Retry-After': String(rateLimit.retryAfterSeconds),
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      }
    );
  }

  const bodyResult = await readJsonBodyWithLimit(req, MAX_REQUEST_BODY_BYTES);
  if (!bodyResult.ok) {
    if (bodyResult.tooLarge) {
      logSecurityEvent('warn', 'OVERSIZED_PAYLOAD', {
        route: '/api/generate-pdf',
        ip,
        maxBytes: MAX_REQUEST_BODY_BYTES
      });
      logEvent(false, 'Payload Too Large', 'payload_validation', 413);
      return jsonError(413, { error: 'Payload too large' });
    }

    logSecurityEvent('warn', 'MALFORMED_REQUEST_BODY', {
      route: '/api/generate-pdf',
      ip
    });
    logEvent(false, 'Invalid Request Body', 'payload_validation', 400);
    return jsonError(400, { error: 'Invalid request body' });
  }

  const parsedBody = generatePdfSchema.safeParse(bodyResult.data);
  if (!parsedBody.success) {
    logSecurityEvent('warn', 'MALFORMED_REQUEST_BODY', {
      route: '/api/generate-pdf',
      ip,
      reason: 'schema_validation_failed'
    });
    logEvent(false, 'Invalid Request Body', 'payload_validation', 400);
    return jsonError(400, { error: 'Invalid request body' });
  }

  const slot = await acquirePdfConcurrencySlot();
  if (!slot.acquired) {
    logSecurityEvent('warn', 'SERVER_BUSY', {
      route: '/api/generate-pdf',
      ip
    });
    logEvent(false, 'Server Busy', 'concurrency_limits', 503);
    return jsonError(503, { error: 'Server busy. Try again shortly.' });
  }

  try {
    const urlInput = parsedBody.data.url;

    const valid = validateChatGptShareUrl(urlInput);
    if ('reason' in valid) {
      logSecurityEvent('warn', 'INVALID_CHAT_URL', {
        route: '/api/generate-pdf',
        ip,
        reason: valid.reason
      });
      logEvent(false, 'Invalid URL', 'url_validation', 400);
      return jsonError(400, { error: valid.reason });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { prewarmBrowser } = require('../../../lib/generate-pdf');
      prewarmBrowser();
    } catch {
      // ignore
    }

    const fetched = await fetchChatPage(valid.url, 12000);

    if ('reason' in fetched) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'fetch_chat_page',
        status: fetched.status,
        reason: fetched.reason,
        ip
      });
      logEvent(false, fetched.reason || 'Fetch Failed', 'fetch_chat_page', fetched.status || 502);
      return jsonError(502, { error: true, message: 'PDF generation failed. Please try again.' });
    }

    const parsed = parseChatHtml(fetched.html);
    if (parsed.messages.length === 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'parse_chat_html',
        reason: 'no_messages',
        ip
      });
      logEvent(false, 'Parser Failed', 'parse_chat_html', 422);
      return jsonError(422, { error: true, message: 'PDF generation failed. Please try again.' });
    }

    const pdfResult = await generatePdf(parsed, 30000);

    if ('reason' in pdfResult) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'generate_pdf',
        reason: pdfResult.reason,
        ip
      });
      logEvent(false, pdfResult.reason || 'PDF Generation Failed', 'generate_pdf', 500);
      return jsonError(500, { error: true, message: 'PDF generation failed. Please try again.' });
    }

    try {
      await incrementPdfGeneratedCount();
    } catch {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'increment_counter',
        reason: 'counter_increment_failed',
        ip
      });
    }

    const fileName = createPdfFileName(parsed.title);
    const pdfBuffer = pdfResult.buffer;

    // Track successful export event in background
    logEvent(true, null, null, 200, pdfBuffer.byteLength);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch {
    logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
      route: '/api/generate-pdf',
      stage: 'route_exception',
      ip
    });
    logEvent(false, 'Unknown', 'route_exception', 500);
    return jsonError(500, { error: true, message: 'PDF generation failed. Please try again.' });
  } finally {
    if (slot.acquired) {
      await slot.release();
    }
  }
}
