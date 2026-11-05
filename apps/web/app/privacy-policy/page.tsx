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
                This Privacy Policy explains how GPTtoPDF handles information when you use the website and its public ChatGPT shared-link-to-PDF service.
              </p>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information Processing</h2>
                <p>
                  We process only the information necessary to generate PDFs and operate the service. When you provide a public ChatGPT shared link, our servers fetch the content of that specific link solely to format and generate your PDF document. 
                </p>
                <p className="mt-4">
                  The submitted URL and fetched conversation are processed to create the PDF. The application does not intentionally save conversation contents or generated PDF files in its database or file storage after the request. Hosting, browser, proxy, and security logs may still contain request metadata according to the provider's retention practices.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Telemetry and Analytics</h2>
                <p>
                  To understand how the tool is used and improve its performance, the site sends pseudonymous telemetry. This can include a random visitor and session identifier stored in browser local/session storage, page paths, referrers, campaign parameters, browser and operating-system details, device type, screen and viewport size, language, timezone, approximate Vercel-provided geography, and performance metrics such as PDF generation time.
                </p>
                <p className="mt-4">
                  Telemetry does not intentionally include conversation contents. It can be associated with a pseudonymous visitor or session record, and normal hosting and security logs may include an IP address, user agent, request path, timestamp, and response status.
                </p>
              </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Infrastructure and Third-Party Services</h2>
                  <p>
                    GPTtoPDF is built on modern web infrastructure, utilizing platforms such as Vercel for hosting and Upstash Redis for essential technical functions like rate limiting.
                  </p>
                  <p className="mt-4">
                    Vercel provides hosting and may process standard request logs. Upstash Redis is used for production rate limiting when configured. The application uses a database for operational analytics and export statistics. These providers may process standard technical metadata, such as IP addresses, request timestamps, user-agent information, and service performance data, to operate and secure the service. Their own privacy policies and retention practices also apply.
                  </p>
                </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cookies</h2>
                <p>
                  GPTtoPDF does not currently use advertising cookies or advertising scripts. The browser may use local storage and session storage for a pseudonymous analytics visitor/session identifier and cookie-consent preference. You can clear these values through your browser settings; clearing them does not delete server-side analytics records.
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
