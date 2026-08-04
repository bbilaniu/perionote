import { spawn } from "node:child_process";
import {
  closeSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , command, distDir, ...nextArguments] = process.argv;
const supportedCommands = new Set(["dev", "start"]);
const validDistDir = /^\.[a-z0-9][a-z0-9._-]*$/i;

if (!supportedCommands.has(command) || !validDistDir.test(distDir ?? "")) {
  console.error(
    "Usage: node scripts/run-next.mjs <dev|start> <.dist-dir> [...next arguments]",
  );
  process.exit(1);
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const lockPath = path.join(projectRoot, `${distDir}.lock`);
const nextBinary = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

function acquireLock() {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const descriptor = openSync(lockPath, "wx");
      try {
        writeFileSync(descriptor, `${process.pid}\n`, "utf8");
      } finally {
        closeSync(descriptor);
      }
      return;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;

      let ownerPid = Number.NaN;
      try {
        ownerPid = Number.parseInt(readFileSync(lockPath, "utf8"), 10);
      } catch (readError) {
        if (readError?.code !== "ENOENT") throw readError;
      }

      if (isProcessRunning(ownerPid)) {
        console.error(
          `Cannot start Next.js: process ${ownerPid} is already using ${distDir}. Stop that process before starting another ${command} server with the same output directory.`,
        );
        process.exit(1);
      }

      try {
        unlinkSync(lockPath);
      } catch (unlinkError) {
        if (unlinkError?.code !== "ENOENT") throw unlinkError;
      }
    }
  }

  throw new Error(`Unable to acquire the Next.js output lock at ${lockPath}`);
}

function releaseLock(ownerPid) {
  try {
    const currentOwnerPid = Number.parseInt(readFileSync(lockPath, "utf8"), 10);
    if (currentOwnerPid === ownerPid) unlinkSync(lockPath);
  } catch (error) {
    if (error?.code !== "ENOENT") console.error(error);
  }
}

acquireLock();

const child = spawn(process.execPath, [nextBinary, command, ...nextArguments], {
  cwd: projectRoot,
  env: {
    ...process.env,
    PERIONOTE_NEXT_DIST_DIR: distDir,
  },
  stdio: "inherit",
});
const ownerPid = child.pid ?? process.pid;
writeFileSync(lockPath, `${ownerPid}\n`, "utf8");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.once("error", (error) => {
  releaseLock(ownerPid);
  console.error(error);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  releaseLock(ownerPid);
  process.exitCode = code ?? (signal ? 1 : 0);
});
