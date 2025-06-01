import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // 关闭严格模式
  output: 'standalone', // 支持 Docker 部署
};

export default nextConfig;
