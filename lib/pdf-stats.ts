import { Redis } from '@upstash/redis';
import { logSecurityEvent } from './security';

const PDF_GENERATED_COUNT_KEY = 'pdf_generated_count';
const DEFAULT_EXPORT_COUNT = 0;
const isProduction = process.env.NODE_ENV === 'production';

let fallbackCount = DEFAULT_EXPORT_COUNT;
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
        logSecurityEvent('info', 'COUNTER_READ', {
          source: 'redis',
          value: current
        });
        return current;
      }

      const seeded = await seedRedisCount(redis);
      logSecurityEvent('info', 'COUNTER_READ', {
        source: 'redis_seeded',
        value: seeded
      });
      return seeded;
    } catch (error) {
      logSecurityEvent('error', 'REDIS_UNAVAILABLE', {
        stage: 'stats_read',
        reason: 'redis_read_failed',
        mode: isProduction ? 'production' : 'development',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (isProduction) {
    return 0;
  }

  return fallbackCount;
}

export async function incrementPdfGeneratedCount() {
  const redis = getRedisClient();

  if (redis) {
    try {
      const current = await readRedisCount(redis);
      if (current === null) {
        const seeded = await seedRedisCount(redis);
        const next = await redis.incr(PDF_GENERATED_COUNT_KEY);
        const nextCount = typeof next === 'number' && Number.isFinite(next) ? next : seeded + 1;
        logSecurityEvent('info', 'COUNTER_INCREMENT_SUCCESS', {
          source: 'redis_seeded',
          previousCount: seeded,
          nextCount
        });
        return nextCount;
      }

      const next = await redis.incr(PDF_GENERATED_COUNT_KEY);
      const nextCount = typeof next === 'number' && Number.isFinite(next) ? next : current + 1;
      logSecurityEvent('info', 'COUNTER_INCREMENT_SUCCESS', {
        source: 'redis',
        previousCount: current,
        nextCount
      });
      return nextCount;
    } catch (error) {
      logSecurityEvent('error', 'COUNTER_INCREMENT_FAILED', {
        stage: 'stats_increment',
        reason: 'redis_increment_failed',
        mode: isProduction ? 'production' : 'development',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (isProduction) {
    return 0;
  }

  fallbackCount += 1;
  logSecurityEvent('info', 'COUNTER_INCREMENT_SUCCESS', {
    source: 'memory',
    previousCount: fallbackCount - 1,
    nextCount: fallbackCount
  });
  return fallbackCount;
}