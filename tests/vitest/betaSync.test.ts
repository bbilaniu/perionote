import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";

const script = path.resolve("scripts/sync-beta.sh");
const directories: string[] = [];

function git(cwd: string, ...args: string[]) {
  return execFileSync("git", args, {
    cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function commit(cwd: string, message: string) {
  git(cwd, "commit", "--allow-empty", "-m", message);
  return git(cwd, "rev-parse", "HEAD");
}

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "hygienenote-beta-sync-"));
  directories.push(root);
  const cwd = path.join(root, "work");
  const remote = path.join(root, "origin.git");
  mkdirSync(cwd);
  git(root, "init", "--bare", "--initial-branch=main", remote);
  git(cwd, "init", "--initial-branch=main");
  git(cwd, "config", "user.name", "CI Test");
  git(cwd, "config", "user.email", "ci@example.invalid");
  git(cwd, "config", "commit.gpgsign", "false");
  git(cwd, "config", "core.hooksPath", "/dev/null");
  git(cwd, "remote", "add", "origin", remote);
  const base = commit(cwd, "Base");
  git(cwd, "push", "origin", "HEAD:main", "HEAD:beta");
  const validated = commit(cwd, "Validated change");
  git(cwd, "push", "origin", "HEAD:main");
  return { cwd, remote, base, validated };
}

function sync(cwd: string, sha: string) {
  return spawnSync("bash", [script], {
    cwd, encoding: "utf8", timeout: 10_000,
    env: { ...process.env, GITHUB_SHA: sha },
  });
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("fast-forwards Beta to the validated commit and accepts a retry", () => {
  const { cwd, remote, validated } = fixture();
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = sync(cwd, validated);
    expect(result.status, result.stderr).toBe(0);
    expect(git(remote, "rev-parse", "beta")).toBe(validated);
  }
});

test("rejects an unvalidated checkout", () => {
  const { cwd, remote, base } = fixture();
  const result = sync(cwd, base);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("Checkout does not match");
  expect(git(remote, "rev-parse", "beta")).toBe(base);
});

test("skips a superseded main commit without promoting the untested tip", () => {
  const { cwd, remote, base, validated } = fixture();
  commit(cwd, "Newer untested main");
  git(cwd, "push", "origin", "HEAD:main");
  git(cwd, "checkout", "--detach", validated);
  const result = sync(cwd, validated);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain("Main has advanced");
  expect(git(remote, "rev-parse", "beta")).toBe(base);
});

test.each(["divergent", "newer"])("preserves a %s Beta branch", (kind) => {
  const { cwd, remote, base, validated } = fixture();
  git(cwd, "checkout", "--detach", kind === "divergent" ? base : validated);
  const beta = commit(cwd, "Independent Beta change");
  git(cwd, "push", "origin", "HEAD:beta");
  git(cwd, "checkout", "--detach", validated);
  expect(sync(cwd, validated).status).not.toBe(0);
  expect(git(remote, "rev-parse", "beta")).toBe(beta);
});
