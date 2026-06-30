import './globals.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { siteUrl } from '../lib/branding';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      'Convert ChatGPT to PDF Free | GPT to PDF',
    template: '%s | GPT to PDF'
  },
  description:
    'Convert ChatGPT conversations and shared links into clean PDFs instantly. Preserve formatting, code blocks, equations, and tables. Free, no login, works on mobile.',
  keywords: [
    'chatgpt to pdf',
    'convert chatgpt to pdf',
    'save chatgpt conversation as pdf',
    'chatgpt pdf converter',
    'chatgpt shared link to pdf',
    'export chatgpt chat',
    'chatgpt conversation exporter',
    'chatgpt to pdf free',
    'chatgpt to pdf mobile',
    'chatgpt export pdf'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Convert ChatGPT to PDF Free',
    description:
      'Convert ChatGPT conversations and shared links into clean PDFs instantly.',
    url: siteUrl,
    siteName: 'GPT to PDF',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Convert ChatGPT to PDF'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert ChatGPT to PDF Free',
    description:
      'Convert ChatGPT conversations and shared links into clean PDFs instantly.',
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
      <body>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
