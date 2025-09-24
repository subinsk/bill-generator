/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Vercel deployment
  output: 'standalone',
  
  // Ensure SQLite works in serverless environment
  serverExternalPackages: ['better-sqlite3'],
  
  // Environment variables
  env: {
    DISTRIBUTION_METHOD: process.env.DISTRIBUTION_METHOD || 'even',
    PREFERRED_ADJUSTMENT_ITEM: process.env.PREFERRED_ADJUSTMENT_ITEM || ''
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Disable ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration for SQLite
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  }
};

module.exports = nextConfig;
