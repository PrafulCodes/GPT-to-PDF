import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import HeroInputCard from '../components/HeroInputCard';
import FAQ from '../components/FAQ';
import { FAQ_ITEMS } from '../lib/seo';
import Footer from '../components/Footer';
import { siteUrl } from '../lib/branding';

export const metadata: Metadata = {
  title: 'ChatGPT to PDF Converter | Save & Export Chats | GPT to PDF',
  description:
    'Paste a ChatGPT shared link or conversation and convert it into a clean PDF for saving, exporting, printing, or archiving. No extension, no login, works on mobile.',
  keywords: [
    'chatgpt to pdf',
    'convert chatgpt to pdf',
    'save chatgpt conversation as pdf',
    'export chatgpt chat',
    'chatgpt shared link to pdf',
    'chatgpt to pdf without extension'
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: 'ChatGPT to PDF Converter | Save & Export Chats | GPT to PDF',
    description:
      'Paste a ChatGPT shared link or conversation and convert it into a clean PDF for saving, exporting, printing, or archiving.',
    url: siteUrl,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'GPT to PDF homepage'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT to PDF Converter | Save & Export Chats | GPT to PDF',
    description:
      'Paste a ChatGPT shared link or conversation and convert it into a clean PDF for saving, exporting, printing, or archiving.',
    images: [`${siteUrl}/og-image.png`]
  }
};

const trustChips = [
  'No login required',
  'No Chrome extension',
  'Works on mobile',
  'Formatting preserved',
  'Private & secure'
];

const comparisonRows = [
  {
    feature: 'Formatting quality',
    gpt: 'High - preserves styles and structure',
    print: 'Often broken or inconsistent'
  },
  {
    feature: 'Code blocks',
    gpt: 'Rendered and syntax-friendly',
    print: 'Often clipped or misformatted'
  },
  {
    feature: 'Equations',
    gpt: 'Preserved as readable math',
    print: 'May render poorly'
  },
  {
    feature: 'Mobile support',
    gpt: 'Designed to work on mobile',
    print: 'Print dialogs vary by device'
  },
  {
    feature: 'Shared links',
    gpt: 'Converts public share links directly',
    print: 'Manual steps required'
  },
  {
    feature: 'Ease of export',
    gpt: 'One-click export flow',
    print: 'Multiple dialog steps'
  }
];

const howCards = [
  {
    step: '01',
    title: 'Copy ChatGPT conversation',
    body: 'Copy the ChatGPT conversation or shared link.'
  },
  {
    step: '02',
    title: 'Paste into GPT to PDF',
    body: 'Paste it into GPT to PDF and click Generate.'
  },
  {
    step: '03',
    title: 'Download formatted PDF',
    body: 'Download a beautifully formatted PDF with code, equations, and tables preserved.'
  }
];

const personas = [
  {
    title: 'Students',
    body: 'Save study chats, summaries, and research notes in a clean PDF archive.'
  },
  {
    title: 'Developers',
    body: 'Keep prompts, code snippets, and debugging threads readable and shareable.'
  },
  {
    title: 'Researchers',
    body: 'Turn long AI conversations into organized references you can revisit later.'
  },
  {
    title: 'Consultants',
    body: 'Package client-ready outputs from AI sessions without extra formatting work.'
  },
  {
    title: 'Teams',
    body: 'Share knowledge from public ChatGPT links in a consistent format.'
  }
];

const privacyChecks = [
  'No login',
  'No extension',
  'No unnecessary permissions',
  "We don't store chats"
];

