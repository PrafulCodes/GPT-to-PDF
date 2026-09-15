import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

const pageUrl = `${siteUrl}/terms`;

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for GPTtoPDF. Read the rules and guidelines for using our ChatGPT Link to PDF converter.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'Terms of Service | GPTtoPDF',
    description:
      'Terms of Service for GPTtoPDF. Read the rules and guidelines for using our ChatGPT Link to PDF converter.',
    url: pageUrl,
    type: 'website'
  }
};

export default function TermsPage() {
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
        name: 'Terms of Service',
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
            <span className="text-slate-900">Terms of Service</span>
          </div>
        </nav>

        <section aria-labelledby="terms-heading" className="px-4">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
            <div className="mb-8 border-b border-slate-100 pb-8">
              <h1 id="terms-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="mt-4 text-slate-500 font-medium">Last Updated: July 2026</p>
            </div>

            <div className="space-y-8 text-slate-600 leading-relaxed md:text-lg">
              <p>
                Welcome to GPTtoPDF. By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our service.
              </p>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Use of the Service</h2>
                <p>
                  GPTtoPDF provides a utility to convert publicly accessible ChatGPT shared links into PDF documents. You agree to use this service only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of this service by, any third party.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Prohibited Activities</h2>
                <p>
                  You are specifically prohibited from:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-3">
                  <li>Automated scraping, bulk downloading, or bypassing our rate limits without explicit permission.</li>
                  <li>Using the service to process or distribute illegal, abusive, or malicious content.</li>
                  <li>Attempting to interfere with, disrupt, or gain unauthorized access to the servers or networks connected to GPTtoPDF.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Disclaimer of Warranties</h2>
                <p>
                  The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties, expressed or implied, regarding the accuracy, reliability, or availability of the service. We do not guarantee that the generated PDFs will perfectly preserve all complex formatting in every edge case, though we strive for high quality.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, GPTtoPDF and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Intellectual Property</h2>
                <p>
                  We do not claim ownership over the content you convert using our tool. You retain all rights to the ChatGPT conversations you provide. The GPTtoPDF name, branding, and original code remain the property of their respective owners.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Updates to These Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. We will indicate that changes have been made by updating the &quot;Last Updated&quot; date at the top of this page. Your continued use of the service after any such changes constitutes your acceptance of the new Terms of Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Contact</h2>
                <p>
                  For questions about these Terms of Service, please visit our <Link href="/contact" className="text-blue-700 font-medium hover:underline">Contact</Link> page. For details on how we handle data, please refer to our <Link href="/privacy-policy" className="text-blue-700 font-medium hover:underline">Privacy Policy</Link>.
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
