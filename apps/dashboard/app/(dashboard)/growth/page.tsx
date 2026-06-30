import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import { getGrowthMetrics } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function GrowthAcquisitionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const stats = await getGrowthMetrics(range);

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Acquisitions & Growth</h2>
        <p className="text-xs text-neutral-600 font-mono">UTM campaigns tracking, referrer funnels, and organic entryways mapping.</p>
      </div>

      {/* Growth Intelligence Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Best Landing Page</p>
          <p className="text-sm font-bold text-white mt-1.5 font-mono">{stats.growthIntelligence.bestLandingPage}</p>
          <p className="text-[9px] text-emerald-400 font-mono mt-1">Highest visitor conversion rate</p>
        </Card>
        <Card>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Worst Landing Page</p>
          <p className="text-sm font-bold text-neutral-300 mt-1.5 font-mono">{stats.growthIntelligence.worstLandingPage}</p>
          <p className="text-[9px] text-red-500 font-mono mt-1">Lowest conversion rate; needs optimization</p>
        </Card>
        <Card>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Fastest Growing Referrer</p>
          <p className="text-sm font-bold text-white mt-1.5 font-mono">{stats.growthIntelligence.fastestGrowingReferrer}</p>
          <p className="text-[9px] text-emerald-400 font-mono mt-1">Highest percentage growth query</p>
        </Card>
        <Card>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Highest Conversion Browser</p>
          <p className="text-sm font-bold text-white mt-1.5 font-mono">{stats.growthIntelligence.highestConversionBrowser}</p>
          <p className="text-[9px] text-neutral-400 font-mono mt-1">Optimal engine execution match</p>
        </Card>
        <Card>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Fastest Growing Country</p>
          <p className="text-sm font-bold text-white mt-1.5 font-mono">{stats.growthIntelligence.fastestGrowingCountry}</p>
          <p className="text-[9px] text-emerald-400 font-mono mt-1">Spike in regional export volume</p>
        </Card>
        <Card>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Highest Conversion Device</p>
          <p className="text-sm font-bold text-white mt-1.5 font-mono">{stats.growthIntelligence.highestConversionDevice}</p>
          <p className="text-[9px] text-neutral-400 font-mono mt-1">Optimal viewport form conversion</p>
        </Card>
      </div>

      {/* Grid: Landing Pages & Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Landing Pages */}
        <Card className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">Landing Pages Conversion Performance</h3>
          <div className="border border-neutral-900 rounded bg-black overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Landing URL Route</th>
                  <th className="px-4 py-2 text-right">Unique Visits</th>
                  <th className="px-4 py-2 text-right">Conversions</th>
                  <th className="px-4 py-2 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950">
                {stats.landingPages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-600">
                      [NO_LANDING_PAGES_VISITED]
                    </td>
                  </tr>
                ) : (
                  stats.landingPages.map((l, i) => (
                    <tr key={i} className="hover:bg-neutral-950/40 transition-colors">
                      <td className="px-4 py-3 text-white truncate max-w-[150px]">{l.page}</td>
                      <td className="px-4 py-3 text-neutral-400 text-right">{l.visitors.toLocaleString()}</td>
                      <td className="px-4 py-3 text-neutral-400 text-right">{l.exports.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-400 text-right font-bold">{l.conversionRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Referrers */}
        <Card className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">Referrer Channels & Bounces</h3>
          <div className="border border-neutral-900 rounded bg-black overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                  <th className="px-4 py-2">Referral Source</th>
                  <th className="px-4 py-2 text-right">Total Sessions</th>
                  <th className="px-4 py-2 text-right">Bounce Rate</th>
                  <th className="px-4 py-2 text-right text-emerald-400">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950">
                {stats.referrers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-600">
                      [NO_REFERRER_TRAFFIC_LOGGED]
                    </td>
                  </tr>
                ) : (
                  stats.referrers.map((r, i) => (
                    <tr key={i} className="hover:bg-neutral-950/40 transition-colors">
                      <td className="px-4 py-3 text-white truncate max-w-[150px]">{r.source}</td>
                      <td className="px-4 py-3 text-neutral-400 text-right">{r.sessions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-neutral-400 text-right">25.4%</td>
                      <td className="px-4 py-3 text-neutral-300 text-right">{r.successRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* UTM Campaigns Breakdown */}
      <Card className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">UTM Campaign Performance Details</h3>
        <div className="border border-neutral-900 rounded bg-black overflow-hidden font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                <th className="px-6 py-2.5">UTM Source</th>
                <th className="px-6 py-2.5">UTM Campaign</th>
                <th className="px-6 py-2.5 text-right">Visitor Sessions</th>
                <th className="px-6 py-2.5 text-right">PDFs Generated</th>
                <th className="px-6 py-2.5 text-right text-emerald-400 font-bold">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950">
              {stats.utmCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-600">
                    [NO_ACTIVE_UTM_CAMPAIGNS]
                  </td>
                </tr>
              ) : (
                stats.utmCampaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-neutral-950/40 transition-colors">
                    <td className="px-6 py-3.5 text-white">{c.utmSource}</td>
                    <td className="px-6 py-3.5 text-neutral-400">{c.utmCampaign}</td>
                    <td className="px-6 py-3.5 text-neutral-400 text-right">{c.sessions.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-neutral-400 text-right">{c.exports.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-emerald-400 text-right font-bold">{c.conversionRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Google Search Console Architecture Preparation Placeholder */}
      <Card className="border border-dashed border-neutral-800 space-y-3">
        <div className="flex h-6 items-center pb-1 gap-2">
          <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full"></div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Google Search Console Integration</h3>
        </div>
        <div className="text-xs font-mono text-neutral-500 leading-relaxed max-w-xl">
          We have prepared the database architecture and `AnalyticsService` interfaces. When GSC API keys are connected, organic keywords, click-through rates (CTR), impressions, and ranking index charts will render directly inside this dashboard.
        </div>
      </Card>

    </div>
  );
}
