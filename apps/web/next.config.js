/** @type {import('next').NextConfig} */
const csp = [
  "default-src 'self' https://*.clarity.ms https://c.bing.com",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "style-src-elem 'self' https://fonts.googleapis.com 'unsafe-inline'",
  "img-src 'self' data: blob: https: https://c.bing.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.vercel.app https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://adservice.google.com https://*.clarity.ms https://c.bing.com",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "child-src 'self' https://googleads.g.doubleclick.net",
  'upgrade-insecure-requests'
].join('; ');

const nextConfig = {
  serverExternalPackages: [
    '@sparticuz/chromium-min',
    'puppeteer-core',
    'puppeteer',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        '@sparticuz/chromium-min',
        'puppeteer-core',
        'puppeteer',
      ];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp }
        ]
      }
    ];
  },
  async redirects() {
    const duplicateLandingPages = [
      '/save-chatgpt-conversation-as-pdf',
      '/export-chatgpt-chat',
      '/chatgpt-to-pdf-no-extension',
      '/why-chatgpt-export-is-hard',
      '/print-chatgpt-conversation',
      '/chatgpt-conversation-archive',
      '/chatgpt-export-tool',
      '/how-to-save-chatgpt-conversations'
    ];

    return duplicateLandingPages.map((source) => ({
      source,
      destination: '/chatgpt-shared-link-to-pdf',
      permanent: true
    }));
  }
};

module.exports = nextConfig;


