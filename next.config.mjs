import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mysql2'],
  turbopack: {
    root: path.resolve('.'),
  },
  async redirects() {
    return [
      {
        source: '/mentor/course/:id',
        destination: '/mentor/courses/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
