import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import { getExportExplorer } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    device?: string;
    browser?: string;
    country?: string;
    date?: string;
    page?: string;
    cursorId?: string;
  }>;
}

export default async function ExportExplorerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();

  const search = params.search || '';
  const status = params.status || 'all';
  const device = params.device || 'all';
  const browser = params.browser || 'all';
  const country = params.country || 'all';
  const dateRange = params.date || cookieStore.get('analytics_range')?.value || '7d';
  const currentPageNum = Number(params.page || '1');
  const cursorId = params.cursorId || undefined;

  const limit = 50;
  const offset = (currentPageNum - 1) * limit;

  // Fetch exports logs using the explorer service helper
  const { logs, totalCount } = await getExportExplorer({
    search,
    status,
    device,
    browser,
    country,
    dateRange,
    limit,
    offset,
    cursorId
  });

  const totalPages = Math.ceil(totalCount / limit);

  // Compile export download CSV query parameters
  const csvParams = new URLSearchParams({
    search,
    status,
    device,
    browser,
    country,
    date: dateRange
  }).toString();

  // Next cursor computation
  const nextCursor = logs.length > 0 ? logs[logs.length - 1].id : '';

  return (
    <div className="space-y-6 md:space-y-8 select-none font-mono">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Export Explorer</h2>
          <p className="text-xs text-neutral-600 font-mono">Filter, paginate, and audit PDF exports ledger.</p>
        </div>
        <div>
          <a
            href={`/api/export-csv?${csvParams}`}
            className="inline-flex h-8 items-center border border-white px-3 bg-black hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-widest transition-colors rounded"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="p-4 bg-neutral-950/20">
        <form method="GET" action="/exports" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search bar */}
          <div className="md:col-span-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Search Keywords</label>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Referrer, ID, country..."
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          {/* Status filter */}
          <div>
            <label className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Success Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Device filter */}
          <div>
            <label className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Device Segment</label>
            <select
              name="device"
              defaultValue={device}
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="all">All Devices</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
              <option value="Bot">Bot</option>
            </select>
          </div>

          {/* Browser filter */}
          <div>
            <label className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Browser Engine</label>
            <select
              name="browser"
              defaultValue={browser}
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="all">All Browsers</option>
              <option value="Chrome">Chrome</option>
              <option value="Safari">Safari</option>
              <option value="Firefox">Firefox</option>
              <option value="Edge">Edge</option>
            </select>
          </div>

          {/* Filter button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full h-8 bg-white text-black font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors rounded"
            >
              Apply filters
            </button>
          </div>

        </form>
      </Card>

      {/* Ledger Table */}
      <div className="border border-neutral-900 rounded bg-black overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-widest">
              <th className="px-4 py-2.5">Timestamp (UTC)</th>
              <th className="px-4 py-2.5">Visitor / Session</th>
              <th className="px-4 py-2.5">Geo</th>
              <th className="px-4 py-2.5">Platform Details</th>
              <th className="px-4 py-2.5 text-right">PDF size</th>
              <th className="px-4 py-2.5 text-right">Render Latency</th>
              <th className="px-4 py-2.5 text-right">Pages</th>
              <th className="px-4 py-2.5 text-right text-emerald-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-950 text-xs text-neutral-300">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-neutral-600">
                  [NO_EXPORT_EVENTS_LOGGED_MATCHING_FILTERS]
                </td>
              </tr>
            ) : (
              logs.map((ev) => (
                <tr key={ev.id} className="hover:bg-neutral-950/40 transition-colors font-mono">
                  <td className="px-4 py-3 text-neutral-400 select-none">
                    {new Date(ev.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="px-4 py-3 select-all truncate max-w-[150px]">
                    {ev.anonymousVisitorId?.substring(0, 10) || 'anon'}/
                    {ev.sessionId?.substring(0, 10) || 'anon'}
                  </td>
                  <td className="px-4 py-3 truncate max-w-[100px]">{ev.country}</td>
                  <td className="px-4 py-3 text-neutral-400 select-none">
                    {ev.browser} / {ev.operatingSystem} ({ev.deviceType})
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ev.pdfSize ? `${Math.round(ev.pdfSize / 1024)} KB` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">{ev.generationDuration.toFixed(2)}s</td>
                  <td className="px-4 py-3 text-right">{ev.estimatedPages || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                      ev.success ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900' : 'bg-red-950/20 text-red-500 border border-red-900'
                    }`}>
                      {ev.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-900 pt-4 text-xs font-mono">
          <div className="text-neutral-500">
            Page {currentPageNum} of {totalPages} ({totalCount} total matched logs)
          </div>
          <div className="flex items-center gap-2">
            {currentPageNum > 1 && (
              <Link
                href={`/exports?search=${search}&status=${status}&device=${device}&browser=${browser}&country=${country}&page=${currentPageNum - 1}`}
                className="inline-flex h-8 items-center border border-neutral-900 bg-black hover:bg-neutral-900 px-3 text-white transition-colors rounded"
              >
                Previous
              </Link>
            )}
            {currentPageNum < totalPages && (
              <Link
                href={`/exports?search=${search}&status=${status}&device=${device}&browser=${browser}&country=${country}&page=${currentPageNum + 1}&cursorId=${nextCursor}`}
                className="inline-flex h-8 items-center border border-neutral-900 bg-black hover:bg-neutral-900 px-3 text-white transition-colors rounded"
              >
                Next (Cursor)
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
