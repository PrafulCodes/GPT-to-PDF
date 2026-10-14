import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';

const REDACT_KEYS = /(token|authorization|cookie|secret|password|key)/i;

export type SecurityEventCode =
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_CHAT_URL'
  | 'OVERSIZED_PAYLOAD'
  | 'SERVER_BUSY'
  | 'PDF_GENERATION_FAILED'
  | 'COUNTER_INCREMENT_SUCCESS'
  | 'COUNTER_INCREMENT_FAILED'
  | 'COUNTER_READ'
  | 'PDF_GENERATION_COMPLETED'
  | 'REDIRECT_DOMAIN_BLOCKED'
  | 'REDIRECT_LIMIT_EXCEEDED'
  | 'FETCH_BODY_LIMIT_EXCEEDED'
  | 'MALFORMED_REQUEST_BODY'
  | 'REDIS_UNAVAILABLE';

type SecurityMeta = Record<string, unknown>;

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};

    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (REDACT_KEYS.test(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redactValue(child);
      }
    }

    return out;
  }

  return value;
}

export function logSecurityEvent(level: 'info' | 'warn' | 'error', code: SecurityEventCode, meta?: SecurityMeta) {
  const payload = {
    ts: new Date().toISOString(),
    code,
    ...(meta ? { meta: redactValue(meta) } : {})
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}

type RequestLike = Pick<Request, 'headers'> | Pick<NextRequest, 'headers'>;

export function getClientIp(req: RequestLike) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

export function getUserAgent(req: RequestLike) {
  return req.headers.get('user-agent') || 'unknown';
}

export function getRequestFingerprint(ip: string, userAgent: string) {
  return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex');
}

export async function readJsonBodyWithLimit(req: NextRequest, limitBytes: number) {
  const rawLength = req.headers.get('content-length');

  if (rawLength) {
    const parsedLength = Number(rawLength);
    if (Number.isFinite(parsedLength) && parsedLength > limitBytes) {
      return { ok: false as const, tooLarge: true as const, malformed: false as const };
    }
  }

  if (!req.body) {
    return { ok: false as const, tooLarge: false as const, malformed: true as const };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = value || new Uint8Array(0);
      total += chunk.byteLength;

      if (total > limitBytes) {
        await reader.cancel('payload too large').catch(() => {});
        return { ok: false as const, tooLarge: true as const, malformed: false as const };
      }

      chunks.push(chunk);
    }

    const body = new Uint8Array(total);
    let offset = 0;

    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const text = new TextDecoder().decode(body);
    try {
      return { ok: true as const, data: JSON.parse(text) as unknown };
    } catch {
      return { ok: false as const, tooLarge: false as const, malformed: true as const };
    }
  } finally {
    reader.releaseLock();
  }
}
