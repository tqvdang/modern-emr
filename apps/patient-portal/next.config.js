/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Internationalization configuration
  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  // PWA configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Accept-Language',
            value: 'en,vi;q=0.9',
          },
        ],
      },
    ];
  },
  // Optimize for mobile performance
  compress: true,
  poweredByHeader: false,
  // Enable SWC minification
  swcMinify: true,
  // Optimize bundle
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize for production
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  // Redirect configuration for language routing
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/en/dashboard',
        permanent: false,
        locale: false,
      },
      {
        source: '/patients',
        destination: '/en/patients',
        permanent: false,
        locale: false,
      },
    ];
  },
};

module.exports = nextConfig;