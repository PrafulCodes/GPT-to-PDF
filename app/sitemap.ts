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
    }
  ];
}
