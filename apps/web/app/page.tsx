import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './page.css';
import Navbar from '../components/Navbar';
import HeroInputCard from '../components/HeroInputCard';
import FAQ from '../components/FAQ';
import { FAQ_ITEMS } from '../lib/seo';
import Footer from '../components/Footer';
import { siteUrl } from '../lib/branding';

export const metadata: Metadata = {
  title: 'ChatGPT Link to PDF Converter | GPTtoPDF',
  description:
    'GPTtoPDF is a free ChatGPT Link to PDF Converter. Convert shared links to PDF without login or extensions. Preserves tables, code, and math formatting.',
  keywords: [
    'chatgpt link to pdf converter',
    'chatgpt to pdf converter',
    'chat gpt link to pdf converter',
    'gpt link to pdf',
    'gpt to pdf',
    'chatgpt to pdf',
    'export chatgpt to pdf',
    'print chatgpt conversation',
    'save chatgpt conversation as pdf',
    'export chatgpt chat',
    'gpttopdf'
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: 'ChatGPT Link to PDF Converter | GPTtoPDF',
    description:
      'GPTtoPDF is a free ChatGPT Link to PDF Converter. Convert shared links to PDF without login or extensions. Preserves tables, code, and math formatting.',
    url: siteUrl,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'GPTtoPDF homepage'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT Link to PDF Converter | GPTtoPDF',
    description:
      'GPTtoPDF is a free ChatGPT Link to PDF Converter. Convert shared links to PDF without login or extensions. Preserves tables, code, and math formatting.',
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
    title: 'Paste into GPTtoPDF',
    body: 'Paste it into our ChatGPT Link to PDF Converter and click Generate.'
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
  const seoContent = `Save time and keep your AI conversations organized with GPTtoPDF. Paste a ChatGPT conversation or shared link and download a clean PDF that preserves headings, lists, code blocks, equations, and tables. No login, no extension — works on desktop and mobile.`;

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GPTtoPDF',
    url: siteUrl,
    description:
      'Convert ChatGPT conversations and shared links into clean PDFs instantly. Preserve formatting, code blocks, equations, and tables. Free, no login, works on mobile.'
  };

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GPTtoPDF',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon.png`
    }
  };

  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GPTtoPDF',
    url: siteUrl,
    description:
      'Convert ChatGPT shared links into clean downloadable PDFs without installing anything. Mobile-friendly and free to use.',
    applicationCategory: 'UtilitiesApplication',
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
              <h1 className="hero-headline">Convert ChatGPT Links & Conversations to PDF</h1>

              <p className="hero-subtext">
                GPTtoPDF is a free ChatGPT Link to PDF Converter. Paste a shared link 
                or conversation and instantly get a clean PDF with code blocks, 
                equations, and tables preserved. No login or extension required.
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

        <section id="demo" className="site-container home-section section-wide video-section">
          <div className="section-intro">
            <h2 className="section-heading">
              <Link href="/video/how-to-convert-chatgpt-to-pdf" style={{ color: 'inherit', textDecoration: 'none' }} title="Watch the product demonstration video">
                See how gpttopdf.site works
              </Link>
            </h2>
            <p className="seo-body">From a ChatGPT shared link to a clean, downloadable PDF.</p>
          </div>
          
          <div className="video-container">
            <video 
              controls 
              preload="none" 
              playsInline 
              width="1280" 
              height="720"
              poster="/og-image.png"
            >
              <source src="/video/gpttopdf-demo.webm" type="video/webm" />
              {/* Fallback mp4 will be added here once generated via ffmpeg */}
              {/* <source src="/video/gpttopdf-demo.mp4" type="video/mp4" /> */}
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        <section id="why" className="site-container home-section section-wide">
          <div className="section-intro">
            <p className="section-kicker">Why GPTtoPDF</p>
            <h2 className="section-heading">Why Use GPTtoPDF Instead of Browser Print?</h2>
            <p className="seo-body">{seoContent}</p>
          </div>

          <div className="comparison-card card" role="table" aria-label="GPT to PDF vs Browser Print">
            <div className="comparison-grid comparison-header" role="row">
              <div role="columnheader">Feature</div>
              <div role="columnheader">GPTtoPDF</div>
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
              GPTtoPDF helps students, developers, researchers, consultants, and teams convert AI conversations into clean,
              shareable PDFs. Built to export ChatGPT to PDF effortlessly — expanding to more AI models soon.
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
              Explore our guides to learn more about <Link href="/save-chatgpt-conversation-as-pdf" className="link">saving your conversations securely</Link>,{' '}
              <Link href="/export-chatgpt-chat" className="link">exporting chats for offline use</Link>, or converting <Link href="/chatgpt-shared-link-to-pdf" className="link">shared links directly</Link>{' '}
              <Link href="/chatgpt-to-pdf-no-extension" className="link">without installing browser extensions</Link>.
              {' '}
              If you're wondering why native options often break, read our technical breakdown on <Link href="/why-chatgpt-export-is-hard" className="link">why exporting is hard</Link>.
              {' '}
              You can also learn the best methods to <Link href="/print-chatgpt-conversation" className="link">print threads</Link>, build a <Link href="/chatgpt-conversation-archive" className="link">personal archive</Link>, or use a dedicated <Link href="/chatgpt-export-tool" className="link">export tool</Link> in our complete guide on <Link href="/how-to-save-chatgpt-conversations" className="link">how to save AI discussions</Link>.
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

    </div>
  );
}
