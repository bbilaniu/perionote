#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const VERSION_COUNT = 4;
const PATCH_DIRNAME = "patch";
const SESSION_FILENAME = ".codex-patch-session.json";

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function runGit(repoRoot, args, options = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function tryRunGit(repoRoot, args, options = {}) {
  try {
    return {
      ok: true,
      stdout: execFileSync("git", args, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        ...options,
      }).trim(),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout?.toString?.() ?? "",
      stderr: error.stderr?.toString?.() ?? "",
      error,
    };
  }
}

function getRepoRoot() {
  return runGit(process.cwd(), ["rev-parse", "--show-toplevel"]);
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = {};

  rest.forEach((arg) => {
    if (!arg.startsWith("--")) {
      fail(`Unexpected argument: ${arg}`);
    }

    const [key, rawValue] = arg.slice(2).split("=", 2);
    const value = rawValue ?? "true";

    switch (key) {
      case "run":
        options.run = Number.parseInt(value, 10);
        break;
      case "date":
        options.date = value;
        break;
      case "versions":
        options.versions = Number.parseInt(value, 10);
        break;
      case "base":
        options.base = value;
        break;
      case "force":
        options.force = value === "true";
        break;
      case "dry-run":
        options.dryRun = value === "true";
        break;
      case "keep-patches":
        options.keepPatches = value === "true";
        break;
      default:
        fail(`Unknown option: --${key}`);
    }
  });

  return { command, options };
}

function printHelp() {
  console.log(`codex-patch-branches

Usage:
  node scripts/codex-patch-branches.mjs prepare
  node scripts/codex-patch-branches.mjs apply

Commands:
  prepare   Create patch/X---1.patch through patch/X---4.patch for the next run.
  apply     Create YYYY-MM-DD--X---Y branches, apply each patch, and commit it.

Options:
  --run=N           Override the Codex run number (X).
  --date=YYYY-MM-DD Override the branch date. Defaults to today.
  --versions=N      Number of patch/branch versions to manage. Defaults to 4.
  --base=<ref>      Base branch/ref for branch creation during apply. Defaults to current HEAD.
  --force           Allow prepare to overwrite existing patch files for the target run.
  --dry-run         Print the planned actions without changing files or branches.
  --keep-patches    Keep patch/X---Y.patch files after apply instead of archiving them.

Typical flow:
  1. npm run codex:patches:prepare
  2. Paste GitHub patch contents into patch/X---1.patch ... patch/X---4.patch
  3. Make sure the repo is clean except for those patch files
  4. npm run codex:patches:apply
`);
}

function listBranches(repoRoot) {
  const output = runGit(repoRoot, ["branch", "--format=%(refname:short)"]);
  return output ? output.split("\n").filter(Boolean) : [];
}

function detectNextRun(branches, date) {
  const pattern = new RegExp(`^${date}--(\\d+)---\\d+$`);
  let maxRun = 0;

  branches.forEach((branch) => {
    const match = branch.match(pattern);
    if (!match) return;
    maxRun = Math.max(maxRun, Number.parseInt(match[1], 10));
  });

  return maxRun + 1;
}

function getPatchPaths(repoRoot, run, versions) {
  const patchDir = path.join(repoRoot, PATCH_DIRNAME);
  return Array.from({ length: versions }, (_, index) =>
    path.join(patchDir, `${run}---${index + 1}.patch`),
  );
}

function getSessionPath(repoRoot) {
  return path.join(repoRoot, PATCH_DIRNAME, SESSION_FILENAME);
}

