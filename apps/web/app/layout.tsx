import './globals.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { siteUrl } from '../lib/branding';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      'ChatGPT Link to PDF Converter | GPTtoPDF',
    template: '%s | GPTtoPDF'
  },
  description:
    'GPTtoPDF is a free ChatGPT Link to PDF Converter. Convert shared links to PDF without login or extensions. Preserves tables, code, and math formatting.',
  keywords: [
    'chatgpt link to pdf converter',
    'chatgpt to pdf converter',
    'chat gpt link to pdf converter',
    'gpt link to pdf',
    'gpt to pdf',
    'chatgpt to pdf',
    'export chatgpt to pdf',
    'print chatgpt conversation',
    'save chatgpt conversation',
    'gpttopdf'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'ChatGPT Link to PDF Converter | GPTtoPDF',
    description:
      'GPTtoPDF is a free ChatGPT Link to PDF Converter. Convert shared links to PDF without login or extensions. Preserves tables, code, and math formatting.',
    url: siteUrl,
    siteName: 'GPTtoPDF',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ChatGPT Link to PDF Converter'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT Link to PDF Converter | GPTtoPDF',
    description:
      'GPTtoPDF is a free ChatGPT Link to PDF Converter. Convert shared links to PDF without login or extensions. Preserves tables, code, and math formatting.',
    images: [`${siteUrl}/og-image.png`]
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
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5797461661880771"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
