import React from 'react';

const steps = [
  { title: 'Paste link', desc: 'Drop your public ChatGPT share link into the input above.' },
  { title: 'Generate PDF', desc: 'Our server converts the full conversation into a clean, formatted PDF.' },
  { title: 'Download', desc: 'Instantly download your PDF — ready to save, share, or print.' }
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      aria-label="How it works"
      className="site-container"
      style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}
    >
      <h2
        style={{
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--weight-medium)',
          marginBottom: 'var(--space-5)',
          margin: '0 0 var(--space-5)'
        }}
      >
        How it works
      </h2>
      <div className="steps-grid">
        {steps.map((s, i) => (
          <div key={s.title} className="step-card">
            <div className="step-number">{`0${i + 1}`}</div>
            <div
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-medium)',
                marginBottom: 'var(--space-2)',
                lineHeight: 1.3
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6
              }}
            >
              {s.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
