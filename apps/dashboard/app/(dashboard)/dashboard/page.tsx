import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import LineChart from '../../../components/charts/LineChart';
import {
  formatPercentageChange,
  getDimensionPerformanceBreakdown,
  getFounderInsights,
  getLocationPerformanceBreakdown,
  getOverviewSnapshot,
  getTrendData,
  resolveComparisonRange
} from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

function formatMetricDelta(delta: number, suffix = '%') {
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  const sign = delta > 0 ? '+' : '';

  return {
    direction,
    label: `${sign}${delta.toFixed(1)}${suffix}`
  };
}

function MetricCard({
  title,
  value,
  delta,
  detail,
  tone = 'neutral'
}: {
  title: string;
  value: string;
  delta: number;
  detail: string;
  tone?: 'neutral' | 'positive' | 'negative';
}) {
  const formattedDelta = formatMetricDelta(delta);
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-400'
      : tone === 'negative'
        ? 'text-red-400'
        : 'text-neutral-400';

  return (
    <Card className="bg-black border border-neutral-900 rounded p-4 font-mono h-full">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white tracking-tight">{value}</p>
      <div className={`mt-2 text-[11px] uppercase tracking-[0.25em] ${toneClass}`}>
        {formattedDelta.direction === 'neutral' ? 'No change vs previous period' : `${formattedDelta.label} vs previous period`}
      </div>
      <p className="mt-2 text-[11px] text-neutral-500 leading-relaxed">{detail}</p>
    </Card>
  );
}

