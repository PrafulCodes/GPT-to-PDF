import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

const pageUrl = `${siteUrl}/how-to-use`;

export const metadata: Metadata = {
  title: 'How to Use GPTtoPDF',
  description:
    'Learn how to convert a public ChatGPT share link into a PDF, what the converter supports, and how to troubleshoot failed exports.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'How to Use GPTtoPDF',
    description:
      'Step-by-step instructions for converting public ChatGPT share links into readable PDFs.',
    url: pageUrl,
    type: 'website'
  }
};

export default function HowToUsePage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'How to Use', item: pageUrl }
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
            <span className="text-slate-900">How to Use</span>
          </div>
        </nav>

        <section aria-labelledby="how-to-use-heading" className="px-4">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
            <h1 id="how-to-use-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
              How to use GPTtoPDF
            </h1>

            <div className="space-y-8 text-slate-600 leading-relaxed md:text-lg">
              <p>
                GPTtoPDF converts a public ChatGPT share link into a downloadable PDF. You do not need to sign in to GPTtoPDF or install a browser extension.
              </p>

              <ol className="list-decimal pl-6 space-y-5">
                <li>
                  <strong className="text-slate-900">Create a public share link.</strong> In ChatGPT, open the conversation menu, choose Share, and copy the link.
                </li>
                <li>
                  <strong className="text-slate-900">Paste the link.</strong> Return to GPTtoPDF, paste the complete HTTPS link into the converter, and select Generate PDF.
                </li>
                <li>
                  <strong className="text-slate-900">Download the result.</strong> When processing finishes, the PDF download will be offered by your browser.
                </li>
              </ol>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">What links are supported?</h2>
                <p>
                  The converter accepts public HTTPS links whose host is <code className="bg-slate-100 px-1.5 py-0.5 rounded">chatgpt.com</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded">chat.openai.com</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded">share.openai.com</code>, or <code className="bg-slate-100 px-1.5 py-0.5 rounded">shareg.pt</code>, including supported subdomains. It does not accept private conversations, links that require your account, uploaded files, or arbitrary web pages.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">What does the PDF preserve?</h2>
                <p>
                  The renderer preserves common headings, lists, code blocks, tables, images, and supported mathematical markup where those elements are available in the shared page. Browser-specific behavior and unusually complex formatting may not reproduce exactly.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Troubleshooting</h2>
                <ul className="list-disc pl-6 space-y-3">
                  <li>Make sure the link is public, complete, and starts with <code className="bg-slate-100 px-1.5 py-0.5 rounded">https://</code>.</li>
                  <li>If the service says the URL is unsupported, check the hostname against the supported domains above; a normal ChatGPT conversation URL is not necessarily a public share link.</li>
                  <li>If the conversation is very long, try a shorter shared conversation because exports have response-size and execution-time limits.</li>
                  <li>If a link has been deleted or made private in ChatGPT, create a new public share link.</li>
                  <li>If the PDF download is interrupted, retry from the converter and check that your browser allows downloads for the site.</li>
                  <li>For persistent problems, contact support with the error message and link domain. Do not send private conversation content by email.</li>
                </ul>
              </div>

              <p>
                For data handling details, read the <Link href="/privacy-policy" className="text-blue-700 font-medium hover:underline">Privacy Policy</Link>. To start an export, return to the <Link href="/" className="text-blue-700 font-medium hover:underline">GPTtoPDF converter</Link>.
              </p>
            </div>
          </div>
        </section>

        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      </main>
    </div>
  );
}
