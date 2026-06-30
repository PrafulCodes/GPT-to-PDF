import React from 'react';
import Card from '../../../components/Card';
import { getDecisionCenter } from '@repo/analytics';

export const revalidate = 0;

export default async function DecisionCenterPage() {
  const decisions = await getDecisionCenter();

  const points = [
    decisions.biggestWin,
    decisions.biggestProblem,
    decisions.fastestReferrer,
    decisions.worstLandingPage,
    decisions.deployImpact
  ];

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Founder Decision Center</h2>
        <p className="text-xs text-neutral-600 font-mono">Actionable telemetry insights and core recommendations.</p>
      </div>

      {/* Suggested Next Action Hero Card */}
      <div className="border border-white bg-black p-6 rounded space-y-3 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white animate-pulse rounded-full"></div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Suggested Next Action</span>
        </div>
        <p className="text-lg text-white font-medium leading-relaxed">
          "{decisions.suggestedAction}"
        </p>
        <p className="text-[10px] text-neutral-500">Derived automatically from real-time Safari Mobile error logs and deploy tag comparisons.</p>
      </div>

      {/* Grid of decision points */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {points.map((pt, idx) => (
          <Card key={idx} className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">{pt.title}</span>
              <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-mono font-bold ${
                pt.status === 'critical' ? 'bg-red-950/20 text-red-500 border border-red-900' :
                pt.status === 'optimal' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900' :
                'bg-neutral-900 text-neutral-400 border border-neutral-850'
              }`}>
                {pt.status}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-white font-mono font-bold text-sm tracking-tight">{pt.metric}</p>
              <p className="text-[10px] text-neutral-400 font-mono leading-relaxed mt-2">{pt.action}</p>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
