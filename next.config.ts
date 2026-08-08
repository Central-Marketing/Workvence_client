import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Determine the base API URL to proxy to. Fallback to localhost:8080 if not set.
    // Make sure to remove any trailing slash to prevent double slashes in proxy requests.
    const apiUrl = (process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`, // Proxy to Backend
      },
    ]
  },
};

export default nextConfig;
