const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@hishab/shared"],
  reactStrictMode: true,
  images: {
    // Vercel's /_next/image optimizer is not routed in this services-based
    // monorepo deployment (requests 404 with x-matched-path: /_not-found).
    // All images are small local PNGs in /public, so serve them directly.
    unoptimized: true,
  },
};

module.exports = withNextIntl(nextConfig);
