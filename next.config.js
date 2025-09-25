/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip database operations during build
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
  // Disable static generation for dynamic routes
  trailingSlash: false,
  // Disable static optimization for API routes
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Force dynamic rendering for all pages
  output: 'standalone',
};

export default nextConfig;
