import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';
import { permanentRedirect } from 'next/navigation';

const pageUrl = `${siteUrl}/print-chatgpt-conversation`;

const faqItems = [
  {
    q: 'Why does browser print break ChatGPT formatting?',
    a: 'ChatGPT conversations often include long answers, code blocks, and nested structure. Generic print tools are not built to preserve that layout cleanly.'
  },
  {
    q: 'Can I print a ChatGPT conversation as PDF instead?',
    a: 'Yes. Saving the conversation as a PDF usually gives a cleaner, more stable result than trying to print the page directly.'
  },
  {
    q: 'What should I do if screenshots are too messy?',
    a: 'Use a PDF export workflow. It keeps the conversation in one document instead of splitting it across image files.'
  },
  {
    q: 'Does GPT to PDF work for shared links?',
    a: 'Yes. If the conversation is public, GPT to PDF can convert the shared link into a printable PDF.'
  }
];

export const metadata: Metadata = {
  title: 'How to Print ChatGPT Conversations Without Losing Formatting',
  description:
    'Learn how to print ChatGPT conversations without losing formatting, why browser print breaks chats, and why PDF export is a better alternative for clean output.',
  keywords: [
    'print chatgpt conversation',
    'chatgpt print to pdf',
    'how to print chatgpt chats',
    'print chatgpt conversation as pdf'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'How to Print ChatGPT Conversations Without Losing Formatting',
    description:
      'Learn why browser print breaks ChatGPT chats and how to print conversations as PDF without losing the structure that matters.',
    url: pageUrl,
    type: 'article',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'How to print ChatGPT conversations without losing formatting'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Print ChatGPT Conversations Without Losing Formatting',
    description:
      'Learn why browser print breaks ChatGPT chats and how to print conversations as PDF without losing formatting.',
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function PrintChatGPTConversationPage() {
  permanentRedirect('/blog/why-browser-printing-breaks-chatgpt-code-blocks-and-tables');
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Print ChatGPT Conversations Without Losing Formatting',
    description:
      'Learn how to print ChatGPT conversations without losing formatting and why PDF export works better than browser print.',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: [`${siteUrl}/og-image.png`],
    datePublished: '2026-06-24',
    dateModified: '2026-06-24',
    author: {
      '@type': 'Organization',
      name: 'GPT to PDF',
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'GPT to PDF',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.png`
      }
    }
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Print ChatGPT Conversation', item: pageUrl }
    ]
  };

  return (
    <div>
      <Navbar />
      <main className="pt-6">
        <section id="hero" className="px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm">
              Print workflow guide
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-5">How to Print ChatGPT Conversations Without Losing Formatting</h1>
            <p className="text-slate-600 mt-4 text-lg leading-relaxed">
              People usually start with browser print and discover that long ChatGPT chats do not fit the page cleanly. This guide explains why that happens
              and how to get a readable PDF instead.
            </p>
          </div>
        </section>

        <section id="why-print-breaks" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Why browser print breaks ChatGPT chats</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Browser print is designed for general web pages, not for conversational threads with code blocks, tables, long answers, and nested structure.
              When the page is converted to paper layout, the spacing and line lengths often shift in ways that make the transcript harder to read.
            </p>
          </div>
        </section>

        <section id="screenshots" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Problems with screenshots</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Screenshots can preserve visual fidelity for a single screen, but they do not scale well for long chats. The result is usually a patchwork of
              images that is difficult to search, archive, or share as a single document.
            </p>
          </div>
        </section>

        <section id="how-to-print" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">How to print ChatGPT conversations as PDF</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              The practical route is to export the conversation to PDF first, then print the PDF if you still need a paper copy. That keeps the structure
              intact and usually avoids the layout damage caused by browser print.
            </p>
          </div>
        </section>

        <section id="better-alternative" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">A better alternative to printing</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              GPT to PDF gives you a cleaner way to convert a public ChatGPT link into a printable file. If your goal is a readable export, PDF is usually
              better than raw browser print.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/" className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                Use GPT to PDF
              </Link>
              <Link href="/chatgpt-to-pdf-no-extension" className="inline-block border border-blue-200 text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
                No-extension guide
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">FAQ</h2>
            <div className="mt-6 space-y-4">
              {faqItems.map((item) => (
                <details key={item.q} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition cursor-pointer">
                  <summary className="font-semibold text-slate-800">{item.q}</summary>
                  <p className="text-slate-600 mt-3 text-sm leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="related" className="px-4 mt-12 mb-6">
          <div className="max-w-3xl mx-auto text-center text-sm">
            <p className="text-slate-500 leading-relaxed">
              Related pages: <Link href="/" className="text-blue-600 hover:underline">Home</Link> •{' '}
              <Link href="/chatgpt-to-pdf-no-extension" className="text-blue-600 hover:underline">ChatGPT to PDF without extension</Link> •{' '}
              <Link href="/save-chatgpt-conversation-as-pdf" className="text-blue-600 hover:underline">Save ChatGPT conversation as PDF</Link> •{' '}
              <Link href="/why-chatgpt-export-is-hard" className="text-blue-600 hover:underline">Why exporting ChatGPT conversations is hard</Link>
            </p>
          </div>
        </section>

        <Footer />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      </main>
    </div>
  );
}