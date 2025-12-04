/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development
  reactStrictMode: true,
  
  // Image optimization with remotePatterns (new format)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.open-meteo.com',
      },
      {
        protocol: 'https',
        hostname: 'nominatim.openstreetmap.org',
      },
    ],
  },
  
  // Enable compression
  compress: true,
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_APP_NAME: 'AgroAI',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
