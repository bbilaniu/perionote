import type { NextConfig } from "next";

const distDir = process.env.PERIONOTE_NEXT_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir,
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
};

export default nextConfig;
