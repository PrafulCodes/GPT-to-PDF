import React from 'react';

const steps = [
  { title: 'Paste link', desc: 'Drop your public ChatGPT share link into the input.' },
  { title: 'Generate PDF', desc: "Server converts the conversation into a clean PDF." },
  { title: 'Download', desc: 'Instantly download the exported PDF.' }
];

export default function HowItWorks() {
  return (
    <section id="how" aria-label="How it works" className="site-container" style={{paddingTop:'var(--space-6)',paddingBottom:'var(--space-6)'}}>
      <h2 style={{fontSize:'var(--text-md)',fontWeight:'var(--weight-medium)',marginBottom:'var(--space-6)'}}>How it works</h2>
      <div className="steps-grid">
        {steps.map((s, i) => (
          <div key={s.title} className="step-card">
            <div className="step-number">{`0${i + 1}`}</div>
            <div style={{fontSize:'var(--text-base)',fontWeight:'var(--weight-medium)',marginBottom:'var(--space-2)'}}>{s.title}</div>
            <div style={{fontSize:'var(--text-sm)',color:'var(--color-text-secondary)'}}>{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
