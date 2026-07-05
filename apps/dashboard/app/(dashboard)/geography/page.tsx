import React from 'react';
import { cookies } from 'next/headers';
import {
  getDimensionPerformanceBreakdown,
  getLocationBreakdown,
} from '@repo/analytics';
import DataTable from '../../../components/DataTable';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function formatCountryName(codeOrName: string) {
  if (!codeOrName || codeOrName === 'Unknown') return 'Unknown';
  try {
    // If it's a 2-letter ISO code, this will return the full name
    if (codeOrName.length === 2) {
      return regionNames.of(codeOrName.toUpperCase()) || codeOrName;
    }
    return codeOrName;
  } catch {
    return codeOrName;
  }
}

export default async function GeographyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const [locations, countries, cities, timezones] = await Promise.all([
    getLocationBreakdown(range),
    getDimensionPerformanceBreakdown('country', range),
    getDimensionPerformanceBreakdown('city', range),
    getDimensionPerformanceBreakdown('timezone', range)
  ]);

  const formattedCountries = countries.map(c => ({
    ...c,
    name: formatCountryName(c.name)
  }));

  const commonColumns = [
    { key: 'name', label: 'Location', sortable: true },
    { key: 'exports', label: 'Exports', align: 'right' as const, sortable: true, format: 'number' as const },
    { key: 'successRate', label: 'Success Rate', align: 'right' as const, sortable: true, format: 'percentage' as const },
    { key: 'avgLatency', label: 'Avg Latency', align: 'right' as const, sortable: true, format: 'latency' as const }
  ];

  const locationColumns = [
    { key: 'name', label: 'Top Locations', sortable: true },
    { key: 'count', label: 'Exports', align: 'right' as const, sortable: true, format: 'number' as const }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-semibold text-white tracking-tight">Geography</h2>
        <p className="text-sm text-neutral-500">
          Analyze user demographics across regions, countries, and cities.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable
          title="Countries"
          description="Export volume by country."
          data={formattedCountries}
          columns={commonColumns as any}
          searchable={true}
          searchPlaceholder="Search countries..."
          searchKeys={['name']}
          emptyMessage="No country telemetry in the selected period."
        />
        <DataTable
          title="Cities"
          description="Export volume by city."
          data={cities}
          columns={commonColumns as any}
          searchable={true}
          searchPlaceholder="Search cities..."
          searchKeys={['name']}
          emptyMessage="No city telemetry in the selected period."
        />
        <DataTable
          title="Top Locations"
          description="Combined country and city metrics."
          data={locations}
          columns={locationColumns as any}
          emptyMessage="No location telemetry in the selected period."
        />
        <DataTable
          title="Timezones"
          description="Usage distributed by timezones."
          data={timezones}
          columns={commonColumns as any}
          emptyMessage="No timezone telemetry in the selected period."
        />
      </div>
    </div>
  );
}
