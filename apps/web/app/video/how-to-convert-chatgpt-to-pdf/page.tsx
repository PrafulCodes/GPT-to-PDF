import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import '../page.css';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { siteUrl } from '../../../lib/branding';

const pageUrl = `${siteUrl}/video/how-to-convert-chatgpt-to-pdf`;
const videoTitle = 'How to Convert a ChatGPT Link to PDF | GPTtoPDF';
const videoDescription =
  'Watch how GPTtoPDF converts a ChatGPT shared link into a clean, downloadable PDF while preserving supported formatting such as tables, code blocks, and mathematical content.';
const videoUploadDate = '2026-09-01T00:00:00+05:30';

export const metadata: Metadata = {
  title: videoTitle,
  description: videoDescription,
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: videoTitle,
    description: videoDescription,
    url: pageUrl,
    type: 'video.other',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'GPTtoPDF ChatGPT link to PDF video thumbnail'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: videoTitle,
    description: videoDescription,
    images: [`${siteUrl}/og-image.png`]
  }
};

export default function VideoWatchPage() {
  const videoObjectLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: videoTitle,
    description: videoDescription,
    thumbnailUrl: `${siteUrl}/og-image.png`,
    uploadDate: videoUploadDate,
    contentUrl: `${siteUrl}/video/gpttopdf-demo.webm`
  };

  return (
    <div className="video-page">
      <Navbar />

      <main>
        <section className="video-section">
          <div className="video-intro">
            <p className="video-kicker">GPTtoPDF video guide</p>
            <h1 className="video-heading">How to Convert a ChatGPT Link to PDF</h1>
            <p className="video-body">
              Watch the complete GPTtoPDF workflow: start with a public ChatGPT shared link and finish with a clean PDF that keeps useful conversation formatting readable.
            </p>
          </div>

          <div className="video-player-container">
            <video
              controls
              preload="none"
              playsInline
              width="1280"
              height="720"
              poster="/og-image.png"
            >
              <source src="/video/gpttopdf-demo.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="video-context">
            <h2>What this GPTtoPDF video shows</h2>
            <p>
              The demonstration covers the short path from a ChatGPT shared link to a downloadable PDF. GPTtoPDF is designed for public conversations and aims to keep headings, lists, code blocks, tables, and mathematical content organized in the exported document.
            </p>
            <h2>How to follow along</h2>
            <ol>
              <li>Copy a public ChatGPT conversation link.</li>
              <li>Paste the link into the GPTtoPDF converter.</li>
              <li>Generate and download the formatted PDF.</li>
            </ol>
            <p>
              When you are ready to try the workflow, open the <Link href="/">GPTtoPDF converter</Link>.
            </p>
          </div>

          <p className="video-disclaimer">
            gpttopdf.site is not affiliated with or endorsed by OpenAI. ChatGPT is a trademark of OpenAI.
          </p>

          <div className="back-link-container">
            <Link href="/" className="back-link">
              <span aria-hidden="true">←</span> Try the converter
            </Link>
          </div>
        </section>

        <Footer />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectLd) }} />
      </main>
    </div>
  );
}