import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/branding';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${siteUrl}/chatgpt-shared-link-to-pdf`,
      changeFrequency: 'weekly',
      priority: 0.95
    },
    {
      url: `${siteUrl}/video/how-to-convert-chatgpt-to-pdf`,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'weekly',
      priority: 0.6
    },
    {
      url: `${siteUrl}/how-to-use`,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: 'weekly',
      priority: 0.4
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: 'weekly',
      priority: 0.4
    },
    {
      url: `${siteUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    ...[
      'why-browser-printing-breaks-chatgpt-code-blocks-and-tables',
      'archiving-ai-research-and-prompt-engineering-outputs-for-teams',
      'legal-compliance-teams-document-llm-interactions-secure-pdfs'
    ].map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7
    }
    ))
  ];
}
