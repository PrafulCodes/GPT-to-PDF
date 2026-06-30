import React from 'react';
import { db } from '@repo/db';
import Card from '../../../components/Card';
import { checkDbStatus, ExportLogEvent } from '../../../lib/db-queries';


export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    device?: string;
    browser?: string;
    date?: string;
  }>;
}

export default async function ExportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const status = params.status || 'all';
  const device = params.device || 'all';
  const browser = params.browser || 'all';
  const dateRange = params.date || 'all';

  const csvUrlParams = new URLSearchParams();
  if (search) csvUrlParams.set('search', search);
  if (status !== 'all') csvUrlParams.set('status', status);
  if (device !== 'all') csvUrlParams.set('device', device);
  if (browser !== 'all') csvUrlParams.set('browser', browser);
  if (dateRange !== 'all') csvUrlParams.set('date', dateRange);
  const csvExportUrl = `/api/export-csv?${csvUrlParams.toString()}`;


  // Check DB status
  const dbStatus = await checkDbStatus();

  let logs: ExportLogEvent[] = [];

  let totalCount = 0;

  if (dbStatus === 'CONNECTED') {
    try {
      // Build Prisma filter clauses dynamically
      const where: any = {};

      if (status === 'success') where.success = true;
      if (status === 'failed') where.success = false;

      if (device !== 'all') {
        where.deviceType = { equals: device, mode: 'insensitive' };
      }

      if (browser !== 'all') {
        // Handle casing compatibility
        where.browser = { equals: browser, mode: 'insensitive' };
      }

      if (search) {
        where.OR = [
          { id: { contains: search, mode: 'insensitive' } },
          { referrer: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { failureReason: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (dateRange !== 'all') {
        const now = new Date();
        if (dateRange === 'today') {
          const startOfToday = new Date(now);
          startOfToday.setUTCHours(0, 0, 0, 0);
          where.timestamp = { gte: startOfToday };
        } else if (dateRange === '7d') {
          const startOf7d = new Date(now);
          startOf7d.setUTCDate(now.getUTCDate() - 7);
          startOf7d.setUTCHours(0, 0, 0, 0);
          where.timestamp = { gte: startOf7d };
        } else if (dateRange === '30d') {
          const startOf30d = new Date(now);
          startOf30d.setUTCDate(now.getUTCDate() - 30);
          startOf30d.setUTCHours(0, 0, 0, 0);
          where.timestamp = { gte: startOf30d };
        }
      }

      // Execute query with a limit of 100 recent rows
      [logs, totalCount] = await Promise.all([
        db.exportEvent.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: 100
        }),
        db.exportEvent.count({ where })
      ]);
    } catch (error) {
      console.error('[Dashboard Logs Page] Query execution failed:', error);
    }
  }

  // Predefined browser / device options for filter dropdowns
  const browserOptions = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 'Unknown'];
  const deviceOptions = ['Desktop', 'Mobile', 'Tablet', 'Bot', 'Unknown'];

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Exports Ledger</h2>
        <p className="text-xs text-neutral-600 font-mono">Query logs and examine transaction payloads.</p>
      </div>

      {/* FILTER BAR FORM */}
      <Card>
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2 md:col-span-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Filter Search</span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="ID, location, referrer..."
              className="bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-500"
            />
          </div>

          {/* Status select */}
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Status</span>
            <select
              name="status"
              defaultValue={status}
              className="bg-black border border-neutral-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All States</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Device select */}
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Device</span>
            <select
              name="device"
              defaultValue={device}
              className="bg-black border border-neutral-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Devices</option>
              {deviceOptions.map(d => (
                <option key={d} value={d.toLowerCase()}>{d}</option>
              ))}
            </select>
          </div>

          {/* Browser select */}
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Browser</span>
            <select
              name="browser"
              defaultValue={browser}
              className="bg-black border border-neutral-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Browsers</option>
              {browserOptions.map(b => (
                <option key={b} value={b.toLowerCase()}>{b}</option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Date Range</span>
            <select
              name="date"
              defaultValue={dateRange}
              className="bg-black border border-neutral-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 items-end justify-end col-span-1 sm:col-span-2 md:col-span-5 mt-2">
            <a
              href="/exports"
              className="px-3 py-1.5 text-[10px] font-mono uppercase border border-neutral-900 text-neutral-500 hover:text-white rounded hover:bg-neutral-950 transition-colors"
            >
              Reset
            </a>
            {dbStatus === 'CONNECTED' && logs.length > 0 && (
              <a
                href={csvExportUrl}
                className="px-3 py-1.5 text-[10px] font-mono uppercase border border-neutral-850 text-neutral-300 hover:text-white rounded hover:bg-neutral-900 transition-colors"
              >
                Export CSV
              </a>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 text-[10px] font-mono uppercase bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </form>

      </Card>

      {/* SEARCH RESULTS TABLE */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
          <span>QUERY_COUNT: {totalCount} records matched</span>
          <span className="uppercase text-[9px]">Limited to recent 100 hits</span>
        </div>

        <div className="border border-neutral-900 rounded bg-black overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-neutral-600">
              [NO_LOGGED_EXPORTS_MATCHED]
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  <th className="px-6 py-3">UUID</th>
                  <th className="px-6 py-3">Timestamp (UTC)</th>
                  <th className="px-6 py-3">Browser / OS / Device</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">PDF Size</th>
                  <th className="px-6 py-3">Referrer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 font-mono text-xs">
                {logs.map((log) => (

                  <tr key={log.id} className="hover:bg-neutral-950/40 transition-colors text-neutral-300">
                    <td className="px-6 py-3.5 text-white select-all">{log.id}</td>
                    <td className="px-6 py-3.5 text-neutral-400">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-400">
                      {log.browser} / {log.operatingSystem} ({log.deviceType})
                    </td>
                    <td className="px-6 py-3.5 text-neutral-300">
                      {log.city}, {log.country}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-400">{log.generationDuration.toFixed(2)}s</td>
                    <td className="px-6 py-3.5 text-neutral-400">
                      {log.pdfSize ? `${(log.pdfSize / 1024).toFixed(1)} KB` : '-'}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-300 truncate max-w-[120px]" title={log.referrer}>
                      {log.referrer}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          log.success
                            ? 'border-neutral-800 text-neutral-300 bg-neutral-900/30'
                            : 'border-neutral-800 text-neutral-500 bg-neutral-950'
                        }`}
                      >
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-neutral-500 text-[10px]">
                      {log.failureReason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
