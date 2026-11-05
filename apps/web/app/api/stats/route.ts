import { NextResponse } from 'next/server';
import { bytesToMegabytes, getPdfGenerationStats } from '../../../lib/pdf-stats';
import { enforceStatsRateLimit } from '../../../lib/abuse-protection';
import { getClientIp, logSecurityEvent } from '../../../lib/security';
import { withTimeout } from '../../../lib/with-timeout';

export const runtime = 'nodejs';

const STATS_CACHE_CONTROL = 'no-store';
const STATS_TIMEOUT_MS = 3000;

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = await enforceStatsRateLimit(ip);

  if (!rateLimit.success) {
    logSecurityEvent('warn', 'RATE_LIMIT_EXCEEDED', {
      route: '/api/stats',
      ip,
      limit: rateLimit.limit,
      remaining: rateLimit.remaining
    });

    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'Cache-Control': STATS_CACHE_CONTROL
        }
      }
    );
  }

  try {
    const stats = await withTimeout(getPdfGenerationStats(), STATS_TIMEOUT_MS);
    if (!stats) {
      return NextResponse.json(
        { error: 'Statistics temporarily unavailable' },
        { status: 503, headers: { 'Cache-Control': STATS_CACHE_CONTROL, 'Retry-After': '30' } }
      );
    }

    return NextResponse.json({
      pdfGeneratedCount: stats.pdfGeneratedCount,
      pdfGeneratedMegabytes: bytesToMegabytes(stats.pdfGeneratedBytes),
      pdfGeneratedBytes: stats.pdfGeneratedBytes
    }, { headers: { 'Cache-Control': STATS_CACHE_CONTROL } });
  } catch {
    return NextResponse.json(
      { error: 'Statistics temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': STATS_CACHE_CONTROL, 'Retry-After': '30' } }
    );
  }
}