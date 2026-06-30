'use client';
import React, { useState, useEffect } from 'react';
import { parseContentDispositionFileName } from '../lib/pdf-filename';

function getBrowserName() {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  return 'Unknown';
}

function getOSName() {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Unknown';
}

function getDeviceType() {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/mobi|iphone|ipod|iemobile|blackberry/i.test(ua)) return 'Mobile';
  if (/ipad|tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function isLocalStorageAvailable() {
  try {
    localStorage.setItem('test_ls', '1');
    localStorage.removeItem('test_ls');
    return true;
  } catch {
    return false;
  }
}


type ProgressStage = 'idle' | 'fetching' | 'formatting' | 'generating' | 'preparing' | 'done';

const stageMeta: Record<Exclude<ProgressStage, 'idle' | 'done'>, { label: string; hint: string }> = {
  fetching: {
    label: 'Fetching conversation…',
    hint: 'Longer chats may take a moment — hang tight.'
  },
  formatting: {
    label: 'Formatting content…',
    hint: 'Longer chats may take a moment — hang tight.'
  },
  generating: {
    label: 'Generating your PDF…',
    hint: 'Longer chats may take a moment — hang tight.'
  },
  preparing: {
    label: 'Preparing download…',
    hint: 'Almost there — your file is nearly ready.'
  }
};

const stageOrder: Array<Exclude<ProgressStage, 'idle' | 'done'>> = ['fetching', 'formatting', 'generating', 'preparing'];

function isLikelyChatGptUrl(s: string) {
  try {
    const u = new URL(s.trim());
    const host = u.hostname.toLowerCase();
    return (
      host.includes('chat.openai.com') ||
      host.includes('chatgpt.com') ||
      host.includes('share.openai.com') ||
      host.includes('shareg.pt')
    );
  } catch {
    return false;
  }
}

export default function HeroInputCard() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressStage>('idle');

  useEffect(() => {
    // 1. Initialize anonymous visitor_id and session_id
    let anonymousVisitorId = localStorage.getItem('anon_visitor_id');
    if (!anonymousVisitorId) {
      anonymousVisitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('anon_visitor_id', anonymousVisitorId);
    }

    let sessionId = sessionStorage.getItem('anon_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('anon_session_id', sessionId);
    }

    // 2. Parse UTMs
    const query = new URLSearchParams(window.location.search);
    const utms = {
      utmSource: query.get('utm_source') || undefined,
      utmMedium: query.get('utm_medium') || undefined,
      utmCampaign: query.get('utm_campaign') || undefined,
      utmContent: query.get('utm_content') || undefined,
      utmTerm: query.get('utm_term') || undefined,
    };

    // 3. Collect Browser Telemetry
    const telemetryPayload = {
      schemaVersion: 2,
      eventType: 'pageview',
      anonymousVisitorId,
      sessionId,
      landingPath: window.location.pathname,
      landingQuery: window.location.search.substring(1) || undefined,
      currentPage: window.location.pathname,
      rawReferrer: document.referrer || 'Direct',
      ...utms,
      browser: getBrowserName(),
      browserVersion: navigator.userAgent.split(' ').pop() || 'Unknown',
      operatingSystem: getOSName(),
      osVersion: 'Unknown',
      deviceType: getDeviceType(),
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      localStorageEnabled: isLocalStorageAvailable(),
      javaScriptEnabled: true,
      approximateLatency: 0.0
    };

    // Post pageview telemetry
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetryPayload)
    }).catch(err => console.error('Failed to log pageview telemetry:', err));
  }, []);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl((text || '').trim());
      setError(null);
    } catch {
      setError('Unable to access clipboard. Please paste manually.');
    }
  };

  const generate = async () => {
    setError(null);
    const trimmed = url.trim();
    setUrl(trimmed);
    if (!trimmed || !isLikelyChatGptUrl(trimmed)) {
      setError('Please paste a valid public ChatGPT share link.');
      return;
    }

    if (loading) return;

    setLoading(true);
    setProgress('fetching');

    const startTime = performance.now();
    const stageTimers: Array<ReturnType<typeof setTimeout>> = [];
    
    // Telemetry identifiers
    const anonymousVisitorId = localStorage.getItem('anon_visitor_id') || 'anon';
    const sessionId = sessionStorage.getItem('anon_session_id') || 'anon';
    const query = new URLSearchParams(window.location.search);
    const utms = {
      utmSource: query.get('utm_source') || undefined,
      utmMedium: query.get('utm_medium') || undefined,
      utmCampaign: query.get('utm_campaign') || undefined,
      utmContent: query.get('utm_content') || undefined,
      utmTerm: query.get('utm_term') || undefined,
    };

    try {
      const req = fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed })
      });

      stageTimers.push(setTimeout(() => setProgress('formatting'), 650));
      stageTimers.push(setTimeout(() => setProgress('generating'), 1700));
      stageTimers.push(setTimeout(() => setProgress('preparing'), 3400));

      const res = await req;
      if (!res.ok) {
        throw new Error('PDF generation failed. Please try again.');
      }

      setProgress('preparing');

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = parseContentDispositionFileName(res.headers.get('content-disposition')) || 'conversation.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);

      const generationDuration = (performance.now() - startTime) / 1000;
      setProgress('done');
      setTimeout(() => setProgress('idle'), 1800);

      // Decoupled log export success telemetry
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaVersion: 2,
          eventType: 'export',
          anonymousVisitorId,
          sessionId,
          success: true,
          generationDuration,
          landingPath: window.location.pathname,
          landingQuery: window.location.search.substring(1) || undefined,
          currentPage: window.location.pathname,
          rawReferrer: document.referrer || 'Direct',
          pdfSize: blob.size,
          ...utms,
          browser: getBrowserName(),
          browserVersion: navigator.userAgent.split(' ').pop() || 'Unknown',
          operatingSystem: getOSName(),
          deviceType: getDeviceType(),
          touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          pixelRatio: window.devicePixelRatio || 1,
          darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
          language: navigator.language || 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        })
      }).catch(err => console.error('Failed to log telemetry:', err));

    } catch (err: any) {
      const generationDuration = (performance.now() - startTime) / 1000;
      setError('PDF generation failed. Please try again.');
      setProgress('idle');

      // Decoupled log export failure telemetry
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaVersion: 2,
          eventType: 'export',
          anonymousVisitorId,
          sessionId,
          success: false,
          failureReason: err instanceof Error ? err.message : 'Unknown generation error',
          failureStage: 'generate_pdf',
          generationDuration,
          landingPath: window.location.pathname,
          landingQuery: window.location.search.substring(1) || undefined,
          currentPage: window.location.pathname,
          rawReferrer: document.referrer || 'Direct',
          ...utms,
          browser: getBrowserName(),
          browserVersion: navigator.userAgent.split(' ').pop() || 'Unknown',
          operatingSystem: getOSName(),
          deviceType: getDeviceType(),
          touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          pixelRatio: window.devicePixelRatio || 1,
          darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
          language: navigator.language || 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        })
      }).catch(telemetryErr => console.error('Failed to log failure telemetry:', telemetryErr));
    } finally {
      stageTimers.forEach(clearTimeout);
      setLoading(false);
    }
  };

  const progressIndex = stageOrder.indexOf(progress as Exclude<ProgressStage, 'idle' | 'done'>);
  const progressPercent = progress === 'done' ? 100 : progressIndex >= 0 ? ((progressIndex + 1) / stageOrder.length) * 100 : 0;
  const currentStage = progress !== 'idle' && progress !== 'done' ? stageMeta[progress] : null;

  return (
    <div className="hero-input-wrap">
      {/* ── URL input row ── */}
      <div className="hero-input-row">
        {/* Input fills the row */}
        <div className="hero-input-field">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
            placeholder="https://chatgpt.com/share/…"
            className={`input-url ${error ? 'input-error' : ''}`}
            aria-label="ChatGPT share URL"
            inputMode="url"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>

        {/* Action buttons — row on mobile, row on desktop */}
        <div className="hero-action-row">
          <button
            type="button"
            onClick={pasteFromClipboard}
            className="btn-ghost hero-btn-paste"
            aria-label="Paste URL from clipboard"
          >
            Paste
          </button>
          <button
            type="button"
            onClick={generate}
            className={`btn-primary hero-btn-generate ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span className="btn-pulse" aria-hidden />
                <span>Generating…</span>
              </span>
            ) : 'Generate PDF'}
          </button>
        </div>
      </div>

      {/* Helper text */}
      <div className="hero-helper-row">
        <span className="helper-text">Works with public ChatGPT shared links — no login required</span>
        {loading && currentStage && (
          <span className="hero-stage-label" aria-live="polite">{currentStage.label}</span>
        )}
      </div>

      {/* Status banners */}
      <div className="hero-banners">
        {progress === 'done' && (
          <div className="status-banner status-success" role="status">
            <span className="status-icon" aria-hidden>✔</span>
            <span>Your PDF is ready — download started.</span>
          </div>
        )}

        {error && (
          <div className="status-banner status-error" role="alert">
            <span className="status-icon" aria-hidden>!</span>
            <span style={{ flex: 1 }}>
              {error}{' '}
              <button
                onClick={() => setError(null)}
                className="banner-retry"
              >
                Try again
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Progress loader */}
      {loading && currentStage && (
        <div className="premium-loader" role="status" aria-live="polite">
          <div className="premium-loader-title">{currentStage.label}</div>
          <div className="premium-loader-track" aria-hidden>
            <div className="premium-loader-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="premium-loader-steps" aria-hidden>
            {stageOrder.map((stage, idx) => {
              const active = progressPercent >= ((idx + 1) / stageOrder.length) * 100;
              return <span key={stage} className={`premium-dot ${active ? 'active' : ''}`} />;
            })}
          </div>
          <div className="premium-loader-hint">{currentStage.hint}</div>
        </div>
      )}

      <style>{`
        /* ── Hero layout ── */
        .hero-input-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .hero-input-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        /* Mobile: buttons stack vertically by default */
        .hero-action-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .hero-btn-paste {
          width: 100%;
          flex: 1 1 auto;
          justify-content: center;
          min-width: 0;
        }

        .hero-btn-generate {
          width: 100%;
          flex: 1 1 auto;
          justify-content: center;
          min-width: 0;
        }

        .input-url {
          width: 100%;
          height: 52px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--color-border-strong);
          background: var(--color-neutral-50);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }

        .input-url:focus {
          outline: none;
          border: 1.5px solid var(--color-accent);
        }

        @media (max-width: 414px) {
          .input-url {
            height: 48px;
            padding: 0 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 320px) {
          .input-url {
            height: 44px;
            padding: 0 8px;
            font-size: 11px;
          }
        }

        .hero-helper-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          min-height: 20px;
        }

        .hero-stage-label {
          font-size: 11px;
          color: var(--color-accent);
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .hero-banners {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ── Status banners ── */
        .status-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: var(--radius-md);
          padding: 12px 14px;
          font-size: var(--text-sm);
          line-height: 1.5;
        }
        .status-success {
          background: var(--color-success-bg);
          border: 1px solid rgba(22,163,74,0.2);
          color: var(--color-success);
        }
        .status-error {
          background: var(--color-error-bg);
          border: 1px solid rgba(220,38,38,0.2);
          color: var(--color-error);
        }
        .status-icon {
          flex-shrink: 0;
          font-size: 13px;
          margin-top: 1px;
        }
        .banner-retry {
          background: transparent;
          border: 0;
          cursor: pointer;
          color: var(--color-error);
          text-decoration: underline;
          font-size: inherit;
          padding: 0;
          margin-left: 4px;
        }

        /* ── Progress loader ── */
        .btn-loading {
          transition: transform 220ms ease, opacity 220ms ease, background-color 220ms ease;
        }

        .btn-pulse {
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.45);
          animation: pulseDot 1.3s ease-out infinite;
          flex-shrink: 0;
        }

        .premium-loader {
          margin-top: 4px;
          width: 100%;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 14px;
          padding: 16px;
          background:
            radial-gradient(circle at 18% 22%, rgba(59, 130, 246, 0.07), transparent 40%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
          animation: fadeSlideIn 260ms ease;
          box-sizing: border-box;
        }

        .premium-loader-title {
          text-align: center;
          font-size: 0.9rem;
          color: #0f172a;
          font-weight: 550;
          letter-spacing: 0.01em;
        }

        .premium-loader-track {
          margin-top: 12px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(148, 163, 184, 0.22);
          overflow: hidden;
        }

        .premium-loader-fill {
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(90deg, #3b82f6, #0ea5e9);
          transition: width 480ms cubic-bezier(0.2, 0.65, 0.2, 1);
        }

        .premium-loader-steps {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .premium-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: rgba(100, 116, 139, 0.26);
          transition: transform 280ms ease, background-color 280ms ease;
        }

        .premium-dot.active {
          background: rgba(14, 116, 240, 0.9);
          transform: scale(1.15);
        }

        .premium-loader-hint {
          margin-top: 10px;
          text-align: center;
          font-size: 0.78rem;
          color: rgba(71, 85, 105, 0.8);
          line-height: 1.5;
        }

        @keyframes pulseDot {
          0%   { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.45); }
          100% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Desktop (641px+): side-by-side layout ── */
        @media (min-width: 641px) {
          .hero-input-row {
            flex-direction: row;
            align-items: center;
            gap: 8px;
          }

          .hero-input-field {
            flex: 1 1 auto;
            min-width: 0;
            width: auto;
          }

          .hero-action-row {
            flex-direction: row;
            flex: 0 0 auto;
            width: auto;
            gap: 8px;
          }

          .hero-btn-paste {
            width: auto;
            min-width: 80px;
            flex: 0 0 auto;
          }

          .hero-btn-generate {
            width: auto;
            flex: 0 0 auto;
            min-width: 148px;
          }

          .btn-primary,
          .btn-ghost {
            width: auto;
          }
        }

        /* ── Small phones (414px): optimize button height and spacing ── */
        @media (max-width: 414px) {
          .hero-btn-paste {
            width: 100%;
            min-width: 0;
            height: 44px;
            font-size: 13px;
            padding: 0 12px;
          }

          .hero-btn-generate {
            width: 100%;
            min-width: 0;
            height: 44px;
            font-size: 13px;
            padding: 0 12px;
          }

          .hero-action-row {
            gap: 8px;
          }
        }

        /* ── Tiny phones (max 320px): full width stacked buttons ── */
        @media (max-width: 320px) {
          .hero-btn-paste {
            width: 100%;
            min-width: 0;
            height: 40px;
            font-size: 12px;
            padding: 0 10px;
          }

          .hero-btn-generate {
            width: 100%;
            min-width: 0;
            height: 40px;
            font-size: 12px;
            padding: 0 10px;
          }

          .hero-action-row {
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}
