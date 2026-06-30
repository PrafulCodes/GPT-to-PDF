import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import LineChart from '../../../components/charts/LineChart';
import { db } from '@repo/db';
import { getExecutiveOverview, resolveTimeRange } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function DashboardOverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const { start, end } = resolveTimeRange(range);

  // Retrieve multi-period metrics to populate the cards
  const [
    overview,
    overview24h,
    overview7d,
    overview28d,
    browsers,
    exportSources,
    landingPages,
    trafficSources
  ] = await Promise.all([
    getExecutiveOverview(range),
    getExecutiveOverview('24h'),
    getExecutiveOverview('7d'),
    getExecutiveOverview('28d'),
    db.exportEvent.groupBy({
      by: ['browser'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['exportSource'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } }
    }),
    db.exportEvent.groupBy({
      by: ['landingPath'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['trafficSource'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })
  ]);

  const cards = [
    { name: 'Total Exports', value: overview.exportsCount.toLocaleString(), detail: 'All-time platform downloads' },
    { name: "Today's Exports", value: overview24h.exportsCount.toLocaleString(), detail: 'Last 24 hours traffic' },
    { name: 'Last 7 Days', value: overview7d.exportsCount.toLocaleString(), detail: 'Weekly volume aggregate' },
    { name: 'Last 28 Days', value: overview28d.exportsCount.toLocaleString(), detail: 'Monthly volume aggregate' },
    { name: 'Success Rate', value: `${overview.successRate}%`, detail: 'Successful downloads percentage' },
    { name: 'Avg Latency', value: `${overview.avgDuration}s`, detail: 'Mean PDF print duration' },
    { name: 'Returning Visitors', value: `${overview.returningVisitorsRate}%`, detail: 'Returning visitor segment' },
    { name: 'Active Sessions', value: overview.sessionsCount.toLocaleString(), detail: 'Unique user sessions logged' }
  ];

  // Convert trend data to LineChart
  const chartData = overview.trends.map(t => ({
    label: t.label,
    value: t.exports
  }));

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Dashboard Overview</h2>
        <p className="text-xs text-neutral-600 font-mono">Real-time platform usage metrics, conversion, and performance indicators.</p>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.name} className="bg-black border border-neutral-900 rounded p-4 font-mono">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">{card.name}</p>
            <p className="text-lg font-bold text-white mt-1">{card.value}</p>
            <p className="text-[8px] text-neutral-600 mt-0.5">{card.detail}</p>
          </Card>
        ))}
      </div>

      {/* Trend Graph */}
      <Card className="bg-black border border-neutral-900 rounded p-4 font-mono">
        <LineChart
          data={chartData}
          height={180}
          label={`Export Generations Trend (${range.toUpperCase()})`}
        />
      </Card>

      {/* Grid 1: Countries & Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Countries */}
        <Card className="space-y-4 font-mono bg-black border border-neutral-900 rounded p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Top Countries Demand</h3>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs bg-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Country Location</th>
                  <th className="px-4 py-2 text-right">Total Exports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {overview.topCountries.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-neutral-600">[NO_COUNTRY_GEOGRAPHY_LOGS]</td>
                  </tr>
                ) : (
                  overview.topCountries.slice(0, 5).map((c, i) => (
                    <tr key={i} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="px-4 py-2 text-white">{c.name}</td>
                      <td className="px-4 py-2 text-right">{c.count.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Referrers */}
        <Card className="space-y-4 font-mono bg-black border border-neutral-900 rounded p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Top Referrer Channels</h3>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs bg-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Referrer Host</th>
                  <th className="px-4 py-2 text-right">Total Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {overview.topReferrers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-neutral-600">[NO_REFERRER_TRAFFIC_LOGGED]</td>
                  </tr>
                ) : (
                  overview.topReferrers.slice(0, 5).map((r, i) => (
                    <tr key={i} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="px-4 py-2 text-white">{r.name}</td>
                      <td className="px-4 py-2 text-right">{r.count.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Grid 2: Traffic Sources, Landing pages, Browsers, Export Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        {/* Traffic sources */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Traffic Sources</h4>
          <div className="space-y-1 text-xs text-neutral-300">
            {trafficSources.map((ts, idx) => (
              <div key={idx} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[120px]">{ts.trafficSource || 'Direct'}</span>
                <span className="text-white font-bold">{ts._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Landing pages */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Landing Pages</h4>
          <div className="space-y-1 text-xs text-neutral-300">
            {landingPages.map((lp, idx) => (
              <div key={idx} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[120px]">{lp.landingPath || '/'}</span>
                <span className="text-white font-bold">{lp._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Browser share */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Browser Share</h4>
          <div className="space-y-1 text-xs text-neutral-300">
            {browsers.map((b, idx) => (
              <div key={idx} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[120px]">{b.browser || 'Chrome'}</span>
                <span className="text-white font-bold">{b._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Export sources */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Export Source App</h4>
          <div className="space-y-1 text-xs text-neutral-300">
            {exportSources.map((es, idx) => (
              <div key={idx} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[120px]">{es.exportSource || 'ChatGPT'}</span>
                <span className="text-white font-bold">{es._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Recent Live Activity Logs */}
      <Card className="space-y-4 font-mono bg-black border border-neutral-900 rounded p-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Recent Export Activity Ledger</h3>
        <div className="border border-neutral-900 rounded overflow-hidden text-xs bg-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                <th className="px-4 py-2">Timestamp (UTC)</th>
                <th className="px-4 py-2">Geography</th>
                <th className="px-4 py-2">Browser Engine</th>
                <th className="px-4 py-2 text-right">Duration</th>
                <th className="px-4 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-neutral-400">
              {overview.liveActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-600">[NO_LIVE_EXPORT_LOGS_INGESTED]</td>
                </tr>
              ) : (
                overview.liveActivity.slice(0, 10).map((act, idx) => (
                  <tr key={idx} className="hover:bg-neutral-950/20 transition-colors">
                    <td className="px-4 py-2 text-neutral-500">
                      {new Date(act.timestamp).toISOString().substring(11, 19)}
                    </td>
                    <td className="px-4 py-2 text-white font-medium">{act.country}</td>
                    <td className="px-4 py-2">{act.browser}</td>
                    <td className="px-4 py-2 text-right">{act.duration}s</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                        act.success
                          ? 'bg-neutral-950 text-white border-neutral-700'
                          : 'bg-neutral-900 text-neutral-500 border-neutral-950'
                      }`}>
                        {act.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
