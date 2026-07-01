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
      <div className="flex items-center justify-between text-xs text-neutral-500 uppercase tracking-[0.3em]">
        <span>{totalCount.toLocaleString()} matching exports</span>
        <a href={`/api/export-csv?${csvParams.toString()}`} className="text-white hover:text-neutral-300 transition-colors">
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
        <div className="border border-neutral-900 rounded bg-black overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/20 text-[9px] text-neutral-500 uppercase tracking-[0.3em]">
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Visitor</th>
                <th className="px-4 py-2.5">Location</th>
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5">Source</th>
                <th className="px-4 py-2.5 text-right">Duration</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-xs text-neutral-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-600">No exports in the selected period.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isActive = selected?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedId(log.id)}
                      className={`cursor-pointer transition-colors ${isActive ? 'bg-neutral-950/30' : 'hover:bg-neutral-950/20'}`}
                    >
                      <td className="px-4 py-3 text-neutral-500 select-none">{formatTimestamp(log.timestamp)}</td>
                      <td className="px-4 py-3">
                        <div className="text-white">{(log.anonymousVisitorId || 'anon').slice(0, 12)}</div>
                        <div className="text-[10px] text-neutral-600">{(log.sessionId || 'session').slice(0, 12)}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        <div>{[log.city, log.country].filter(Boolean).join(', ') || 'Telemetry unavailable'}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        <div>{[log.browser, log.browserVersion].filter(Boolean).join(' ') || 'Browser unavailable'}</div>
                        <div className="text-[10px] text-neutral-600">{[log.operatingSystem, log.osVersion].filter(Boolean).join(' ') || 'OS unavailable'} · {log.deviceType || 'Device unavailable'}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        <div>{log.exportSource || 'Export source unavailable'}</div>
                        <div className="text-[10px] text-neutral-600">{log.normalizedReferrer || log.rawReferrer || 'Referrer unavailable'}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-white">{typeof log.generationDuration === 'number' ? `${log.generationDuration.toFixed(2)}s` : 'Telemetry unavailable'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${log.success ? 'bg-neutral-950 text-white border-neutral-700' : 'bg-neutral-900 text-neutral-500 border-neutral-950'}`}>
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

        <aside className="sticky top-4 rounded border border-neutral-900 bg-black p-4 space-y-4">
          {!selected ? (
            <div className="text-xs text-neutral-600">Select a row to inspect complete telemetry.</div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-400">Export Drawer</h3>
                  <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${selected.success ? 'bg-neutral-950 text-white border-neutral-700' : 'bg-neutral-900 text-neutral-500 border-neutral-950'}`}>
                    {selected.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500">{formatTimestamp(selected.timestamp)}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded border border-neutral-900 p-3 bg-neutral-950/20">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Complete Telemetry</div>
                  <div className="space-y-1 text-neutral-300">
                    <div><span className="text-neutral-500">Visitor:</span> {(selected.anonymousVisitorId || 'telemetry unavailable').slice(0, 32)}</div>
                    <div><span className="text-neutral-500">Session:</span> {(selected.sessionId || 'telemetry unavailable').slice(0, 32)}</div>
                    <div><span className="text-neutral-500">Location:</span> {[selected.city, selected.country].filter(Boolean).join(', ') || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Browser:</span> {[selected.browser, selected.browserVersion].filter(Boolean).join(' ') || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">OS:</span> {[selected.operatingSystem, selected.osVersion].filter(Boolean).join(' ') || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Source:</span> {selected.exportSource || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Referrer:</span> {selected.normalizedReferrer || selected.rawReferrer || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Landing:</span> {selected.landingPath || 'Telemetry unavailable'}</div>
                  </div>
                </div>

                <div className="rounded border border-neutral-900 p-3 bg-neutral-950/20">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Timeline</div>
                  <div className="space-y-1 text-neutral-300">
                    <div><span className="text-neutral-500">Duration:</span> {typeof selected.generationDuration === 'number' ? `${selected.generationDuration.toFixed(2)}s` : 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Queue:</span> {selected.queueTime != null ? `${selected.queueTime.toFixed(2)}s` : 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Parse:</span> {selected.parseTime != null ? `${selected.parseTime.toFixed(2)}s` : 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Render:</span> {selected.renderTime != null ? `${selected.renderTime.toFixed(2)}s` : 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Estimated pages:</span> {selected.estimatedPages != null ? selected.estimatedPages : 'Telemetry unavailable'}</div>
                  </div>
                </div>

                <div className="rounded border border-neutral-900 p-3 bg-neutral-950/20">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Performance</div>
                  <div className="space-y-1 text-neutral-300">
                    <div><span className="text-neutral-500">Size bucket:</span> {selected.exportSizeBucket || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Duration bucket:</span> {selected.exportDurationBucket || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">PDF size:</span> {selected.pdfSize != null ? `${Math.round(selected.pdfSize / 1024)} KB` : 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Pages:</span> {selected.estimatedPages != null ? selected.estimatedPages : 'Telemetry unavailable'}</div>
                  </div>
                </div>

                <div className="rounded border border-neutral-900 p-3 bg-neutral-950/20">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Failure</div>
                  <div className="space-y-1 text-neutral-300">
                    <div><span className="text-neutral-500">Stage:</span> {selected.failureStage || 'No failure stage'}</div>
                    <div><span className="text-neutral-500">Reason:</span> {selected.failureReason || 'No failure reason'}</div>
                    <div><span className="text-neutral-500">HTTP status:</span> {selected.httpStatus != null ? selected.httpStatus : 'Telemetry unavailable'}</div>
                  </div>
                </div>

                <div className="rounded border border-neutral-900 p-3 bg-neutral-950/20">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Browser Details</div>
                  <div className="space-y-1 text-neutral-300">
                    <div><span className="text-neutral-500">Browser:</span> {[selected.browser, selected.browserVersion].filter(Boolean).join(' ') || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">OS:</span> {[selected.operatingSystem, selected.osVersion].filter(Boolean).join(' ') || 'Telemetry unavailable'}</div>
                    <div><span className="text-neutral-500">Device:</span> {selected.deviceType || 'Telemetry unavailable'}</div>
                  </div>
                </div>

                <div className="rounded border border-neutral-900 p-3 bg-neutral-950/20">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Visitor History</div>
                  {visitorHistory.length === 0 ? (
                    <div className="text-neutral-600">Waiting for first matching visitor record.</div>
                  ) : (
                    <div className="space-y-2 text-neutral-300">
                      {visitorHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          <span className="text-neutral-500">{item.success ? 'Success' : 'Failed'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded border border-neutral-900 p-3 bg-neutral-950/20">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">Raw Payload</div>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-relaxed text-neutral-400">
                    {JSON.stringify(selected, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-900 pt-4 text-xs font-mono">
          <div className="text-neutral-500">Page {currentPageNum} of {totalPages}</div>
          <div className="flex items-center gap-2">
            {currentPageNum > 1 && (
              <Link href={buildHref(currentPageNum - 1)} className="inline-flex h-8 items-center border border-neutral-900 bg-black hover:bg-neutral-900 px-3 text-white transition-colors rounded">
                Previous
              </Link>
            )}
            {currentPageNum < totalPages && (
              <Link href={buildHref(currentPageNum + 1)} className="inline-flex h-8 items-center border border-neutral-900 bg-black hover:bg-neutral-900 px-3 text-white transition-colors rounded">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}