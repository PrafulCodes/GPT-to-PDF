import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

const pageUrl = `${siteUrl}/how-to-save-chatgpt-conversations`;

const faqItems = [
  {
    q: 'What is the simplest way to save a ChatGPT conversation permanently?',
    a: 'For public conversations, the simplest route is to convert the shared link into a PDF and store the file as a backup.'
  },
  {
    q: 'Why not just copy the text into notes?',
    a: 'Copying text can break formatting and remove the structure that makes the conversation easy to review later.'
  },
  {
    q: 'Should I save AI conversations differently from regular notes?',
    a: 'Yes. AI chats often include long answers, code, and links, so a structured archive format like PDF is usually better.'
  },
  {
    q: 'Can GPT to PDF help with backups?',
    a: 'Yes. It turns a public ChatGPT conversation into a file you can keep as part of a long-term backup strategy.'
  }
];

export const metadata: Metadata = {
  title: 'How to Save ChatGPT Conversations Permanently | GPT to PDF',
  description:
    'Learn how to save ChatGPT conversations permanently, avoid common backup mistakes, and use PDF for long-term storage and backup strategy.',
  keywords: [
    'how to save chatgpt conversations',
    'save chatgpt chats',
    'chatgpt backup',
    'save ai conversations'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'How to Save ChatGPT Conversations Permanently | GPT to PDF',
    description:
      'Learn how to save ChatGPT conversations permanently and why PDF is a strong long-term backup format.',
    url: pageUrl,
    type: 'article',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'How to save ChatGPT conversations permanently'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Save ChatGPT Conversations Permanently | GPT to PDF',
    description:
      'Learn how to save ChatGPT conversations permanently and keep them as durable backups.',
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function HowToSaveChatGPTConversationsPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Save ChatGPT Conversations Permanently',
    description:
      'Learn how to save ChatGPT conversations permanently and why PDF is a durable format for backup strategy.',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: [`${siteUrl}/og-image.png`],
    datePublished: '2026-06-24',
    dateModified: '2026-06-24',
    author: { '@type': 'Organization', name: 'GPT to PDF', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'GPT to PDF',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.png` }
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
      { '@type': 'ListItem', position: 2, name: 'How to Save ChatGPT Conversations', item: pageUrl }
    ]
  };

  return (
    <div>
      <Navbar />
      <main className="pt-6">
        <section id="hero" className="px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm">
              Backup guide
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-5">How to Save ChatGPT Conversations Permanently</h1>
            <p className="text-slate-600 mt-4 text-lg leading-relaxed">
              This page is for people who want a simple backup strategy for AI conversations. The goal is to keep important chats safe, readable, and easy
              to recover later.
            </p>
          </div>
        </section>

        <section id="why-people-save" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Why people save AI conversations</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              ChatGPT chats often contain instructions, research, drafts, and code that people want to revisit. Saving them permanently prevents losing that
              work when the browser session ends or the conversation gets hard to find.
            </p>
          </div>
        </section>

        <section id="mistakes" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Common mistakes</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Common mistakes include relying only on browser history, copying text without formatting, or saving screenshots instead of a structured
              document. Those methods make the content harder to restore later.
            </p>
          </div>
        </section>

        <section id="saving-as-pdf" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Saving as PDF</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              PDF is a practical format because it preserves the conversation in a portable file that can be backed up, shared, and opened later without
              depending on a live web page.
            </p>
          </div>
        </section>

        <section id="backup-strategy" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Long-term backup strategy</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              The safest approach is to export important conversations into PDF, store them in organized folders, and keep them alongside project notes or
              documentation so they are easy to retrieve later.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/" className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                Open GPT to PDF
              </Link>
              <Link href="/chatgpt-conversation-archive" className="inline-block border border-blue-200 text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
                Archive conversations
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
              <Link href="/chatgpt-conversation-archive" className="text-blue-600 hover:underline">ChatGPT conversation archive</Link> •{' '}
              <Link href="/save-chatgpt-conversation-as-pdf" className="text-blue-600 hover:underline">Save ChatGPT conversation as PDF</Link> •{' '}
              <Link href="/chatgpt-export-tool" className="text-blue-600 hover:underline">ChatGPT export tool</Link>
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