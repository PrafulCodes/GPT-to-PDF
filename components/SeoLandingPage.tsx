import React from 'react';
import Navbar from './Navbar';
import HeroInputCard from './HeroInputCard';
import Footer from './Footer';
import { siteUrl } from '../lib/branding';

export type SeoFaqItem = {
  q: string;
  a: string;
};

export type SeoCard = {
  title: string;
  body: string;
};

export type SeoLink = {
  href: string;
  label: string;
};

type SeoLandingPageProps = {
  pageUrl: string;
  pageLabel: string;
  h1: string;
  intro: string;
  toolTitle: string;
  toolBody: string;
  howTitle: string;
  howCards: SeoCard[];
  benefitsTitle: string;
  benefitsCards: SeoCard[];
  faqTitle: string;
  faqItems: SeoFaqItem[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
  ctaLabel: string;
  relatedTitle: string;
  relatedLinks: SeoLink[];
};

export default function SeoLandingPage({
  pageUrl,
  pageLabel,
  h1,
  intro,
  toolTitle,
  toolBody,
  howTitle,
  howCards,
  benefitsTitle,
  benefitsCards,
  faqTitle,
  faqItems,
  ctaTitle,
  ctaBody,
  ctaHref,
  ctaLabel,
  relatedTitle,
  relatedLinks
}: SeoLandingPageProps) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GPT to PDF',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description: toolBody,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageLabel,
        item: pageUrl
      }
    ]
  };

  return (
    <div>
      <Navbar />

      <main className="pt-6">
        <section id="hero" className="px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm">
                GPT to PDF
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-5">{h1}</h1>
              <p className="text-slate-600 mt-4 text-lg leading-relaxed">{intro}</p>
            </div>
          </div>
        </section>

        <section id="tool" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">{toolTitle}</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">{toolBody}</p>

            <div className="mt-8">
              <HeroInputCard />
            </div>
          </div>
        </section>

        <section id="how" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">{howTitle}</h2>

            <div className="mt-6 space-y-6">
              {howCards.map((card, index) => (
                <div key={card.title} className="border-l-4 border-blue-500 pl-6 py-2">
                  <h3 className="font-semibold text-lg">
                    {index + 1}. {card.title}
                  </h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">{benefitsTitle}</h2>

            <div className="mt-6 grid gap-6">
              {benefitsCards.map((card) => (
                <div key={card.title} className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition">
                  <h3 className="font-semibold text-blue-700">{card.title}</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{faqTitle}</h2>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition cursor-pointer group"
                >
                  <summary className="font-semibold text-slate-800 group-open:text-blue-600 group-open:font-bold">
                    {item.q}
                  </summary>
                  <p className="text-slate-600 mt-3 text-sm leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="final-cta" className="px-4 mt-12 mb-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold">{ctaTitle}</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">{ctaBody}</p>
            <div className="mt-6">
              <a href={ctaHref} className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                {ctaLabel}
              </a>
            </div>
          </div>
        </section>

        <section id="related" className="px-4 mt-8">
          <div className="max-w-3xl mx-auto text-center text-sm">
            <p className="text-slate-500 leading-relaxed">
              {relatedTitle}{' '}
              {relatedLinks.map((link, index) => (
                <span key={link.href}>
                  {index > 0 ? ' • ' : ''}
                  <a href={link.href} className="link text-blue-600 hover:underline">
                    {link.label}
                  </a>
                </span>
              ))}
            </p>
          </div>
        </section>

        <Footer />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      </main>
    </div>
  );
}