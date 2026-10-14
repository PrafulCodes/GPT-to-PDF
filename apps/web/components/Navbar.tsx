import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (
    <nav role="banner" className="navbar">
      <div className="site-container navbar-inner">
        <div className="navbar-brand">GPT to PDF</div>
        <div className="navbar-links">
          <a href="#faq" className="navbar-link">FAQ</a>
          <a href="/blog" className="navbar-link">Guides</a>
        </div>
      </div>

      <style>{`
        .navbar {
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(250, 250, 250, 0.92);
          border-bottom: 1px solid var(--color-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          height: 52px;
        }

        .navbar-inner {
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          text-decoration: none;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .navbar-link {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          text-decoration: none;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast), background var(--transition-fast);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .navbar-link:hover {
          color: var(--color-text-primary);
          background: var(--color-neutral-100);
        }
      `}</style>
    </nav>
  );
}
