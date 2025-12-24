// next.config.js
// Configuración de Next.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_MAX_GUIAS_PER_BATCH: process.env.MAX_GUIAS_PER_BATCH || '50',
  },

  // Configuración para Puppeteer en Vercel
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Configuración para Puppeteer
      config.externals.push({
        'puppeteer': 'commonjs puppeteer',
        'chrome-aws-lambda': 'commonjs chrome-aws-lambda',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
