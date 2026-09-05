import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function git(cwd: string, ...args: string[]) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function writeJson(cwd: string, file: string, value: unknown) {
  writeFileSync(path.join(cwd, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeVersion(cwd: string, version: string) {
  writeJson(cwd, "package.json", {
    name: "hygienenote",
    version,
    private: true,
    scripts: {
      release: "changeset tag",
      "versioning:check": "node scripts/check-versioning.mjs",
    },
  });
  writeJson(cwd, "package-lock.json", {
    name: "hygienenote",
    version,
    lockfileVersion: 3,
    packages: { "": { name: "hygienenote", version } },
  });
  writeFileSync(path.join(cwd, "CHANGELOG.md"), `# hygienenote\n\n## ${version}\n\nSynthetic release.\n`);
}

function commit(cwd: string, message: string) {
  git(cwd, "add", ".");
  git(cwd, "commit", "-m", message);
  return git(cwd, "rev-parse", "HEAD");
}

function fixture() {
  const directory = mkdtempSync(path.join(tmpdir(), "hygienenote-release-test-"));
  temporaryDirectories.push(directory);
  const cwd = path.join(directory, "work");
  const remote = path.join(directory, "origin.git");
  mkdirSync(cwd);
  git(directory, "init", "--bare", "--initial-branch=main", remote);
  git(cwd, "init", "--initial-branch=main");
  git(cwd, "config", "user.name", "Release Test");
  git(cwd, "config", "user.email", "release-test@example.invalid");
  git(cwd, "config", "commit.gpgsign", "false");
  git(cwd, "config", "tag.gpgsign", "false");
  git(cwd, "config", "core.hooksPath", "/dev/null");
  git(cwd, "remote", "add", "origin", remote);
  mkdirSync(path.join(cwd, ".changeset"));
  mkdirSync(path.join(cwd, "scripts"));
  copyFileSync(path.join(projectRoot, ".changeset/config.json"), path.join(cwd, ".changeset/config.json"));
  for (const file of ["check-versioning.mjs", "tag-release.sh", "archive-release.sh"]) {
    copyFileSync(path.join(projectRoot, "scripts", file), path.join(cwd, "scripts", file));
  }
  writeFileSync(path.join(cwd, ".gitignore"), "node_modules/\n");
  symlinkSync(path.join(projectRoot, "node_modules"), path.join(cwd, "node_modules"), "dir");
  writeVersion(cwd, "0.15.0");
  commit(cwd, "Existing application version");
  git(cwd, "push", "origin", "main");
  return { cwd, remote };
}

function tagRelease(cwd: string) {
  const result = spawnSync("bash", ["scripts/tag-release.sh"], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GITHUB_OUTPUT: path.join(cwd, ".git/action-output") },
  });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function archiveRelease(cwd: string) {
  const result = spawnSync("bash", ["scripts/archive-release.sh"], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GITHUB_STEP_SUMMARY: path.join(cwd, ".git/action-summary") },
  });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe("release tagging with local Git remotes", () => {
  it("skips ordinary pushes even with a misleading commit title and a pending major changeset", () => {
    const { cwd, remote } = fixture();
    writeFileSync(path.join(cwd, ".changeset/feature.md"), '---\n"hygienenote": major\n---\n\nSynthetic feature.\n');
    commit(cwd, "Fix Version Packages workflow");

    const result = tagRelease(cwd);
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("version unchanged");
    expect(git(remote, "tag", "--list")).toBe("");
    expect(git(cwd, "tag", "--list")).toBe("");
    expect(existsSync(path.join(cwd, ".git/action-output"))).toBe(false);
  });

  it("tags the version PR merge commit despite a custom title and can rerun safely", () => {
    const { cwd, remote } = fixture();
    git(cwd, "switch", "-c", "changeset-release/main");
    writeVersion(cwd, "1.0.0");
    const versionCommit = commit(cwd, "Version Packages");
    git(cwd, "switch", "main");
    git(cwd, "merge", "--no-ff", "changeset-release/main", "-m", "Ship the next application version");
    const releaseCommit = git(cwd, "rev-parse", "HEAD");
    expect(releaseCommit).not.toBe(versionCommit);
    git(cwd, "tag", "unrelated-local-tag");

    const firstRun = tagRelease(cwd);
    expect(firstRun.status, firstRun.output).toBe(0);
    expect(git(remote, "rev-parse", "refs/tags/v1.0.0^{commit}")).toBe(releaseCommit);
    expect(git(remote, "cat-file", "-t", "refs/tags/v1.0.0")).toBe("tag");
    expect(git(remote, "tag", "--list")).toBe("v1.0.0");
    expect(readFileSync(path.join(cwd, ".git/action-output"), "utf8")).toBe("tag=v1.0.0\n");

    // Simulate another runner discovering the existing tag from origin.
    git(cwd, "tag", "-d", "v1.0.0");
    const rerun = tagRelease(cwd);
    expect(rerun.status, rerun.output).toBe(0);
    expect(git(remote, "rev-parse", "refs/tags/v1.0.0^{commit}")).toBe(releaseCommit);
  });

  it("tags a squashed patch release without depending on its commit message", () => {
    const { cwd, remote } = fixture();
    writeVersion(cwd, "0.15.1");
    const releaseCommit = commit(cwd, "Ship reviewed fixes (#123)");

    const result = tagRelease(cwd);
    expect(result.status, result.output).toBe(0);
    expect(git(remote, "rev-parse", "refs/tags/v0.15.1^{commit}")).toBe(releaseCommit);
  });

  it("refuses to move a remote release tag pointing at another commit", () => {
    const { cwd, remote } = fixture();
    const originalCommit = git(cwd, "rev-parse", "HEAD");
    git(cwd, "tag", "-a", "v1.0.0", "-m", "Existing tag");
    git(cwd, "push", "origin", "refs/tags/v1.0.0");
    git(cwd, "tag", "-d", "v1.0.0");
    writeVersion(cwd, "1.0.0");
    commit(cwd, "Next release");

    const result = tagRelease(cwd);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain("already points to");
    expect(git(remote, "rev-parse", "refs/tags/v1.0.0^{commit}")).toBe(originalCommit);
  });

  it.each([
    ["lockfile version mismatch", "package-lock.json", (cwd: string) => {
      const lock = JSON.parse(readFileSync(path.join(cwd, "package-lock.json"), "utf8"));
      lock.packages[""].version = "0.15.0";
      writeJson(cwd, "package-lock.json", lock);
    }],
    ["missing release notes", "CHANGELOG.md", (cwd: string) => {
      writeFileSync(path.join(cwd, "CHANGELOG.md"), "# hygienenote\n\n## 0.15.0\n");
    }],
    ["unconsumed changesets", "pending changesets", (cwd: string) => {
      writeFileSync(path.join(cwd, ".changeset/feature.md"), '---\n"hygienenote": major\n---\n\nSynthetic feature.\n');
    }],
    ["disabled private-package tags", "enable versioning and tagging", (cwd: string) => {
      writeJson(cwd, ".changeset/config.json", { privatePackages: { version: true, tag: false } });
    }],
  ] as const)("rejects %s before creating a tag", (_label, expectedError, corrupt) => {
    const { cwd, remote } = fixture();
    writeVersion(cwd, "1.0.0");
    corrupt(cwd);
    commit(cwd, "Incomplete release metadata");

    const result = tagRelease(cwd);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain(expectedError);
    expect(git(cwd, "tag", "--list")).toBe("");
    expect(git(remote, "tag", "--list")).toBe("");
  });

  it("allows pending changesets in the development version check", () => {
    const { cwd } = fixture();
    writeFileSync(path.join(cwd, ".changeset/feature.md"), '---\n"hygienenote": major\n---\n\nSynthetic feature.\n');
    const result = spawnSync(process.execPath, ["scripts/check-versioning.mjs"], { cwd, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
  });
});

describe("release archive branches with local Git remotes", () => {
  it("archives the tagged commit after main advances and accepts a retry", () => {
    const { cwd, remote } = fixture();
    writeVersion(cwd, "1.0.0");
    const releaseCommit = commit(cwd, "Next release");
    const tag = tagRelease(cwd);
    expect(tag.status, tag.output).toBe(0);
    writeFileSync(path.join(cwd, "later.txt"), "Later development\n");
    const laterCommit = commit(cwd, "Later work on main");
    git(cwd, "push", "origin", "main");
    git(cwd, "checkout", "--detach", releaseCommit);

    const firstRun = archiveRelease(cwd);
    expect(firstRun.status, firstRun.output).toBe(0);
    expect(git(remote, "rev-parse", "refs/heads/archive/v1.0.0")).toBe(releaseCommit);
    expect(git(remote, "rev-parse", "refs/heads/main")).toBe(laterCommit);
    const summary = readFileSync(path.join(cwd, ".git/action-summary"), "utf8");
    expect(summary).toContain("archive/v1.0.0");
    expect(summary).toContain(releaseCommit);
    expect(summary).toContain("separate Workers Build");

    const retry = archiveRelease(cwd);
    expect(retry.status, retry.output).toBe(0);
    expect(git(remote, "rev-parse", "refs/heads/archive/v1.0.0")).toBe(releaseCommit);
  });

  it("refuses an archive branch pointing to another commit", () => {
    const { cwd, remote } = fixture();
    const originalCommit = git(cwd, "rev-parse", "HEAD");
    writeVersion(cwd, "1.0.0");
    commit(cwd, "Next release");
    const tag = tagRelease(cwd);
    expect(tag.status, tag.output).toBe(0);
    git(cwd, "push", "origin", `${originalCommit}:refs/heads/archive/v1.0.0`);

    const result = archiveRelease(cwd);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain("already points to");
    expect(git(remote, "rev-parse", "refs/heads/archive/v1.0.0")).toBe(originalCommit);
  });

  it("requires a published tag, even when a local tag exists", () => {
    const { cwd, remote } = fixture();
    writeVersion(cwd, "1.0.0");
    commit(cwd, "Next release");
    git(cwd, "tag", "-a", "v1.0.0", "-m", "Unpublished tag");

    const result = archiveRelease(cwd);
    expect(result.status, result.output).not.toBe(0);
    expect(git(remote, "branch", "--list", "archive/*")).toBe("");
  });

  it("refuses to archive a checkout that differs from the published tag", () => {
    const { cwd, remote } = fixture();
    writeVersion(cwd, "1.0.0");
    commit(cwd, "Next release");
    const tag = tagRelease(cwd);
    expect(tag.status, tag.output).toBe(0);
    writeFileSync(path.join(cwd, "later.txt"), "Later development\n");
    commit(cwd, "Unreleased work");

    const result = archiveRelease(cwd);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain("not checked-out commit");
    expect(git(remote, "branch", "--list", "archive/*")).toBe("");
  });

  it("does not overwrite a branch created concurrently with the archive push", () => {
    const { cwd, remote } = fixture();
    const originalCommit = git(cwd, "rev-parse", "HEAD");
    writeVersion(cwd, "1.0.0");
    commit(cwd, "Next release");
    const tag = tagRelease(cwd);
    expect(tag.status, tag.output).toBe(0);
    const hook = path.join(cwd, ".git/hooks/pre-push");
    writeFileSync(hook, '#!/usr/bin/env bash\ngit --git-dir="../origin.git" update-ref refs/heads/archive/v1.0.0 refs/heads/main\n');
    chmodSync(hook, 0o700);
    git(cwd, "config", "core.hooksPath", ".git/hooks");

    const result = archiveRelease(cwd);
    expect(result.status, result.output).not.toBe(0);
    expect(git(remote, "rev-parse", "refs/heads/archive/v1.0.0")).toBe(originalCommit);
  });
});
