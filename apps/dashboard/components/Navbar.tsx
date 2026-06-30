'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        // Redirect to login page and refresh the route state
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
    <header className="flex h-14 md:h-16 items-center justify-between px-4 md:px-8 border-b border-neutral-950 bg-black sticky top-0 z-30 w-full">
      {/* Left side: Mobile menu toggle + Logo + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburguer Toggle */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 border border-neutral-900 hover:border-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Brand logo & title - Mobile only since it's already in the desktop sidebar */}
        <div className="flex items-center gap-2 md:hidden">
          <img src="/favicon.png" alt="Logo" className="w-5 h-5 invert" />
          <span className="font-semibold text-xs text-white uppercase tracking-wider">GPT to PDF</span>
        </div>

        {/* Section title - Desktop only */}
        <h1 className="hidden md:block text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Developer Operations Dashboard
        </h1>
      </div>

      {/* Right side: Environment diagnostics and Logout action */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-neutral-400">
          <span>Environment: <strong className="text-white font-medium">Production</strong></span>
          <span className="text-neutral-800">|</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
            <span>Status: <strong className="text-white font-medium">SYS_OK</strong></span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-950 rounded transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? 'Terminating...' : 'Logout'}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
