'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

interface ExportLog {
  id: string;
  timestamp: string;
  anonymousVisitorId?: string | null;
  sessionId?: string | null;
  country?: string | null;
  city?: string | null;
  browser?: string | null;
  browserVersion?: string | null;
  operatingSystem?: string | null;
  osVersion?: string | null;
  deviceType?: string | null;
  exportSource?: string | null;
  trafficSource?: string | null;
  landingPath?: string | null;
  normalizedReferrer?: string | null;
  rawReferrer?: string | null;
  exportDurationBucket?: string | null;
  exportSizeBucket?: string | null;
  generationDuration?: number;
  pdfSize?: number | null;
  success?: boolean;
  failureStage?: string | null;
  failureReason?: string | null;
  httpStatus?: number | null;
  queueTime?: number | null;
  parseTime?: number | null;
  renderTime?: number | null;
  estimatedPages?: number | null;
  messageCount?: number | null;
  imagesCount?: number | null;
  tablesCount?: number | null;
  codeBlockCount?: number | null;
  localHour?: number | null;
  dayOfWeek?: number | null;
  [key: string]: unknown;
}

interface ExportExplorerBoardProps {
  logs: ExportLog[];
  totalCount: number;
  currentPageNum: number;
  totalPages: number;
  search: string;
  status: string;
  device: string;
  browser: string;
  country: string;
  city: string;
  exportSource: string;
  trafficSource: string;
  landingPath: string;
  referrer: string;
  durationBucket: string;
  sessionId: string;
  visitorId: string;
  dateFrom: string;
  dateTo: string;
}

function formatTimestamp(value: string) {
  try {
    return new Date(value).toISOString().replace('T', ' ').substring(0, 19);
  } catch {
    return value;
  }
}

