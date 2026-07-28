import { spawn } from "node:child_process";
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
const nextBinary = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

const child = spawn(process.execPath, [nextBinary, command, ...nextArguments], {
  cwd: projectRoot,
  env: {
    ...process.env,
    PERIONOTE_NEXT_DIST_DIR: distDir,
  },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.once("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
