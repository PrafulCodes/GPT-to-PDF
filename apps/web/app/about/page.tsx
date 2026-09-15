import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

const pageUrl = `${siteUrl}/about`;

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about GPTtoPDF, a free web tool to convert ChatGPT links to PDF while preserving formatting. No login required and mobile friendly.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'About | GPTtoPDF',
    description:
      'Learn about GPTtoPDF, a free web tool to convert ChatGPT links to PDF while preserving formatting. No login required and mobile friendly.',
    url: pageUrl,
    type: 'website'
  }
};

export default function AboutPage() {
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
        name: 'About',
        item: pageUrl
      }
    ]
  };

  return (
    <div>
      <Navbar />

      <main className="pt-6 pb-16">
        <nav aria-label="Breadcrumb" className="px-4 mt-4 mb-6">
          <div className="max-w-3xl mx-auto text-sm text-slate-500 font-medium flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900">About</span>
          </div>
        </nav>

        <section aria-labelledby="about-heading" className="px-4">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
            <h1 id="about-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">About</h1>

            <div className="space-y-6 text-slate-600 leading-relaxed md:text-lg">
              <p>
                <strong>GPTtoPDF</strong> is a free web tool designed to solve a very specific problem: saving AI conversations without losing their readability. 
                When people try to save or print long chats, they often find that standard browser printing breaks code blocks, misaligns tables, and splits paragraphs awkwardly across pages.
              </p>
              
              <p>
                We built this <strong>ChatGPT Link to PDF Converter</strong> to ensure that every export looks as clean as the original conversation. By prioritizing <strong>formatting preservation</strong>, we make sure that headings, lists, nested code, and complex equations survive the transition to a document format.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Our Approach</h2>
              
              <p>
                A core part of our philosophy is keeping things simple and private. The tool requires <strong>no login</strong> and there is no need to install a browser extension. It is intentionally lightweight and <strong>mobile friendly</strong>, allowing you to generate PDFs directly from your phone or desktop using just a shared link.
              </p>

              <p>
                We believe utility tools should be fast, reliable, and out of your way. Our goal is simply to give you a clean, readable export whenever you need to archive a valuable AI interaction.
              </p>

              <div className="mt-10 p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="m-0">
                  Have questions or suggestions? Visit our <Link href="/contact" className="text-blue-700 font-medium hover:underline">Contact</Link> page.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      </main>
    </div>
  );
}
