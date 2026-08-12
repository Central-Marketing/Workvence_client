import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    let rawMainUrl = (
      process.env.NEXT_PUBLIC_SERVER_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080/api'
    ).trim().replace(/\/$/, '');

    // Ensure mainApiUrl always ends with /api
    const mainApiUrl = rawMainUrl.endsWith('/api') ? rawMainUrl : `${rawMainUrl}/api`;

    let rawAdminUrl = (
      process.env.NEXT_PUBLIC_ADMIN_API_URL ||
      process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL ||
      'http://localhost:8082/api'
    ).trim().replace(/\/$/, '');

    // Ensure adminApiUrl always ends with /api
    const adminApiUrl = rawAdminUrl.endsWith('/api') ? rawAdminUrl : `${rawAdminUrl}/api`;

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
