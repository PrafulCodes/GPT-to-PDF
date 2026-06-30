import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import { getSeoPerformance } from '@repo/analytics';

export const revalidate = 0;

// Landing page routes map
const landingPages = [
  { route: '/', description: 'Root Converter Homepage', visitors: 14500, conversionPlaceholder: '24.1%' },
  { route: '/chatgpt-conversation-archive', description: 'ChatGPT Conversation Archive Guide', visitors: 2840, conversionPlaceholder: '12.4%' },
  { route: '/how-to-save-chatgpt-conversations', description: 'How to Save Conversations Article', visitors: 1980, conversionPlaceholder: '14.2%' },
  { route: '/print-chatgpt-conversation', description: 'Print ChatGPT Conversation Guide', visitors: 1250, conversionPlaceholder: '18.9%' },
  { route: '/why-chatgpt-export-is-hard', description: 'Technical Analysis Article', visitors: 420, conversionPlaceholder: '8.4%' },
];

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function SeoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const seoReferrers = await getSeoPerformance(range);

  return (
    <div className="space-y-6 md:space-y-8 select-none font-mono">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">SEO Health Monitor</h2>
        <p className="text-xs text-neutral-600 font-mono">Organic traffic key performance metrics, sitemap conversions, and rankings.</p>
      </div>

      {/* Grid: Referrers Performance and Future Search Console placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Referral conversions */}
        <Card className="lg:col-span-2 space-y-4 bg-black border border-neutral-900 rounded p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Search Engine Referral Conversions ({range.toUpperCase()})
          </h3>
          <div className="border border-neutral-900 rounded overflow-x-auto">
            {seoReferrers.length === 0 ? (
              <div className="p-8 text-center text-neutral-600 text-xs">
                [NO_TRAFFIC_CONVERSIONS_LOGGED]
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                    <th className="px-4 py-2.5">Traffic Source</th>
                    <th className="px-4 py-2.5">Total Conversions</th>
                    <th className="px-4 py-2.5 text-right">Avg Server Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-950 text-neutral-400">
                  {seoReferrers.map((ref) => (
                    <tr key={ref.referrer} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{ref.referrer}</td>
                      <td className="px-4 py-3">{ref.exports.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{ref.avgLatency}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Future Search Console connection placeholder */}
        <Card className="space-y-3 bg-black border border-neutral-900 rounded p-4">
          <div className="flex h-6 items-center border-b border-neutral-950 pb-1 gap-2">
            <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Google Search Console</h3>
          </div>
          <div className="space-y-4 text-xs text-neutral-500 pt-2 leading-relaxed">
            <p>
              Integration with the **Google Search Console API** is scheduled.
            </p>
            <p>
              This console will query:
              <br />• Search impressions volume.
              <br />• Organic CTR percent.
              <br />• Average keyword position index.
            </p>
            <div className="border border-dashed border-neutral-800 p-3 rounded text-[10px] text-center uppercase tracking-widest bg-neutral-950/10">
              PENDING_API_CONNECTION
            </div>
          </div>
        </Card>
      </div>

      {/* Landing page performance summary table */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-400">Conversion by Landing Page</h3>
        <div className="border border-neutral-900 rounded bg-black overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
                <th className="px-4 py-2.5">Landing URL Route</th>
                <th className="px-4 py-2.5">Focus Keyword Segment</th>
                <th className="px-4 py-2.5">Simulated Monthly Sessions</th>
                <th className="px-4 py-2.5 text-right">Conversion Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-neutral-400">
              {landingPages.map((page) => (
                <tr key={page.route} className="hover:bg-neutral-950/20 transition-colors">
                  <td className="px-4 py-3.5 text-white select-all">{page.route}</td>
                  <td className="px-4 py-3.5 text-neutral-500">{page.description}</td>
                  <td className="px-4 py-3.5">{page.visitors.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-neutral-500 font-bold">{page.conversionPlaceholder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
