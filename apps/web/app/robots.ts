import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/branding';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/']
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}