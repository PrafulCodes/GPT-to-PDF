import { NextResponse } from 'next/server';
import { getPdfGeneratedCount } from '../../../lib/pdf-stats';
import { enforceStatsRateLimit } from '../../../lib/abuse-protection';
import { getClientIp, logSecurityEvent } from '../../../lib/security';

export const runtime = 'nodejs';

const STATS_CACHE_CONTROL = 'public, max-age=30, stale-while-revalidate=60';

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
    const pdfGeneratedCount = await getPdfGeneratedCount();

    return NextResponse.json({ pdfGeneratedCount }, { headers: { 'Cache-Control': STATS_CACHE_CONTROL } });
  } catch {
    return NextResponse.json({ pdfGeneratedCount: 0 }, { headers: { 'Cache-Control': STATS_CACHE_CONTROL } });
  }
}