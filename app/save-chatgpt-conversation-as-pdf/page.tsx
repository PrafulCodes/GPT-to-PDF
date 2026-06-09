import type { Metadata } from 'next';
import SeoLandingPage from '../../components/SeoLandingPage';
import { siteUrl } from '../../lib/branding';

const pageUrl = `${siteUrl}/save-chatgpt-conversation-as-pdf`;

const faqItems = [
  {
    q: 'How do I save a ChatGPT conversation as PDF?',
    a: 'Open the conversation, generate the public ChatGPT share link, paste it into GPT to PDF, and download the formatted file.'
  },
  {
    q: 'Can I download a ChatGPT conversation PDF without installing anything?',
    a: 'Yes. The converter works in the browser and does not require a desktop extension, account add-on, or extra software.'
  },
  {
    q: 'Does the PDF keep the conversation readable?',
    a: 'It preserves the conversational flow, headings, lists, code blocks, and tables so the exported PDF is easy to review later.'
  },
  {
    q: 'Is this the same as a ChatGPT conversation export?',
    a: 'It serves the same goal: turn a ChatGPT conversation into a clean PDF you can archive, email, or print.'
  }
];

export const metadata: Metadata = {
  title: 'Save ChatGPT Conversation as PDF | GPT to PDF',
  description:
    'Save ChatGPT conversation as PDF with GPT to PDF. Download a ChatGPT conversation PDF from a share link, preserve formatting, and keep an archive without an extension.',
  keywords: [
    'save chatgpt conversation as pdf',
    'download chatgpt conversation pdf',
    'chatgpt conversation export',
    'chatgpt to pdf',
    'chatgpt shared link to pdf',
    'chatgpt export conversation'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'Save ChatGPT Conversation as PDF | GPT to PDF',
    description:
      'Save ChatGPT conversation as PDF with GPT to PDF. Download a clean ChatGPT conversation PDF from a public share link without changing your workflow.',
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Save ChatGPT conversation as PDF with GPT to PDF'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Save ChatGPT Conversation as PDF | GPT to PDF',
    description:
      'Save ChatGPT conversation as PDF with GPT to PDF. Download a formatted ChatGPT conversation PDF from a share link without an extension.',
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function SaveChatGPTConversationAsPdfPage() {
  return (
    <SeoLandingPage
      pageUrl={pageUrl}
      pageLabel="Save ChatGPT Conversation as PDF"
      h1="Save ChatGPT Conversation as PDF"
      intro="Use GPT to PDF to turn a public ChatGPT conversation into a clean PDF you can archive, email, or print. The workflow stays simple: share the conversation, paste the link, and download the file."
      toolTitle="Convert a ChatGPT conversation into PDF"
      toolBody="This converter is built for people who want a fast way to save ChatGPT conversation as PDF without learning a new interface. It works with public ChatGPT share links, keeps the output readable, and avoids the friction of browser printing or extension installs."
      howTitle="How to save a ChatGPT conversation as PDF"
      howCards={[
        {
          title: 'Create a public share link',
          body: 'Open the conversation in ChatGPT, choose Share, and copy the public URL for the thread you want to keep.'
        },
        {
          title: 'Paste the link into GPT to PDF',
          body: 'Drop the shared link into the converter and let it fetch the conversation for formatting.'
        },
        {
          title: 'Download and archive the PDF',
          body: 'Save the exported file locally so you can revisit the conversation later without relying on the live link.'
        }
      ]}
      benefitsTitle="Why this approach works well"
      benefitsCards={[
        {
          title: 'Keeps the conversation portable',
          body: 'A PDF is easier to store, attach, and share than a live ChatGPT link that may be edited, deleted, or hidden later.'
        },
        {
          title: 'Preserves the useful parts',
          body: 'GPT to PDF focuses on clarity, so prompts, answers, code blocks, and structured content remain easy to read offline.'
        },
        {
          title: 'Avoids extra tooling',
          body: 'No browser extension, account add-on, or extra app is needed to export the conversation into a format you can keep.'
        }
      ]}
      faqTitle="FAQ about saving a ChatGPT conversation as PDF"
      faqItems={faqItems}
      ctaTitle="Ready to save a ChatGPT conversation as PDF?"
      ctaBody="Paste a public ChatGPT share link into GPT to PDF and generate a clean PDF version of the conversation in one flow."
      ctaHref="/"
      ctaLabel="Go to the converter"
      relatedTitle="Related pages:"
      relatedLinks={[
        { href: '/', label: 'Convert ChatGPT to PDF' },
        { href: '/chatgpt-shared-link-to-pdf', label: 'ChatGPT shared link to PDF' },
        { href: '/export-chatgpt-chat', label: 'Export ChatGPT chat' },
        { href: '/chatgpt-to-pdf-no-extension', label: 'ChatGPT to PDF without extension' }
      ]}
    />
  );
}