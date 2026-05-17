/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@sparticuz/chromium',
    'puppeteer-core',
    'puppeteer',
  ],
};

module.exports = nextConfig;
