import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (
    <nav aria-label="Primary navigation" className="navbar">
      <div className="site-container navbar-inner">
        <a href="/" className="navbar-brand">GPT to PDF</a>
        <div className="navbar-links">
          <a href="/how-to-use" className="navbar-link">How to use</a>
          <a href="/#faq" className="navbar-link">FAQ</a>
          <a href="/blog" className="navbar-link">Guides</a>
          <a href="/contact" className="navbar-link">Contact</a>
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
          box-sizing: border-box;
        }

        .navbar-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 12px;
          min-width: 0;
        }

        .navbar-brand {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          font-family: var(--font-mono);
          font-size: clamp(11px, 3.3vw, var(--text-sm));
          font-weight: 500;
          line-height: 1.2;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          text-decoration: none;
          white-space: nowrap;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          flex: 0 1 auto;
          gap: clamp(0px, 0.7vw, 4px);
          min-width: 0;
        }

        .navbar-link {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
          font-size: clamp(10.5px, 3.1vw, var(--text-sm));
          line-height: 1.5;
          color: var(--color-text-secondary);
          text-decoration: none;
          padding: 6px clamp(4px, 1.4vw, 10px);
          border-radius: var(--radius-sm);
          white-space: nowrap;
          transition: color var(--transition-fast), background var(--transition-fast);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .navbar-link:hover {
          color: var(--color-text-primary);
          background: var(--color-neutral-100);
        }

        /* Tighter spacing so the row never wraps or overflows on small phones */
        @media (max-width: 360px) {
          .navbar-inner {
            gap: 8px;
          }

          .navbar-links {
            gap: 2px;
          }

          .navbar-link {
            padding-left: 4px;
            padding-right: 4px;
          }
        }

        @media (max-width: 320px) {
          .navbar-inner {
            gap: 6px;
          }

          .navbar-brand {
            font-size: 10px;
            letter-spacing: -0.03em;
          }

          .navbar-links {
            gap: 0;
          }

          .navbar-link {
            font-size: 11px;
            padding-left: 3px;
            padding-right: 3px;
          }
        }

        @media (max-width: 300px) {
          .navbar-brand {
            font-size: 9.5px;
          }

          .navbar-link {
            font-size: 10px;
            padding-left: 2px;
            padding-right: 2px;
          }
        }
      `}</style>
    </nav>
  );
}
