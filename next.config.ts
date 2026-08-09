import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const mainApiUrl = (process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
    const adminApiUrl = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8082/api').replace(/\/$/, '');
    return [
      {
        source: '/api/support/:path*',
        destination: `${adminApiUrl}/support/:path*`,
      },
      {
        source: '/api/storage/:path*',
        destination: `${adminApiUrl}/storage/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${mainApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
