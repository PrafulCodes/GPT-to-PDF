'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Exports', href: '/exports' },
  { name: 'Performance', href: '/performance' },
  { name: 'SEO', href: '/seo' },
  { name: 'Settings', href: '/settings' },
  { name: 'Health Console', href: '/health' },
];


export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const renderNavLinks = () => (
    <nav className="space-y-1.5 font-mono text-[11px] uppercase tracking-wider">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <a
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={`flex items-center px-3 py-2.5 rounded border transition-colors ${
              isActive
                ? 'bg-neutral-900 border-neutral-800 text-white font-medium'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white hover:bg-neutral-950'
            }`}
          >
            {item.name}
          </a>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* MOBILE DRAWER OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* MOBILE DRAWER PANEL */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-black border-r border-neutral-950 z-50 md:hidden transition-transform duration-200 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-neutral-950">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Logo" className="w-5 h-5 invert" />
            <span className="font-semibold text-xs text-white uppercase tracking-wider">GPT to PDF</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-neutral-900 rounded text-neutral-400 hover:text-white"
            aria-label="Close menu"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-6">
          {renderNavLinks()}
        </div>
      </aside>

      {/* DESKTOP SIDEBAR - PERSISTENT */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-neutral-950 bg-black z-20">
        {/* Header */}
        <div className="flex h-16 items-center px-6 border-b border-neutral-950 gap-3">
          <img src="/favicon.png" alt="Logo" className="w-6 h-6 invert" />
          <div className="flex flex-col">
            <span className="font-semibold text-xs tracking-wider text-white uppercase">GPT to PDF</span>
            <span className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase">Console</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-4 py-6">
          {renderNavLinks()}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-neutral-950 font-mono text-[9px] text-neutral-600 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></div>
          <span>Security Level: Auth</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
