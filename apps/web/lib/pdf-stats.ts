import { Redis } from '@upstash/redis';
import { logSecurityEvent } from './security';

const PDF_GENERATED_COUNT_KEY = 'pdf_generated_count';
const PDF_GENERATED_BYTES_KEY = 'pdf_generated_bytes';
const isProduction = process.env.NODE_ENV === 'production';

let redisClient: Redis | null = null;
let warnedMissingRedis = false;
let warnedInvalidRedis = false;

function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}

function warnMissingRedisOnce() {
  if ((!isDevelopment() && !isProduction) || warnedMissingRedis) {
    return;
  }

  warnedMissingRedis = true;
  logSecurityEvent(isProduction ? 'error' : 'warn', 'REDIS_UNAVAILABLE', {
    reason: 'missing_env_vars',
    mode: isProduction ? 'production' : 'development'
  });
}

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    warnMissingRedisOnce();
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis({ url, token });
    } catch (error) {
      if (!warnedInvalidRedis) {
        warnedInvalidRedis = true;
        logSecurityEvent('error', 'REDIS_UNAVAILABLE', {
          reason: 'client_initialization_failed',
          mode: isProduction ? 'production' : 'development',
          error: error instanceof Error ? error.message : String(error)
        });
      }

      return null;
    }
  }

  return redisClient;
}

function parseCount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

async function readRedisCount(redis: Redis) {
  return parseCount(await redis.get(PDF_GENERATED_COUNT_KEY));
}

export type PdfGenerationStats = {
  pdfGeneratedCount: number;
  pdfGeneratedBytes: number;
};

export function bytesToMegabytes(bytes: number) {
  return bytes / (1000 * 1000);
}

async function readRedisStats(redis: Redis): Promise<PdfGenerationStats> {
  const count = await readRedisCount(redis);
  const bytes = parseCount(await redis.get(PDF_GENERATED_BYTES_KEY));
  return {
    pdfGeneratedCount: count ?? 0,
    pdfGeneratedBytes: bytes ?? 0
  };
}

export async function getPdfGenerationStats(): Promise<PdfGenerationStats | null> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const stats = await readRedisStats(redis);
      logSecurityEvent('info', 'COUNTER_READ', {
        source: 'redis',
        value: stats.pdfGeneratedCount,
        bytes: stats.pdfGeneratedBytes
      });
      return stats;
    } catch (error) {
      logSecurityEvent('error', 'REDIS_UNAVAILABLE', {
        stage: 'stats_read',
        reason: 'redis_read_failed',
        mode: isProduction ? 'production' : 'development',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return null;
}

export async function incrementPdfGenerationStats(pdfBytes: number): Promise<PdfGenerationStats | null> {
  if (!Number.isSafeInteger(pdfBytes) || pdfBytes < 0) {
    throw new Error('PDF byte size must be a non-negative safe integer');
  }

  const redis = getRedisClient();

  if (redis) {
    try {
      const pipeline = redis.pipeline();
      pipeline.incr(PDF_GENERATED_COUNT_KEY);
      pipeline.incrby(PDF_GENERATED_BYTES_KEY, pdfBytes);
      const results = await pipeline.exec();
      const nextCount = parseCount(results[0]);
      const nextBytes = parseCount(results[1]);
      if (nextCount === null || nextBytes === null) throw new Error('Redis returned invalid counter values');
      logSecurityEvent('info', 'COUNTER_INCREMENT_SUCCESS', {
        source: 'redis',
        nextCount,
        nextBytes
      });
      return { pdfGeneratedCount: nextCount, pdfGeneratedBytes: nextBytes };
    } catch (error) {
      logSecurityEvent('error', 'COUNTER_INCREMENT_FAILED', {
        stage: 'stats_increment',
        reason: 'redis_increment_failed',
        mode: isProduction ? 'production' : 'development',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // A missing stats store must never be represented as a global total.
  return null;
}

export const incrementPdfGeneratedCount = async () => incrementPdfGenerationStats(0);
export const getPdfGeneratedCount = async () => (await getPdfGenerationStats())?.pdfGeneratedCount ?? 0;