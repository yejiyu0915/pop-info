import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // monorepo: 루트 lockfile 경고 방지 (Turbopack root 대신 webpack dev 사용)
  outputFileTracingRoot: path.join(__dirname, '..'),
  // 1 GB Oracle VM과 일반 노트북에서 production build 시 과도한 worker 생성 방지
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
