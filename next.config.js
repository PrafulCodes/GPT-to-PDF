/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@sparticuz/chromium',
    'puppeteer-core',
    'puppeteer',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure these native modules are not bundled and are loaded from node_modules at runtime
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        '@sparticuz/chromium',
        'puppeteer-core',
        'puppeteer',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;

