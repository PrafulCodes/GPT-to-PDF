'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '14d', label: 'Last 14 Days' },
  { value: '28d', label: 'Last 28 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'all-time', label: 'All Time' },
];

export function TimeRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedRange, setSelectedRange] = useState('7d');

  useEffect(() => {
    // 1. Check URL parameters
    const urlRange = searchParams.get('range');
    if (urlRange) {
      setSelectedRange(urlRange);
      return;
    }

    // 2. Check cookies
    const cookieRange = document.cookie
      .split('; ')
      .find(row => row.startsWith('analytics_range='))
      ?.split('=')[1];

    if (cookieRange) {
      setSelectedRange(cookieRange);
      
      // Update URL search parameters to be consistent
      const params = new URLSearchParams(window.location.search);
      params.set('range', cookieRange);
      router.replace(`${pathname}?${params.toString()}`);
    } else {
      // Default to 7d and set cookie
      document.cookie = 'analytics_range=7d; path=/; max-age=31536000; SameSite=Lax';
    }
  }, [searchParams, pathname, router]);

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRange = e.target.value;
    setSelectedRange(newRange);

    // Save to cookie
    document.cookie = `analytics_range=${newRange}; path=/; max-age=31536000; SameSite=Lax`;

    // Update URL parameters and refresh page state
    const params = new URLSearchParams(window.location.search);
    params.set('range', newRange);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 hidden sm:inline">Time Window:</span>
      <select
        value={selectedRange}
        onChange={handleRangeChange}
        className="bg-black border border-neutral-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
      >
        {RANGE_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TimeRangeSelector;
