import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // 关闭严格模式
  // 暂时移除 standalone 模式以避免 Windows 符号链接问题
  // output: 'standalone', // 支持 Docker 部署
};

export default nextConfig;
