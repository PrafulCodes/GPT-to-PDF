'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Acquisition', href: '/acquisition' },
  { name: 'Geography', href: '/geography' },
  { name: 'Export Events', href: '/exports' },
  { name: 'User Behaviour', href: '/user-behaviour' },
  { name: 'Settings', href: '/settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const renderNavLinks = () => (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
        return (
          <a
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all ${
              isActive
                ? 'bg-blue-500/10 text-blue-400 font-medium'
                : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/50'
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
          className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* MOBILE DRAWER PANEL */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-neutral-900/80 z-50 md:hidden transition-transform duration-200 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-neutral-900/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <img src="/favicon.png" alt="Logo" className="w-4 h-4 invert opacity-90" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">Console</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-3 py-6">
          {renderNavLinks()}
        </div>
      </aside>

      {/* DESKTOP SIDEBAR - PERSISTENT */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-neutral-900/80 bg-[#0a0a0a] z-20">
        {/* Header */}
        <div className="flex h-16 items-center px-5 border-b border-neutral-900/80 gap-3">
          <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <img src="/favicon.png" alt="Logo" className="w-4 h-4 invert opacity-90" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white">GPT to PDF</span>
            <span className="text-[10px] text-neutral-500 font-medium">Founder Console</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-3 py-6">
          <div className="mb-2 px-3 text-[10px] uppercase font-semibold tracking-wider text-neutral-600">Analytics</div>
          {renderNavLinks()}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
