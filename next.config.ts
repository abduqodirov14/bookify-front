import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://3-68-191-39.sslip.io/:path*',
      },
    ];
  },
};

export default nextConfig;
