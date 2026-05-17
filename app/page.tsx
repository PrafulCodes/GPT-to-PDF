import React from 'react';
import Navbar from '../components/Navbar';
import HeroInputCard from '../components/HeroInputCard';
import TrustStrip from '../components/TrustStrip';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import { FAQ_ITEMS } from '../lib/seo';
import Footer from '../components/Footer';

const siteUrl = 'https://gpt-to-pdf-six.vercel.app';

export default function Page() {
  const seoContent = `Save time and keep your conversations organized. No extension needed — simply paste a public ChatGPT share link and download a clean PDF that preserves headings, lists, code blocks, and tables. This mobile-friendly converter works in any browser and requires no signup or account.`;

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GPT to PDF',
    url: siteUrl,
    description:
      'Paste any ChatGPT shared link and download a clean, formatted PDF in seconds. No extension, no signup, works on mobile. Free forever.'
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
    <div>
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section id="hero" className="site-container hero-section">
          <div className="hero-inner">
            <div className="badge-eyebrow">Free · No signup · No extension</div>

            <h1 className="hero-headline">
              Export ChatGPT Conversations to PDF
            </h1>

            <p className="hero-subtext">
              Paste a public ChatGPT share link. Get a clean, formatted PDF instantly.
            </p>

            <div className="hero-card-wrap">
              <HeroInputCard />
            </div>

            <TrustStrip />
          </div>
        </section>

        {/* ── Why use GPT to PDF ── */}
        <section id="seo" className="site-container seo-section">
          <h2 className="section-heading">Why use GPT to PDF?</h2>
          <p className="seo-body">{seoContent}</p>
        </section>

        <HowItWorks />

        <section className="site-container">
          <FAQ />
        </section>

        <Footer />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      </main>

      <style>{`
        /* Hero section */
        .hero-section {
          padding-top: var(--space-16);
          padding-bottom: var(--space-6);
          text-align: center;
        }

        .hero-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }

        .hero-headline {
          font-size: var(--text-2xl);
          font-weight: var(--weight-medium);
          letter-spacing: -0.03em;
          max-width: 540px;
          margin: 0;
          line-height: 1.2;
          color: var(--color-text-primary);
        }

        .hero-subtext {
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          max-width: 420px;
          margin: 0;
          line-height: 1.6;
        }

        .hero-card-wrap {
          width: 100%;
          max-width: var(--max-width);
          margin-top: var(--space-4);
        }

        /* SEO section */
        .seo-section {
          padding-top: var(--space-6);
          padding-bottom: var(--space-6);
        }

        .section-heading {
          font-size: var(--text-md);
          font-weight: var(--weight-medium);
          margin: 0 0 var(--space-2);
        }

        .seo-body {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          line-height: 1.7;
          margin: 0;
        }

        /* Mobile overrides */
        @media (max-width: 640px) {
          .hero-section {
            padding-top: var(--space-10);
            padding-bottom: var(--space-4);
            text-align: left;
          }

          .hero-inner {
            align-items: flex-start;
            gap: var(--space-3);
          }

          .hero-headline {
            font-size: var(--text-2xl);
            max-width: 100%;
            line-height: 1.15;
          }

          .hero-subtext {
            font-size: var(--text-sm);
            max-width: 100%;
          }

          .hero-card-wrap {
            margin-top: var(--space-3);
          }

          .seo-section {
            padding-top: var(--space-4);
            padding-bottom: var(--space-4);
          }
        }

        @media (max-width: 390px) {
          .hero-section {
            padding-top: var(--space-8);
          }
        }
      `}</style>
    </div>
  );
}
