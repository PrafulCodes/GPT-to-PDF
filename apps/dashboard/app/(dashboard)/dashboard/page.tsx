import React from 'react';
import Card from '../../../components/Card';
import { getKPIMetrics, getExportsOverTime, getRecentEvents } from '../../../lib/db-queries';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';

export const revalidate = 0; // force dynamic rendering

export default async function OverviewPage() {
  // Query all database metrics on the server
  const [kpis, timeSeriesData, recentLogs] = await Promise.all([
    getKPIMetrics(),
    getExportsOverTime(14), // Last 14 days is perfect for readability
    getRecentEvents(10) // Show last 10 logs
  ]);

  // Convert time series data to LineChart expected format
  const lineChartData = timeSeriesData.map(d => ({
    label: d.label,
    value: d.exports
  }));

  // Convert time series data to BarChart expected format
  const barChartData = timeSeriesData.map(d => ({
    label: d.label,
    successes: d.successes,
    failures: d.failures
  }));

  const metrics = [
    { name: 'Total Exports', value: kpis.totalExports.toLocaleString(), detail: 'Lifetime conversions', isMonospace: true },
    { name: 'Today\'s Exports', value: kpis.todayExports.toLocaleString(), detail: 'Last 24 hours (UTC)', isMonospace: true },
    { name: 'Average Latency', value: `${kpis.avgDuration}s`, detail: 'p95 successful render time', isMonospace: true },
    { name: 'Success Rate', value: `${kpis.successRate}%`, detail: `${kpis.successes} successes / ${kpis.failures} failures`, isMonospace: true },
  ];

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Header Block */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">System Overview</h2>
          <p className="text-xs text-neutral-600 font-mono">Real-time statistics pipeline console.</p>
        </div>
        
        {/* DB Connection Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-black border border-neutral-900 rounded font-mono text-[10px]">
          <div className={`w-1.5 h-1.5 rounded-full ${kpis.dbStatus === 'CONNECTED' ? 'bg-white animate-pulse' : 'bg-neutral-600'}`}></div>
          <span className="text-neutral-500 uppercase">Database:</span>
          <span className="text-white font-medium">{kpis.dbStatus}</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-medium">{metric.name}</p>
            <p className={`text-xl font-bold tracking-tight text-white mt-1.5 ${metric.isMonospace ? 'font-mono' : ''}`}>
              {metric.value}
            </p>
            <p className="text-[9px] text-neutral-400 font-mono mt-1">{metric.detail}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <LineChart data={lineChartData} height={180} label="Conversions Volume (14 Days)" />
        </Card>
        <Card>
          <BarChart data={barChartData} height={180} label="Success Rate Breakdown (14 Days)" />
        </Card>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Terminal Log Output</h3>
          <span className="text-[9px] text-neutral-500 font-mono">Live events</span>
        </div>
        
        <div className="border border-neutral-900 rounded bg-black overflow-x-auto">
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-neutral-600">
              [NO_CONVERSION_EVENTS_LOGGED]
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  <th className="px-6 py-2.5">Log ID</th>
                  <th className="px-6 py-2.5">Time (UTC)</th>
                  <th className="px-6 py-2.5">Referrer</th>
                  <th className="px-6 py-2.5">Browser/OS</th>
                  <th className="px-6 py-2.5">Latency</th>
                  <th className="px-6 py-2.5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-950/40 transition-colors text-xs">
                    <td className="px-6 py-3.5 font-mono text-white select-all">{log.id.substring(0, 8)}</td>
                    <td className="px-6 py-3.5 font-mono text-neutral-400">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-300 font-mono truncate max-w-[120px]">{log.referrer}</td>
                    <td className="px-6 py-3.5 text-neutral-400 font-mono truncate">
                      {log.browser} / {log.operatingSystem} ({log.deviceType})
                    </td>
                    <td className="px-6 py-3.5 font-mono text-neutral-400">{log.generationDuration.toFixed(2)}s</td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded border ${
                          log.success
                            ? 'border-neutral-800 text-neutral-300 bg-neutral-900/30'
                            : 'border-neutral-800 text-neutral-500 bg-neutral-950'
                        }`}
                      >
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Diagnostics Info Block */}
      <Card title="Node Diagnostics" subtitle="SYS_DIAG_OK">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-neutral-400 mt-4">
          <div className="space-y-1">
            <span className="text-neutral-600 block text-[9px] uppercase tracking-wider">Database Node</span>
            <span className="text-neutral-300">Neon PostgreSQL (Active)</span>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-600 block text-[9px] uppercase tracking-wider">Edge Middleware</span>
            <span className="text-neutral-300">Vercel Edge v2.0.4</span>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-600 block text-[9px] uppercase tracking-wider">Node Engine</span>
            <span className="text-neutral-300">NodeJS v22.17.0</span>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-600 block text-[9px] uppercase tracking-wider">Monorepo Workspace</span>
            <span className="text-neutral-300">@repo/dashboard</span>
          </div>
        </div>
      </Card>

    </div>
  );
}
