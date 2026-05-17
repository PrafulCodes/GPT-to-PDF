/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;


