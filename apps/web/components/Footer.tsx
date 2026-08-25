'use client';

import React, { useEffect, useRef, useState } from 'react';
import { creatorName, creatorUrl, siteHost, siteUrl } from '../lib/branding';

export default function Footer() {
  const [count, setCount] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement | null>(null);
  const animatedCount = useAnimatedCount(count, isVisible);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data?.pdfGeneratedCount === 'number') {
          setCount(data.pdfGeneratedCount);
        }
      } catch {
        // Keep footer resilient if stats call fails.
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const countText = count === null ? '...' : formatNumber(animatedCount);

  return (
    <footer role="contentinfo" className="site-footer">
      <div className="site-container footer-shell">
        <div className="footer-brand">
          <div className="footer-brand-name">
            <a href={siteUrl} className="link footer-brand-link">
              GPT to PDF
            </a>
          </div>
          <div className="footer-brand-subtitle">Clean exports from your ChatGPT conversations</div>
        </div>

        <div className="footer-right">
          <div className="footer-proof-card" ref={counterRef} aria-live="polite">
            <div className="footer-proof-label">Trusted for</div>
            <div className="footer-proof-value">
              <span className={`footer-proof-dot ${isVisible ? 'is-visible' : ''}`} aria-hidden />
              <span className="footer-proof-count">{countText}</span>
              <span className="footer-proof-suffix">chat exports</span>
            </div>
          </div>

          <div className="footer-nav-groups">
            <nav className="footer-links" aria-label="Main links">
              <a href="/" className="link footer-link">Home</a>
              <a href="/chatgpt-shared-link-to-pdf" className="link footer-link">Shared Links</a>
              <a href="/#faq" className="link footer-link">FAQ</a>
              <a href="/about" className="link footer-link">About</a>
              <a href="/contact" className="link footer-link">Contact</a>
            </nav>
            <nav className="footer-links footer-legal" aria-label="Legal links">
              <a href="/privacy-policy" className="link footer-link">Privacy Policy</a>
              <a href="/terms" className="link footer-link">Terms</a>
            </nav>
          </div>
        </div>
<div className="site-container footer-meta-row">
        <a href={creatorUrl} className="link footer-meta-link">
          {creatorName}
        </a>
        <span aria-hidden="true">•</span>
        <a href={siteUrl} className="link footer-meta-link">
          {siteHost}
        </a>
      </div>

      <div className="site-container footer-disclaimer">
        © 2026 GPTtoPDF. Not affiliated with or endorsed by OpenAI. ChatGPT is a trademark of OpenAI.
      </div>
      </div>

      <div className="site-container footer-meta-row">
        <a href={creatorUrl} className="link footer-meta-link">
          {creatorName}
        </a>
        <span aria-hidden="true">•</span>
        <a href={siteUrl} className="link footer-meta-link">
          {siteHost}
        </a>
      </div>

      <style>{`
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
.footer-disclaimer {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.5;
          color: var(--color-text-tertiary);
        }

        .footer-brand-name {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .footer-brand-link {
          color: var(--color-text-primary);
        }

        .footer-brand-subtitle {
          font-size: 13px;
          color: var(--color-text-tertiary);
          line-height: 1.5;
        }

        .footer-proof-card {
          min-width: 240px;
          padding: 14px 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.98));
          box-shadow: 0 12px 32px rgba(15,23,42,0.06);
        }

        .footer-proof-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-text-tertiary);
          margin-bottom: 6px;
        }

        .footer-proof-value {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: normal;
          flex-wrap: wrap;
          line-height: 1.4;
        }

        .footer-proof-count {
          font-family: var(--font-mono);
          font-size: 18px;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }

        .footer-proof-suffix {
          color: var(--color-text-secondary);
        }

        .footer-nav-groups {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .footer-links {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .footer-legal {
          opacity: 0.85;
          gap: 12px;
        }

        .footer-link,
        .footer-meta-link {
          font-size: 13px;
          color: var(--color-text-tertiary);
          text-decoration: none;
        }

        .footer-link:hover,
        .footer-meta-link:hover {
          color: var(--color-text-primary);
          text-decoration: underline;
        }

        .footer-meta-row {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          font-size: 12px;
          color: var(--color-text-tertiary);
        }

        @media (max-width: 640px) {
          .footer-proof-card {
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }

          .footer-proof-value {
            font-size: 14px;
          }

          .footer-proof-count {
            font-size: 17px;
          }

          .footer-nav-groups {
            align-items: flex-start;
          }

          .footer-links {
            justify-content: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}

function varWeight(name: 'regular'|'medium') {
  return name === 'medium' ? 500 : 400;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function useAnimatedCount(target: number | null, shouldAnimate: boolean) {
  const [value, setValue] = useState(0);
  const previousTargetRef = useRef(0);

  useEffect(() => {
    if (!shouldAnimate || target === null) return;

    const from = previousTargetRef.current;
    const duration = 1200;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(from + (target - from) * eased);

      setValue(nextValue);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        previousTargetRef.current = target;
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate, target]);

  useEffect(() => {
    if (target === null) {
      previousTargetRef.current = 0;
      setValue(0);
    }
  }, [target]);

  return target === null ? 0 : value;
}
