import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import DataTable from '../../../components/DataTable';
import {
  getOverviewSnapshot,
  getFounderTables
} from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

function SnapshotCard({
  title,
  value,
  detail
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-white tracking-tight">{value}</p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-neutral-500">{detail}</span>
      </div>
    </Card>
  );
}

export default async function DashboardOverviewPage({ searchParams }: PageProps) {
  // Always restrict to "today" as per the new baseline requirement
  const range = 'today';

  const [current, tables] = await Promise.all([
    getOverviewSnapshot(range),
    getFounderTables()
  ]);

  const metricCards = [
    { title: "Today's Exports", value: current.exportsCount.toLocaleString(), detail: 'Total initiated' },
    { title: "Today's Successful Exports", value: (current.exportsCount - current.failedExportsCount).toLocaleString(), detail: 'Completed without errors' },
    { title: "Today's Failed Exports", value: current.failedExportsCount.toLocaleString(), detail: 'Failed attempts' },
    { title: "Average Generation Time", value: current.exportsCount > 0 ? `${current.avgDuration.toFixed(1)}s` : '—', detail: 'Per export' },
    { title: "Average PDF Size", value: current.exportsCount > 0 && current.avgPdfSize > 0 ? `${(current.avgPdfSize / 1024).toFixed(1)} KB` : '—', detail: 'Generated output' },
    { title: "Unique Visitors Today", value: current.visitorsCount.toLocaleString(), detail: 'Distinct visitors' },
    { title: "Returning Visitors Today", value: current.returningVisitorsCount.toLocaleString(), detail: 'Repeat visitors' },
    { title: "Countries Today", value: current.countriesCount.toLocaleString(), detail: 'Geographic distribution' },
    { title: "Top Referrer Today", value: current.topReferrer, detail: 'Primary traffic source' },
    { title: "Top Landing Page Today", value: current.topLandingPage, detail: 'Most frequent entry point' },
    { title: "Top Export Source", value: current.topExportSource, detail: 'Application feature used' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <SnapshotCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Recent Exports</h3>
          <DataTable 
            data={tables.recentExports} 
            columns={[
              { key: 'exportSource', label: 'Source' },
              { key: 'pdfSize', label: 'Size', format: 'number' },
              { key: 'generationDuration', label: 'Duration', format: 'latency' }
            ]} 
          />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Recent Visitors</h3>
          <DataTable 
            data={tables.recentVisitors} 
            columns={[
              { key: 'country', label: 'Country' },
              { key: 'browser', label: 'Browser' }
            ]} 
          />
        </Card>
        
        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Top Acquisition Sources</h3>
          <DataTable 
            data={tables.topAcquisition} 
            columns={[
              { key: 'referrer', label: 'Referrer' },
              { key: 'count', label: 'Exports', format: 'number' }
            ]} 
          />
        </Card>
        
        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Top Countries</h3>
          <DataTable 
            data={tables.topCountries} 
            columns={[
              { key: 'country', label: 'Country' },
              { key: 'count', label: 'Exports', format: 'number' }
            ]} 
          />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Top Cities</h3>
          <DataTable 
            data={tables.topCities} 
            columns={[
              { key: 'city', label: 'City' },
              { key: 'count', label: 'Exports', format: 'number' }
            ]} 
          />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Latest Failures</h3>
          <DataTable 
            data={tables.latestFailures} 
            columns={[
              { key: 'exportSource', label: 'Source' },
              { key: 'failureReason', label: 'Reason' }
            ]} 
          />
        </Card>
      </div>
    </div>
  );
}