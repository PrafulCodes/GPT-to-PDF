import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import BreakdownChart from '../../../components/charts/BreakdownChart';
import { getProductMetrics } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function ProductAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const range = params.range || cookieStore.get('analytics_range')?.value || '7d';

  const stats = await getProductMetrics(range);

  const kpis = [
    { name: 'Average PDF Size', value: `${stats.avgPdfSize} KB`, detail: 'Mean file weight of success exports' },
    { name: 'Maximum PDF Size', value: `${stats.maxPdfSize} KB`, detail: 'Largest successful document printed' },
    { name: 'Avg Message Count', value: stats.avgMessages.toString(), detail: 'Average message nodes processed' },
    { name: 'Avg Images Count', value: stats.avgImages.toString(), detail: 'Average image links formats' },
    { name: 'Avg Tables Count', value: stats.avgTables.toString(), detail: 'Average tables elements layouted' },
    { name: 'Avg Code Blocks', value: stats.avgCodeBlocks.toString(), detail: 'Average developer code block snippets' },
  ];

  // User Journey Funnel Simulation Metrics based on conversion rates
  const funnelSteps = [
    { step: '1. Landing Page Session', count: '100.0%', description: 'Visitor loads landing page converter' },
    { step: '2. Link Input pasted', count: '74.2%', description: 'Visitor paste ChatGPT share url link' },
    { step: '3. Generation Triggered', count: '65.8%', description: 'User clicks generate conversation PDF' },
    { step: '4. Node Parsing Complete', count: '62.4%', description: 'Serverless parser scrapes chat HTML' },
    { step: '5. PDF Rendered', count: '58.1%', description: 'Browser layout engine formats document' },
    { step: '6. Document Downloaded', count: '57.8%', description: 'PDF binary delivered to user' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Product Analytics</h2>
        <p className="text-xs text-neutral-600 font-mono">Chat structural ratios, document metadata, and funnel conversion stages.</p>
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

      {/* User Journey Funnel */}
      <Card className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">User Journey Funnel Conversion</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="border border-neutral-900 bg-neutral-950/20 p-4 rounded font-mono space-y-2 relative">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest">{step.step}</div>
              <div className="text-lg font-bold text-white">{step.count}</div>
              <div className="text-[9px] text-neutral-400 leading-normal">{step.description}</div>
              {idx < 5 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-neutral-700 text-xs font-bold font-mono">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Failures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <BreakdownChart
            data={stats.failureStages}
            title="Export Failures by Pipeline Stage"
          />
        </Card>

        <Card>
          <BreakdownChart
            data={stats.failureReasons}
            title="Export Failures by Error Category"
          />
        </Card>
      </div>

    </div>
  );
}
