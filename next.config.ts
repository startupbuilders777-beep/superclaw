import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker container optimization
  output: "standalone",
  // Ignore TypeScript errors during build (for production)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Relax ESLint for now
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
