/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode in development to prevent double API calls
  reactStrictMode: false,
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  
  // Environment variables
  env: {
    // Add any custom environment variables here
  },
};

module.exports = nextConfig;
