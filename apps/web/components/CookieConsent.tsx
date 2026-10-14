'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'gpttopdf-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(CONSENT_KEY) !== 'accepted');
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_KEY, 'accepted');
    } finally {
      setVisible(false);
    }
  }

  return (
    <aside
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex sm:items-center sm:gap-5"
    >
      <p className="text-sm leading-relaxed text-slate-600">
        We use essential local storage for site preferences and limited analytics to keep GPTtoPDF reliable. Read our{' '}
        <Link href="/privacy-policy" className="font-medium text-blue-700 underline">
          Privacy Policy
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={accept}
        className="mt-3 shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 sm:mt-0"
      >
        Continue
      </button>
    </aside>
  );
}
