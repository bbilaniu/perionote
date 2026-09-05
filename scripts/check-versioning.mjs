#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

try {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  const config = readJson(".changeset/config.json");
  const errors = [];
  const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;

  if (pkg.name !== "hygienenote" || pkg.private !== true) {
    errors.push('package.json must describe the private "hygienenote" application.');
  }
  if (typeof pkg.version !== "string" || !semver.test(pkg.version)) {
    errors.push("package.json must contain a semantic version.");
  }
  if (
    lock.name !== pkg.name || lock.packages?.[""]?.name !== pkg.name ||
    lock.version !== pkg.version || lock.packages?.[""]?.version !== pkg.version
  ) {
    errors.push("package-lock.json root name and version must match package.json.");
  }
  const latestVersion = readFileSync("CHANGELOG.md", "utf8").match(/^##\s+(\S+)\s*$/mu)?.[1];
  if (latestVersion !== pkg.version) {
    errors.push(`The first version heading in CHANGELOG.md must be ${pkg.version}.`);
  }
  if (config.privatePackages?.version !== true || config.privatePackages?.tag !== true) {
    errors.push("Changesets must enable versioning and tagging private packages.");
  }
  if (pkg.scripts?.release !== "changeset tag") {
    errors.push('The release script must be "changeset tag".');
  }

  if (process.argv.includes("--release")) {
    const pending = readdirSync(".changeset").filter((name) => name.endsWith(".md") && name !== "README.md");
    if (pending.length > 0) {
      errors.push(`Release still has pending changesets: ${pending.join(", ")}. Merge the version PR first.`);
    }
    if (config.ignore?.includes(pkg.name)) {
      errors.push("Changesets must not ignore the application package.");
    }
  }

  if (errors.length > 0) throw new Error(errors.join("\n"));
  console.log(`Versioning check passed for ${pkg.name}@${pkg.version}.`);
} catch (error) {
  console.error(`Versioning check failed: ${error.message}`);
  process.exitCode = 1;
}
