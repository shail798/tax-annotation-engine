/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://tax-annotation-engine.onrender.com/api/:path*',
      },
    ];
  },
  reactStrictMode: true,
}

export default nextConfig 