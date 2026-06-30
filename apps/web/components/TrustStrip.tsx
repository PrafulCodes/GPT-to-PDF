import React from 'react';

const items = [
  { title: 'No signup' },
  { title: 'Free forever' },
  { title: 'Mobile friendly' },
  { title: 'Instant download' }
];

export default function TrustStrip() {
  return (
    <section aria-label="Trust signals" className="trust-strip">
      <div className="trust-row">
        {items.map((it) => (
          <div key={it.title} className="trust-item">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden
              style={{ flexShrink: 0 }}
            >
              <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(29,78,216,0.08)" />
              <path
                d="M4 6.5l2 2 3-3"
                stroke="#1D4ED8"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{it.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