function BreakdownTable({
  title,
  rows,
  emptyMessage
}: {
  title: string;
  rows: Array<{ name: string; exports: number; successRate: number; avgLatency: number }>;
  emptyMessage: string;
}) {
  return (
    <Card className="space-y-4 font-mono bg-black border border-neutral-900 rounded p-4">
      <h3 className="text-xs uppercase tracking-[0.35em] text-neutral-400">{title}</h3>
      <div className="border border-neutral-900 rounded overflow-hidden text-xs bg-black">
        {rows.length === 0 ? (
          <div className="p-6 text-center text-neutral-600">{emptyMessage}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-[0.28em]">
                <th className="px-4 py-2.5">{title}</th>
                <th className="px-4 py-2.5 text-right">Exports</th>
                <th className="px-4 py-2.5 text-right">Success Rate</th>
                <th className="px-4 py-2.5 text-right">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-neutral-400">
              {rows.map((row) => (
                <tr key={row.name} className="hover:bg-neutral-950/20 transition-colors">
                  <td className="px-4 py-2.5 text-white font-medium">{row.name}</td>
                  <td className="px-4 py-2.5 text-right">{row.exports.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right">{row.successRate.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-right">{row.avgLatency.toFixed(1)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

export default async function DashboardOverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const comparisonBounds = resolveComparisonRange(range);

  const [current, previous, trends, founders, locations, browsers, trafficSources, landingPages, exportSources] = await Promise.all([
    getOverviewSnapshot(range),
    getOverviewSnapshot(range, comparisonBounds),
    getTrendData(range),
    getFounderInsights(),
    getLocationPerformanceBreakdown(range),
    getDimensionPerformanceBreakdown('browser', range),
    getDimensionPerformanceBreakdown('trafficSource', range),
    getDimensionPerformanceBreakdown('landingPath', range),
    getDimensionPerformanceBreakdown('exportSource', range)
  ]);

  const trendData = trends.map((point) => ({
    label: point.label,
    value: point.exports,
    exports: point.exports,
    successes: point.successes,
    failures: point.failures,
    visitors: point.visitors,
    sessions: point.sessions,
    avgDuration: point.avgDuration
  }));

  const metricCards = [
    {
      title: 'Exports',
      value: current.exportsCount.toLocaleString(),
      delta: formatPercentageChange(current.exportsCount, previous.exportsCount),
      detail: 'Completed PDF exports inside the selected period.'
    },
    {
      title: 'Success Rate',
      value: `${current.successRate.toFixed(1)}%`,
      delta: formatPercentageChange(current.successRate, previous.successRate),
      detail: 'Share of exports that completed successfully.',
      tone: current.successRate >= previous.successRate ? ('positive' as const) : ('negative' as const)
    },
    {
      title: 'Failure Rate',
      value: `${Math.max(0, 100 - current.successRate).toFixed(1)}%`,
      delta: formatPercentageChange(100 - current.successRate, 100 - previous.successRate),
      detail: 'Share of exports that failed in this period.',
      tone: current.successRate >= previous.successRate ? ('positive' as const) : ('negative' as const)
    },
    {
      title: 'Average Latency',
      value: `${current.avgDuration.toFixed(1)}s`,
      delta: formatPercentageChange(current.avgDuration, previous.avgDuration),
      detail: 'Average PDF generation duration for successful exports.',
      tone: current.avgDuration <= previous.avgDuration ? ('positive' as const) : ('negative' as const)
    },
    {
      title: 'Unique Visitors',
      value: current.visitorsCount.toLocaleString(),
      delta: formatPercentageChange(current.visitorsCount, previous.visitorsCount),
      detail: 'Distinct visitors observed in the selected period.'
    },
    {
      title: 'Returning Visitors',
      value: `${current.returningVisitorsRate.toFixed(1)}%`,
      delta: formatPercentageChange(current.returningVisitorsRate, previous.returningVisitorsRate),
      detail: 'Visitors marked as returning in the telemetry stream.'
    },
    {
      title: 'Conversion Rate',
      value: `${current.conversionRate.toFixed(1)}%`,
      delta: formatPercentageChange(current.conversionRate, previous.conversionRate),
      detail: 'Successful exports divided by sessions.'
    },
    {
      title: 'Sessions',
      value: current.sessionsCount.toLocaleString(),
      delta: formatPercentageChange(current.sessionsCount, previous.sessionsCount),
      detail: 'Distinct sessions captured by the telemetry pipeline.'
    }
  ];

  const founderByPeriod = founders.reduce<Record<string, typeof founders>>((acc, insight) => {
    if (!acc[insight.period]) acc[insight.period] = [];
    acc[insight.period].push(insight);
    return acc;
  }, {});

  return (
    <div className="space-y-8 select-none font-mono">
      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Founder Intelligence Console</h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Selected period: {range.toUpperCase()} . Every widget below uses the same time window and compares against the previous comparable period.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <Card className="bg-black border border-neutral-900 rounded p-4 md:p-5 font-mono">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div>
            <h3 className="text-xs uppercase tracking-[0.35em] text-neutral-400">Usage Trend</h3>
            <p className="text-[11px] text-neutral-600 mt-1">Exports, success/failure mix, visitors, sessions, and latency for the selected window.</p>
          </div>
          <div className="text-[11px] text-neutral-500 uppercase tracking-[0.3em]">{range.toUpperCase()}</div>
        </div>
        <LineChart
          data={trendData}
          height={220}
          label="Export Activity"
        />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BreakdownTable title="Top Locations" rows={locations} emptyMessage="No exports during the selected period." />
        <BreakdownTable title="Top Browsers" rows={browsers} emptyMessage="No browser telemetry for the selected period." />
        <BreakdownTable title="Traffic Sources" rows={trafficSources} emptyMessage="No traffic source telemetry for the selected period." />
        <BreakdownTable title="Landing Pages" rows={landingPages} emptyMessage="No landing-page telemetry for the selected period." />
        <BreakdownTable title="Export Sources" rows={exportSources} emptyMessage="No export-source telemetry for the selected period." />
      </div>

      <Card className="space-y-4 font-mono bg-black border border-neutral-900 rounded p-4 md:p-5">
        <div>
          <h3 className="text-xs uppercase tracking-[0.35em] text-neutral-400">Founder Insights</h3>
          <p className="text-[11px] text-neutral-600 mt-1">Built from live telemetry only. Each section is scoped to its own time window.</p>
        </div>

        {(['Today', 'Last 7 Days', 'Last 28 Days'] as const).map((period) => {
          const items = founderByPeriod[period] || [];

          return (
            <div key={period} className="space-y-3 border-t border-neutral-950 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-[11px] uppercase tracking-[0.35em] text-white">{period}</h4>
                <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Real telemetry only</span>
              </div>

              {items.length === 0 ? (
                <div className="text-xs text-neutral-600">No insights available for this period.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((insight) => (
                    <div key={insight.id} className="rounded border border-neutral-900 bg-neutral-950/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{insight.type}</p>
                      </div>
                      <p className="mt-2 text-sm text-white leading-snug">{insight.title}</p>
                      <p className="mt-2 text-[11px] text-neutral-500 leading-relaxed">{insight.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}