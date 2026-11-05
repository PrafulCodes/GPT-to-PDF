import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const CONCURRENCY_KEY = 'lock:pdf:concurrency';
const CONCURRENCY_TTL_SECONDS = 120;
const MAX_CONCURRENT_GENERATIONS = 3;

const FALLBACK_WINDOW_STORE = new Map<string, number[]>();
let fallbackConcurrent = 0;

let redisClient: Redis | null = null;

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({ url, token });
  }

  return redisClient;
}

const redis = getRedisClient();

const generateBurstLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      analytics: false,
      prefix: 'rl:generate:burst'
    })
  : null;

const generateDailyLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '1 d'),
      analytics: false,
      prefix: 'rl:generate:daily'
    })
  : null;

const generateFingerprintLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      analytics: false,
      prefix: 'rl:generate:fingerprint'
    })
  : null;

const statsLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: false,
      prefix: 'rl:stats:ip'
    })
  : null;

type RateLimitDecision = {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

function runFallbackWindow(key: string, limit: number, windowMs: number): RateLimitDecision {
  const now = Date.now();
  const lowerBound = now - windowMs;
  const existing = FALLBACK_WINDOW_STORE.get(key) || [];
  const recent = existing.filter((ts) => ts > lowerBound);

  if (recent.length >= limit) {
    const earliest = recent[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((earliest + windowMs - now) / 1000));
    FALLBACK_WINDOW_STORE.set(key, recent);
    return { success: false, limit, remaining: 0, retryAfterSeconds };
  }

  recent.push(now);
  FALLBACK_WINDOW_STORE.set(key, recent);
  return { success: true, limit, remaining: Math.max(0, limit - recent.length), retryAfterSeconds: 0 };
}

async function limitOrFallback(
  redisLimiter: Ratelimit | null,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitDecision> {
  if (!redisLimiter) {
    return runFallbackWindow(key, limit, windowMs);
  }

  try {
    const result = await redisLimiter.limit(key);
    const retryAfterSeconds = result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));

    return {
      success: result.success,
      limit: result.limit,
      remaining: Math.max(0, result.remaining),
      retryAfterSeconds
    };
  } catch {
    return runFallbackWindow(key, limit, windowMs);
  }
}

export async function enforceGenerateRateLimits(ip: string, fingerprint: string) {
  const burst = await limitOrFallback(generateBurstLimiter, `ip:${ip}`, 10, 10 * 60 * 1000);
  if (!burst.success) return burst;

  const daily = await limitOrFallback(generateDailyLimiter, `ip:${ip}`, 50, 24 * 60 * 60 * 1000);
  if (!daily.success) return daily;

  const fp = await limitOrFallback(generateFingerprintLimiter, `fp:${fingerprint}`, 10, 10 * 60 * 1000);
  if (!fp.success) return fp;

  return { success: true as const };
}

export async function enforceStatsRateLimit(ip: string) {
  return limitOrFallback(statsLimiter, `ip:${ip}`, 60, 60 * 1000);
}

export async function acquirePdfConcurrencySlot() {
  if (!redis) {
    fallbackConcurrent += 1;
    if (fallbackConcurrent > MAX_CONCURRENT_GENERATIONS) {
      fallbackConcurrent -= 1;
      return { acquired: false as const };
    }

    return {
      acquired: true as const,
      release: async () => {
        fallbackConcurrent = Math.max(0, fallbackConcurrent - 1);
      }
    };
  }

  const count = await redis.incr(CONCURRENCY_KEY);
  if (count === 1) {
    await redis.expire(CONCURRENCY_KEY, CONCURRENCY_TTL_SECONDS);
  }

  if (count > MAX_CONCURRENT_GENERATIONS) {
    await redis.decr(CONCURRENCY_KEY);
    return { acquired: false as const };
  }

  return {
    acquired: true as const,
    release: async () => {
      const value = await redis.decr(CONCURRENCY_KEY);
      if (typeof value === 'number' && value <= 0) {
        await redis.del(CONCURRENCY_KEY).catch(() => {});
      }
    }
  };
}
