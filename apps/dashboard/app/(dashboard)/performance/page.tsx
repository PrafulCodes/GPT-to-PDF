import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import { getPerformanceMetrics } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

function SectionTable({
  title,
  rows,
  emptyMessage,
  columns
}: {
  title: string;
  rows: Array<Record<string, any>>;
  emptyMessage: string;
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' }>;
}) {
  return (
    <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
      <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">{title}</h4>
      <div className="border border-neutral-900 rounded overflow-hidden text-xs bg-black">
        {rows.length === 0 ? (
          <div className="p-6 text-center text-neutral-600">{emptyMessage}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                {columns.map((column) => (
                  <th key={column.key} className={`px-4 py-2 ${column.align === 'right' ? 'text-right' : ''}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-neutral-400">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-neutral-950/10">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-2 ${column.align === 'right' ? 'text-right' : 'text-white font-medium'}`}>
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

export default async function PerformancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const perf = await getPerformanceMetrics(range);

  const latencyBuckets = ['0–2 sec', '2–5 sec', '5–10 sec', '10–20 sec', '20+'].map((label) => ({
    name: label,
    count: perf.latencyBuckets.find((bucket) => bucket.name === label)?.count || 0
  }));

  const pdfSizeBuckets = ['0–500 KB', '500KB–1MB', '1MB–5MB', '5MB+'].map((label) => ({
    name: label,
    count: perf.pdfSizeBuckets.find((bucket) => bucket.name === label)?.count || 0
  }));

  const deploymentRows = perf.deployments.map((deployment) => ({
    version: deployment.version,
    exports: deployment.exportsCount.toLocaleString(),
    successRate: `${deployment.successRate.toFixed(1)}%`,
    avgDuration: `${deployment.avgDuration.toFixed(2)}s`
  }));

  return (
    <div className="space-y-6 md:space-y-8 select-none font-mono">
      <div className="space-y-1">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400">Performance Diagnostics</h2>
        <p className="text-xs text-neutral-600">{range.toUpperCase()} selected. Buckets, failures, and outliers are sourced from one shared performance snapshot.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Average', value: `${perf.avgDuration.toFixed(2)}s` },
          { name: 'Median', value: `${perf.median.toFixed(2)}s` },
          { name: 'P95', value: `${perf.p95.toFixed(2)}s` },
          { name: 'P99', value: `${perf.p99.toFixed(2)}s` }
        ].map((item) => (
          <Card key={item.name} className="bg-black border border-neutral-900 rounded p-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">{item.name}</p>
            <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
            <p className="mt-1 text-[10px] text-neutral-600 uppercase tracking-widest">Compared to the selected period only</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionTable
          title="Latency Distribution"
          rows={latencyBuckets.map((bucket) => ({ bucket: bucket.name, exports: bucket.count.toLocaleString() }))}
          emptyMessage="No successful exports in the selected period."
          columns={[
            { key: 'bucket', label: 'Latency Range' },
            { key: 'exports', label: 'Exports', align: 'right' }
          ]}
        />
        <SectionTable
          title="PDF Size Distribution"
          rows={pdfSizeBuckets.map((bucket) => ({ bucket: bucket.name, exports: bucket.count.toLocaleString() }))}
          emptyMessage="No PDF size telemetry in the selected period."
          columns={[
            { key: 'bucket', label: 'Size Range' },
            { key: 'exports', label: 'Exports', align: 'right' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionTable
          title="Failure Stages"
          rows={perf.failureStageBreakdown.map((item) => ({ stage: item.name, failures: item.count.toLocaleString() }))}
          emptyMessage="No failure stages logged in the selected period."
          columns={[
            { key: 'stage', label: 'Stage' },
            { key: 'failures', label: 'Failures', align: 'right' }
          ]}
        />
        <SectionTable
          title="Failure Reasons"
          rows={perf.failureReasonBreakdown.map((item) => ({ reason: item.name, failures: item.count.toLocaleString() }))}
          emptyMessage="No failure reasons logged in the selected period."
          columns={[
            { key: 'reason', label: 'Reason' },
            { key: 'failures', label: 'Failures', align: 'right' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionTable
          title="Slowest Exports"
          rows={perf.slowestExports.map((item) => ({ id: item.id, bucket: item.exportSizeBucket || 'Telemetry unavailable', duration: `${item.generationDuration.toFixed(2)}s` }))}
          emptyMessage="No slow exports in the selected period."
          columns={[
            { key: 'id', label: 'Export ID' },
            { key: 'bucket', label: 'Size Bucket' },
            { key: 'duration', label: 'Duration', align: 'right' }
          ]}
        />
        <SectionTable
          title="Fastest Exports"
          rows={perf.fastestExports.map((item) => ({ id: item.id, bucket: item.exportSizeBucket || 'Telemetry unavailable', duration: `${item.generationDuration.toFixed(2)}s` }))}
          emptyMessage="No fast exports in the selected period."
          columns={[
            { key: 'id', label: 'Export ID' },
            { key: 'bucket', label: 'Size Bucket' },
            { key: 'duration', label: 'Duration', align: 'right' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionTable
          title={perf.deployments.length > 1 ? 'Engine Versions' : 'Engine Version'}
          rows={perf.deployments.length > 1 ? deploymentRows : []}
          emptyMessage={perf.deployments.length > 1 ? 'No engine version comparison available.' : 'Only one engine version is present, so this section is hidden.'}
          columns={[
            { key: 'version', label: 'Version' },
            { key: 'exports', label: 'Exports', align: 'right' },
            { key: 'successRate', label: 'Success Rate', align: 'right' },
            { key: 'avgDuration', label: 'Avg Latency', align: 'right' }
          ]}
        />
        <SectionTable
          title="Failure Timeline"
          rows={perf.failureTimeline.map((item) => ({ day: item.label, failures: item.failures.toLocaleString() }))}
          emptyMessage="No failure timeline data in the selected period."
          columns={[
            { key: 'day', label: 'Day' },
            { key: 'failures', label: 'Failures', align: 'right' }
          ]}
        />
      </div>
    </div>
  );
}