export default function ExportExplorerBoard({
  logs,
  totalCount,
  currentPageNum,
  totalPages,
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
}: ExportExplorerBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(logs[0]?.id || null);

  const selected = useMemo(() => logs.find((log) => log.id === selectedId) || logs[0] || null, [logs, selectedId]);

  const visitorHistory = useMemo(() => {
    if (!selected?.anonymousVisitorId) return [];
    return logs
      .filter((log) => log.anonymousVisitorId === selected.anonymousVisitorId)
      .slice(0, 8);
  }, [logs, selected]);

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (device) params.set('device', device);
    if (browser) params.set('browser', browser);
    if (country) params.set('country', country);
    if (city) params.set('city', city);
    if (exportSource) params.set('exportSource', exportSource);
    if (trafficSource) params.set('trafficSource', trafficSource);
    if (landingPath) params.set('landingPath', landingPath);
    if (referrer) params.set('referrer', referrer);
    if (durationBucket) params.set('durationBucket', durationBucket);
    if (sessionId) params.set('sessionId', sessionId);
    if (visitorId) params.set('visitorId', visitorId);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    params.set('page', String(page));
    return `/exports?${params.toString()}`;
  };

  const csvParams = new URLSearchParams();
  if (search) csvParams.set('search', search);
  if (status) csvParams.set('status', status);
  if (device) csvParams.set('device', device);
  if (browser) csvParams.set('browser', browser);
  if (country) csvParams.set('country', country);
  if (city) csvParams.set('city', city);
  if (exportSource) csvParams.set('exportSource', exportSource);
  if (trafficSource) csvParams.set('trafficSource', trafficSource);
  if (landingPath) csvParams.set('landingPath', landingPath);
  if (referrer) csvParams.set('referrer', referrer);
  if (durationBucket) csvParams.set('durationBucket', durationBucket);
  if (sessionId) csvParams.set('sessionId', sessionId);
  if (visitorId) csvParams.set('visitorId', visitorId);
  if (dateFrom) csvParams.set('dateFrom', dateFrom);
  if (dateTo) csvParams.set('dateTo', dateTo);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{totalCount.toLocaleString()} matching exports</span>
        <a href={`/api/export-csv?${csvParams.toString()}`} className="text-white hover:text-blue-400 transition-colors font-medium">
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_26rem] gap-6 items-start">
        <div className="border border-neutral-900/80 rounded-xl bg-[#0a0a0a] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead className="bg-[#0f0f0f] sticky top-0 border-b border-neutral-900/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-medium text-neutral-400">Timestamp</th>
                <th className="px-5 py-3.5 text-xs font-medium text-neutral-400">Visitor</th>
                <th className="px-5 py-3.5 text-xs font-medium text-neutral-400">Location</th>
                <th className="px-5 py-3.5 text-xs font-medium text-neutral-400">Client</th>
                <th className="px-5 py-3.5 text-xs font-medium text-neutral-400">Source</th>
                <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 text-right">Duration</th>
                <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/60 text-sm text-neutral-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-500">No exports in the selected period.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isActive = selected?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedId(log.id)}
                      className={`cursor-pointer transition-colors ${isActive ? 'bg-neutral-900/40 border-l-2 border-l-blue-500' : 'hover:bg-neutral-900/30 border-l-2 border-l-transparent'}`}
                    >
                      <td className="px-5 py-4 text-neutral-500 text-xs font-mono select-none">{formatTimestamp(log.timestamp)}</td>
                      <td className="px-5 py-4">
                        <div className="text-neutral-200 font-mono text-xs">{(log.anonymousVisitorId || 'anon').slice(0, 12)}</div>
                        <div className="text-xs text-neutral-600 font-mono mt-0.5">{(log.sessionId || 'session').slice(0, 12)}</div>
                      </td>
                      <td className="px-5 py-4 text-neutral-300">
                        <div>{[log.city, log.country].filter(Boolean).join(', ') || 'Unknown'}</div>
                      </td>
                      <td className="px-5 py-4 text-neutral-300">
                        <div>{[log.browser, log.browserVersion].filter(Boolean).join(' ') || 'Unknown'}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">{[log.operatingSystem, log.osVersion].filter(Boolean).join(' ') || 'Unknown'} · {log.deviceType || 'Unknown'}</div>
                      </td>
                      <td className="px-5 py-4 text-neutral-300">
                        <div>{log.exportSource || 'Unknown'}</div>
                        <div className="text-xs text-neutral-500 mt-0.5 truncate max-w-[200px]">{log.normalizedReferrer || log.rawReferrer || 'Unknown'}</div>
                      </td>
                      <td className="px-5 py-4 text-right text-neutral-200 font-mono">{typeof log.generationDuration === 'number' ? `${log.generationDuration.toFixed(2)}s` : '-'}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${log.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <aside className="sticky top-20 rounded-xl border border-neutral-900/80 bg-[#0a0a0a] p-5 space-y-5 shadow-sm">
          {!selected ? (
            <div className="text-sm text-neutral-500 p-4 text-center">Select a row to inspect complete telemetry.</div>
          ) : (
            <>
              <div className="space-y-2 border-b border-neutral-900/80 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold tracking-tight text-white">Export Details</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${selected.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {selected.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 font-mono">{formatTimestamp(selected.timestamp)}</div>
              </div>

              <div className="space-y-4 text-sm max-h-[calc(100vh-14rem)] overflow-y-auto pr-2">
                
                <div>
                  <div className="text-xs font-semibold text-neutral-400 mb-2 tracking-wider uppercase">Timeline</div>
                  <div className="bg-neutral-900/30 rounded-lg p-3 space-y-2 border border-neutral-900/50">
                    <div className="flex justify-between"><span className="text-neutral-500">Duration</span> <span className="font-mono text-neutral-300">{typeof selected.generationDuration === 'number' ? `${selected.generationDuration.toFixed(2)}s` : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Queue</span> <span className="font-mono text-neutral-300">{selected.queueTime != null ? `${selected.queueTime.toFixed(2)}s` : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Parse</span> <span className="font-mono text-neutral-300">{selected.parseTime != null ? `${selected.parseTime.toFixed(2)}s` : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Render</span> <span className="font-mono text-neutral-300">{selected.renderTime != null ? `${selected.renderTime.toFixed(2)}s` : '-'}</span></div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-neutral-400 mb-2 tracking-wider uppercase">Performance</div>
                  <div className="bg-neutral-900/30 rounded-lg p-3 space-y-2 border border-neutral-900/50">
                    <div className="flex justify-between"><span className="text-neutral-500">Size bucket</span> <span className="text-neutral-300">{selected.exportSizeBucket || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Duration bucket</span> <span className="text-neutral-300">{selected.exportDurationBucket || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">PDF size</span> <span className="font-mono text-neutral-300">{selected.pdfSize != null ? `${Math.round(selected.pdfSize / 1024)} KB` : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Pages</span> <span className="font-mono text-neutral-300">{selected.estimatedPages != null ? selected.estimatedPages : '-'}</span></div>
                  </div>
                </div>

                {!selected.success && (
                  <div>
                    <div className="text-xs font-semibold text-red-400 mb-2 tracking-wider uppercase">Failure Details</div>
                    <div className="bg-red-500/5 rounded-lg p-3 space-y-2 border border-red-500/10">
                      <div className="flex justify-between"><span className="text-red-400/70">Stage</span> <span className="text-red-200">{selected.failureStage || 'Unknown'}</span></div>
                      <div className="flex flex-col"><span className="text-red-400/70 mb-1">Reason</span> <span className="text-red-200 text-xs">{selected.failureReason || 'Unknown'}</span></div>
                      <div className="flex justify-between"><span className="text-red-400/70">HTTP status</span> <span className="text-red-200 font-mono">{selected.httpStatus != null ? selected.httpStatus : '-'}</span></div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-neutral-400 mb-2 tracking-wider uppercase">Raw Payload</div>
                  <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-900/80">
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs font-mono leading-relaxed text-neutral-500">
                      {JSON.stringify(selected, null, 2)}
                    </pre>
                  </div>
                </div>

              </div>
            </>
          )}
        </aside>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-900/80 pt-5 mt-6">
          <div className="text-sm text-neutral-500">Page <span className="font-medium text-neutral-300">{currentPageNum}</span> of <span className="font-medium text-neutral-300">{totalPages}</span></div>
          <div className="flex items-center gap-2">
            {currentPageNum > 1 && (
              <Link href={buildHref(currentPageNum - 1)} className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-4 text-sm font-medium text-neutral-300 transition-colors">
                Previous
              </Link>
            )}
            {currentPageNum < totalPages && (
              <Link href={buildHref(currentPageNum + 1)} className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-4 text-sm font-medium text-neutral-300 transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}