'use client';

import React, { useState, useRef } from 'react';

interface BarDataPoint {
  label: string;
  successes: number;
  failures: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  label?: string;
}

export function BarChart({ data, height = 200, label }: BarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center border border-neutral-900 rounded font-mono text-xs text-neutral-600 bg-black">
        [NO_DATA_AVAILABLE]
      </div>
    );
  }

  const totals = data.map(d => d.successes + d.failures);
  const maxVal = Math.max(...totals, 5); // Minimum y-scale height
  const minVal = 0;

  const viewBoxWidth = 600;
  const paddingX = 40;
  const paddingY = 20;
  const chartHeight = height - paddingY * 2;
  const chartWidth = viewBoxWidth - paddingX * 2;

  const barCount = data.length;
  // Calculate width of each bar and spacing
  const gapRatio = 0.3; // 30% gap
  const totalBarSpace = chartWidth / barCount;
  const barWidth = totalBarSpace * (1 - gapRatio);

  const bars = data.map((dp, idx) => {
    const x = paddingX + idx * totalBarSpace + (totalBarSpace * gapRatio) / 2;
    const total = dp.successes + dp.failures;
    
    const successHeight = maxVal > 0 ? (dp.successes / maxVal) * chartHeight : 0;
    const failureHeight = maxVal > 0 ? (dp.failures / maxVal) * chartHeight : 0;

    const ySuccess = height - paddingY - successHeight;
    const yFailure = ySuccess - failureHeight;

    return {
      x,
      ySuccess,
      successHeight,
      yFailure,
      failureHeight,
      total,
      dp,
    };
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseXInSvg = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;

    // Find closest index
    let closestIndex = 0;
    let closestDist = Infinity;
    bars.forEach((b, idx) => {
      const barCenterX = b.x + barWidth / 2;
      const dist = Math.abs(barCenterX - mouseXInSvg);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const activeBar = activeIndex !== null ? bars[activeIndex] : null;

  return (
    <div className="space-y-2 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-500 uppercase tracking-wider">{label || 'Success vs Failure'}</span>
        {activeBar ? (
          <span className="text-white">
            <span className="text-neutral-500">{activeBar.dp.label}:</span>{' '}
            <span className="text-neutral-300">S: {activeBar.dp.successes}</span>{' '}
            <span className="text-neutral-500">|</span>{' '}
            <span className="text-neutral-500">F: {activeBar.dp.failures}</span>
          </span>
        ) : (
          <span className="text-neutral-400">Hover bars for details</span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative border border-neutral-900 rounded bg-black overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={viewBoxWidth - paddingX} y2={paddingY} className="stroke-neutral-900" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={viewBoxWidth - paddingX} y2={height / 2} className="stroke-neutral-900" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={viewBoxWidth - paddingX} y2={height - paddingY} className="stroke-neutral-900" strokeWidth={1} />

          {/* X axis ticks */}
          <text x={paddingX} y={height - 5} className="fill-neutral-600 font-mono text-[9px]" textAnchor="start">
            {data[0]?.label}
          </text>
          <text x={viewBoxWidth - paddingX} y={height - 5} className="fill-neutral-600 font-mono text-[9px]" textAnchor="end">
            {data[data.length - 1]?.label}
          </text>

          {/* Y axis ticks */}
          <text x={paddingX - 10} y={paddingY + 3} className="fill-neutral-600 font-mono text-[9px]" textAnchor="end">
            {maxVal}
          </text>
          <text x={paddingX - 10} y={height - paddingY + 3} className="fill-neutral-600 font-mono text-[9px]" textAnchor="end">
            {minVal}
          </text>

          {/* Render Bars */}
          {bars.map((bar, idx) => {
            const isActive = activeIndex === idx;
            return (
              <g key={idx}>
                {/* Success Portion (White or Light Gray) */}
                {bar.successHeight > 0 && (
                  <rect
                    x={bar.x}
                    y={bar.ySuccess}
                    width={barWidth}
                    height={bar.successHeight}
                    className={`${isActive ? 'fill-white' : 'fill-neutral-400'} transition-colors`}
                  />
                )}
                {/* Failure Portion (Dark Gray) */}
                {bar.failureHeight > 0 && (
                  <rect
                    x={bar.x}
                    y={bar.yFailure}
                    width={barWidth}
                    height={bar.failureHeight}
                    className={`${isActive ? 'fill-neutral-600' : 'fill-neutral-800'} transition-colors`}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default BarChart;
