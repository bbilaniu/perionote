import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const repoBasePath = isGithubActions && repositoryName ? `/${repositoryName}` : "";
const distDir = process.env.PERIONOTE_NEXT_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir,
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
  //basePath: repoBasePath,
  //assetPrefix: repoBasePath
};

export default nextConfig;
