import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import { db } from '@repo/db';
import { getPerformanceMetrics, resolveTimeRange } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function PerformancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const { start, end } = resolveTimeRange(range);

  // Fetch core performance percentiles, buckets, comparison stats, and lists
  const [perf, durationBuckets, engineComparison, slowest, fastest] = await Promise.all([
    getPerformanceMetrics(range),
    db.exportEvent.groupBy({
      by: ['exportDurationBucket'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end }, success: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    db.exportEvent.groupBy({
      by: ['exportEngineVersion'],
      _count: { id: true },
      _avg: { generationDuration: true },
      where: { timestamp: { gte: start, lte: end }, success: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    db.exportEvent.findMany({
      where: { success: true, timestamp: { gte: start, lte: end } },
      orderBy: { generationDuration: 'desc' },
      take: 5
    }),
    db.exportEvent.findMany({
      where: { success: true, timestamp: { gte: start, lte: end } },
      orderBy: { generationDuration: 'asc' },
      take: 5
    })
  ]);

  const stats = [
    { name: 'Average Latency', value: `${perf.avgDuration}s`, detail: 'Mean generation time' },
    { name: 'Median (P50)', value: `${perf.median}s`, detail: '50th percentile latency' },
    { name: '95th Percentile (P95)', value: `${perf.p95}s`, detail: '95th percentile latency' },
    { name: '99th Percentile (P99)', value: `${perf.p99}s`, detail: '99th percentile latency' }
  ];

  return (
    <div className="space-y-6 md:space-y-8 select-none font-mono">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Performance Diagnostics</h2>
        <p className="text-xs text-neutral-600 font-mono">Execution percentiles, bucket classifications, and engine regression checks.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.name} className="bg-black border border-neutral-900 rounded p-4">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{s.name}</p>
            <p className="text-lg font-bold text-white mt-1">{s.value}</p>
            <p className="text-[8px] text-neutral-600 mt-0.5">{s.detail}</p>
          </Card>
        ))}
      </div>

      {/* Buckets & Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Duration Buckets */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Export Duration Buckets</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Latency Range</th>
                  <th className="px-4 py-2 text-right">Exports Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {durationBuckets.map((bucket, i) => (
                  <tr key={i} className="hover:bg-neutral-950/10">
                    <td className="px-4 py-2 text-white font-medium">{bucket.exportDurationBucket || 'Unknown'}</td>
                    <td className="px-4 py-2 text-right font-bold text-white">{bucket._count.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Engine Version Comparison */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Export Engine Versions</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Engine version</th>
                  <th className="px-4 py-2">Exports</th>
                  <th className="px-4 py-2 text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {engineComparison.map((eng, i) => (
                  <tr key={i} className="hover:bg-neutral-950/10">
                    <td className="px-4 py-2 text-white font-medium">{eng.exportEngineVersion || 'Legacy'}</td>
                    <td className="px-4 py-2">{eng._count.id}</td>
                    <td className="px-4 py-2 text-right font-bold text-white">{(eng._avg.generationDuration || 0).toFixed(2)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Failures stages and reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Failure stages */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Failure Stages</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Stage</th>
                  <th className="px-4 py-2 text-right">Failures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {perf.failureStageBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-neutral-600">[NO_STAGE_FAILURES_LOGGED]</td>
                  </tr>
                ) : (
                  perf.failureStageBreakdown.map((s, i) => (
                    <tr key={i} className="hover:bg-neutral-950/10">
                      <td className="px-4 py-2 text-white font-medium">{s.name}</td>
                      <td className="px-4 py-2 text-right font-bold text-white">{s.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Failure reasons */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Failure Reasons</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Failure Reason Log</th>
                  <th className="px-4 py-2 text-right">Failures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {perf.failureReasonBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-neutral-600">[NO_REASON_FAILURES_LOGGED]</td>
                  </tr>
                ) : (
                  perf.failureReasonBreakdown.map((r, i) => (
                    <tr key={i} className="hover:bg-neutral-950/10">
                      <td className="px-4 py-2 text-white font-medium truncate max-w-[200px]">{r.name}</td>
                      <td className="px-4 py-2 text-right font-bold text-white">{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Latency Slowest/Fastest Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Slowest Exports */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Slowest Document Generated</h3>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Export ID</th>
                  <th className="px-4 py-2 text-right">Size Bucket</th>
                  <th className="px-4 py-2 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {slowest.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-neutral-600">[NO_SLOWEST_RECORD_LOGGED]</td>
                  </tr>
                ) : (
                  slowest.map((s, idx) => (
                    <tr key={idx} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="px-4 py-2 text-white truncate max-w-[120px] select-all">{s.id}</td>
                      <td className="px-4 py-2 text-right">{s.exportSizeBucket || 'Unknown'}</td>
                      <td className="px-4 py-2 text-right text-red-400 font-bold">{s.generationDuration.toFixed(2)}s</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Fastest Exports */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Fastest Document Generated</h3>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Export ID</th>
                  <th className="px-4 py-2 text-right">Size Bucket</th>
                  <th className="px-4 py-2 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {fastest.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-neutral-600">[NO_FASTEST_RECORD_LOGGED]</td>
                  </tr>
                ) : (
                  fastest.map((f, idx) => (
                    <tr key={idx} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="px-4 py-2 text-white truncate max-w-[120px] select-all">{f.id}</td>
                      <td className="px-4 py-2 text-right">{f.exportSizeBucket || 'Unknown'}</td>
                      <td className="px-4 py-2 text-right text-emerald-400 font-bold">{f.generationDuration.toFixed(2)}s</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

    </div>
  );
}
