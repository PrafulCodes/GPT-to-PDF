import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import LineChart from '../../../components/charts/LineChart';
import BreakdownChart from '../../../components/charts/BreakdownChart';
import { getPerformanceMetrics, getTrendData } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function PerformanceDiagnosticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const [perf, trendData] = await Promise.all([
    getPerformanceMetrics(range),
    getTrendData(range)
  ]);

  const latencyMetrics = [
    { name: 'Average Latency', value: `${perf.avgDuration}s`, detail: 'Mean generation duration' },
    { name: 'Median (P50) Latency', value: `${perf.median}s`, detail: '50% of documents render under this speed' },
    { name: '95th Percentile (P95)', value: `${perf.p95}s`, detail: '95% of documents render under this speed' },
    { name: '99th Percentile (P99)', value: `${perf.p99}s`, detail: '99% of documents render under this speed' },
    { name: 'Fastest Latency', value: `${perf.minDuration}s`, detail: 'Minimum successful generation time' },
    { name: 'Slowest Latency', value: `${perf.maxDuration}s`, detail: 'Maximum successful generation time' },
    { name: 'Avg Concurrency Queue', value: `${perf.avgQueueTime}s`, detail: 'Average queue wait duration' },
    { name: 'Avg Parsing Duration', value: `${perf.avgParseTime}s`, detail: 'Average chat content parse time' },
    { name: 'Avg Render Duration', value: `${perf.avgRenderTime}s`, detail: 'Average browser print execution' },
  ];

  // Convert trend data to LineChart expected format
  const latencyChartData = trendData.map(d => ({
    label: d.label,
    value: d.avgDuration || 0.0
  }));

  // Infrastructure health lines
  const dbHealthData = perf.systemHealth.map((h, i) => ({ label: `Ping ${i+1}`, value: h.dbLatency }));
  const redisHealthData = perf.systemHealth.map((h, i) => ({ label: `Ping ${i+1}`, value: h.redisLatency }));

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Performance Diagnostics</h2>
        <p className="text-xs text-neutral-600 font-mono">Render latencies, serverless load, and resource profiling.</p>
      </div>

      {/* Latency Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {latencyMetrics.map((metric) => (
          <Card key={metric.name}>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-medium">{metric.name}</p>
            <p className="text-xl font-bold tracking-tight text-white mt-1.5 font-mono">
              {metric.value}
            </p>
            <p className="text-[9px] text-neutral-400 font-mono mt-1">{metric.detail}</p>
          </Card>
        ))}
      </div>

      {/* Latency Trend Graph */}
      <Card>
        <LineChart
          data={latencyChartData}
          height={180}
          label={`Latency Performance Trend (${range.toUpperCase()})`}
        />
      </Card>

      {/* Systems Health Time-Series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <LineChart
            data={dbHealthData}
            height={150}
            label="PostgreSQL Query Latency (ms)"
          />
        </Card>
        <Card>
          <LineChart
            data={redisHealthData}
            height={150}
            label="Upstash Redis Response Latency (ms)"
          />
        </Card>
      </div>

      {/* Deployment Version Comparisons */}
      <Card className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">Deployment Regression comparison</h3>
        <div className="border border-neutral-900 rounded bg-black overflow-hidden font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                <th className="px-6 py-2">Deployment Version</th>
                <th className="px-6 py-2 text-right">Total Exports logged</th>
                <th className="px-6 py-2 text-right">Average render latency</th>
                <th className="px-6 py-2 text-right text-emerald-400">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950">
              {perf.deployments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-600">
                    [NO_DEPLOYMENT_RECORDS_FOUND]
                  </td>
                </tr>
              ) : (
                perf.deployments.map((d, i) => (
                  <tr key={i} className="hover:bg-neutral-950/40 transition-colors">
                    <td className="px-6 py-3 text-white">{d.version}</td>
                    <td className="px-6 py-3 text-neutral-400 text-right">{d.exportsCount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-neutral-400 text-right">{d.avgDuration}s</td>
                    <td className="px-6 py-3 text-emerald-400 text-right font-bold">{d.successRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Failure Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <BreakdownChart
            data={perf.failureStageBreakdown}
            title="Failure Distribution by Operation Stage"
          />
        </Card>

        <Card>
          <BreakdownChart
            data={perf.failureReasonBreakdown}
            title="Failure Distribution by Cause / Category"
          />
        </Card>
      </div>

    </div>
  );
}
