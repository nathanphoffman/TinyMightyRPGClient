import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tmrpg/schemas"],
  typedRoutes: true,
};

export default nextConfig;
