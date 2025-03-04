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
    eslint: {
      ignoreDuringBuilds: true,
  },
  };

  
  export default nextConfig;