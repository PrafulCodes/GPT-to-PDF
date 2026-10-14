'use client';
import React, { useState, useEffect, useRef } from 'react';
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



type ExportStatus = 'idle' | 'loading' | 'done';
type ExportStats = {
  messages: number;
  equations: number;
  codeBlocks: number;
  tables: number;
  blockquotes: number;
};

const KITTEN_MESSAGES = [
  'Kitten is organizing your conversation 🐈',
  'Untangling those equations...',
  'Your PDF is getting its finishing touches.'
];

const LONG_CONVERSATION_NOTICE_DELAY_MS = 4000;
const EXTENDED_WAIT_NOTICE_DELAY_MS = 10000;

export function formatElapsedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0
    ? `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`
    : `${remainingSeconds}s`;
}

export function getExportErrorMessage(payload: unknown, fallback = 'PDF generation failed. Please try again.') {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.trim()
  ) {
    return payload.message;
  }

  return fallback;
}

export function getLoadingNotice(elapsedSeconds: number) {
  if (elapsedSeconds >= EXTENDED_WAIT_NOTICE_DELAY_MS / 1000) {
    return 'Still working — please keep this page open while your PDF is prepared.';
  }

  if (elapsedSeconds >= LONG_CONVERSATION_NOTICE_DELAY_MS / 1000) {
    return "This conversation is very long. We're processing it into a PDF, which may take a little longer.";
  }

  return null;
}

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
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showLongNotice, setShowLongNotice] = useState(false);
  const [showExtendedWaitNotice, setShowExtendedWaitNotice] = useState(false);
  const [exportStats, setExportStats] = useState<ExportStats | null>(null);
  const [kittenMessage, setKittenMessage] = useState(KITTEN_MESSAGES[0]);
  const mountedRef = useRef(true);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
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
      deviceType: getDeviceType(),
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      localHour: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };

    // Post pageview telemetry
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetryPayload)
    }).catch(err => console.error('Failed to log pageview telemetry:', err));

    return () => {
      mountedRef.current = false;
      requestControllerRef.current?.abort();
    };
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

    const controller = new AbortController();
    requestControllerRef.current = controller;
    setLoading(true);
    setExportStatus('loading');
    setElapsedSeconds(0);
    setShowLongNotice(false);
    setShowExtendedWaitNotice(false);
    setExportStats(null);
    setKittenMessage(KITTEN_MESSAGES[0]);

    const startedAt = Date.now();
    const elapsedTimer = setInterval(() => {
      if (!mountedRef.current) return;
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed * 1000 >= LONG_CONVERSATION_NOTICE_DELAY_MS) setShowLongNotice(true);
      if (elapsed * 1000 >= EXTENDED_WAIT_NOTICE_DELAY_MS) setShowExtendedWaitNotice(true);
    }, 1000);
    const messageTimer = setInterval(() => {
      if (!mountedRef.current) return;
      setKittenMessage((current) => {
        const index = KITTEN_MESSAGES.indexOf(current);
        return KITTEN_MESSAGES[(index + 1) % KITTEN_MESSAGES.length];
      });
    }, 4200);

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
        signal: controller.signal
      });

      if (!res.ok) {
        let payload: unknown = null;
        try {
          payload = await res.json();
        } catch {
          // Use the generic fallback below for non-JSON responses.
        }
        throw new Error(getExportErrorMessage(payload));
      }

      const blob = await res.blob();
      if (!mountedRef.current) return;
      const statsHeader = res.headers.get('x-pdf-stats');
      if (statsHeader) {
        try {
          const stats = JSON.parse(statsHeader) as ExportStats;
          if (Number.isFinite(stats.messages)) setExportStats(stats);
        } catch {
          // Stats are optional metadata; the download remains valid without them.
        }
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = parseContentDispositionFileName(res.headers.get('content-disposition')) || 'conversation.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);

      setExportStatus('done');
      setTimeout(() => {
        if (mountedRef.current) setExportStatus('idle');
      }, 1800);

    } catch (err: unknown) {
      if (!mountedRef.current || (err instanceof DOMException && err.name === 'AbortError')) return;
      setError(err instanceof Error && err.message ? err.message : 'PDF generation failed. Please try again.');
      setExportStatus('idle');
      setExportStats(null);

    } finally {
      clearInterval(elapsedTimer);
      clearInterval(messageTimer);
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
      if (mountedRef.current) setLoading(false);
    }
  };

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
        {loading && (
          <span className="hero-stage-label" aria-live="polite">
            Exporting with care
          </span>
        )}
      </div>

      {/* Status banners */}
      <div className="hero-banners">
        {exportStatus === 'done' && (
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
                onClick={() => {
                  setError(null);
                  void generate();
                }}
                className="banner-retry"
              >
                Try again
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Progress loader */}
      {loading && (
        <div className="premium-loader" role="status" aria-live="polite" aria-atomic="true">
          <div className="premium-loader-heading">
            <div>
              <div className="premium-loader-eyebrow">PDF KITTEN WORKSHOP</div>
              <div className="premium-loader-title">{kittenMessage}</div>
            </div>
            <button type="button" className="premium-loader-cancel" onClick={() => requestControllerRef.current?.abort()}>
              Cancel
            </button>
          </div>
          <div className="kitten-scene" aria-hidden="true">
            <div className="kitten-cloud cloud-one" />
            <div className="kitten-cloud cloud-two" />
            <div className="kitten">
              <div className="kitten-ear ear-left" />
              <div className="kitten-ear ear-right" />
              <div className="kitten-face"><i className="eye eye-left" /><i className="eye eye-right" /><i className="nose" /></div>
              <div className="kitten-body"><span className="paw paw-left" /><span className="paw paw-right" /></div>
              <div className="kitten-tail" />
            </div>
            <div className="tiny-laptop"><span>~ ~ ~</span></div>
          </div>
          <div className="premium-loader-track" aria-hidden="true">
            <div className="premium-loader-indicator" />
          </div>
          <div className="premium-loader-preservation" aria-label="Content preservation checklist">
            <span><i aria-hidden>✓</i> Message order</span>
            <span><i aria-hidden>✓</i> Formatting</span>
            <span><i aria-hidden>✓</i> Equations and code</span>
          </div>
          <div className="premium-loader-hint">No fake percentages — we’ll let you know when your download is ready.</div>

          {exportStats && (
            <div className="premium-loader completed-stats" role="status">
              <div className="premium-loader-eyebrow">PRESERVED IN YOUR PDF</div>
              <div className="stats-grid">
                <span><strong>{exportStats.messages}</strong> messages</span>
                <span><strong>{exportStats.equations}</strong> equations</span>
                <span><strong>{exportStats.codeBlocks}</strong> code blocks</span>
                <span><strong>{exportStats.tables}</strong> tables</span>
              </div>
            </div>
          )}
          {showExtendedWaitNotice && (
            <div className="premium-loader-hint">{getLoadingNotice(elapsedSeconds)}</div>
          )}
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
          font-size: 0.9rem;
          color: #0f172a;
          font-weight: 550;
          letter-spacing: 0.01em;
        }

        .premium-loader-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .premium-loader-eyebrow {
          color: #2563eb;
          font-size: 0.66rem;
          font-weight: 750;
          letter-spacing: 0.14em;
        }

        .premium-loader-subtitle {
          margin-top: 6px;
          color: #475569;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .kitten-scene {
          position: relative;
          height: 92px;
          margin: 12px 0 4px;
          overflow: hidden;
          border-radius: 12px;
          background: linear-gradient(180deg, #e0f2fe, #f8fafc);
        }

        .kitten-cloud {
          position: absolute;
          width: 42px;
          height: 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.8);
          animation: cloudDrift 8s linear infinite;
        }
        .cloud-one { top: 17px; left: 12%; }
        .cloud-two { top: 34px; left: 68%; animation-delay: -4s; transform: scale(.7); }
        .kitten {
          position: absolute;
          left: 50%;
          bottom: 10px;
          width: 72px;
          height: 58px;
          transform: translateX(-58%);
          animation: kittenWork 1.8s ease-in-out infinite;
        }
        .kitten-face {
          position: absolute;
          z-index: 2;
          top: 9px;
          left: 17px;
          width: 38px;
          height: 31px;
          border-radius: 48% 48% 45% 45%;
          background: #f59e0b;
          box-shadow: inset 0 -4px 0 rgba(180,83,9,.15);
        }
        .kitten-ear {
          position: absolute;
          z-index: 1;
          top: 1px;
          width: 20px;
          height: 22px;
          background: #d97706;
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
        }
        .ear-left { left: 14px; transform: rotate(-16deg); }
        .ear-right { right: 12px; transform: rotate(16deg); }
        .eye { position: absolute; top: 12px; width: 4px; height: 6px; border-radius: 50%; background: #1e293b; }
        .eye-left { left: 10px; } .eye-right { right: 10px; }
        .nose { position: absolute; left: 17px; top: 20px; width: 5px; height: 4px; border-radius: 50%; background: #be123c; }
        .kitten-body { position: absolute; bottom: 0; left: 14px; width: 44px; height: 31px; border-radius: 50% 50% 35% 35%; background: #f59e0b; }
        .paw { position: absolute; bottom: -3px; width: 15px; height: 9px; border-radius: 50%; background: #fbbf24; }
        .paw-left { left: 5px; } .paw-right { right: 5px; }
        .kitten-tail { position: absolute; right: 0; bottom: 7px; width: 26px; height: 30px; border: 5px solid #d97706; border-left: 0; border-bottom-color: transparent; border-radius: 0 24px 0 0; transform: rotate(20deg); }
        .tiny-laptop { position: absolute; left: 50%; bottom: 6px; width: 29px; height: 19px; border: 3px solid #64748b; border-radius: 3px; background: #dbeafe; transform: translateX(14px); color: #2563eb; font-size: 7px; text-align: center; line-height: 16px; }
        .tiny-laptop:after { content: ''; position: absolute; left: -6px; bottom: -6px; width: 41px; height: 4px; border-radius: 50%; background: #64748b; }
        @keyframes kittenWork { 0%,100% { transform: translateX(-58%) translateY(0); } 50% { transform: translateX(-58%) translateY(-3px); } }
        @keyframes cloudDrift { from { margin-left: -8px; } to { margin-left: 8px; } }

        .premium-loader-cancel {
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          background: #fff;
          color: #334155;
          cursor: pointer;
          font-size: 0.72rem;
          padding: 5px 10px;
        }

        .premium-loader-track {
          margin-top: 12px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(148, 163, 184, 0.22);
          overflow: hidden;
        }

        .premium-loader-indicator {
          height: 100%;
          width: 35%;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, #3b82f6, #0ea5e9, transparent);
          animation: indeterminateProgress 1.4s ease-in-out infinite;
        }

        .premium-loader-elapsed {
          margin-top: 10px;
          text-align: center;
          font-size: 0.78rem;
          color: rgba(71, 85, 105, 0.8);
          font-variant-numeric: tabular-nums;
        }

        .premium-loader-preservation {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          margin-top: 13px;
          color: #475569;
          font-size: 0.73rem;
        }

        .premium-loader-preservation i {
          color: #2563eb;
          font-style: normal;
          font-weight: 700;
          margin-right: 4px;
        }

        .completed-stats {
          animation: fadeSlideIn 260ms ease;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
          color: #475569;
          font-size: 0.78rem;
        }

        .stats-grid strong {
          color: #0f172a;
          font-size: 1rem;
          margin-right: 4px;
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

        @keyframes indeterminateProgress {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(290%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .btn-pulse,
          .premium-loader-indicator,
          .kitten,
          .kitten-cloud {
            animation: none;
          }
          .premium-loader-indicator {
            width: 100%;
            background: #3b82f6;
          }
          .completed-stats {
            animation: none;
          }
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