export default function Page() {
  const seoContent = `Save time and keep your AI conversations organized. Paste a ChatGPT conversation or a shared link and download a clean PDF that preserves headings, lists, code blocks, equations, and tables. No login, no extension — works on desktop and mobile.`;

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GPT to PDF',
    url: siteUrl,
    description:
      'Convert ChatGPT conversations and shared links into clean PDFs instantly. Preserve formatting, code blocks, equations, and tables. Free, no login, works on mobile.'
  };

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GPT to PDF',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon.png`
    }
  };

  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GPT to PDF',
    url: siteUrl,
    description:
      'Convert ChatGPT shared links into clean downloadable PDFs without installing anything. Mobile-friendly and free to use.',
    applicationCategory: 'Tools',
    operatingSystem: 'Web'
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  return (
    <div className="home-page">
      <Navbar />

      <main>
        <section id="hero" className="site-container home-section hero-section">
          <div className="hero-inner">
            <div className="hero-badge">FREE • NO LOGIN • MOBILE FRIENDLY</div>

            <div className="hero-copy">
              <h1 className="hero-headline">Convert ChatGPT Conversations to PDF in One Click</h1>

              <p className="hero-subtext">
                Paste a ChatGPT conversation or shared link and instantly get a clean,
                formatted PDF with code blocks, equations, tables, and original
                formatting preserved. No login. No Chrome extension. Works on mobile.
              </p>
            </div>

            <div className="hero-card-wrap card hero-card">
              <HeroInputCard />
            </div>

            <div className="trust-chip-row" role="list" aria-label="Trust features">
              {trustChips.map((chip) => (
                <span key={chip} role="listitem" className="trust-chip">
                  <span aria-hidden="true" className="trust-chip-icon">✓</span>
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="site-container home-section section-wide">
          <div className="section-intro">
            <p className="section-kicker">Why GPT to PDF</p>
            <h2 className="section-heading">Why Use GPT to PDF Instead of Browser Print?</h2>
            <p className="seo-body">{seoContent}</p>
          </div>

          <div className="comparison-card card" role="table" aria-label="GPT to PDF vs Browser Print">
            <div className="comparison-grid comparison-header" role="row">
              <div role="columnheader">Feature</div>
              <div role="columnheader">GPT to PDF</div>
              <div role="columnheader">Browser Print</div>
            </div>

            {comparisonRows.map((row) => (
              <div key={row.feature} className="comparison-grid comparison-row" role="row">
                <div role="cell" className="comparison-feature">{row.feature}</div>
                <div role="cell" className="comparison-positive">
                  <span aria-hidden="true">✓</span>
                  <span>{row.gpt}</span>
                </div>
                <div role="cell" className="comparison-negative">
                  <span aria-hidden="true">✕</span>
                  <span>{row.print}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="site-container home-section section-wide">
          <div className="section-intro">
            <p className="section-kicker">How it works</p>
            <h2 className="section-heading">How to Save ChatGPT Conversations as PDF</h2>
          </div>

          <div className="step-grid">
            {howCards.map((card) => (
              <article key={card.step} className="step-card card">
                <div className="step-number">{card.step}</div>
                <h3 className="step-title">{card.title}</h3>
                <p className="step-body">{card.body}</p>
              </article>
            ))}
          </div>

          <p className="how-note">
            Use this flow to save, archive, or share AI conversations — whether you want to convert ChatGPT to PDF, export ChatGPT chat, or save chatgpt conversation as pdf for offline review.
          </p>
        </section>

        <section id="authority" className="site-container home-section section-wide">
          <div className="section-intro">
            <p className="section-kicker">Built for AI conversations</p>
            <h2 className="section-heading">Built for AI Conversations</h2>
            <p className="seo-body">
              GPT to PDF helps students, developers, researchers, consultants, and teams convert AI conversations into clean,
              shareable PDFs. Built for ChatGPT today — expanding to more AI models soon.
            </p>
          </div>

          <div className="persona-grid">
            {personas.map((persona) => (
              <article key={persona.title} className="persona-card card">
                <h3 className="persona-title">{persona.title}</h3>
                <p className="persona-body">{persona.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="privacy" className="site-container home-section section-wide">
          <div className="privacy-card card">
            <div className="section-intro privacy-intro">
              <p className="section-kicker">Privacy first</p>
              <h2 className="section-heading">Privacy First</h2>
              <p className="seo-body">
                No login, no browser extension, and no unnecessary permissions. We fetch public shared pages to generate PDFs and do not store
                your conversations. Your content is processed only to produce the PDF and then discarded.
              </p>
            </div>

            <div className="privacy-checklist" role="list" aria-label="Privacy benefits">
              {privacyChecks.map((item) => (
                <div key={item} role="listitem" className="privacy-check-item">
                  <span aria-hidden="true" className="privacy-check-icon">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="related-pages" className="site-container home-section section-wide">
          <div className="section-intro">
            <p className="section-kicker">Related pages</p>
            <h2 className="section-heading">ChatGPT export pages</h2>
            <p className="seo-body">
              Explore the focused pages for <a href="/save-chatgpt-conversation-as-pdf" className="link">save ChatGPT conversation as PDF</a>,{' '}
              <a href="/export-chatgpt-chat" className="link">export ChatGPT chat</a>,{' '}
              <a href="/chatgpt-to-pdf-no-extension" className="link">ChatGPT to PDF without extension</a>, and{' '}
              <a href="/chatgpt-shared-link-to-pdf" className="link">ChatGPT shared link to PDF</a>.
              {' '}
              For why the export workflow matters, read <a href="/why-chatgpt-export-is-hard" className="link">why ChatGPT export is hard</a>.
              {' '}
              Learn how to <a href="/print-chatgpt-conversation" className="link">print ChatGPT conversation</a>, build a <a href="/chatgpt-conversation-archive" className="link">chatgpt conversation archive</a>, use the <a href="/chatgpt-export-tool" className="link">chatgpt export tool</a>, and follow <a href="/how-to-save-chatgpt-conversations" className="link">how to save ChatGPT conversations</a>.
            </p>
          </div>
        </section>

        <FAQ />

        <Footer />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      </main>

      <style>{`
        .home-page {
          background:
            radial-gradient(circle at top, rgba(29, 78, 216, 0.04), transparent 36%),
            linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
        }

        .home-section {
          max-width: 1120px;
          margin-top: clamp(88px, 10vw, 128px);
        }

        .section-wide {
          width: 100%;
        }

        .section-intro {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }

        .section-kicker {
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text-tertiary);
        }

        .hero-section {
          margin-top: clamp(24px, 3vw, 40px);
          padding-top: clamp(24px, 3vw, 32px);
          padding-bottom: 0;
          text-align: center;
        }

        .hero-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.82);
          color: #334155;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.04);
        }

        .hero-copy {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .hero-headline {
          font-size: clamp(34px, 4.4vw, 60px);
          font-weight: 600;
          letter-spacing: -0.05em;
          max-width: 14ch;
          margin: 0;
          line-height: 1.04;
          color: var(--color-text-primary);
        }

        .hero-subtext {
          font-size: clamp(15px, 1.2vw, 18px);
          color: var(--color-text-secondary);
          max-width: 60ch;
          margin: 0;
          line-height: 1.7;
        }

        .hero-card-wrap {
          width: 100%;
          max-width: 920px;
        }

        .hero-card {
          padding: clamp(18px, 2vw, 28px);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
        }

        .trust-chip-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-top: 4px;
        }

        .trust-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
          color: #334155;
          font-size: 13px;
          line-height: 1;
        }

        .trust-chip-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          font-size: 11px;
          flex-shrink: 0;
        }

        .section-heading {
          font-size: clamp(24px, 2.5vw, 36px);
          font-weight: 600;
          letter-spacing: -0.04em;
          margin: 0;
          line-height: 1.12;
        }

        .seo-body {
          color: var(--color-text-secondary);
          font-size: clamp(14px, 1.1vw, 16px);
          line-height: 1.7;
          margin: 0;
          max-width: 68ch;
        }

        .comparison-card,
        .privacy-card {
          padding: clamp(20px, 2.4vw, 30px);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.05);
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr 1fr;
          gap: 16px;
          align-items: center;
        }

        .comparison-header {
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .comparison-row {
          padding: 18px 0;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .comparison-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .comparison-feature {
          font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .comparison-positive,
        .comparison-negative {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          line-height: 1.6;
        }

        .comparison-positive {
          color: #0f766e;
        }

        .comparison-negative {
          color: #64748b;
        }

        .comparison-positive span:first-child {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          flex-shrink: 0;
          font-size: 12px;
          margin-top: 1px;
        }

        .comparison-negative span:first-child {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: rgba(148, 163, 184, 0.14);
          color: #94a3b8;
          flex-shrink: 0;
          font-size: 12px;
          margin-top: 1px;
        }

        .step-grid,
        .persona-grid {
          display: grid;
          gap: 16px;
        }

        .step-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .persona-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
          margin-top: 24px;
        }

        .step-card,
        .persona-card {
          padding: 22px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          background: rgba(29, 78, 216, 0.08);
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }

        .step-title,
        .persona-title {
          margin: 0 0 10px;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
          color: var(--color-text-primary);
        }

        .step-body,
        .persona-body {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 14px;
          line-height: 1.65;
        }

        .how-note {
          margin: 18px 0 0;
          color: var(--color-text-secondary);
          font-size: 14px;
          line-height: 1.7;
          max-width: 72ch;
        }

        .privacy-card {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
          gap: 24px;
          align-items: center;
          background:
            radial-gradient(circle at top right, rgba(29, 78, 216, 0.05), transparent 30%),
            rgba(255, 255, 255, 0.92);
        }

        .privacy-intro {
          margin-bottom: 0;
        }

        .privacy-checklist {
          display: grid;
          gap: 12px;
        }

        .privacy-check-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(249, 250, 251, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.06);
          color: var(--color-text-primary);
          font-size: 14px;
          line-height: 1.5;
        }

        .privacy-check-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .persona-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .hero-section {
            margin-top: 24px;
            padding-top: 32px;
            text-align: center;
          }

          .hero-inner {
            gap: 14px;
          }

          .hero-headline {
            font-size: clamp(28px, 8vw, 38px);
            max-width: 100%;
          }

          .hero-subtext {
            font-size: 15px;
            max-width: 100%;
          }

          .trust-chip-row {
            justify-content: flex-start;
          }

          .section-intro {
            margin-bottom: 20px;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .comparison-header {
            display: none;
          }

          .comparison-row {
            padding: 16px 0;
          }

          .comparison-feature {
            margin-bottom: 4px;
          }

          .step-grid,
          .persona-grid {
            grid-template-columns: 1fr;
          }

          .privacy-card {
            grid-template-columns: 1fr;
          }

          .hero-card {
            padding: 16px;
            border-radius: 20px;
          }
        }
      `}</style>
    </div>
  );
}
