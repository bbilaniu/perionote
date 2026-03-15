export const dynamic = "force-static";

import type { MetadataRoute } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const repoBasePath = isGithubActions && repositoryName ? `/${repositoryName}` : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HygieneNote",
    short_name: "HygieneNote",
    description: "Periodontal chart notes",
    start_url: `${repoBasePath}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: `${repoBasePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${repoBasePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
