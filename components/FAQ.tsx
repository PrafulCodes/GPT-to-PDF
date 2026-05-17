'use client';
import React, { useState } from 'react';

import { FAQ_ITEMS } from '../lib/seo';

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  function toggle(i:number) {
    setOpen(open === i ? null : i);
  }

  return (
    <section id="faq" className="site-container" style={{paddingTop:'var(--space-12)',paddingBottom:'var(--space-8)'}}>
      <h2 style={{fontSize:'var(--text-md)',fontWeight:'var(--weight-medium)',marginBottom:'var(--space-5)'}}>Frequently asked questions</h2>
      <div className="faq-container">
        {FAQ_ITEMS.map((f, i) => (
          <div key={f.q} className="faq-item">
            <button
              onClick={() => toggle(i)}
              aria-expanded={open === i}
              aria-controls={`faq-panel-${i}`}
              className="faq-trigger"
            >
              <span>{f.q}</span>
              <svg style={{transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',transition:'transform var(--transition-base)'}} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M6 9l6 6 6-6" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-${i}`} className={`faq-panel ${open === i ? 'faq-open' : ''}`}>
              <div style={{paddingTop:open === i ? 'var(--space-3)' : 0}}>{f.a}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
