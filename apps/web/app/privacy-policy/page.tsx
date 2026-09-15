import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

const pageUrl = `${siteUrl}/privacy-policy`;

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for GPTtoPDF. Learn how we handle your information and provide a private ChatGPT Link to PDF conversion experience.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'Privacy Policy | GPTtoPDF',
    description:
      'Privacy Policy for GPTtoPDF. Learn how we handle your information and provide a private ChatGPT Link to PDF conversion experience.',
    url: pageUrl,
    type: 'website'
  }
};

export default function PrivacyPolicyPage() {
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
        name: 'Privacy Policy',
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
            <span className="text-slate-900">Privacy Policy</span>
          </div>
        </nav>

        <section aria-labelledby="privacy-heading" className="px-4">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
            <div className="mb-8 border-b border-slate-100 pb-8">
              <h1 id="privacy-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="mt-4 text-slate-500 font-medium">Last Updated: August 13, 2026</p>
            </div>

            <div className="space-y-8 text-slate-600 leading-relaxed md:text-lg">
              <p>
                At GPTtoPDF, we respect your privacy. This Privacy Policy explains how we collect, use, and handle information when you use our website and services to convert ChatGPT shared links to PDFs.
              </p>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information Processing</h2>
                <p>
                  We process only the information necessary to generate PDFs and operate the service. When you provide a public ChatGPT shared link, our servers fetch the content of that specific link solely to format and generate your PDF document. 
                </p>
                <p className="mt-4">
                  We do not store your conversations or generated PDFs on our servers after the generation process is complete. The content is held in memory just long enough to create the file and return it to your browser.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Telemetry and Analytics</h2>
                <p>
                  To understand how our tool is used and to improve its performance, we collect anonymous usage data (telemetry). This includes general information such as browser type, operating system, device type, referring pages, and performance metrics (like how long it takes to generate a PDF). 
                </p>
                <p className="mt-4">
                  This telemetry data does not include personally identifiable information or the contents of your ChatGPT conversations.
                </p>
              </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Infrastructure and Third-Party Services</h2>
                  <p>
                    GPTtoPDF is built on modern web infrastructure, utilizing platforms such as Vercel for hosting and Upstash Redis for essential technical functions like rate limiting.
                  </p>
                  <p className="mt-4">
                    These services may process standard server logs (such as IP addresses and request timestamps) to ensure the security, stability, and reliability of our application. We only use third-party services that are essential to the operation of GPTtoPDF.
                  </p>
                  <p className="mt-4">
                    We may display third-party advertising on the site, such as Google AdSense. These advertising providers may set cookies or collect information about your device and browsing activity for ad serving and measurement. You can learn about Google’s advertising practices and opt-out options at <a href="https://adssettings.google.com" className="text-blue-700 hover:underline">Google Ad Settings</a>.
                  </p>
                </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cookies</h2>
                <p>
                  We do not use tracking cookies for advertising purposes. We may use minimal technical cookies or local storage only when necessary to provide core site functionality.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Updates to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The "Last Updated" date at the top of this page will indicate when changes were made.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or how your data is handled, please visit our <Link href="/contact" className="text-blue-700 font-medium hover:underline">Contact</Link> page. For information on the rules governing the use of this service, please see our <Link href="/terms" className="text-blue-700 font-medium hover:underline">Terms of Service</Link>.
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
