'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshWrapperProps {
  intervalMs?: number; // default to 45 seconds
}

export function RefreshWrapper({ intervalMs = 45000 }: RefreshWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    // Set up auto-refresh interval
    const interval = setInterval(() => {
      // Re-fetches server component data without reloading page state
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  // This is a utility script component that renders nothing visible
  return null;
}

export default RefreshWrapper;
