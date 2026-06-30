import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import { db } from '@repo/db';
import { getExecutiveOverview, getGrowthMetrics, resolveTimeRange } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const { start, end } = resolveTimeRange(range);

  // Fetch telemetry breakdowns directly for dashboard widgets
  const [
    overview,
    growth,
    browsers,
    oss,
    devices,
    screenBuckets,
    languages,
    timezones,
    darkModes,
    countries,
    cities,
    exportSources,
    landingPages,
    heatmapRaw
  ] = await Promise.all([
    getExecutiveOverview(range),
    getGrowthMetrics(range),
    db.exportEvent.groupBy({
      by: ['browser'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['operatingSystem'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['deviceType'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } }
    }),
    db.exportEvent.groupBy({
      by: ['screenSizeBucket'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['language'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['timezone'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['darkMode'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } }
    }),
    db.exportEvent.groupBy({
      by: ['country'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    db.exportEvent.groupBy({
      by: ['city'],
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
      by: ['dayOfWeek', 'localHour'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } }
    })
  ]);

  // Construct Heatmap table values
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hourBlocks = [
    { name: 'Night (0-6)', min: 0, max: 5 },
    { name: 'Morning (6-12)', min: 6, max: 11 },
    { name: 'Afternoon (12-18)', min: 12, max: 17 },
    { name: 'Evening (18-24)', min: 18, max: 23 }
  ];

  const heatmapMatrix = days.map((dayName, dayIdx) => {
    const row: Record<string, number> = { dayIdx };
    hourBlocks.forEach((block) => {
      const cellSum = heatmapRaw
        .filter(h => h.dayOfWeek === dayIdx && h.localHour !== null && h.localHour >= block.min && h.localHour <= block.max)
        .reduce((sum, curr) => sum + curr._count.id, 0);
      row[block.name] = cellSum;
    });
    return { name: dayName, ...row };
  });

  return (
    <div className="space-y-6 md:space-y-8 select-none font-mono">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">User Behavior Insights</h2>
        <p className="text-xs text-neutral-600 font-mono">Monospace engineering charts tracking system visitor profiles.</p>
      </div>

      {/* Row 1: Core Metrics & Returns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Visitor retention */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-3">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Visitor Cohorts</h4>
          <div className="space-y-3 text-xs text-neutral-300">
            <div className="flex justify-between border-b border-neutral-950 pb-1.5">
              <span>Unique Visitors</span>
              <span className="text-white font-bold">{overview.visitorsCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-950 pb-1.5">
              <span>Returning Sessions Ratio</span>
              <span className="text-white font-bold">{overview.returningVisitorsRate}%</span>
            </div>
          </div>
        </Card>

        {/* Devices */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-3">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Device Class</h4>
          <div className="space-y-2 text-xs text-neutral-300">
            {devices.map((d, idx) => (
              <div key={idx} className="flex justify-between border-b border-neutral-950 pb-1.5">
                <span>{d.deviceType || 'Desktop'}</span>
                <span className="text-white font-bold">{d._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Viewport Size Buckets */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-3">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Screen Size Buckets</h4>
          <div className="space-y-2 text-xs text-neutral-300">
            {screenBuckets.map((sb, idx) => (
              <div key={idx} className="flex justify-between border-b border-neutral-950 pb-1.5">
                <span>{sb.screenSizeBucket || 'Desktop'}</span>
                <span className="text-white font-bold">{sb._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Row 2: Browsers, OS, Languages, Timezones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Browsers */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Browser</h4>
          <div className="space-y-1.5 text-xs text-neutral-300">
            {browsers.map((b, i) => (
              <div key={i} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[100px]">{b.browser || 'Unknown'}</span>
                <span className="text-white font-bold">{b._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* OS */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Operating System</h4>
          <div className="space-y-1.5 text-xs text-neutral-300">
            {oss.map((o, i) => (
              <div key={i} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[100px]">{o.operatingSystem || 'Unknown'}</span>
                <span className="text-white font-bold">{o._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Languages */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Languages</h4>
          <div className="space-y-1.5 text-xs text-neutral-300">
            {languages.map((l, i) => (
              <div key={i} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[100px]">{l.language || 'en'}</span>
                <span className="text-white font-bold">{l._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Timezones */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-2">
          <h4 className="text-[9px] uppercase text-neutral-500 tracking-wider">Timezones</h4>
          <div className="space-y-1.5 text-xs text-neutral-300">
            {timezones.map((tz, i) => (
              <div key={i} className="flex justify-between border-b border-neutral-950 pb-1">
                <span className="truncate max-w-[100px]">{tz.timezone?.split('/').pop() || 'UTC'}</span>
                <span className="text-white font-bold">{tz._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Row 3: Channels, Sources, Landing Pages, Export Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Source distribution */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Export Source Distribution</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Source Application</th>
                  <th className="px-4 py-2 text-right">PDFs Printed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {exportSources.map((es, i) => (
                  <tr key={i} className="hover:bg-neutral-950/10">
                    <td className="px-4 py-2 text-white font-medium">{es.exportSource || 'ChatGPT'}</td>
                    <td className="px-4 py-2 text-right font-bold text-white">{es._count.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Landing pages */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Top Landing Routes</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Landing URL Path</th>
                  <th className="px-4 py-2 text-right">Visits Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {landingPages.map((lp, i) => (
                  <tr key={i} className="hover:bg-neutral-950/10">
                    <td className="px-4 py-2 text-white font-medium">{lp.landingPath || '/'}</td>
                    <td className="px-4 py-2 text-right font-bold text-white">{lp._count.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Geography: Countries & Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Countries */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Top Countries Demand</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Country Name</th>
                  <th className="px-4 py-2 text-right">Exports Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {countries.map((c, i) => (
                  <tr key={i} className="hover:bg-neutral-950/10">
                    <td className="px-4 py-2 text-white font-medium">{c.country || 'Unknown'}</td>
                    <td className="px-4 py-2 text-right font-bold text-white">{c._count.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cities */}
        <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
          <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Top Cities Demand</h4>
          <div className="border border-neutral-900 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">City Location</th>
                  <th className="px-4 py-2 text-right">Exports Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-neutral-400">
                {cities.map((ct, i) => (
                  <tr key={i} className="hover:bg-neutral-950/10">
                    <td className="px-4 py-2 text-white font-medium">{ct.city || 'Unknown'}</td>
                    <td className="px-4 py-2 text-right font-bold text-white">{ct._count.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Hour x Day Usage Heatmap Grid */}
      <Card className="bg-black border border-neutral-900 rounded p-4 space-y-4">
        <h4 className="text-[10px] uppercase text-neutral-500 tracking-wider">Export Time Heatmap (Hour × Day)</h4>
        <div className="border border-neutral-900 rounded overflow-hidden text-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                <th className="px-4 py-2.5">Day of Week</th>
                {hourBlocks.map((b) => (
                  <th key={b.name} className="px-4 py-2.5 text-right">{b.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-neutral-400">
              {heatmapMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-950/20 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{row.name}</td>
                  {hourBlocks.map((b) => {
                    const val = (row as any)[b.name] || 0;
                    return (
                      <td key={b.name} className={`px-4 py-3 text-right ${val > 0 ? 'text-white font-bold' : 'text-neutral-600'}`}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
