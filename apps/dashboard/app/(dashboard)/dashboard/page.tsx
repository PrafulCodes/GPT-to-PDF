import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import LineChart from '../../../components/charts/LineChart';
import {
  formatPercentageChange,
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
      ? 'text-emerald-400 bg-emerald-400/10'
      : tone === 'negative'
        ? 'text-red-400 bg-red-400/10'
        : 'text-neutral-400 bg-neutral-800';

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-white tracking-tight">{value}</p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className={`px-2 py-1 text-[10px] font-semibold rounded-md uppercase tracking-wider ${toneClass}`}>
          {formattedDelta.direction === 'neutral' ? 'NO CHANGE' : formattedDelta.label}
        </span>
        <span className="text-xs text-neutral-500">{detail}</span>
      </div>
    </Card>
  );
}

export default async function DashboardOverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const comparisonBounds = resolveComparisonRange(range);

  const [current, previous, trends] = await Promise.all([
    getOverviewSnapshot(range),
    getOverviewSnapshot(range, comparisonBounds),
    getTrendData(range)
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
      detail: 'vs previous period',
      tone: current.exportsCount >= previous.exportsCount ? ('positive' as const) : ('negative' as const)
    },
    {
      title: 'Success Rate',
      value: `${current.successRate.toFixed(1)}%`,
      delta: formatPercentageChange(current.successRate, previous.successRate),
      detail: 'vs previous period',
      tone: current.successRate >= previous.successRate ? ('positive' as const) : ('negative' as const)
    },
    {
      title: 'Average Latency',
      value: `${current.avgDuration.toFixed(1)}s`,
      delta: formatPercentageChange(current.avgDuration, previous.avgDuration),
      detail: 'vs previous period',
      tone: current.avgDuration <= previous.avgDuration ? ('positive' as const) : ('negative' as const)
    },
    {
      title: 'Conversion Rate',
      value: `${current.conversionRate.toFixed(1)}%`,
      delta: formatPercentageChange(current.conversionRate, previous.conversionRate),
      detail: 'vs previous period',
      tone: current.conversionRate >= previous.conversionRate ? ('positive' as const) : ('negative' as const)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">Export Activity Trend</h3>
            <p className="text-xs text-neutral-500 mt-1">Daily completed exports and generation metrics.</p>
          </div>
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{range}</div>
        </div>
        <div className="h-[300px]">
          <LineChart
            data={trendData}
            height={300}
            label="Export Activity"
          />
        </div>
      </Card>
    </div>
  );
}