function toRepoRelative(repoRoot, filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function writeSession(repoRoot, session) {
  fs.mkdirSync(path.join(repoRoot, PATCH_DIRNAME), { recursive: true });
  fs.writeFileSync(getSessionPath(repoRoot), `${JSON.stringify(session, null, 2)}\n`);
}

function readSession(repoRoot) {
  const sessionPath = getSessionPath(repoRoot);
  if (!fs.existsSync(sessionPath)) return null;
  return JSON.parse(fs.readFileSync(sessionPath, "utf8"));
}

function ensurePrepareInputs(repoRoot, options) {
  const date = options.date ?? getTodayDateString();
  const versions = options.versions ?? VERSION_COUNT;

  if (!Number.isInteger(versions) || versions <= 0) {
    fail("--versions must be a positive integer");
  }

  const run =
    options.run ??
    detectNextRun(listBranches(repoRoot), date);

  if (!Number.isInteger(run) || run <= 0) {
    fail("--run must be a positive integer");
  }

  return { date, run, versions };
}

function prepare(repoRoot, options) {
  const { date, run, versions } = ensurePrepareInputs(repoRoot, options);
  const patchPaths = getPatchPaths(repoRoot, run, versions);

  if (!options.force) {
    const existing = patchPaths.filter((filePath) => fs.existsSync(filePath));
    if (existing.length) {
      fail(
        `Patch files already exist for run ${run}: ${existing
          .map((filePath) => toRepoRelative(repoRoot, filePath))
          .join(", ")}. Use --force to overwrite them.`,
      );
    }
  }

  if (options.dryRun) {
    console.log(`Would prepare run ${run} for ${date}:`);
    patchPaths.forEach((filePath) => {
      console.log(`- ${toRepoRelative(repoRoot, filePath)}`);
    });
    return;
  }

  fs.mkdirSync(path.join(repoRoot, PATCH_DIRNAME), { recursive: true });
  patchPaths.forEach((filePath) => {
    fs.writeFileSync(filePath, "");
  });

  writeSession(repoRoot, {
    date,
    run,
    versions,
    preparedAt: new Date().toISOString(),
  });

  console.log(`Prepared patch files for run ${run} on ${date}:`);
  patchPaths.forEach((filePath) => {
    console.log(`- ${toRepoRelative(repoRoot, filePath)}`);
  });
  console.log("Paste your GitHub patch content into those files, then run apply.");
}

function getCurrentRef(repoRoot) {
  try {
    return runGit(repoRoot, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
  } catch {
    return runGit(repoRoot, ["rev-parse", "--verify", "HEAD"]);
  }
}

function getStatusLines(repoRoot) {
  const output = runGit(repoRoot, ["status", "--porcelain", "--untracked-files=all"]);
  return output ? output.split("\n").filter(Boolean) : [];
}

function parseStatusPath(line) {
  const payload = line.slice(3);
  if (payload.includes(" -> ")) {
    return payload.split(" -> ").at(-1);
  }
  return payload;
}

function validateApplyWorktree(repoRoot, session) {
  const allowed = new Set(
    getPatchPaths(repoRoot, session.run, session.versions).map((filePath) =>
      toRepoRelative(repoRoot, filePath),
    ),
  );
  allowed.add(path.posix.join(PATCH_DIRNAME, SESSION_FILENAME));

  const disallowed = getStatusLines(repoRoot).filter((line) => {
    const relativePath = parseStatusPath(line).replace(/\\/g, "/");
    return !allowed.has(relativePath);
  });

  if (disallowed.length) {
    fail(
      `Apply requires a clean worktree except for the current patch files. Clean or stash these entries first:\n${disallowed.join("\n")}`,
    );
  }
}

function ensurePatchFilesReady(repoRoot, session) {
  const patchPaths = getPatchPaths(repoRoot, session.run, session.versions);

  patchPaths.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      fail(`Missing patch file: ${toRepoRelative(repoRoot, filePath)}`);
    }

    const content = fs.readFileSync(filePath, "utf8").trim();
    if (!content) {
      fail(`Patch file is empty: ${toRepoRelative(repoRoot, filePath)}`);
    }
  });

  return patchPaths;
}

function listChangedPathsExcludingPatch(repoRoot) {
  return getStatusLines(repoRoot)
    .map(parseStatusPath)
    .map((filePath) => filePath.replace(/\\/g, "/"))
    .filter((filePath) => !filePath.startsWith(`${PATCH_DIRNAME}/`));
}

function stageChangedPaths(repoRoot) {
  const changedPaths = Array.from(new Set(listChangedPathsExcludingPatch(repoRoot)));

  if (!changedPaths.length) {
    fail("Patch applied no trackable changes.");
  }

  runGit(repoRoot, ["add", "--", ...changedPaths]);
}

function archivePatchFiles(repoRoot, session, patchPaths, dryRun) {
  const archiveDir = path.join(repoRoot, PATCH_DIRNAME, "archive");

  if (dryRun) {
    patchPaths.forEach((filePath, index) => {
      console.log(
        `Would archive ${path.relative(repoRoot, filePath)} -> ${path.join(
          PATCH_DIRNAME,
          "archive",
          `${session.date}--${session.run}---${index + 1}.patch`,
        ).replace(/\\/g, "/")}`,
      );
    });
    return;
  }

  fs.mkdirSync(archiveDir, { recursive: true });
  patchPaths.forEach((filePath, index) => {
    const archivePath = path.join(
      archiveDir,
      `${session.date}--${session.run}---${index + 1}.patch`,
    );
    fs.renameSync(filePath, archivePath);
  });
}

function getBranchName(session, version) {
  return `${session.date}--${session.run}---${version}`;
}

