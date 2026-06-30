'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  label?: string;
}

export function LineChart({ data, height = 200, label }: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center border border-neutral-900 rounded font-mono text-xs text-neutral-600 bg-black">
        [NO_DATA_AVAILABLE]
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 5); // ensure at least 5 for scale
  const minVal = 0;
  const range = maxVal - minVal;

  const viewBoxWidth = 600;
  const paddingX = 40;
  const paddingY = 20;
  const chartHeight = height - paddingY * 2;
  const chartWidth = viewBoxWidth - paddingX * 2;

  // Map coordinates
  const points = data.map((dp, idx) => {
    const x = paddingX + (idx / (data.length - 1 || 1)) * chartWidth;
    const normValue = range > 0 ? (dp.value - minVal) / range : 0.5;
    const y = height - paddingY - normValue * chartHeight;
    return { x, y, dp };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Calculate mouse interactions
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseXInSvg = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;

    // Find closest index
    let closestIndex = 0;
    let closestDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - mouseXInSvg);
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

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="space-y-2 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-500 uppercase tracking-wider">{label || 'Activity'}</span>
        {activePoint ? (
          <span className="text-white">
            <span className="text-neutral-500">{activePoint.dp.label}:</span> {activePoint.dp.value}
          </span>
        ) : (
          <span className="text-neutral-400">Hover graph for details</span>
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
          <text x={paddingX} y={height - 5} className="fill-neutral-600 font-mono text-[9px] text-left" textAnchor="start">
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

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            className="stroke-white"
            strokeWidth={1.5}
          />

          {/* Active Highlight Line and Circle */}
          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={height - paddingY}
                className="stroke-neutral-800"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={4}
                className="fill-black stroke-white"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

export default LineChart;
