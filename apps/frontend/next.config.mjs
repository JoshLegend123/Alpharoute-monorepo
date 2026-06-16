/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@alpharoute/shared-types'],
  
  // FIXED: Tell Next.js natively to skip static check barriers and build standalone
  output: 'standalone', 
};

export default nextConfig;