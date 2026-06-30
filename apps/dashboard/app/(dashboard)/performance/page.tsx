import React from 'react';
import Card from '../../../components/Card';
import { getPerformanceMetrics } from '../../../lib/db-queries';
import BreakdownChart from '../../../components/charts/BreakdownChart';

export const revalidate = 0;

export default async function PerformancePage() {
  const perf = await getPerformanceMetrics();

  const latencyMetrics = [
    { name: 'Average Latency', value: `${perf.avgDuration}s`, detail: 'Arithmetic mean of successful exports' },
    { name: '95th Percentile (p95)', value: `${perf.p95}s`, detail: '95% of exports complete under this duration' },
    { name: '99th Percentile (p99)', value: `${perf.p99}s`, detail: '99% of exports complete under this duration' },
    { name: 'Extreme Latencies', value: `${perf.minDuration}s - ${perf.maxDuration}s`, detail: 'Minimum vs Maximum successful conversion duration' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Performance Diagnostics</h2>
        <p className="text-xs text-neutral-600 font-mono">Render latencies, serverless load, and resource profiling.</p>
      </div>

      {/* Latency Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Failure Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Failure Stages */}
        <Card>
          <BreakdownChart
            data={perf.failureStageBreakdown}
            title="Failure Distribution by Operation Stage"
          />
        </Card>

        {/* Failure Reasons */}
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
