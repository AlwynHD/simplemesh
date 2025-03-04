/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {
        bodySizeLimit: '5mb',
      },
    },
    images: {
      // Add your domain where thumbnails are hosted
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'dtvtmcu5ktkw1.cloudfront.net',
          port: '',
          search: '',
        },
      ],
    },
  };
  module.exports = {
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
  }
  
  export default nextConfig;