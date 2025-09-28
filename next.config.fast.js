/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip database operations during build
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },

  // Disable static generation for dynamic routes
  trailingSlash: false,

  // External packages for server components
  serverExternalPackages: ['@prisma/client'],

  // Simplified headers for development (major performance gain)
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return []; // No security headers in development - much faster!
    }

    // Only apply security headers in production
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
        ],
      },
    ];
  },
};

export default nextConfig;
