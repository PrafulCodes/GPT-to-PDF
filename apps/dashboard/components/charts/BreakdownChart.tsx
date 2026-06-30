import React from 'react';

interface BreakdownItem {
  name: string;
  count: number;
}

interface BreakdownChartProps {
  data: BreakdownItem[];
  title?: string;
}

export function BreakdownChart({ data, title }: BreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="border border-neutral-900 rounded p-6 text-center font-mono text-xs text-neutral-600 bg-black">
        [NO_DATA_AVAILABLE]
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-4 select-none">
      {title && (
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
          {title}
        </h4>
      )}

      <div className="space-y-3">
        {data.map((item) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const barWidthPercent = (item.count / maxCount) * 100;

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-300 truncate pr-2" title={item.name}>{item.name}</span>
                <span className="text-neutral-500 shrink-0">
                  {item.count} <span className="text-neutral-700">({percentage.toFixed(1)}%)</span>
                </span>
              </div>
              
              <div className="h-2 bg-neutral-950 border border-neutral-900 rounded-sm overflow-hidden">
                <div
                  style={{ width: `${barWidthPercent}%` }}
                  className="h-full bg-white transition-all duration-300"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BreakdownChart;
