import React from 'react';
import Navbar from '../components/Navbar';
import HeroInputCard from '../components/HeroInputCard';
import TrustStrip from '../components/TrustStrip';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import { FAQ_ITEMS } from '../lib/seo';
import Footer from '../components/Footer';

export default function Page() {
  const seoContent = `Save time and keep your conversations organized. No extension needed — simply paste a public ChatGPT share link and download a clean PDF that preserves headings, lists, code blocks, and tables. This mobile-friendly converter works in any browser and requires no signup or account.`;

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GPT to PDF',
    url: 'https://your-domain.com/',
    description:
      'Paste any ChatGPT shared link and download a clean, formatted PDF in seconds. No extension, no signup, works on mobile. Free forever.'
  };

  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GPT to PDF',
    url: 'https://your-domain.com/',
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
        <section id="hero" className="site-container" style={{paddingTop:'var(--space-16)',paddingBottom:'var(--space-10)',textAlign:'center'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'var(--space-4)'}}>
            <div className="badge-eyebrow">Free · No signup · No extension</div>
            <h1 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--weight-medium)',letterSpacing:'-0.03em',maxWidth:540,margin:0}}>Export ChatGPT Conversations to PDF</h1>
            <p style={{fontSize:'var(--text-base)',color:'var(--color-text-secondary)',maxWidth:460,margin:0}}>Paste a public ChatGPT share link. Get a clean, formatted PDF instantly.</p>

            <div style={{width:'100%',maxWidth:'var(--max-width)',marginTop:'var(--space-6)'}}>
              <HeroInputCard />
            </div>

            <TrustStrip />
          </div>
        </section>

        <section id="seo" className="site-container" style={{paddingTop:'var(--space-6)',paddingBottom:'var(--space-6)'}}>
          <h2 style={{fontSize:'var(--text-md)',fontWeight:'var(--weight-medium)'}}>Why use GPT to PDF?</h2>
          <p style={{color:'var(--color-text-secondary)',marginTop:'var(--space-2)'}}>{seoContent}</p>
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
    </div>
  );
}
