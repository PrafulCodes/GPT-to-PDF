import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert ChatGPT Shared Links to PDF — Free, No Login',
  description:
    'Paste any ChatGPT shared link and download a clean, formatted PDF in seconds. No extension, no signup, works on mobile. Free forever.',
  keywords: [
    'chatgpt conversation to pdf online free',
    'convert chatgpt share url to pdf',
    'chatgpt shared link pdf downloader',
    'free chatgpt to pdf',
    'chatgpt to pdf without extension',
    'mobile friendly chatgpt pdf export'
  ],
  openGraph: {
    title: 'Convert ChatGPT Shared Links to PDF — Free, No Login',
    description:
      'Paste any ChatGPT shared link and download a clean, formatted PDF in seconds. No extension, no signup, works on mobile. Free forever.',
    url: 'https://your-domain.com/',
    siteName: 'GPT to PDF',
    images: [
      {
        url: 'https://your-domain.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChatGPT to PDF preview'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert ChatGPT Shared Links to PDF — Free, No Login',
    description:
      'Paste any ChatGPT shared link and download a clean, formatted PDF in seconds. No extension, no signup, works on mobile. Free forever.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  other: {
    canonical: 'https://your-domain.com/'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
