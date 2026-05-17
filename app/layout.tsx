import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

const siteUrl = 'https://gpt-to-pdf-six.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'GPT to PDF',
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
    url: siteUrl,
    siteName: 'GPT to PDF',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
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
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png'
  },
  verification: {
    google: 'fTkvePLH7J-gdh0WhFq_y-IqLTfDa29Yo76wKxawvzY'
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
    canonical: siteUrl
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
