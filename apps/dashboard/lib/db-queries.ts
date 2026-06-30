import { db } from '@repo/db';
import { unstable_cache } from 'next/cache';

export interface KPIMetrics {
  totalExports: number;
  todayExports: number;
  weekExports: number;
  monthExports: number;
  successes: number;
  failures: number;
  successRate: number;
  failureRate: number;
  avgDuration: number;
  dbStatus: 'CONNECTED' | 'DISCONNECTED';
}

export interface ExportLogEvent {
  id: string;
  timestamp: Date;
  success: boolean;
  failureReason: string | null;
  failureStage: string | null;
  httpStatus: number | null;
  pdfSize: number | null;
  chatSource: string | null;
  referrer: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  country: string;
  city: string;
  generationDuration: number;
}

export interface ChartDataPoint {
  label: string;
  exports: number;
  successes: number;
  failures: number;
}

export interface DimensionCount {
  name: string;
  count: number;
}

export interface PerformanceMetrics {
  avgDuration: number;
  p95: number;
  p99: number;
  minDuration: number;
  maxDuration: number;
  failureStageBreakdown: DimensionCount[];
  failureReasonBreakdown: DimensionCount[];
}

export interface SeoPerformance {
  referrer: string;
  exports: number;
  avgLatency: number;
}

/**
 * Checks connection state to the database in real-time.
 * Uncached to prevent stale online status metrics.
 */
export async function checkDbStatus(): Promise<'CONNECTED' | 'DISCONNECTED'> {
  try {
    await db.$queryRaw`SELECT 1`;
    return 'CONNECTED';
  } catch (error) {
    console.error('[Dashboard DB Check] Connection failure:', error);
    return 'DISCONNECTED';
  }
}

/**
 * Fetches high-level KPI metrics. Cached for 30 seconds.
 */
export const getKPIMetrics: () => Promise<KPIMetrics> = unstable_cache(
  async (): Promise<KPIMetrics> => {
    const defaultMetrics: KPIMetrics = {
      totalExports: 0,
      todayExports: 0,
      weekExports: 0,
      monthExports: 0,
      successes: 0,
      failures: 0,
      successRate: 100,
      failureRate: 0,
      avgDuration: 0.0,
      dbStatus: 'DISCONNECTED',
    };

    try {
      const status = await checkDbStatus();
      if (status === 'DISCONNECTED') return defaultMetrics;

      const now = new Date();
      
      const startOfToday = new Date(now);
      startOfToday.setUTCHours(0, 0, 0, 0);

      const startOfWeek = new Date(now);
      startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
      startOfWeek.setUTCHours(0, 0, 0, 0);

      const startOfMonth = new Date(now);
      startOfMonth.setUTCDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);

      const [total, today, week, month, successes, failures, avgResult] = await Promise.all([
        db.exportEvent.count(),
        db.exportEvent.count({ where: { timestamp: { gte: startOfToday } } }),
        db.exportEvent.count({ where: { timestamp: { gte: startOfWeek } } }),
        db.exportEvent.count({ where: { timestamp: { gte: startOfMonth } } }),
        db.exportEvent.count({ where: { success: true } }),
        db.exportEvent.count({ where: { success: false } }),
        db.exportEvent.aggregate({
          _avg: { generationDuration: true },
          where: { success: true }
        })
      ]);

      const successRate = total > 0 ? (successes / total) * 100 : 100;
      const failureRate = total > 0 ? (failures / total) * 100 : 0;
      const avgDuration = avgResult._avg.generationDuration || 0.0;

      return {
        totalExports: total,
        todayExports: today,
        weekExports: week,
        monthExports: month,
        successes,
        failures,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
        avgDuration: Math.round(avgDuration * 100) / 100,
        dbStatus: 'CONNECTED'
      };
    } catch (error) {
      console.error('[Dashboard Query] getKPIMetrics failed:', error);
      return defaultMetrics;
    }
  },
  ['kpi-metrics-cached'],
  { revalidate: 30, tags: ['analytics'] }
);

/**
 * Fetches pre-aggregated daily counts for the last N days. Cached for 30 seconds.
 */
export function getExportsOverTime(days: number = 30): Promise<ChartDataPoint[]> {
  return unstable_cache(
    async (): Promise<ChartDataPoint[]> => {
      try {
        const status = await checkDbStatus();
        if (status === 'DISCONNECTED') return [];

        const now = new Date();
        const cutoffDate = new Date(now);
        cutoffDate.setUTCDate(now.getUTCDate() - days);
        cutoffDate.setUTCHours(0, 0, 0, 0);

        const stats = await db.dailyStatistic.findMany({
          where: { date: { gte: cutoffDate } },
          orderBy: { date: 'asc' }
        });

        return stats.map(s => ({
          label: s.date.toISOString().split('T')[0],
          exports: s.totalExports,
          successes: s.successes,
          failures: s.failures
        }));
      } catch (error) {
        console.error('[Dashboard Query] getExportsOverTime failed:', error);
        return [];
      }
    },
    [`exports-over-time-${days}`],
    { revalidate: 30, tags: ['analytics'] }
  )();
}

