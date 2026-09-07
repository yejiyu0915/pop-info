import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // monorepo: 루트 lockfile 경고 방지 (Turbopack root 대신 webpack dev 사용)
  outputFileTracingRoot: path.join(__dirname, '..'),
};

export default nextConfig;
