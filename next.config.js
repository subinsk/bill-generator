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
  
  // Webpack configuration for SQLite
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  }
};

module.exports = nextConfig;
