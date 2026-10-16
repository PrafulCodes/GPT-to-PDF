import { NextRequest } from 'next/server';
import { z } from 'zod';
import { trackExportEvent } from '@repo/analytics';

export const runtime = 'nodejs';
export const maxDuration = 60;

import { validateChatGptShareUrl } from '../../../lib/validate-url';
import { CHAT_PAGE_TOO_LARGE_REASON, fetchChatPage } from '../../../lib/fetch-chat';
import { parseChatHtml } from '../../../lib/parse-chat';
import { createPdfDeadline, generatePdf } from '../../../lib/generate-pdf';
import { incrementPdfGenerationStats } from '../../../lib/pdf-stats';
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
const EXPORT_DEADLINE_MS = 55_000;

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
  const deadline = createPdfDeadline(EXPORT_DEADLINE_MS);
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);
  const fingerprint = getRequestFingerprint(ip, userAgent);
  const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
  const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
  const referrer = req.headers.get('referer') || 'Direct';

  const recordExportEvent = async (
    success: boolean,
    failureReason?: string | null,
    failureStage?: string | null,
    httpStatus?: number | null,
    pdfSize?: number | null
  ) => {
    await trackExportEvent({
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
      generationDuration: (Date.now() - startTime) / 1000
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
    await recordExportEvent(false, 'Rate Limited', 'rate_limiting', 429);

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
      await recordExportEvent(false, 'Payload Too Large', 'payload_validation', 413);
      return jsonError(413, { error: 'Payload too large' });
    }

    logSecurityEvent('warn', 'MALFORMED_REQUEST_BODY', {
      route: '/api/generate-pdf',
      ip
    });
    await recordExportEvent(false, 'Invalid Request Body', 'payload_validation', 400);
    return jsonError(400, { error: 'Invalid request body' });
  }

  const parsedBody = generatePdfSchema.safeParse(bodyResult.data);
  if (!parsedBody.success) {
    logSecurityEvent('warn', 'MALFORMED_REQUEST_BODY', {
      route: '/api/generate-pdf',
      ip,
      reason: 'schema_validation_failed'
    });
    await recordExportEvent(false, 'Invalid Request Body', 'payload_validation', 400);
    return jsonError(400, { error: 'Invalid request body' });
  }

  const slot = await acquirePdfConcurrencySlot();
  if (!slot.acquired) {
    logSecurityEvent('warn', 'SERVER_BUSY', {
      route: '/api/generate-pdf',
      ip
    });
    await recordExportEvent(false, 'Server Busy', 'concurrency_limits', 503);
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
      await recordExportEvent(false, 'Invalid URL', 'url_validation', 400);
      return jsonError(400, { error: valid.reason });
    }

    if (deadline.remainingMs() <= 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'deadline',
        reason: 'export_deadline_exceeded',
        ip
      });
      await recordExportEvent(false, 'Export exceeded the safe execution budget', 'deadline', 504);
      return jsonError(504, {
        error: true,
        message: 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
      });
    }

    const fetched = await fetchChatPage(valid.url, Math.min(12000, deadline.remainingMs()));

    if ('reason' in fetched) {
      const tooLarge = fetched.status === 413;
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'fetch_chat_page',
        status: fetched.status,
        reason: fetched.reason,
        ip
      });
      await recordExportEvent(false, fetched.reason || 'Fetch Failed', 'fetch_chat_page', fetched.status || 502);
      return jsonError(tooLarge ? 413 : 502, {
        error: true,
        code: tooLarge ? 'CHAT_PAGE_TOO_LARGE' : 'PDF_GENERATION_FAILED',
        message: tooLarge ? CHAT_PAGE_TOO_LARGE_REASON : 'PDF generation failed. Please try again.'
      });
    }

    if (deadline.remainingMs() <= 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'deadline',
        reason: 'export_deadline_exceeded',
        ip
      });
      await recordExportEvent(false, 'Export exceeded the safe execution budget', 'deadline', 504);
      return jsonError(504, {
        error: true,
        message: 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
      });
    }

    const parsed = parseChatHtml(fetched.html);
    if (deadline.remainingMs() <= 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'deadline',
        reason: 'export_deadline_exceeded_during_parse',
        ip
      });
      await recordExportEvent(false, 'Export exceeded the safe execution budget', 'deadline', 504);
      return jsonError(504, {
        error: true,
        message: 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
      });
    }

    if (parsed.messages.length === 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'parse_chat_html',
        reason: 'no_messages',
        ip
      });
      await recordExportEvent(false, 'Parser Failed', 'parse_chat_html', 422);
      return jsonError(422, { error: true, message: 'PDF generation failed. Please try again.' });
    }

    const pdfResult = await generatePdf(parsed, EXPORT_DEADLINE_MS, deadline);

    if ('reason' in pdfResult) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: pdfResult.stage,
        reason: pdfResult.reason,
        timing: pdfResult.timing,
        ip
      });
      const timedOut = pdfResult.stage === 'deadline';
      await recordExportEvent(false, pdfResult.reason || 'PDF Generation Failed', pdfResult.stage, timedOut ? 504 : 500);
      return jsonError(timedOut ? 504 : 500, {
        error: true,
        message: timedOut
          ? 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
          : 'PDF generation failed. Please try again.'
      });
    }

    logSecurityEvent('info', 'PDF_GENERATION_COMPLETED', {
      route: '/api/generate-pdf',
      timing: pdfResult.timing,
      messageCount: parsed.messages.length,
      ip
    });

    const fileName = createPdfFileName(parsed.title);
    const pdfBuffer = pdfResult.buffer;

    try {
      const updatedStats = await incrementPdfGenerationStats(pdfBuffer.byteLength);
      if (!updatedStats) {
        logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
          route: '/api/generate-pdf',
          stage: 'stats_increment',
          reason: 'persistent_stats_unavailable',
          ip
        });
      }
    } catch {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'increment_counter',
        reason: 'counter_increment_failed',
        ip
      });
    }

    await recordExportEvent(true, null, null, 200, pdfBuffer.byteLength);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-PDF-Stats': JSON.stringify(parsed.stats || {
          messages: parsed.messages.length,
          equations: 0,
          codeBlocks: 0,
          tables: 0,
          blockquotes: 0
        }),
        'Server-Timing': [
          `html;dur=${pdfResult.timing.htmlGenerationMs}`,
          `chromium;dur=${pdfResult.timing.chromiumLaunchMs}`,
          `render;dur=${pdfResult.timing.pageRenderMs}`,
          `pdf;dur=${pdfResult.timing.pdfGenerateMs}`
        ].join(', '),
        'Cache-Control': 'no-store'
      }
    });
  } catch {
    logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
      route: '/api/generate-pdf',
      stage: 'route_exception',
      ip
    });
    await recordExportEvent(false, 'Unknown', 'route_exception', 500);
    return jsonError(500, { error: true, message: 'PDF generation failed. Please try again.' });
  } finally {
    if (slot.acquired) {
      await slot.release();
    }
  }
}
