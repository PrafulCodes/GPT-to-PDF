import type { Metadata } from 'next';
import SeoLandingPage from '../../components/SeoLandingPage';
import { siteUrl } from '../../lib/branding';
import { permanentRedirect } from 'next/navigation';

const pageUrl = `${siteUrl}/chatgpt-to-pdf-no-extension`;

const faqItems = [
  {
    q: 'Can I convert ChatGPT to PDF without extension?',
    a: 'Yes. GPT to PDF is browser-based, so you can convert a public ChatGPT share link without installing a browser extension.'
  },
  {
    q: 'Is this a ChatGPT PDF converter online?',
    a: 'Yes. Paste the public conversation link, generate the PDF, and download it directly from the browser.'
  },
  {
    q: 'Why avoid a browser extension for ChatGPT export?',
    a: 'An online converter keeps the workflow simpler and avoids permission prompts or extension maintenance.'
  },
  {
    q: 'Does the converter work on mobile?',
    a: 'Yes. The page is designed to work in mobile browsers, which is helpful when you need the PDF on the go.'
  }
];

export const metadata: Metadata = {
  title: 'ChatGPT to PDF Without Extension | GPT to PDF',
  description:
    'Convert ChatGPT to PDF without extension with GPT to PDF. Use a public ChatGPT share link to generate a clean PDF online and keep the workflow simple.',
  keywords: [
    'chatgpt to pdf without extension',
    'chatgpt pdf converter',
    'convert chatgpt to pdf online',
    'chatgpt to pdf',
    'chatgpt shared link to pdf',
    'export chatgpt chat'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: 'ChatGPT to PDF Without Extension | GPT to PDF',
    description:
      'Convert ChatGPT to PDF without extension with GPT to PDF. Generate a clean PDF from a public ChatGPT conversation link online.',
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ChatGPT to PDF without extension with GPT to PDF'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT to PDF Without Extension | GPT to PDF',
    description:
      'Convert ChatGPT to PDF without extension with GPT to PDF. Download a clean PDF from a public ChatGPT link online.',
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function ChatGPTToPdfWithoutExtensionPage() {
  permanentRedirect('/');
  return (
    <SeoLandingPage
      pageUrl={pageUrl}
      pageLabel="ChatGPT to PDF Without Extension"
      h1="ChatGPT to PDF Without Extension"
      intro="GPT to PDF gives you a straightforward way to convert ChatGPT to PDF without extension, using only a public conversation link and your browser."
      toolTitle="Use a browser-based ChatGPT PDF converter"
      toolBody="If you want a chatgpt pdf converter that stays online and avoids extension prompts, paste the public ChatGPT share link here and let GPT to PDF generate the file for you."
      howTitle="How to convert ChatGPT to PDF online"
      howCards={[
        {
          title: 'Share the conversation',
          body: 'Create a public ChatGPT link for the conversation you want to export.'
        },
        {
          title: 'Run the online conversion',
          body: 'Paste the link into GPT to PDF and let the site prepare the content for export.'
        },
        {
          title: 'Download the PDF',
          body: 'Save the finished PDF locally so you can keep or share the conversation without relying on an extension.'
        }
      ]}
      benefitsTitle="Why the no-extension workflow matters"
      benefitsCards={[
        {
          title: 'Less setup, faster export',
          body: 'You can move from share link to PDF in a single browser flow instead of managing add-ons or permissions.'
        },
        {
          title: 'Fits locked-down devices',
          body: 'When installing extensions is not practical, an online converter keeps the export path open.'
        },
        {
          title: 'Keeps GPT to PDF as the brand',
          body: 'The page stays focused on the GPT to PDF tool, so the brand remains the place to go for future ChatGPT exports.'
        }
      ]}
      faqTitle="FAQ about converting ChatGPT to PDF without extension"
      faqItems={faqItems}
      ctaTitle="Convert ChatGPT to PDF without extension"
      ctaBody="Open the converter, paste a public ChatGPT share link, and download a clean PDF without installing anything."
      ctaHref="/"
      ctaLabel="Start converting"
      relatedTitle="Related pages:"
      relatedLinks={[
        { href: '/', label: 'Convert ChatGPT to PDF' },
        { href: '/chatgpt-shared-link-to-pdf', label: 'ChatGPT shared link to PDF' },
        { href: '/save-chatgpt-conversation-as-pdf', label: 'Save ChatGPT conversation as PDF' },
        { href: '/export-chatgpt-chat', label: 'Export ChatGPT chat' }
      ]}
    />
  );
}