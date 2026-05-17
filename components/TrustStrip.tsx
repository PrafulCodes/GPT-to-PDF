import React from 'react';

const items = [
  { title: 'No signup' },
  { title: 'Free forever' },
  { title: 'Mobile friendly' },
  { title: 'Instant download' }
];

export default function TrustStrip() {
  return (
    <section aria-label="Trust" className="site-container" style={{paddingTop:'var(--space-4)',paddingBottom:'var(--space-10)'}}>
      <div className="trust-row">
        {items.map((it) => (
          <div key={it.title} className="trust-item">
            <span aria-hidden style={{width:14,height:14,display:'inline-block',borderRadius:4,background:'transparent'}} />
            <span>{it.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
