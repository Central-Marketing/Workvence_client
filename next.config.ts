import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 85],
  },
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
      'http://localhost:8082/api/admin'
    ).trim().replace(/\/$/, '');

    // Ensure adminApiUrl always ends with /api/admin
    let adminApiUrl = rawAdminUrl;
    if (!adminApiUrl.endsWith('/admin')) {
      adminApiUrl = adminApiUrl.endsWith('/api') ? `${adminApiUrl}/admin` : `${adminApiUrl}/api/admin`;
    }

    return [
      {
        source: '/api/support/:path*',
        destination: `${mainApiUrl}/support/:path*`,
      },
      {
        source: '/api/storage/:path*',
        destination: `${mainApiUrl}/storage/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${adminApiUrl}/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${mainApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
