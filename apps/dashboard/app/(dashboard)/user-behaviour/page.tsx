import React from 'react';
import { cookies } from 'next/headers';
import { getOverviewSnapshot } from '@repo/analytics';
import DataTable from '../../../components/DataTable';
import Card from '../../../components/Card';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function UserBehaviourPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const overview = await getOverviewSnapshot(range);

  const visitorMixData = [
    {
      metric: 'Unique Visitors',
      value: overview.visitorsCount.toLocaleString(),
      successRate: `${overview.conversionRate.toFixed(1)}%`,
    },
    {
      metric: 'Returning Visitors',
      value: `${overview.returningVisitorsRate.toFixed(1)}%`,
      successRate: `${overview.successRate.toFixed(1)}%`,
    },
    {
      metric: 'Total Sessions',
      value: overview.sessionsCount.toLocaleString(),
      successRate: `${overview.conversionRate.toFixed(1)}%`,
    },
    {
      metric: 'Exports per Session',
      value: overview.sessionsCount > 0 ? (overview.exportsCount / overview.sessionsCount).toFixed(2) : '0.00',
      successRate: `${overview.successRate.toFixed(1)}%`,
    }
  ];

  const columns = [
    { key: 'metric', label: 'Metric', sortable: true },
    { key: 'value', label: 'Value', align: 'right' as const, sortable: false },
    { key: 'successRate', label: 'Success Rate', align: 'right' as const, sortable: false }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-semibold text-white tracking-tight">User Behaviour</h2>
        <p className="text-sm text-neutral-500">
          Understand how visitors interact and return to your application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Returning Rate</p>
            <p className="mt-3 text-3xl font-semibold text-white tracking-tight">{overview.returningVisitorsRate.toFixed(1)}%</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Of total visitors</span>
          </div>
        </Card>
        
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Exports / Session</p>
            <p className="mt-3 text-3xl font-semibold text-white tracking-tight">
              {overview.sessionsCount > 0 ? (overview.exportsCount / overview.sessionsCount).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Average per session</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        <DataTable
          title="Visitor Cohorts"
          description="High level overview of new vs returning visitors."
          data={visitorMixData}
          columns={columns as any}
          emptyMessage="No behavioural telemetry in the selected period."
        />
      </div>
    </div>
  );
}
