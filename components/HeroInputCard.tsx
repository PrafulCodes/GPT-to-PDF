'use client';
import React, { useState } from 'react';

type ProgressStage = 'idle' | 'fetching' | 'formatting' | 'generating' | 'preparing' | 'done';

const stageMeta: Record<Exclude<ProgressStage, 'idle' | 'done'>, { label: string; hint: string }> = {
  fetching: {
    label: 'Fetching conversation...',
    hint: 'Longer chats may take slightly longer to convert.'
  },
  formatting: {
    label: 'Formatting content...',
    hint: 'Longer chats may take slightly longer to convert.'
  },
  generating: {
    label: 'Generating premium PDF...',
    hint: 'Longer chats may take slightly longer to convert.'
  },
  preparing: {
    label: 'Preparing download...',
    hint: 'Longer chats may take slightly longer to convert.'
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
    } catch (err) {
      setError('Unable to access clipboard');
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

    if (loading) return; // prevent duplicate clicks

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
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to generate PDF');
      }

      setProgress('preparing');

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'conversation.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);

      setProgress('done');
      setTimeout(() => setProgress('idle'), 1200);
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
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
    <div className="site-container">
      <div className="card max-w-full mx-auto" style={{maxWidth:'var(--max-width)'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
          <div>
            <div className="badge-eyebrow">Free · No signup · No extension</div>
          </div>

          <div>
            <h3 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--weight-medium)',margin:0,letterSpacing:'-0.03em'}}>Export ChatGPT Conversations to PDF</h3>
            <p style={{fontSize:'var(--text-base)',color:'var(--color-text-secondary)',marginTop:'var(--space-3)',maxWidth:540}}>Paste a public ChatGPT share link. Get a clean, formatted PDF instantly.</p>
          </div>

          <div style={{marginTop:'var(--space-6)'}}>
            <div style={{display:'flex',gap:'var(--space-2)',alignItems:'center',flexWrap:'wrap'}}>
              <div style={{flex:1,position:'relative'}}>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
                  placeholder="https://chatgpt.com/share/..."
                  className={`input-url ${error ? 'input-error' : ''}`}
                  aria-label="ChatGPT share URL"
                  inputMode="url"
                />
              </div>

              <div style={{display:'flex',gap:'var(--space-2)',alignItems:'center'}}>
                <button type="button" onClick={pasteFromClipboard} className="btn-ghost" style={{minWidth:96}}>Paste</button>
                <button
                  type="button"
                  onClick={generate}
                  className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <span className="btn-pulse" />
                      <span>Generating...</span>
                    </span>
                  ) : 'Generate PDF'}
                </button>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'var(--space-2)'}}>
              <div className="helper-text">Works with public ChatGPT shared links - no login required</div>
              <div style={{ minHeight: 20 }} aria-live="polite">{loading ? currentStage?.label || 'Working...' : ''}</div>
            </div>

            {/* Success / Error banners */}
            <div style={{marginTop:'var(--space-3)'}}>
              {progress === 'done' && (
                <div style={{background:'var(--color-success-bg)',border:`1px solid rgba(22,163,74,0.2)`,borderRadius:'var(--radius-md)',padding:'var(--space-3) var(--space-4)',display:'flex',alignItems:'center',gap:12,color:'var(--color-success)',fontSize:'var(--text-sm)'}} role="status">
                  <span style={{width:16,height:16,display:'inline-block',borderRadius:8,background:'transparent'}} aria-hidden>✔</span>
                  <div>PDF ready — download started</div>
                </div>
              )}

              {error && (
                <div role="alert" style={{background:'var(--color-error-bg)',border:`1px solid rgba(220,38,38,0.2)`,borderRadius:'var(--radius-md)',padding:'var(--space-3) var(--space-4)',display:'flex',alignItems:'center',gap:12,color:'var(--color-error)',fontSize:'var(--text-sm)'}}>
                  <span style={{width:16,height:16,display:'inline-block'}} aria-hidden>!</span>
                  <div style={{flex:1}}>{error} <button onClick={() => setError(null)} style={{marginLeft:12,textDecoration:'underline',color:'var(--color-error)',background:'transparent',border:0,cursor:'pointer'}}>Try again</button></div>
                </div>
              )}
            </div>

            <div style={{ minHeight: 150, marginTop: 'var(--space-4)' }}>
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
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .btn-loading {
          min-width: 164px;
          transition: transform 220ms ease, opacity 220ms ease, background-color 220ms ease;
        }

        .btn-pulse {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.45);
          animation: pulseDot 1.3s ease-out infinite;
        }

        .premium-loader {
          margin: 6px auto 0;
          max-width: 580px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 16px;
          padding: 16px 18px;
          background:
            radial-gradient(circle at 18% 22%, rgba(59, 130, 246, 0.09), transparent 35%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(2px);
          animation: fadeSlideIn 280ms ease;
        }

        .premium-loader-title {
          text-align: center;
          font-size: 0.95rem;
          color: #0f172a;
          font-weight: 550;
          letter-spacing: 0.01em;
          transition: opacity 260ms ease, transform 260ms ease;
        }

        .premium-loader-track {
          margin-top: 12px;
          height: 8px;
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
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(100, 116, 139, 0.26);
          transform: scale(1);
          transition: transform 280ms ease, background-color 280ms ease;
        }

        .premium-dot.active {
          background: rgba(14, 116, 240, 0.9);
          transform: scale(1.08);
        }

        .premium-loader-hint {
          margin-top: 10px;
          text-align: center;
          font-size: 0.82rem;
          color: rgba(71, 85, 105, 0.88);
        }

        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.45); }
          100% { box-shadow: 0 0 0 9px rgba(255, 255, 255, 0); }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .premium-loader {
            border-radius: 14px;
            padding: 14px;
          }

          .btn-loading {
            min-width: 148px;
          }
        }
      `}</style>
    </div>
  );
}
