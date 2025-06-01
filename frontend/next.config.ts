import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // 关闭严格模式
  output: 'standalone', // 支持 Docker 部署
  outputFileTracingRoot: process.cwd(), // 设置追踪根目录
  outputFileTracingExcludes: {
    '*': [
      'node_modules/**/*',
      '.next/**/*',
      '.git/**/*'
    ]
  },
  // 禁用符号链接以避免 Windows 权限问题
  trailingSlash: false,
};

export default nextConfig;
