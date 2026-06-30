import React from 'react';
import Card from '../../../components/Card';
import { getFounderInsights } from '@repo/analytics';

export const revalidate = 0;

export default async function FounderInsightsPage() {
  const insights = await getFounderInsights();

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Founder Intelligence Insights</h2>
        <p className="text-xs text-neutral-600 font-mono">Dynamically compiled observations and conversion regressions.</p>
      </div>

      {/* Insights Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((ins) => (
          <Card key={ins.id} className="space-y-3 font-mono">
            <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                ins.type === 'success' ? 'bg-emerald-400' :
                ins.type === 'warning' ? 'bg-red-500 animate-pulse' :
                'bg-blue-400'
              }`}></div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{ins.title}</span>
            </div>
            
            <p className="text-sm text-neutral-200 leading-relaxed font-mono">
              {ins.description}
            </p>

            <div className="text-[9px] text-neutral-500 uppercase tracking-wider font-mono">
              Metric Status: {ins.type.toUpperCase()}
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
