import type { Metadata } from 'next';
import SeoLandingPage from '../../components/SeoLandingPage';
import { siteUrl } from '../../lib/branding';
import { permanentRedirect } from 'next/navigation';

const pageUrl = `${siteUrl}/chatgpt-export-tool`;

const faqItems = [
  {
    q: 'What makes a good ChatGPT export tool?',
    a: 'A good export tool should keep formatting readable, avoid extension friction, and produce a file you can save or share quickly.'
  },
  {
    q: 'Why is GPT to PDF different from browser print?',
    a: 'Browser print is generic. GPT to PDF is built around the ChatGPT export workflow, which makes it easier to create a readable PDF.'
  },
  {
    q: 'Can I use this export tool for shared links?',
    a: 'Yes. If the ChatGPT conversation is public, the tool can convert the shared link into a PDF download.'
  },
  {
    q: 'Is this software or a one-off converter?',
    a: 'It is an online export utility focused on ChatGPT conversation exports and PDF downloads.'
  }
];

export const metadata: Metadata = {
  title: 'Best ChatGPT Export Tool for PDF Downloads | GPT to PDF',
  description:
    'GPT to PDF is a ChatGPT export tool built for PDF downloads, with no extension required and a workflow focused on exporting conversations cleanly.',
  keywords: [
    'chatgpt export tool',
    'chatgpt exporter',
    'chatgpt export utility',
    'chatgpt export software'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'Best ChatGPT Export Tool for PDF Downloads | GPT to PDF',
    description:
      'Compare browser print with GPT to PDF and see why this export tool is built for readable ChatGPT conversation downloads.',
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Best ChatGPT export tool for PDF downloads'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best ChatGPT Export Tool for PDF Downloads | GPT to PDF',
    description:
      'GPT to PDF is a ChatGPT export tool focused on readable PDF downloads without browser extension friction.',
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function ChatGPTExportToolPage() {
  permanentRedirect('/');
  return (
    <SeoLandingPage
      pageUrl={pageUrl}
      pageLabel="ChatGPT Export Tool"
      h1="Best ChatGPT Export Tool for PDF Downloads"
      intro="GPT to PDF is built for people who want an export tool, not a generic PDF converter. It focuses on turning public ChatGPT conversations into readable PDFs with less friction than browser print or extension-based workflows."
      toolTitle="What makes a good export tool"
      toolBody="A useful ChatGPT export tool should preserve the conversation structure, work from a public share link, and produce a file that can be saved or archived immediately. GPT to PDF is designed around that workflow instead of forcing a general-purpose conversion path."
      howTitle="Browser print vs GPT to PDF"
      howCards={[
        { title: 'Browser print', body: 'Generic and often fragile on long chats, especially when formatting, tables, or code blocks are involved.' },
        { title: 'GPT to PDF', body: 'Purpose-built for ChatGPT conversation exports, so the output is easier to read and store.' },
        { title: 'PDF download flow', body: 'A quick export path that turns a shared link into a file you can keep without extra steps.' }
      ]}
      benefitsTitle="Features comparison"
      benefitsCards={[
        { title: 'No extension required', body: 'The export utility works in the browser and does not depend on an installed add-on.' },
        { title: 'Readable output', body: 'The exported file is meant for archiving, reviewing, and sharing, not just for raw conversion.' },
        { title: 'Shared-link compatible', body: 'If the ChatGPT conversation is public, the tool can convert the link directly into a PDF.' }
      ]}
      faqTitle="FAQ about the ChatGPT export tool"
      faqItems={faqItems}
      ctaTitle="Export ChatGPT conversations in seconds"
      ctaBody="Use GPT to PDF when you want a ChatGPT export tool focused on clean PDF downloads and a workflow built around shared links."
      ctaHref="/"
      ctaLabel="Use GPT to PDF"
      relatedTitle="Related pages:"
      relatedLinks={[
        { href: '/', label: 'Home' },
        { href: '/chatgpt-shared-link-to-pdf', label: 'ChatGPT shared link to PDF' },
        { href: '/export-chatgpt-chat', label: 'Export ChatGPT chat' },
        { href: '/chatgpt-to-pdf-no-extension', label: 'ChatGPT to PDF without extension' }
      ]}
    />
  );
}