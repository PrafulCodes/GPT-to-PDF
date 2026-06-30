import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../../components/Card';
import LineChart from '../../../../components/charts/LineChart';
import BarChart from '../../../../components/charts/BarChart';
import { getExecutiveOverview } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function ExecutiveOverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const data = await getExecutiveOverview(range);

  const kpis = [
    { name: 'Visitors Today', value: data.visitorsCount.toLocaleString(), detail: 'Distinct anonymous visitors' },
    { name: 'Sessions', value: data.sessionsCount.toLocaleString(), detail: 'Total user browsing sessions' },
    { name: 'Exports', value: data.exportsCount.toLocaleString(), detail: 'PDF document outputs' },
    { name: 'Conversion Rate', value: `${data.conversionRate}%`, detail: 'Exports generated per session' },
    { name: 'Returning Visitors', value: `${data.returningVisitorsRate}%`, detail: 'Repeat visitors proportion' },
    { name: 'Avg Duration', value: `${data.avgDuration}s`, detail: 'Arithmetic generation mean' },
    { name: 'Success Rate', value: `${data.successRate}%`, detail: 'Ratio of successful exports' },
    { name: 'System Status', value: data.systemStatus, detail: 'Neon Database connection status' },
    { name: 'Est. Revenue', value: data.revenuePlaceholder, detail: 'Simulated value contribution ($0.05/pdf)' },
  ];

  // Convert trend data to LineCharts format
  const visitorChartData = data.trends.map(d => ({ label: d.label, value: d.visitors }));
  const exportChartData = data.trends.map(d => ({ label: d.label, value: d.exports }));

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Executive Overview</h2>
        <p className="text-xs text-neutral-600 font-mono">Platform operations, conversion metrics, and system status summaries.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.name}>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-medium">{kpi.name}</p>
            <p className="text-xl font-bold tracking-tight text-white mt-1.5 font-mono">
              {kpi.value}
            </p>
            <p className="text-[9px] text-neutral-400 font-mono mt-1">{kpi.detail}</p>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <LineChart
            data={visitorChartData}
            height={180}
            label={`Visitor Trends (${range.toUpperCase()})`}
          />
        </Card>
        <Card>
          <LineChart
            data={exportChartData}
            height={180}
            label={`Export Volume Trends (${range.toUpperCase()})`}
          />
        </Card>
      </div>

      {/* Acquisition Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Top Countries</h3>
          <div className="space-y-2">
            {data.topCountries.slice(0, 5).map((c, i) => (
              <div key={i} className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">{i+1}. {c.name}</span>
                <span className="text-white font-bold">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Landing Pages</h3>
          <div className="space-y-2">
            {data.topLandingPages.slice(0, 5).map((l, i) => (
              <div key={i} className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400 truncate max-w-[150px]">{i+1}. {l.name}</span>
                <span className="text-white font-bold">{l.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Top Referrers</h3>
          <div className="space-y-2">
            {data.topReferrers.slice(0, 5).map((r, i) => (
              <div key={i} className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400 truncate max-w-[150px]">{i+1}. {r.name}</span>
                <span className="text-white font-bold">{r.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Live Stream Stream */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Live Activity Feed</h3>
        <div className="border border-neutral-900 rounded bg-black overflow-hidden font-mono text-xs">
          <div className="divide-y divide-neutral-950">
            {data.liveActivity.length === 0 ? (
              <div className="p-8 text-center text-neutral-600 font-mono">
                [NO_LIVE_TRAFFIC_DETECTED]
              </div>
            ) : (
              data.liveActivity.map((act, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-neutral-950/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-500">
                      {new Date(act.timestamp).toISOString().substring(11, 19)}
                    </span>
                    <span className="text-white font-bold">{act.country}</span>
                    <span className="text-neutral-400">{act.browser}</span>
                    <span className="text-neutral-500 truncate max-w-[180px]">{act.landingPath}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-400">{act.duration}s</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                      act.success ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900' : 'bg-red-950/20 text-red-500 border border-red-900'
                    }`}>
                      {act.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
