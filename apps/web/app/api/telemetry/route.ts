import { NextRequest, NextResponse } from 'next/server';
import { trackTelemetry } from '@repo/analytics';
import { readJsonBodyWithLimit } from '../../../lib/security';

export const runtime = 'nodejs';

const MAX_TELEMETRY_BODY_BYTES = 256 * 1024;
const MAX_TELEMETRY_BATCH_SIZE = 50;

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

    // Fire-and-forget background worker execution
    for (const payload of payloads) {
      const enrichedPayload = {
        ...payload,
        country: country || payload.country,
        region: region || payload.region,
        city: city || payload.city,
        timezone: timezone || payload.timezone,
        userAgent: userAgent || payload.userAgent
      };

      trackTelemetry(enrichedPayload).catch(err => {
        console.error('[Telemetry Endpoint Background Worker] Tracking failed:', err);
      });
    }

    return NextResponse.json({ ok: true, processed: payloads.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process telemetry batch payload' }, { status: 400 });
  }
}
