import React from 'react';
import { cookies } from 'next/headers';
import Card from '../../../components/Card';
import ExportExplorerBoard from '../../../components/ExportExplorerBoard';
import { getExportExplorer } from '@repo/analytics';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    device?: string;
    browser?: string;
    country?: string;
    city?: string;
    exportSource?: string;
    trafficSource?: string;
    landingPath?: string;
    referrer?: string;
    durationBucket?: string;
    sessionId?: string;
    visitorId?: string;
    dateFrom?: string;
    dateTo?: string;
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
  const city = params.city || 'all';
  const exportSource = params.exportSource || 'all';
  const trafficSource = params.trafficSource || 'all';
  const landingPath = params.landingPath || '';
  const referrer = params.referrer || '';
  const durationBucket = params.durationBucket || 'all';
  const sessionId = params.sessionId || '';
  const visitorId = params.visitorId || '';
  const dateFrom = params.dateFrom || '';
  const dateTo = params.dateTo || '';
  const dateRange = cookieStore.get('analytics_range')?.value || '7d';
  const currentPageNum = Number(params.page || '1');
  const cursorId = params.cursorId || undefined;

  const limit = 50;
  const offset = (currentPageNum - 1) * limit;

  // Retrieve matching exports ledger
  const { logs, totalCount } = await getExportExplorer({
    search,
    status,
    device,
    browser,
    country,
    city,
    exportSource,
    trafficSource,
    landingPath,
    referrer,
    durationBucket,
    sessionId,
    visitorId,
    dateFrom,
    dateTo,
    dateRange,
    limit,
    offset,
    cursorId
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6 md:space-y-8 select-none font-mono">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Export Explorer</h2>
          <p className="text-xs text-neutral-600 font-mono">Comprehensive system downloads audit ledger.</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">Selected range: {dateRange.toUpperCase()}</div>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="p-4 bg-black border border-neutral-900 rounded">
        <form method="GET" action="/exports" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          
          {/* Keyword Search */}
          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Keywords</label>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Query, ID..."
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          {/* Success Status */}
          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Status</label>
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

          {/* Device Type */}
          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Device</label>
            <select
              name="device"
              defaultValue={device}
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="all">All Devices</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>

          {/* Browser Engine */}
          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Browser</label>
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

          {/* Landing Path */}
          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Landing Path</label>
            <input
              type="text"
              name="landingPath"
              defaultValue={landingPath}
              placeholder="/chatgpt..."
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          {/* Referrer */}
          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Referrer</label>
            <input
              type="text"
              name="referrer"
              defaultValue={referrer}
              placeholder="Google..."
              className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">City</label>
            <input type="text" name="city" defaultValue={city === 'all' ? '' : city} placeholder="Mumbai..." className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono" />
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Source</label>
            <input type="text" name="exportSource" defaultValue={exportSource === 'all' ? '' : exportSource} placeholder="ChatGPT..." className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono" />
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Duration Bucket</label>
            <select name="durationBucket" defaultValue={durationBucket} className="w-full h-8 bg-black border border-neutral-900 rounded px-2 text-xs text-white focus:outline-none focus:border-white font-mono">
              <option value="all">All buckets</option>
              <option value="0–2 sec">0–2 sec</option>
              <option value="2–5 sec">2–5 sec</option>
              <option value="5–10 sec">5–10 sec</option>
              <option value="10+ sec">10+ sec</option>
            </select>
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Visitor</label>
            <input type="text" name="visitorId" defaultValue={visitorId} placeholder="anon..." className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono" />
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Session</label>
            <input type="text" name="sessionId" defaultValue={sessionId} placeholder="sess..." className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono" />
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Date From</label>
            <input type="date" name="dateFrom" defaultValue={dateFrom} className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono" />
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-1">Date To</label>
            <input type="date" name="dateTo" defaultValue={dateTo} className="w-full h-8 bg-black border border-neutral-900 rounded px-2.5 text-xs text-white focus:outline-none focus:border-white font-mono" />
          </div>

          {/* Apply Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full h-8 bg-white text-black font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors rounded"
            >
              Filter
            </button>
          </div>

        </form>
      </Card>

      <ExportExplorerBoard
        logs={logs}
        totalCount={totalCount}
        currentPageNum={currentPageNum}
        totalPages={totalPages}
        search={search}
        status={status}
        device={device}
        browser={browser}
        country={country}
        city={city}
        exportSource={exportSource}
        trafficSource={trafficSource}
        landingPath={landingPath}
        referrer={referrer}
        durationBucket={durationBucket}
        sessionId={sessionId}
        visitorId={visitorId}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

    </div>
  );
}
