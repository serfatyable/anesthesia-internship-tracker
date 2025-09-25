/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip database operations during build
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
  // Disable static generation for dynamic routes
  trailingSlash: false,
};

export default nextConfig;
