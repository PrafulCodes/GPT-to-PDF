import React from 'react';
import { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import HeroInputCard from '../../components/HeroInputCard';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

export const metadata: Metadata = {
  title: 'Convert ChatGPT Shared Link to PDF Free',
  description:
    'Convert public ChatGPT shared links into readable PDFs. Preserve supported headings, code blocks, equations, and tables without a login or extension.',
  keywords: [
    'chatgpt shared link to pdf',
    'convert chatgpt shared link',
    'chatgpt share url to pdf',
    'download chatgpt conversation pdf',
    'chatgpt conversation export',
    'chatgpt shared link converter',
    'chatgpt transcript to pdf',
    'save chatgpt conversation as pdf',
    'export chatgpt chat',
    'chatgpt to pdf without extension'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: `${siteUrl}/chatgpt-shared-link-to-pdf`
  },
  openGraph: {
    title: 'Convert ChatGPT Shared Link to PDF Free',
    description:
      'Convert public ChatGPT shared links into readable PDFs with supported formatting. No login or browser extension required.',
    url: `${siteUrl}/chatgpt-shared-link-to-pdf`,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert ChatGPT Shared Link to PDF Free',
    description:
      'Convert public ChatGPT shared links into readable PDFs with supported formatting. No login or browser extension required.',
    images: [`${siteUrl}/og-image.png`]
  }
};

const faqItems = [
  {
    q: 'How do I get a ChatGPT shared link?',
    a: 'In ChatGPT, open any conversation, click the three-dot menu, and select "Share" to create a public link. Anyone with that link can view the conversation.'
  },
  {
    q: 'What happens after I paste my shared link?',
    a: 'The service fetches the public page, formats supported content, and returns a PDF when processing finishes. Very long or complex conversations may take longer or exceed service limits.'
  },
  {
    q: 'Is my ChatGPT conversation data stored anywhere?',
    a: 'The application does not intentionally save conversation contents or generated PDF files in its database or file storage. Hosting and analytics systems may still process operational metadata.'
  },
  {
    q: 'Why is URL-based conversion better than using a Chrome extension?',
    a: 'With a public share link, you need no extension or ChatGPT login. The workflow works in modern desktop and mobile browsers, subject to the public link being reachable.'
  }
];

export default function ChatGPTSharedLinkPage() {
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
        name: 'ChatGPT Shared Link to PDF',
        item: `${siteUrl}/chatgpt-shared-link-to-pdf`
      }
    ]
  };

  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GPT to PDF',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description:
      'Convert ChatGPT conversations and shared links into clean PDFs.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  return (
    <div>
      <Navbar />

      <main className="pt-6">
        {/* Hero Section */}
        <section id="hero" className="px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold">Convert a ChatGPT Shared Link to PDF</h1>
              <p className="text-slate-600 mt-4 text-lg">
                Convert a public HTTPS ChatGPT share link into a readable PDF. No extension or GPTtoPDF account is required, but the conversation must be publicly accessible.
              </p>
            </div>

            <div className="mt-8">
              <HeroInputCard />
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section id="intro" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">What is a ChatGPT Shared Link and Why Convert to PDF?</h2>
            <p className="text-slate-600 mt-4">
              A ChatGPT shared link is a public URL you can generate from a conversation. Share it with teammates, clients, or archivists without giving
              access to your full ChatGPT account. But a link is ephemeral — shared links can be deleted, and viewing them requires a browser. A PDF is
              portable, printable, and easier to keep alongside project files.
            </p>
            <p className="text-slate-600 mt-3">
              Paste the shared link, wait for the server-side conversion to finish, and inspect the PDF before archiving or sharing it.
            </p>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section id="guide" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">How to Convert a ChatGPT Shared Link to PDF in 3 Steps</h2>

            <div className="mt-6 space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg">Step 1: Generate Your ChatGPT Shared Link</h3>
                <p className="text-slate-600 mt-2">
                  Open ChatGPT and find the conversation you want to save. Click the three-dot menu (⋯) at the top right, then select "Share." Click "Copy
                  link" to grab the public URL (it looks like <code className="bg-slate-100 px-2 py-1 rounded">chatgpt.com/share/...</code>).
                </p>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg">Step 2: Paste the Link Into Our Converter</h3>
                <p className="text-slate-600 mt-2">
                  Go back to this page, paste your shared link into the input box, and click "Generate PDF." Our tool fetches the conversation from
                  OpenAI's servers and formats it for PDF export.
                </p>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg">Step 3: Download Your PDF</h3>
                <p className="text-slate-600 mt-2">
                  When processing finishes, your browser receives the PDF. Common headings, code blocks, lists, images, tables, and supported math are
                  formatted where the shared page exposes them; complex layouts may not match the source exactly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Who Uses ChatGPT Shared Link PDF Conversion?</h2>

            <div className="mt-6 grid gap-6">
              <div className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition">
                <h3 className="font-semibold text-blue-700">Research Teams</h3>
                <p className="text-slate-600 mt-2">
                  Share ChatGPT research outputs with colleagues as immutable PDFs instead of live links that might expire or change.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition">
                <h3 className="font-semibold text-blue-700">Consultants & Agencies</h3>
                <p className="text-slate-600 mt-2">
                  Export ChatGPT brainstorms and recommendations as professional PDFs to share with clients. No account access required.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition">
                <h3 className="font-semibold text-blue-700">Legal & Compliance</h3>
                <p className="text-slate-600 mt-2">
                  Archive reviewed ChatGPT conversations as readable PDFs for documentation. A PDF is not by itself a verified audit trail or legal record.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition">
                <h3 className="font-semibold text-blue-700">Content Creators</h3>
                <p className="text-slate-600 mt-2">
                  Save ChatGPT drafts, outlines, and ideas as PDFs for offline editing, printing, or sharing with editors and collaborators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why URL-Based Beats Extensions */}
        <section id="why-url" className="px-4 mt-12 bg-blue-50 py-8 rounded-lg">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Why URL-Based Conversion Beats Chrome Extensions</h2>

            <div className="mt-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 text-blue-600 font-bold">✓</div>
                <div>
                  <h3 className="font-semibold">No Extension Install Required</h3>
                  <p className="text-slate-600 text-sm">
                    Extensions live in your browser and require permissions. Our tool works from a link — one URL, zero friction.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-blue-600 font-bold">✓</div>
                <div>
                  <h3 className="font-semibold">No Broad Browser Permissions</h3>
                  <p className="text-slate-600 text-sm">
                    Many ChatGPT export extensions request "read all your data" permissions. We only fetch the public shared page.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-blue-600 font-bold">✓</div>
                <div>
                  <h3 className="font-semibold">Works on Any Device</h3>
                  <p className="text-slate-600 text-sm">
                    Mobile Safari, Firefox, Brave, any browser — no extension ecosystem limitations. Just paste the link.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-blue-600 font-bold">✓</div>
                <div>
                  <h3 className="font-semibold">No Account Sync Needed</h3>
                  <p className="text-slate-600 text-sm">
                    You don't need to be logged in to ChatGPT. Just share a link with anyone, and they can convert it. No login required.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-blue-600 font-bold">✓</div>
                <div>
                  <h3 className="font-semibold">Always Available</h3>
                  <p className="text-slate-600 text-sm">
                    The service is available through a browser, but it still depends on the public link being reachable and on normal service limits.tes that break extensions. No maintenance burden. Just works, every time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <details
                  key={idx}
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

        {/* Final CTA */}
        <section id="final-cta" className="px-4 mt-12 mb-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold">Ready to Convert Your ChatGPT Shared Link?</h2>
            <p className="text-slate-600 mt-2">Paste any public ChatGPT conversation link and download a clean PDF in seconds.</p>
            <div className="mt-6">
              <a href="/" className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                Go to Converter
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section id="related" className="px-4 mt-8">
          <div className="max-w-3xl mx-auto text-center text-sm">
            <p className="text-slate-500">
              Related: <a href="/" className="text-blue-600 hover:underline">Convert ChatGPT to PDF</a> ·{' '}
              <a href="/save-chatgpt-conversation-as-pdf" className="text-blue-600 hover:underline">Save ChatGPT Conversation as PDF</a> ·{' '}
              <a href="/export-chatgpt-chat" className="text-blue-600 hover:underline">Export ChatGPT Chat</a> ·{' '}
              <a href="/chatgpt-to-pdf-no-extension" className="text-blue-600 hover:underline">ChatGPT to PDF Without Extension</a>
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
