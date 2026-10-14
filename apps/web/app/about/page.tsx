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
            <h1 id="about-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">About GPTtoPDF</h1>

            <div className="space-y-6 text-slate-600 leading-relaxed md:text-lg">
              <p>
                <strong>GPTtoPDF</strong> is a free web tool that turns a public ChatGPT shared link into a clean, formatted PDF with code blocks, LaTeX math and tables intact. It was created by Praful Mohite to solve one specific problem well: saving an AI conversation without losing the structure that made it useful.
              </p>
              
              <p>
                AI conversations have become working documents. People use them to debug code, work through problems, draft reports and research unfamiliar topics. Copy and paste flattens code and tables, screenshots cannot be searched, and browser printing often clips code, misaligns tables and splits paragraphs in the wrong places.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">What GPTtoPDF Does</h2>
              
              <p>
                You create a share link in ChatGPT, paste it into GPTtoPDF and download the PDF. The tool works only with public shared links. It never asks for your ChatGPT login and cannot see private conversations. Headings, lists, code blocks, tables and LaTeX formulas are preserved wherever possible, with no extension and no signup.
              </p>

              <p>
                Utility tools earn trust by collecting less. The conversation is held in memory only long enough to create the file. Neither the conversation nor the generated PDF is written to a database or file storage, and neither is kept after delivery.
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
