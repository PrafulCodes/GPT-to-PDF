'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimeRangeSelector from './TimeRangeSelector';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Failed to log out:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-8 border-b border-neutral-900/80 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30 w-full">
      {/* Left side: Mobile menu toggle + Logo + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburguer Toggle */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 border border-neutral-800 hover:border-neutral-700 rounded-md text-neutral-400 hover:text-white transition-colors bg-neutral-900/50"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Brand logo & title - Mobile only since it's already in the desktop sidebar */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
            <img src="/favicon.png" alt="Logo" className="w-3.5 h-3.5 invert opacity-90" />
          </div>
          <span className="font-semibold text-xs text-white tracking-tight">Console</span>
        </div>

        {/* Section title - Desktop only */}
        <h1 className="hidden md:block text-sm font-medium text-neutral-300">
          Analytics Overview
        </h1>
      </div>

      {/* Right side: Time Selector + Logout action */}
      <div className="flex items-center gap-4">
        <TimeRangeSelector />

        <div className="hidden sm:block w-px h-4 bg-neutral-800"></div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-3 py-1.5 text-xs font-medium border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-neutral-700 rounded-md transition-all disabled:opacity-50"
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
