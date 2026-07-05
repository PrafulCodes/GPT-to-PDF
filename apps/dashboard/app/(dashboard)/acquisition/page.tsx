import React from 'react';
import { cookies } from 'next/headers';
import {
  getDimensionPerformanceBreakdown,
  getGrowthMetrics,
} from '@repo/analytics';
import DataTable from '../../../components/DataTable';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function AcquisitionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const [growth, exportSources, landingPages, trafficSources, referrers] = await Promise.all([
    getGrowthMetrics(range),
    getDimensionPerformanceBreakdown('exportSource', range),
    getDimensionPerformanceBreakdown('landingPath', range),
    getDimensionPerformanceBreakdown('trafficSource', range),
    getDimensionPerformanceBreakdown('normalizedReferrer', range)
  ]);

  const commonColumns = [
    { key: 'name', label: 'Source', sortable: true },
    { key: 'exports', label: 'Exports', align: 'right' as const, sortable: true, format: 'number' as const },
    { key: 'successRate', label: 'Success Rate', align: 'right' as const, sortable: true, format: 'percentage' as const },
    { key: 'avgLatency', label: 'Avg Latency', align: 'right' as const, sortable: true, format: 'latency' as const }
  ];

  const aiColumns = [
    { key: 'source', label: 'AI Platform', sortable: true },
    { key: 'sessions', label: 'Sessions', align: 'right' as const, sortable: true, format: 'number' as const },
    { key: 'successRate', label: 'Success Rate', align: 'right' as const, sortable: true, format: 'percentage' as const }
  ];

  const utmColumns = [
    { key: 'utmSource', label: 'UTM Source', sortable: true },
    { key: 'utmCampaign', label: 'UTM Campaign', sortable: true },
    { key: 'sessions', label: 'Sessions', align: 'right' as const, sortable: true, format: 'number' as const },
    { key: 'conversionRate', label: 'Conversion', align: 'right' as const, sortable: true, format: 'percentage' as const }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-semibold text-white tracking-tight">Acquisition</h2>
        <p className="text-sm text-neutral-500">
          Understand where your users are coming from and how they convert.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable
          title="Traffic Sources"
          description="High level channels driving traffic."
          data={trafficSources}
          columns={commonColumns as any}
          emptyMessage="No traffic source telemetry in the selected period."
        />
        <DataTable
          title="Referrers"
          description="Specific websites referring traffic."
          data={referrers}
          columns={commonColumns as any}
          emptyMessage="No referrer telemetry in the selected period."
        />
        <DataTable
          title="Landing Pages"
          description="First pages visited by users."
          data={landingPages}
          columns={commonColumns as any}
          emptyMessage="No landing-page telemetry in the selected period."
        />
        <DataTable
          title="Export Sources"
          description="Pages where exports were triggered."
          data={exportSources}
          columns={commonColumns as any}
          emptyMessage="No export-source telemetry in the selected period."
        />
        <DataTable
          title="AI Platform Referrals"
          description="Traffic from LLMs and chat interfaces."
          data={growth.referrers}
          columns={aiColumns as any}
          emptyMessage="No AI referral telemetry in the selected period."
        />
        <DataTable
          title="UTM Campaigns"
          description="Conversion tracked by UTM tags."
          data={growth.utmCampaigns}
          columns={utmColumns as any}
          emptyMessage="No UTM telemetry in the selected period."
        />
      </div>
    </div>
  );
}
