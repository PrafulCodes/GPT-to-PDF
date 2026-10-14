import type { Metadata } from 'next';
import SeoLandingPage from '../../components/SeoLandingPage';
import { siteUrl } from '../../lib/branding';
import { permanentRedirect } from 'next/navigation';

const pageUrl = `${siteUrl}/export-chatgpt-chat`;

const faqItems = [
  {
    q: 'What does export ChatGPT chat mean on this site?',
    a: 'It means turning a public ChatGPT conversation link into a downloadable PDF that you can archive or share.'
  },
  {
    q: 'Can I export a ChatGPT chat without a Chrome extension?',
    a: 'Yes. GPT to PDF is designed as a browser-based workflow, so there is nothing to install before exporting the chat.'
  },
  {
    q: 'Will the exported chat still be readable?',
    a: 'The PDF keeps the conversation organized and readable, which makes it useful for reviews, handoffs, and documentation.'
  },
  {
    q: 'Is this useful for long ChatGPT conversations?',
    a: 'Yes, especially when you want a stable file format for a chat that contains research, technical notes, or client work.'
  }
];

export const metadata: Metadata = {
  title: 'Export ChatGPT Chat to PDF | GPT to PDF',
  description:
    'Export ChatGPT chat to PDF with GPT to PDF. Turn a public ChatGPT conversation into a clean PDF, keep it readable, and avoid installing a browser extension.',
  keywords: [
    'export chatgpt chat',
    'chatgpt export conversation',
    'download chatgpt chat',
    'chatgpt to pdf',
    'chatgpt shared link to pdf',
    'save chatgpt conversation as pdf'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'Export ChatGPT Chat to PDF | GPT to PDF',
    description:
      'Export ChatGPT chat to PDF with GPT to PDF. Convert a public ChatGPT conversation into a clean PDF without changing the existing workflow.',
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Export ChatGPT chat to PDF with GPT to PDF'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Export ChatGPT Chat to PDF | GPT to PDF',
    description:
      'Export ChatGPT chat to PDF with GPT to PDF. Download a clean PDF from a public ChatGPT conversation without a browser extension.',
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function ExportChatGptChatPage() {
  permanentRedirect('/');
  return (
    <SeoLandingPage
      pageUrl={pageUrl}
      pageLabel="Export ChatGPT Chat"
      h1="Export ChatGPT Chat to PDF"
      intro="GPT to PDF gives you a clear way to export ChatGPT chat into a downloadable PDF that can be archived, reviewed, or shared with a team."
      toolTitle="Export a ChatGPT chat from a shared link"
      toolBody="This page focuses on the chat export workflow: take a public ChatGPT conversation link, paste it into GPT to PDF, and generate a printable PDF with the formatting you need for offline use."
      howTitle="How to export a ChatGPT chat"
      howCards={[
        {
          title: 'Generate the share URL',
          body: 'Open the conversation in ChatGPT and copy the public link so the export tool can fetch it.'
        },
        {
          title: 'Convert the conversation',
          body: 'Paste the link into GPT to PDF and let the converter prepare the chat for PDF export.'
        },
        {
          title: 'Download the finished file',
          body: 'Save the PDF locally and use it as your chatgpt export conversation archive or handoff document.'
        }
      ]}
      benefitsTitle="Benefits of exporting ChatGPT chat to PDF"
      benefitsCards={[
        {
          title: 'Fits team workflows',
          body: 'A PDF is easy to forward to teammates, clients, or reviewers who do not need access to the live ChatGPT thread.'
        },
        {
          title: 'Useful for documentation',
          body: 'Exports are helpful when you want a record of decisions, prompts, technical steps, or research outputs in one file.'
        },
        {
          title: 'No extension dependency',
          body: 'The export process stays inside the browser, which keeps the flow simpler than extension-based alternatives.'
        }
      ]}
      faqTitle="FAQ about exporting ChatGPT chat"
      faqItems={faqItems}
      ctaTitle="Need to export a ChatGPT chat now?"
      ctaBody="Use GPT to PDF with a public ChatGPT share link and download a clean export in PDF format."
      ctaHref="/"
      ctaLabel="Open GPT to PDF"
      relatedTitle="Related pages:"
      relatedLinks={[
        { href: '/', label: 'Convert ChatGPT to PDF' },
        { href: '/chatgpt-shared-link-to-pdf', label: 'ChatGPT shared link to PDF' },
        { href: '/save-chatgpt-conversation-as-pdf', label: 'Save ChatGPT conversation as PDF' },
        { href: '/chatgpt-to-pdf-no-extension', label: 'ChatGPT to PDF without extension' }
      ]}
    />
  );
}