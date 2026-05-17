'use client';
import React, { useState } from 'react';
import { parseContentDispositionFileName } from '../lib/pdf-filename';

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

    const stageTimers: Array<ReturnType<typeof setTimeout>> = [];
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

      setProgress('done');
      setTimeout(() => setProgress('idle'), 1800);
    } catch {
      setError('PDF generation failed. Please try again.');
      setProgress('idle');
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

        .hero-input-field {
          width: 100%;
        }

        .hero-action-row {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .hero-btn-paste {
          flex: 0 0 auto;
          min-width: 88px;
        }

        .hero-btn-generate {
          flex: 1 1 auto;
          justify-content: center;
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

        /* ── Desktop: side-by-side input + buttons ── */
        @media (min-width: 641px) {
          .hero-input-row {
            flex-direction: row;
            align-items: center;
          }

          .hero-input-field {
            flex: 1 1 auto;
            min-width: 0;
          }

          .hero-action-row {
            flex: 0 0 auto;
            width: auto;
          }

          .hero-btn-paste {
            min-width: 80px;
          }

          .hero-btn-generate {
            flex: 0 0 auto;
            min-width: 148px;
          }

          .btn-primary,
          .btn-ghost {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
}
