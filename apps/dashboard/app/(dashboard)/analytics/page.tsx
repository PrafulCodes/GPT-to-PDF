import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import {
  getDimensionBreakdown,
  getDimensionPerformanceBreakdown,
  getGrowthMetrics,
  getLocationBreakdown,
  getLocationPerformanceBreakdown,
  getOverviewSnapshot
} from '@repo/analytics';

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
  columns,
  description
}: {
  title: string;
  rows: Array<Record<string, any>>;
  emptyMessage: string;
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' }>;
  description?: string;
}) {
  return (
    <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
      <div>
        <h3 className="text-xs uppercase tracking-[0.35em] text-neutral-400">{title}</h3>
        {description && <p className="mt-1 text-[11px] text-neutral-600">{description}</p>}
      </div>
      <div className="border border-neutral-900 rounded overflow-hidden text-xs bg-black">
        {rows.length === 0 ? (
          <div className="p-6 text-center text-neutral-600">{emptyMessage}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-[0.3em]">
                {columns.map((column) => (
                  <th key={column.key} className={`px-4 py-2.5 ${column.align === 'right' ? 'text-right' : ''}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-neutral-400">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-neutral-950/20 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-2.5 ${column.align === 'right' ? 'text-right' : 'text-white font-medium'}`}
                    >
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

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const [overview, growth, locations, locationPerformance, browsers, browserVersions, oss, osVersions, devices, screenBuckets, languages, timezones, countries, cities, exportSources, landingPages, trafficSources, referrers] = await Promise.all([
    getOverviewSnapshot(range),
    getGrowthMetrics(range),
    getLocationBreakdown(range),
    getLocationPerformanceBreakdown(range),
    getDimensionPerformanceBreakdown('browser', range),
    getDimensionBreakdown('browserVersion', range),
    getDimensionPerformanceBreakdown('operatingSystem', range),
    getDimensionBreakdown('osVersion', range),
    getDimensionPerformanceBreakdown('deviceType', range),
    getDimensionPerformanceBreakdown('screenSizeBucket', range),
    getDimensionPerformanceBreakdown('language', range),
    getDimensionPerformanceBreakdown('timezone', range),
    getDimensionPerformanceBreakdown('country', range),
    getDimensionPerformanceBreakdown('city', range),
    getDimensionPerformanceBreakdown('exportSource', range),
    getDimensionPerformanceBreakdown('landingPath', range),
    getDimensionPerformanceBreakdown('trafficSource', range),
    getDimensionPerformanceBreakdown('normalizedReferrer', range)
  ]);

  return (
    <div className="space-y-8 select-none font-mono">
      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Analytics Console</h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {range.toUpperCase()} selected. Every table is sorted highest-first and uses the same telemetry window.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Unique Visitors', value: overview.visitorsCount.toLocaleString() },
          { label: 'Sessions', value: overview.sessionsCount.toLocaleString() },
          { label: 'Exports', value: overview.exportsCount.toLocaleString() },
          { label: 'Conversion Rate', value: `${overview.conversionRate.toFixed(1)}%` }
        ].map((item) => (
          <Card key={item.label} className="bg-black border border-neutral-900 rounded p-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.35em] text-neutral-400">Acquisition</h3>
          <p className="text-[11px] text-neutral-600">Traffic sources, search, AI referrers, and landing pages.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionTable
            title="Traffic Sources"
            rows={trafficSources.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No traffic source telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Traffic Source' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Referrers"
            rows={referrers.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No referrer telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Referrer' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Landing Pages"
            rows={landingPages.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No landing-page telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Landing Page' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Search Engines and AI Referrers"
            rows={growth.referrers.map((row) => ({ name: row.source, exports: row.sessions.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: '—' }))}
            emptyMessage="No search-engine or AI referral telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Source' },
              { key: 'exports', label: 'Sessions', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.35em] text-neutral-400">Behaviour</h3>
          <p className="text-[11px] text-neutral-600">Visitor mix and repeat-use signals.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionTable
            title="Visitor Mix"
            rows={[
              { name: 'Unique Visitors', exports: overview.visitorsCount.toLocaleString(), successRate: `${overview.conversionRate.toFixed(1)}%`, avgLatency: `${overview.avgDuration.toFixed(1)}s` },
              { name: 'Returning Visitors', exports: `${overview.returningVisitorsRate.toFixed(1)}%`, successRate: `${overview.successRate.toFixed(1)}%`, avgLatency: `${overview.avgDuration.toFixed(1)}s` },
              { name: 'Sessions', exports: overview.sessionsCount.toLocaleString(), successRate: `${overview.conversionRate.toFixed(1)}%`, avgLatency: `${overview.avgDuration.toFixed(1)}s` },
              { name: 'Exports per Session', exports: overview.sessionsCount > 0 ? (overview.exportsCount / overview.sessionsCount).toFixed(2) : '0.00', successRate: `${overview.successRate.toFixed(1)}%`, avgLatency: `${overview.avgDuration.toFixed(1)}s` }
            ]}
            emptyMessage="No behavioural telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Metric' },
              { key: 'exports', label: 'Value', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Conversion Cohorts"
            rows={growth.utmCampaigns.map((row) => ({ name: `${row.utmSource} / ${row.utmCampaign}`, exports: row.sessions.toLocaleString(), successRate: `${row.conversionRate.toFixed(1)}%`, avgLatency: '—' }))}
            emptyMessage="No UTM telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Campaign' },
              { key: 'exports', label: 'Sessions', align: 'right' },
              { key: 'successRate', label: 'Conversion', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.35em] text-neutral-400">Technology</h3>
          <p className="text-[11px] text-neutral-600">Browsers, operating systems, devices, languages, timezones, and geography.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionTable
            title="Browsers"
            rows={browsers.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No browser telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Browser' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Browser Versions"
            rows={browserVersions.map((row) => ({ name: row.name, exports: row.count.toLocaleString(), successRate: '—', avgLatency: '—' }))}
            emptyMessage="No browser version telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Version' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Operating Systems"
            rows={oss.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No operating-system telemetry in the selected period."
            columns={[
              { key: 'name', label: 'OS' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="OS Versions"
            rows={osVersions.map((row) => ({ name: row.name, exports: row.count.toLocaleString(), successRate: '—', avgLatency: '—' }))}
            emptyMessage="No OS version telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Version' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Device Types"
            rows={devices.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No device telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Device' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Screen Buckets"
            rows={screenBuckets.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No screen telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Screen Bucket' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Languages"
            rows={languages.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No language telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Language' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Timezones"
            rows={timezones.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No timezone telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Timezone' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Top Locations"
            rows={locations.map((row) => ({ name: row.name, exports: row.count.toLocaleString() }))}
            emptyMessage="No location telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Location' },
              { key: 'exports', label: 'Exports', align: 'right' }
            ]}
          />
          <SectionTable
            title="Countries"
            rows={countries.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No country telemetry in the selected period."
            columns={[
              { key: 'name', label: 'Country' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
          <SectionTable
            title="Cities"
            rows={cities.map((row) => ({ name: row.name, exports: row.exports.toLocaleString(), successRate: `${row.successRate.toFixed(1)}%`, avgLatency: `${row.avgLatency.toFixed(1)}s` }))}
            emptyMessage="No city telemetry in the selected period."
            columns={[
              { key: 'name', label: 'City' },
              { key: 'exports', label: 'Exports', align: 'right' },
              { key: 'successRate', label: 'Success Rate', align: 'right' },
              { key: 'avgLatency', label: 'Avg Latency', align: 'right' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}