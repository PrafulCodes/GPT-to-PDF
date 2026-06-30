import { NextRequest, NextResponse } from 'next/server';
import { trackTelemetry } from '@repo/analytics';

export const runtime = 'nodejs';

/**
 * Decoupled batch-ready telemetry logging endpoint.
 * Accepts either a single TelemetryPayload or an array of payloads.
 * Returns immediately to the client to avoid blocking.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract Vercel geography and client user-agent headers
    const country = req.headers.get('x-vercel-ip-country') || undefined;
    const region = req.headers.get('x-vercel-ip-country-region') || undefined;
    const city = req.headers.get('x-vercel-ip-city') || undefined;
    const timezone = req.headers.get('x-vercel-ip-timezone') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    const payloads = Array.isArray(body) ? body : [body];

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
