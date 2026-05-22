import { Redis } from '@upstash/redis';
import { logSecurityEvent } from './security';

const PDF_GENERATED_COUNT_KEY = 'pdf_generated_count';
const DEFAULT_EXPORT_COUNT = 150;

let fallbackCount = DEFAULT_EXPORT_COUNT;
let redisClient: Redis | null = null;
let warnedMissingRedis = false;

function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}

function warnMissingRedisOnce() {
  if (!isDevelopment() || warnedMissingRedis) {
    return;
  }

  warnedMissingRedis = true;
  console.warn('Upstash Redis not configured. Using temporary in-memory counter.');
}

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    warnMissingRedisOnce();
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({ url, token });
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

async function seedRedisCount(redis: Redis) {
  const created = await redis.setnx(PDF_GENERATED_COUNT_KEY, DEFAULT_EXPORT_COUNT);

  if (created) {
    return DEFAULT_EXPORT_COUNT;
  }

  const current = await readRedisCount(redis);
  return current ?? DEFAULT_EXPORT_COUNT;
}

export async function getPdfGeneratedCount() {
  const redis = getRedisClient();

  if (redis) {
    try {
      const current = await readRedisCount(redis);
      if (current !== null) {
        return current;
      }

      return await seedRedisCount(redis);
    } catch (error) {
      logSecurityEvent('warn', 'PDF_GENERATION_FAILED', {
        stage: 'stats_read',
        reason: 'redis_read_failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return fallbackCount;
}

export async function incrementPdfGeneratedCount() {
  const redis = getRedisClient();

  if (redis) {
    try {
      await seedRedisCount(redis);
      const value = await redis.incr(PDF_GENERATED_COUNT_KEY);
      return typeof value === 'number' && Number.isFinite(value) ? value : fallbackCount;
    } catch (error) {
      logSecurityEvent('warn', 'PDF_GENERATION_FAILED', {
        stage: 'stats_increment',
        reason: 'redis_increment_failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  fallbackCount += 1;
  return fallbackCount;
}