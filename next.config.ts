import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  typedRoutes: true,
  reactCompiler: true,
};

export default nextConfig;
