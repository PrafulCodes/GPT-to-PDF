import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';
import { permanentRedirect } from 'next/navigation';

const pageUrl = `${siteUrl}/chatgpt-conversation-archive`;

const faqItems = [
  {
    q: 'Why archive ChatGPT conversations at all?',
    a: 'Archiving keeps important chats available later, even if the original browser tab is gone or the conversation is hard to find again.'
  },
  {
    q: 'Is PDF a good archive format?',
    a: 'Yes. PDFs are durable, portable, and easy to store alongside other project files or notes.'
  },
  {
    q: 'What happens if I only rely on browser history?',
    a: 'Browser history is not a reliable archive strategy because it does not preserve the conversation content in a stable document.'
  },
  {
    q: 'Can GPT to PDF help with chat backups?',
    a: 'Yes. It converts public ChatGPT conversations into files you can keep, email, and store as backups.'
  }
];

export const metadata: Metadata = {
  title: 'How to Archive ChatGPT Conversations | GPT to PDF',
  description:
    'Learn how to archive ChatGPT conversations, why chats matter over time, and why PDF is a durable format for backup and storage.',
  keywords: [
    'chatgpt conversation archive',
    'chatgpt archive chats',
    'chatgpt backup conversation',
    'chatgpt conversation storage'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'How to Archive ChatGPT Conversations | GPT to PDF',
    description:
      'Learn why ChatGPT conversations matter over time and how PDF helps create a durable archive and backup strategy.',
    url: pageUrl,
    type: 'article',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'How to archive ChatGPT conversations'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Archive ChatGPT Conversations | GPT to PDF',
    description:
      'Learn why PDF is a durable way to archive ChatGPT conversations and keep important chats available later.',
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function ChatGPTConversationArchivePage() {
  permanentRedirect('/blog/archiving-ai-research-and-prompt-engineering-outputs-for-teams');
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Archive ChatGPT Conversations',
    description:
      'Learn how to archive ChatGPT conversations and why PDF is a durable format for long-term storage and backup.',
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
      { '@type': 'ListItem', position: 2, name: 'ChatGPT Conversation Archive', item: pageUrl }
    ]
  };

  return (
    <div>
      <Navbar />
      <main className="pt-6">
        <section id="hero" className="px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm">
              Archive guide
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-5">How to Archive ChatGPT Conversations</h1>
            <p className="text-slate-600 mt-4 text-lg leading-relaxed">
              When a conversation matters, it should live somewhere more reliable than browser history. This page explains why durable backups matter and
              why PDF is a strong archive format.
            </p>
          </div>
        </section>

        <section id="why-conversations-matter" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Why conversations matter</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              ChatGPT threads often contain decisions, research, drafts, and technical steps. If you work from the conversation later, losing the original
              context can cost time and create confusion.
            </p>
          </div>
        </section>

        <section id="risks" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">Risks of losing chats</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              A live link is not the same as an archive. Tabs get closed, browser sessions get cleared, and conversations become harder to find when you need
              them most. A backup should be independent of the browser state.
            </p>
          </div>
        </section>

        <section id="pdf-archive" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">PDF as an archive format</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              PDF works well because it captures the conversation in a stable, portable document that can be stored in folders, shared by email, and backed
              up alongside other files.
            </p>
          </div>
        </section>

        <section id="how-gpt-to-pdf-helps" className="px-4 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">How GPT to PDF helps</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              GPT to PDF gives you a straightforward way to turn a public ChatGPT link into a file you can keep. That makes the archive easier to manage
              than screenshots, copy-paste documents, or browser history.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/" className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                Open GPT to PDF
              </Link>
              <Link href="/save-chatgpt-conversation-as-pdf" className="inline-block border border-blue-200 text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
                Save conversation as PDF
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
              <Link href="/save-chatgpt-conversation-as-pdf" className="text-blue-600 hover:underline">Save ChatGPT conversation as PDF</Link> •{' '}
              <Link href="/export-chatgpt-chat" className="text-blue-600 hover:underline">Export ChatGPT chat</Link> •{' '}
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