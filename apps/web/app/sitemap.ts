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
      url: `${siteUrl}/video/how-to-convert-chatgpt-to-pdf`,
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
