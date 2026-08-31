import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/branding';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${siteUrl}/video`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${siteUrl}/chatgpt-shared-link-to-pdf`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${siteUrl}/save-chatgpt-conversation-as-pdf`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${siteUrl}/export-chatgpt-chat`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${siteUrl}/chatgpt-to-pdf-no-extension`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${siteUrl}/why-chatgpt-export-is-hard`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${siteUrl}/print-chatgpt-conversation`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.78
    },
    {
      url: `${siteUrl}/chatgpt-conversation-archive`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.78
    },
    {
      url: `${siteUrl}/chatgpt-export-tool`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.78
    },
    {
      url: `${siteUrl}/how-to-save-chatgpt-conversations`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.78
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.4
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.4
    }
  ];
}
