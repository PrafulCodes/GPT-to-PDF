'use client';
import React, { useState } from 'react';

import { FAQ_ITEMS } from '../lib/seo';

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  function toggle(i: number) {
    setOpen(open === i ? null : i);
  }

  return (
    <section id="faq" className="faq-section card">
      <div className="faq-heading">
        <p className="faq-kicker">Support</p>
        <h2 className="faq-title">Frequently asked questions</h2>
      </div>

      <div className="faq-container">
        {FAQ_ITEMS.map((f, i) => (
          <div key={f.q} className="faq-item">
            <button
              id={`faq-${i}`}
              onClick={() => toggle(i)}
              aria-expanded={open === i}
              aria-controls={`faq-panel-${i}`}
              className="faq-trigger"
            >
              <span>{f.q}</span>
              <svg
                style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--transition-base)' }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-${i}`}
              className={`faq-panel ${open === i ? 'faq-open' : ''}`}
            >
              <div style={{ paddingTop: open === i ? 'var(--space-3)' : 0 }}>{f.a}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .faq-section {
          max-width: 920px;
          margin: clamp(88px, 10vw, 128px) auto 0;
          padding: clamp(20px, 2.4vw, 30px);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.05);
        }

        .faq-heading {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }

        .faq-kicker {
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text-tertiary);
        }

        .faq-title {
          margin: 0;
          font-size: clamp(24px, 2.5vw, 34px);
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1.12;
          color: var(--color-text-primary);
        }

        @media (max-width: 640px) {
          .faq-section {
            margin-top: 88px;
            padding: 18px;
          }
        }
      `}</style>
    </section>
  );
}
