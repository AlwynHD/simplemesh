/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    domains: ['i.pravatar.cc', 'dtvtmcu5ktkw1.cloudfront.net', 'placehold.co', 'source.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dtvtmcu5ktkw1.cloudfront.net',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
      crypto: false,
      fs: false,
      http2: false,
      buffer: false,
      process: false,
      stream: false,
      tls: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;