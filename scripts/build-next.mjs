import { spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
// Keep the isolated sources and linked dependencies inside one Turbopack root.
const buildDirectory = path.join(projectRoot, ".next-build");
mkdirSync(buildDirectory, { recursive: true });
const buildRoot = mkdtempSync(path.join(buildDirectory, "build-"));
const projectOutput = path.join(projectRoot, "out");
const buildOutput = path.join(buildRoot, "out");
const excludedEntries = new Set([
  ".git",
  ".next",
  ".next-build",
  ".next-dev",
  ".next-dev.lock",
  ".next-playwright",
  ".next-playwright.lock",
  "coverage",
  "node_modules",
  "out",
  "playwright-report",
  "test-results",
]);

try {
  for (const entry of readdirSync(projectRoot, { withFileTypes: true })) {
    if (excludedEntries.has(entry.name)) {
      continue;
    }
    cpSync(path.join(projectRoot, entry.name), path.join(buildRoot, entry.name), {
      recursive: true,
    });
  }

  symlinkSync(
    path.join(projectRoot, "node_modules"),
    path.join(buildRoot, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
} catch (error) {
  cleanBuildRoot();
  throw error;
}

const childEnvironment = {
  ...process.env,
  PERIONOTE_NEXT_ROOT_DIR: projectRoot,
};
delete childEnvironment.PERIONOTE_NEXT_DIST_DIR;

const nextBinary = path.join(
  buildRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const child = spawn(process.execPath, [nextBinary, "build", ...process.argv.slice(2)], {
  cwd: buildRoot,
  env: childEnvironment,
  stdio: "inherit",
});

function cleanBuildRoot() {
  rmSync(buildRoot, { recursive: true, force: true });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.once("error", (error) => {
  cleanBuildRoot();
  console.error(error);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  if (code !== 0 || signal) {
    cleanBuildRoot();
    process.exitCode = code ?? 1;
    return;
  }
  if (!existsSync(buildOutput)) {
    console.error(`Next.js did not create the expected export at ${buildOutput}`);
    cleanBuildRoot();
    process.exitCode = 1;
    return;
  }

  try {
    rmSync(projectOutput, { recursive: true, force: true });
    cpSync(buildOutput, projectOutput, { recursive: true });
  } finally {
    cleanBuildRoot();
  }
});