/**
 * Fetches detailed log entries (uncached to maintain realtime console feedback).
 */
export async function getRecentEvents(limit: number = 50, offset: number = 0): Promise<ExportLogEvent[]> {
  try {
    const status = await checkDbStatus();
    if (status === 'DISCONNECTED') return [];

    const events = await db.exportEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    });

    return events as ExportLogEvent[];
  } catch (error) {
    console.error('[Dashboard Query] getRecentEvents failed:', error);
    return [];
  }
}

/**
 * General utility to group by a column name and get frequency counts. Cached for 30 seconds.
 */
export function getDimensionBreakdown(
  dimension: 'browser' | 'deviceType' | 'operatingSystem' | 'referrer' | 'country' | 'city'
): Promise<DimensionCount[]> {
  return unstable_cache(
    async (): Promise<DimensionCount[]> => {
      try {
        const status = await checkDbStatus();
        if (status === 'DISCONNECTED') return [];

        const grouped = await db.exportEvent.groupBy({
          by: [dimension],
          _count: { id: true },
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 10
        });

        return grouped.map(g => ({
          name: (g[dimension] as string) || 'Unknown',
          count: g._count.id
        }));
      } catch (error) {
        console.error(`[Dashboard Query] getDimensionBreakdown failed for ${dimension}:`, error);
        return [];
      }
    },
    [`dimension-breakdown-${dimension}`],
    { revalidate: 30, tags: ['analytics'] }
  )();
}

/**
 * Fetches advanced latency percentiles (p95, p99) and load aggregates. Cached for 30 seconds.
 */
export const getPerformanceMetrics: () => Promise<PerformanceMetrics> = unstable_cache(
  async (): Promise<PerformanceMetrics> => {
    const defaultPerformance = {
      avgDuration: 0,
      p95: 0,
      p99: 0,
      minDuration: 0,
      maxDuration: 0,
      failureStageBreakdown: [] as DimensionCount[],
      failureReasonBreakdown: [] as DimensionCount[],
    };

    try {
      const status = await checkDbStatus();
      if (status === 'DISCONNECTED') return defaultPerformance;

      // Fetch successful duration details for percentile computations
      const successfulEvents = await db.exportEvent.findMany({
        where: { success: true },
        select: { generationDuration: true },
        orderBy: { generationDuration: 'asc' }
      });

      if (successfulEvents.length === 0) return defaultPerformance;

      const durations = successfulEvents.map(e => e.generationDuration);
      const count = durations.length;

      const avg = durations.reduce((a, b) => a + b, 0) / count;
      const min = durations[0];
      const max = durations[count - 1];

      // Compute percentiles (95th and 99th indices)
      const p95Idx = Math.min(Math.ceil(count * 0.95) - 1, count - 1);
      const p99Idx = Math.min(Math.ceil(count * 0.99) - 1, count - 1);

      const p95 = durations[p95Idx];
      const p99 = durations[p99Idx];

      // Group-by breakdowns for failures
      const [stages, reasons] = await Promise.all([
        db.exportEvent.groupBy({
          by: ['failureStage'],
          _count: { id: true },
          where: { success: false },
          orderBy: { _count: { id: 'desc' } }
        }),
        db.exportEvent.groupBy({
          by: ['failureReason'],
          _count: { id: true },
          where: { success: false },
          orderBy: { _count: { id: 'desc' } }
        })
      ]);

      const failureStageBreakdown = stages.map(s => ({
        name: s.failureStage || 'Unknown',
        count: s._count.id
      }));

      const failureReasonBreakdown = reasons.map(r => ({
        name: r.failureReason || 'Unknown',
        count: r._count.id
      }));

      return {
        avgDuration: Math.round(avg * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
        minDuration: Math.round(min * 100) / 100,
        maxDuration: Math.round(max * 100) / 100,
        failureStageBreakdown,
        failureReasonBreakdown
      };
    } catch (error) {
      console.error('[Dashboard Query] getPerformanceMetrics failed:', error);
      return defaultPerformance;
    }
  },
  ['performance-metrics-cached'],
  { revalidate: 30, tags: ['analytics'] }
);

/**
 * SEO Route distribution aggregates. Cached for 30 seconds.
 */
export const getSeoPerformance: () => Promise<SeoPerformance[]> = unstable_cache(
  async (): Promise<SeoPerformance[]> => {
    try {
      const status = await checkDbStatus();
      if (status === 'DISCONNECTED') return [];

      const grouped = await db.exportEvent.groupBy({
        by: ['referrer'],
        _count: { id: true },
        _avg: { generationDuration: true },
        orderBy: { _count: { id: 'desc' } }
      });

      return grouped.map(g => ({
        referrer: g.referrer || 'Direct',
        exports: g._count.id,
        avgLatency: Math.round((g._avg.generationDuration || 0) * 100) / 100
      }));
    } catch (error) {
      console.error('[Dashboard Query] getSeoPerformance failed:', error);
      return [];
    }
  },
  ['seo-performance-cached'],
  { revalidate: 30, tags: ['analytics'] }
);
