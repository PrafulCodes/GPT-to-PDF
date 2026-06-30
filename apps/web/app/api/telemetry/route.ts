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
    
    // Parse single payload or batch arrays of events
    const payloads = Array.isArray(body) ? body : [body];

    // Fire-and-forget background worker execution
    for (const payload of payloads) {
      trackTelemetry(payload).catch(err => {
        console.error('[Telemetry Endpoint Background Worker] Tracking failed:', err);
      });
    }

    return NextResponse.json({ ok: true, processed: payloads.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process telemetry batch payload' }, { status: 400 });
  }
}