function ensureBranchesDoNotExist(repoRoot, session) {
  const branches = new Set(listBranches(repoRoot));
  const existing = Array.from({ length: session.versions }, (_, index) =>
    getBranchName(session, index + 1),
  ).filter((branchName) => branches.has(branchName));

  if (existing.length) {
    fail(`These branches already exist: ${existing.join(", ")}`);
  }
}

function preflightPatchApplications(repoRoot, session, baseRef, patchPaths) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-patch-preflight-"));
  const tempWorktree = path.join(tempRoot, "repo");
  const failures = [];

  try {
    runGit(repoRoot, ["worktree", "add", "--detach", tempWorktree, baseRef], {
      stdio: ["ignore", "pipe", "inherit"],
    });

    patchPaths.forEach((filePath, index) => {
      const version = index + 1;
      const result = tryRunGit(tempWorktree, [
        "apply",
        "--check",
        "--verbose",
        filePath,
      ]);

      if (result.ok) return;

      failures.push({
        branchName: getBranchName(session, version),
        patchPath: toRepoRelative(repoRoot, filePath),
        details: `${result.stdout}${result.stderr}`.trim(),
      });
    });
  } finally {
    tryRunGit(repoRoot, ["worktree", "remove", "--force", tempWorktree]);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }

  if (failures.length) {
    const details = failures
      .map(
        ({ branchName, patchPath, details: failureDetails }) =>
          `- ${branchName} <= ${patchPath}\n${failureDetails}`,
      )
      .join("\n\n");

    fail(
      `One or more patches do not apply cleanly from base ${baseRef}. No branches were created.\n\n${details}`,
    );
  }
}

function apply(repoRoot, options) {
  const session = readSession(repoRoot);
  if (!session) {
    fail(`No ${PATCH_DIRNAME}/${SESSION_FILENAME} found. Run prepare first.`);
  }

  const resolvedSession = {
    date: options.date ?? session.date,
    run: options.run ?? session.run,
    versions: options.versions ?? session.versions ?? VERSION_COUNT,
  };

  if (!Number.isInteger(resolvedSession.run) || resolvedSession.run <= 0) {
    fail("Resolved run number is invalid.");
  }

  validateApplyWorktree(repoRoot, resolvedSession);

  const patchPaths = ensurePatchFilesReady(repoRoot, resolvedSession);
  const baseRef = options.base ?? getCurrentRef(repoRoot);
  const restoreRef = getCurrentRef(repoRoot);

  ensureBranchesDoNotExist(repoRoot, resolvedSession);

  if (options.dryRun) {
    console.log(`Would create ${resolvedSession.versions} branches from ${baseRef}:`);
    patchPaths.forEach((filePath, index) => {
      console.log(
        `- ${resolvedSession.date}--${resolvedSession.run}---${index + 1} <= ${path.relative(
          repoRoot,
          filePath,
        ).replace(/\\/g, "/")}`,
      );
    });
    if (!options.keepPatches) {
      archivePatchFiles(repoRoot, resolvedSession, patchPaths, true);
    }
    return;
  }

  preflightPatchApplications(repoRoot, resolvedSession, baseRef, patchPaths);

  patchPaths.forEach((filePath, index) => {
    const version = index + 1;
    const branchName = getBranchName(resolvedSession, version);

    runGit(repoRoot, ["switch", "-c", branchName, baseRef], { stdio: ["ignore", "pipe", "inherit"] });
    runGit(repoRoot, ["apply", "--3way", filePath], { stdio: ["ignore", "pipe", "inherit"] });
    stageChangedPaths(repoRoot);
    runGit(
      repoRoot,
      ["commit", "-m", `chore(patch): apply ${resolvedSession.date}--${resolvedSession.run}---${version}`],
      { stdio: ["ignore", "pipe", "inherit"] },
    );
    console.log(`Created ${branchName}`);
  });

  runGit(repoRoot, ["switch", restoreRef], { stdio: ["ignore", "pipe", "inherit"] });

  if (!options.keepPatches) {
    archivePatchFiles(repoRoot, resolvedSession, patchPaths, false);
  }

  writeSession(repoRoot, {
    ...resolvedSession,
    appliedAt: new Date().toISOString(),
  });

  console.log(`Finished creating branches for run ${resolvedSession.run} on ${resolvedSession.date}.`);
}

function main() {
  const repoRoot = getRepoRoot();
  const { command, options } = parseArgs(process.argv.slice(2));

  switch (command) {
    case "prepare":
      prepare(repoRoot, options);
      break;
    case "apply":
      apply(repoRoot, options);
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      fail(`Unknown command: ${command}`);
  }
}

main();
