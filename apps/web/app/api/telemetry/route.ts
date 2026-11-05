import { NextRequest, NextResponse } from 'next/server';
import { trackTelemetry } from '@repo/analytics';
import { readJsonBodyWithLimit } from '../../../lib/security';
import { scheduleAfterResponse } from '../../../lib/after-request';

export const runtime = 'nodejs';

const MAX_TELEMETRY_BODY_BYTES = 256 * 1024;
const MAX_TELEMETRY_BATCH_SIZE = 50;
const TELEMETRY_TIMEOUT_MS = 5000;
const TELEMETRY_CONCURRENCY = 2;

async function processWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      await worker(item);
    }
  });

  await Promise.all(workers);
}

/**
 * Decoupled batch-ready telemetry logging endpoint.
 * Accepts either a single TelemetryPayload or an array of payloads.
 * Returns immediately to the client to avoid blocking.
 */
export async function POST(req: NextRequest) {
  try {
    const bodyResult = await readJsonBodyWithLimit(req, MAX_TELEMETRY_BODY_BYTES);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: bodyResult.tooLarge ? 'Telemetry payload too large' : 'Invalid telemetry payload' },
        { status: bodyResult.tooLarge ? 413 : 400 }
      );
    }

    const body = bodyResult.data;
    
    // Extract Vercel geography and client user-agent headers
    const country = req.headers.get('x-vercel-ip-country') || undefined;
    const region = req.headers.get('x-vercel-ip-country-region') || undefined;
    const city = req.headers.get('x-vercel-ip-city') || undefined;
    const timezone = req.headers.get('x-vercel-ip-timezone') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    const payloads = Array.isArray(body) ? body : [body];
    if (payloads.length > MAX_TELEMETRY_BATCH_SIZE) {
      return NextResponse.json({ error: 'Telemetry batch too large' }, { status: 413 });
    }

    const enrichedPayloads = payloads.map((payload) => ({
      ...payload,
      country: country || payload.country,
      region: region || payload.region,
      city: city || payload.city,
      timezone: timezone || payload.timezone,
      userAgent: userAgent || payload.userAgent
    }));

    scheduleAfterResponse(async () => {
      await processWithConcurrency(enrichedPayloads, TELEMETRY_CONCURRENCY, async (payload) => {
        await Promise.race([
          trackTelemetry(payload),
          new Promise<void>((resolve) => setTimeout(resolve, TELEMETRY_TIMEOUT_MS))
        ]);
      });
    }, 'telemetry_batch');

    return NextResponse.json({ ok: true, processed: payloads.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process telemetry batch payload' }, { status: 400 });
  }
}
