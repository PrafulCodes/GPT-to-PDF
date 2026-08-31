import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './page.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

const videoTitle = 'How gpttopdf.site Works | ChatGPT Link to PDF';
const videoDescription = 'Watch how gpttopdf.site instantly converts a ChatGPT shared link into a clean, downloadable PDF. Preserves tables, code blocks, and mathematical formatting effortlessly.';
const videoUploadDate = '2024-10-24T00:00:00+00:00'; // Approximate upload date

export const metadata: Metadata = {
  title: videoTitle,
  description: videoDescription,
  alternates: {
    canonical: `${siteUrl}/video`
  },
  openGraph: {
    title: videoTitle,
    description: videoDescription,
    url: `${siteUrl}/video`,
    type: 'video.other',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'gpttopdf.site video thumbnail'
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
    name: 'How gpttopdf.site Works',
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
            <p className="video-kicker">Product Demonstration</p>
            <h1 className="video-heading">How gpttopdf.site Turns a ChatGPT Link into a PDF</h1>
            <p className="video-body">
              Watch how we preserve your ChatGPT shared links — including tables, code, and mathematical content — in a clean, downloadable PDF.
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
