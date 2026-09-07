import type { NextConfig } from "next";

const distDir = process.env.PERIONOTE_NEXT_DIST_DIR ?? ".next";
const rootDir = process.env.PERIONOTE_NEXT_ROOT_DIR ?? process.cwd();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir,
  outputFileTracingRoot: rootDir,
  turbopack: { root: rootDir },
  trailingSlash: true,
};

export default nextConfig;
