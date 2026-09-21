import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mysql2'],
  turbopack: {
    root: path.resolve('.'),
  },
};

export default nextConfig;
