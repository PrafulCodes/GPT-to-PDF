import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

const pageUrl = `${siteUrl}/contact`;

export const metadata: Metadata = {
  title: 'Contact | GPTtoPDF',
  description:
    'Get in touch with the GPTtoPDF team for support, bug reports, feature requests, or business enquiries.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'Contact | GPTtoPDF',
    description:
      'Get in touch with the GPTtoPDF team for support, bug reports, feature requests, or business enquiries.',
    url: pageUrl,
    type: 'website'
  }
};

export default function ContactPage() {
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
        name: 'Contact',
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
            <span className="text-slate-900">Contact</span>
          </div>
        </nav>

        <section aria-labelledby="contact-heading" className="px-4">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
            <h1 id="contact-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Contact</h1>

            <div className="space-y-8 text-slate-600 leading-relaxed md:text-lg">
              <p>
                Whether you have a question, found a bug, or want to suggest a new feature, we would like to hear from you.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Email Support</h2>
                <p className="text-slate-900 font-medium text-lg">
                  <a href="mailto:prafulmohite2006@gmail.com" className="text-blue-700 hover:underline">prafulmohite2006@gmail.com</a>
                </p>
                <p className="text-sm mt-3 text-slate-500">
                  We aim to respond to all inquiries within 48 hours.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">What you can contact us about:</h2>
                <ul className="list-disc pl-6 space-y-3">
                  <li><strong>Support:</strong> Help with converting your ChatGPT links to PDF.</li>
                  <li><strong>Bug Reporting:</strong> If a specific conversation formatting breaks or fails to export.</li>
                  <li><strong>Feature Requests:</strong> Suggestions to make GPTtoPDF more useful for your workflow.</li>
                  <li><strong>Business Enquiries:</strong> Partnership opportunities or enterprise needs.</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-sm">
                  For information on how we handle data, please review our <Link href="/privacy-policy" className="text-blue-700 font-medium hover:underline">Privacy Policy</Link>.
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
