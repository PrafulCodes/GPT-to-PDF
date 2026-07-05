'use client';

import React, { useState, useMemo } from 'react';
import Card from './Card';

export interface Column<T> {
  key: Extract<keyof T, string>;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: 'number' | 'percentage' | 'latency';
  sortable?: boolean;
}

interface DataTableProps<T> {
  title?: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: Extract<keyof T, string>[];
  pageSize?: number;
}

export default function DataTable<T extends Record<string, any>>({
  title,
  description,
  data,
  columns,
  emptyMessage = 'No data available yet',
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: Extract<keyof T, string>; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: Extract<keyof T, string>) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((row) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = row[key];
          return val != null && String(val).toLowerCase().includes(lowerSearch);
        });
      }
      return Object.values(row).some((val) => val != null && String(val).toLowerCase().includes(lowerSearch));
    });
  }, [data, searchTerm, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card className="flex flex-col h-full bg-[#0a0a0a] border border-neutral-900 rounded-xl overflow-hidden shadow-sm">
      {(title || description || searchable) && (
        <div className="p-4 sm:p-5 border-b border-neutral-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>}
            {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
          </div>
          {searchable && (
            <div className="relative max-w-xs w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        {data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-8 h-8 text-neutral-800 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm text-neutral-500 font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#0f0f0f] sticky top-0 z-10 border-b border-neutral-900/80">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    className={`px-5 py-3 text-xs font-medium text-neutral-400 ${
                      column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                    } ${column.sortable !== false ? 'cursor-pointer hover:text-white transition-colors select-none group' : ''}`}
                  >
                    <div className={`flex items-center gap-1.5 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      {column.label}
                      {column.sortable !== false && (
                        <span className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className={`w-2 h-2 ${sortConfig?.key === column.key && sortConfig.direction === 'asc' ? 'text-blue-500 opacity-100' : 'text-neutral-600'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16z"/></svg>
                          <svg className={`w-2 h-2 mt-[1px] ${sortConfig?.key === column.key && sortConfig.direction === 'desc' ? 'text-blue-500 opacity-100' : 'text-neutral-600'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4z"/></svg>
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/60">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr key={index} className="hover:bg-neutral-900/30 transition-colors group">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`px-5 py-3.5 text-sm ${
                          column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                        } text-neutral-300 group-hover:text-white transition-colors`}
                      >
                        {column.format === 'number' && typeof row[column.key] === 'number'
                          ? Number(row[column.key]).toLocaleString()
                          : column.format === 'percentage' && typeof row[column.key] === 'number'
                          ? `${Number(row[column.key]).toFixed(1)}%`
                          : column.format === 'latency' && typeof row[column.key] === 'number'
                          ? `${Number(row[column.key]).toFixed(1)}s`
                          : String(row[column.key])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-8 text-center text-sm text-neutral-500">
                    No results found for "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-3 border-t border-neutral-900/80 flex items-center justify-between bg-[#0f0f0f]">
          <p className="text-xs text-neutral-500">
            Showing <span className="font-medium text-neutral-300">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-neutral-300">{Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="font-medium text-neutral-300">{sortedData.length}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-xs text-neutral-400 px-2 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
