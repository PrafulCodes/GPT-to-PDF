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

  const countText = count === null ? '...' : `${formatNumber(animatedCount)}+`;

  return (
    <footer role="contentinfo" className="site-footer">
      <div className="site-container footer-shell">
        <div>
          <div style={{fontFamily:'var(--font-mono)',fontWeight:varWeight('medium')}}>
            <a href={siteUrl} className="link" style={{color:'var(--color-text-primary)'}}>
              GPT to PDF
            </a>
          </div>
          <div style={{fontSize:'var(--text-xs)',color:'var(--color-text-tertiary)'}}>Clean exports from your ChatGPT conversations</div>
        </div>

        <div className="footer-right">
          <div className="footer-proof" ref={counterRef} aria-live="polite">
            <div className="footer-proof-label">Trusted for</div>
            <div className="footer-proof-value">
              <span className={`footer-proof-dot ${isVisible ? 'is-visible' : ''}`} aria-hidden />
              <span className="footer-proof-count">{countText}</span>
              <span className="footer-proof-suffix">chat exports</span>
            </div>
          </div>

          <nav className="footer-links" aria-label="Footer links">
            <a href="/chatgpt-shared-link-to-pdf" style={{fontSize:'var(--text-xs)',color:'var(--color-text-tertiary)'}} className="link">Shared Links</a>
            <a href="/no-extension-chatgpt-to-pdf" style={{fontSize:'var(--text-xs)',color:'var(--color-text-tertiary)'}} className="link">No Extension</a>
            <a href="/chatgpt-to-pdf-mobile" style={{fontSize:'var(--text-xs)',color:'var(--color-text-tertiary)'}} className="link">Mobile</a>
            <a href="/#faq" style={{fontSize:'var(--text-xs)',color:'var(--color-text-tertiary)'}} className="link">FAQ</a>
          </nav>
        </div>
      </div>

      <div className="site-container" style={{marginTop:'10px',display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center',fontSize:'var(--text-xs)',color:'var(--color-text-tertiary)'}}>
        <a href={creatorUrl} className="link" style={{fontWeight:600,color:'var(--color-text-primary)'}}>
          {creatorName}
        </a>
        <span aria-hidden="true">•</span>
        <a href={siteUrl} className="link">
          {siteHost}
        </a>
      </div>
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
