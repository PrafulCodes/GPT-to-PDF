import { NextRequest } from 'next/server';
import { z } from 'zod';
import { trackExportEvent } from '@repo/analytics';

export const runtime = 'nodejs';
export const maxDuration = 60;

import { validateChatGptShareUrl } from '../../../lib/validate-url';
import { CHAT_PAGE_TOO_LARGE_REASON, fetchChatPage } from '../../../lib/fetch-chat';
import { parseChatHtmlDetailed } from '../../../lib/parse-chat';
import { createPdfDeadline, generatePdf } from '../../../lib/generate-pdf';
import { incrementPdfGenerationStats } from '../../../lib/pdf-stats';
import { scheduleAfterResponse } from '../../../lib/after-request';
import { createPipelineObserver } from '../../../lib/pipeline-observability';
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
  const pipeline = createPipelineObserver();
  const deadline = createPdfDeadline(EXPORT_DEADLINE_MS);
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);
  const fingerprint = getRequestFingerprint(ip, userAgent);
  const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
  const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
  const referrer = req.headers.get('referer') || 'Direct';
  const errorResponse = (status: number, payload: Record<string, unknown>, headers?: Record<string, string>) =>
    jsonError(status, payload, {
      ...(headers || {}),
      'X-Request-Id': pipeline.correlationId
    });

  pipeline.start('request_received');
  pipeline.complete('request_received');

  const recordExportEvent = (
    success: boolean,
    failureReason?: string | null,
    failureStage?: string | null,
    httpStatus?: number | null,
    pdfSize?: number | null
  ) => {
    pipeline.start('analytics_event_processing');
    pipeline.complete('analytics_event_processing', { scheduled: true, success });
    scheduleAfterResponse(
      () => trackExportEvent({
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
      }),
      'export_analytics'
    );
  };

  pipeline.start('rate_limit_check');
  const rateLimit = await enforceGenerateRateLimits(ip, fingerprint);
  pipeline.complete('rate_limit_check', {
    success: rateLimit.success,
    status: rateLimit.success ? 200 : 429
  });
  if (!rateLimit.success) {
    logSecurityEvent('warn', 'RATE_LIMIT_EXCEEDED', {
      route: '/api/generate-pdf',
      ip,
      limit: rateLimit.limit,
      remaining: rateLimit.remaining
    });
    recordExportEvent(false, 'Rate Limited', 'rate_limiting', 429);

    return errorResponse(
      429,
      { error: 'Rate limit exceeded' },
      {
        'Retry-After': String(rateLimit.retryAfterSeconds),
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      }
    );
  }

  pipeline.start('request_validation');
  const bodyResult = await readJsonBodyWithLimit(req, MAX_REQUEST_BODY_BYTES);
  if (!bodyResult.ok) {
    pipeline.fail('request_validation', { errorCode: bodyResult.tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_REQUEST_BODY' }, 'warn');
    if (bodyResult.tooLarge) {
      logSecurityEvent('warn', 'OVERSIZED_PAYLOAD', {
        route: '/api/generate-pdf',
        ip,
        maxBytes: MAX_REQUEST_BODY_BYTES
      });
      recordExportEvent(false, 'Payload Too Large', 'payload_validation', 413);
      return errorResponse(413, { error: 'Payload too large' });
    }

    logSecurityEvent('warn', 'MALFORMED_REQUEST_BODY', {
      route: '/api/generate-pdf',
      ip
    });
    recordExportEvent(false, 'Invalid Request Body', 'payload_validation', 400);
    return errorResponse(400, { error: 'Invalid request body' });
  }

  const parsedBody = generatePdfSchema.safeParse(bodyResult.data);
  if (!parsedBody.success) {
    pipeline.fail('request_validation', { errorCode: 'INVALID_REQUEST_BODY' }, 'warn');
    logSecurityEvent('warn', 'MALFORMED_REQUEST_BODY', {
      route: '/api/generate-pdf',
      ip,
      reason: 'schema_validation_failed'
    });
    recordExportEvent(false, 'Invalid Request Body', 'payload_validation', 400);
    return errorResponse(400, { error: 'Invalid request body' });
  }
  pipeline.complete('request_validation', { status: 200 });

  pipeline.start('concurrency_check');
  const slot = await acquirePdfConcurrencySlot();
  pipeline.complete('concurrency_check', { success: slot.acquired, status: slot.acquired ? 200 : 503 });
  if (!slot.acquired) {
    logSecurityEvent('warn', 'SERVER_BUSY', {
      route: '/api/generate-pdf',
      ip
    });
    recordExportEvent(false, 'Server Busy', 'concurrency_limits', 503);
    return errorResponse(503, { error: 'Server busy. Try again shortly.' });
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
      recordExportEvent(false, 'Invalid URL', 'url_validation', 400);
      return errorResponse(400, { error: valid.reason });
    }

    if (deadline.remainingMs() <= 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'deadline',
        reason: 'export_deadline_exceeded',
        ip
      });
      recordExportEvent(false, 'Export exceeded the safe execution budget', 'deadline', 504);
      return errorResponse(504, {
        error: true,
        message: 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
      });
    }

    pipeline.start('chat_page_fetch');
    const fetched = await fetchChatPage(valid.url, Math.min(12000, deadline.remainingMs()), { signal: req.signal });

    if ('reason' in fetched) {
      pipeline.fail('chat_page_fetch', {
        errorCode: fetched.category,
        httpStatus: fetched.status || undefined,
        retryAttempt: fetched.attempt,
        retriesExhausted: fetched.retriesExhausted
      });
      const tooLarge = fetched.status === 413;
      const fetchStatus = fetched.status || (
        fetched.category === 'UPSTREAM_TIMEOUT' ? 504 :
          fetched.category === 'ACCESS_DENIED' ? 403 :
            fetched.category === 'RESOURCE_NOT_FOUND' ? 404 :
              fetched.category === 'INVALID_URL' ? 400 : 502
      );
      const fetchMessage = fetched.category === 'ACCESS_DENIED'
        ? 'This shared conversation is not accessible.'
        : fetched.category === 'RESOURCE_NOT_FOUND'
          ? 'This shared conversation was not found or has expired.'
          : fetched.category === 'UPSTREAM_RATE_LIMITED'
            ? 'ChatGPT is temporarily rate limiting requests. Please try again shortly.'
            : fetched.category === 'UPSTREAM_TIMEOUT'
              ? 'ChatGPT took too long to respond. Please try again.'
              : fetched.category === 'UPSTREAM_UNAVAILABLE'
                ? 'ChatGPT is temporarily unavailable. Please try again shortly.'
                : fetched.category === 'RESPONSE_TOO_LARGE'
                  ? CHAT_PAGE_TOO_LARGE_REASON
                  : 'Unable to fetch the shared conversation.';
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'fetch_chat_page',
        status: fetched.status,
        reason: fetched.reason,
        category: fetched.category,
        attempt: fetched.attempt,
        retriesExhausted: fetched.retriesExhausted,
        durationMs: fetched.durationMs,
        ip
      });
      recordExportEvent(false, fetched.category, 'fetch_chat_page', tooLarge ? 413 : fetchStatus);
      return errorResponse(tooLarge ? 413 : fetchStatus, {
        error: true,
        code: tooLarge ? 'CHAT_PAGE_TOO_LARGE' : fetched.category,
        message: fetchMessage
      });
    }
    pipeline.complete('chat_page_fetch', { httpStatus: fetched.status, retryAttempt: fetched.attempts });
    pipeline.start('upstream_response_validation');
    pipeline.complete('upstream_response_validation', {
      httpStatus: fetched.status,
      contentType: fetched.contentType,
      bytes: fetched.bytes
    });

    if (deadline.remainingMs() <= 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'deadline',
        reason: 'export_deadline_exceeded',
        ip
      });
      recordExportEvent(false, 'Export exceeded the safe execution budget', 'deadline', 504);
      return errorResponse(504, {
        error: true,
        message: 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
      });
    }

    pipeline.start('page_classification');
    pipeline.start('html_parsing');
    pipeline.start('message_extraction');
    pipeline.start('content_normalization');
    const parsed = parseChatHtmlDetailed(fetched.html, {
      upstreamStatus: fetched.status,
      contentType: fetched.contentType
    });
    logSecurityEvent('info', 'CHAT_PAGE_PARSE_DIAGNOSTICS', {
      route: '/api/generate-pdf',
      ip,
      ...parsed.diagnostics
    });
    const parseStageMetadata = {
      classification: parsed.classification,
      strategy: parsed.diagnostics.successfulStrategy,
      extractedMessageCount: parsed.diagnostics.extractedMessageCount,
      partialExtraction: parsed.diagnostics.partialExtraction
    };
    if (!parsed.ok) {
      pipeline.fail('page_classification', { errorCode: parsed.errorCode, classification: parsed.classification });
      pipeline.fail('html_parsing', parseStageMetadata);
      pipeline.fail('message_extraction', parseStageMetadata);
      pipeline.fail('content_normalization', parseStageMetadata);
    } else {
      pipeline.complete('page_classification', { classification: parsed.classification });
      pipeline.complete('html_parsing', {
        strategy: parsed.diagnostics.successfulStrategy,
        extractedMessageCount: parsed.diagnostics.extractedMessageCount
      });
      pipeline.complete('message_extraction', {
        extractedMessageCount: parsed.diagnostics.extractedMessageCount
      });
      pipeline.complete('content_normalization', {
        partialExtraction: parsed.diagnostics.partialExtraction
      });
    }
    if (deadline.remainingMs() <= 0) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'deadline',
        reason: 'export_deadline_exceeded_during_parse',
        ip
      });
      recordExportEvent(false, 'Export exceeded the safe execution budget', 'deadline', 504);
      return errorResponse(504, {
        error: true,
        message: 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
      });
    }

    if (!parsed.ok) {
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: 'parse_chat_html',
        reason: parsed.diagnostics.failureClassification || parsed.classification,
        classification: parsed.classification,
        ip
      });
      const status = parsed.classification === 'AUTH_REQUIRED'
        ? 401
        : parsed.classification === 'ACCESS_DENIED' || parsed.classification === 'CAPTCHA_OR_CHALLENGE'
          ? 403
          : parsed.classification === 'EXPIRED_OR_UNAVAILABLE'
            ? 410
            : 422;
      recordExportEvent(false, parsed.classification, 'parse_chat_html', status);
      return errorResponse(status, {
        error: true,
        code: parsed.errorCode,
        message: parsed.message
      });
    }

    pipeline.start('pdf_rendering');
    const pdfResult = await generatePdf(parsed.conversation, EXPORT_DEADLINE_MS, deadline);

    if ('reason' in pdfResult) {
      pipeline.fail('pdf_rendering', {
        errorCode: pdfResult.stage,
        timing: pdfResult.timing
      });
      logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
        route: '/api/generate-pdf',
        stage: pdfResult.stage,
        reason: pdfResult.reason,
        timing: pdfResult.timing,
        ip
      });
      const timedOut = pdfResult.stage === 'deadline';
      recordExportEvent(false, pdfResult.reason || 'PDF Generation Failed', pdfResult.stage, timedOut ? 504 : 500);
      return errorResponse(timedOut ? 504 : 500, {
        error: true,
        message: timedOut
          ? 'This conversation is too large to safely export within the time limit. Try a shorter conversation.'
          : 'PDF generation failed. Please try again.'
      });
    }
    pipeline.complete('pdf_rendering', {
      messageCount: parsed.conversation.messages.length,
      timing: pdfResult.timing
    });

    logSecurityEvent('info', 'PDF_GENERATION_COMPLETED', {
      route: '/api/generate-pdf',
      timing: pdfResult.timing,
      messageCount: parsed.conversation.messages.length,
      ip
    });

    const fileName = createPdfFileName(parsed.conversation.title);
    const pdfBuffer = pdfResult.buffer;

    scheduleAfterResponse(async () => {
      const updatedStats = await incrementPdfGenerationStats(pdfBuffer.byteLength);
      if (!updatedStats) {
        logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
          route: '/api/generate-pdf',
          stage: 'stats_increment',
          reason: 'persistent_stats_unavailable',
          ip
        });
      }
    }, 'pdf_stats_increment');
    recordExportEvent(true, null, null, 200, pdfBuffer.byteLength);

    pipeline.start('pdf_response_delivery');
    const response = new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-PDF-Stats': JSON.stringify(parsed.conversation.stats || {
          messages: parsed.conversation.messages.length,
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
    pipeline.complete('pdf_response_delivery', {
      status: 200,
      bytes: pdfBuffer.byteLength
    });
    response.headers.set('X-Request-Id', pipeline.correlationId);
    return response;
  } catch {
    logSecurityEvent('error', 'PDF_GENERATION_FAILED', {
      route: '/api/generate-pdf',
      stage: 'route_exception',
      ip
    });
    recordExportEvent(false, 'Unknown', 'route_exception', 500);
    return errorResponse(500, { error: true, message: 'PDF generation failed. Please try again.' });
  } finally {
    if (slot.acquired) {
      await slot.release();
    }
  }
}
