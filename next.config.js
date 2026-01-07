/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to allow Vercel to handle API routes as serverless functions
  // Static pages will still be optimized automatically by Vercel
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig

