'use client';

import React, { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'gpttopdf-apology-dismissed-v1';

export default function ApologyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setIsRendered(true);
        // Small delay to trigger smooth entrance animation
        const timer = setTimeout(() => setIsOpen(true), 50);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked/disabled, silently skip
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore localStorage write errors (e.g. private mode quota)
    }
    // Remove from DOM after transition finishes
    setTimeout(() => {
      setIsRendered(false);
    }, 200);
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDismiss]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apology-modal-title"
      aria-describedby="apology-modal-description"
      className={`fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 transition-all duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop with blur */}
      <div
        onClick={handleDismiss}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl transition-all duration-200 sm:p-7 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'
        }`}
      >
        {/* Close (X) button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close message"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-start gap-4">
          {/* Friendly Icon Badge */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100/80 shadow-sm">
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          <div className="space-y-2 text-left">
            <h2
              id="apology-modal-title"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              Sorry for the inconvenience! ❤️
            </h2>

            <div
              id="apology-modal-description"
              className="space-y-2.5 text-sm leading-relaxed text-slate-600"
            >
              <p>
                I recently experienced some issues with PDF generation, but everything is back up and running now.
              </p>
              <p>
                I&apos;m really sorry for the trouble, and I truly appreciate your patience and support. Thank you for using my project!
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          <div className="mt-2 w-full pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full rounded-xl bg-slate-900 py-2.5 px-4 text-center text-sm font-medium text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all"
            >
              Okay, Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

