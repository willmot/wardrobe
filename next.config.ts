import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  outputFileTracingExcludes: { "/*": ["./.runtime/**", "./.data/**", "./wardrobe.config.json", "./.env*"] },
};
export default nextConfig;
