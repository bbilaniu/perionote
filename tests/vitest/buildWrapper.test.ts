import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function fixture() {
  const directory = mkdtempSync(path.join(tmpdir(), "hygienenote-build-test-"));
  temporaryDirectories.push(directory);
  for (const name of ["scripts", "node_modules/next/dist/bin", "out", ".next-dev", ".next-build/other-build"]) {
    mkdirSync(path.join(directory, name), { recursive: true });
  }
  copyFileSync(
    path.resolve("scripts/build-next.mjs"),
    path.join(directory, "scripts/build-next.mjs"),
  );
  writeFileSync(path.join(directory, "tsconfig.json"), "original config");
  writeFileSync(path.join(directory, "out/index.html"), "previous export");
  writeFileSync(path.join(directory, ".next-dev/sentinel"), "active dev output");
  writeFileSync(path.join(directory, ".next-build/other-build/sentinel"), "other build");
  writeFileSync(path.join(directory, "node_modules/next/dist/bin/next"), `
    const assert = require("node:assert/strict");
    const fs = require("node:fs");
    const path = require("node:path");
    const root = process.env.PERIONOTE_NEXT_ROOT_DIR;
    assert.ok(root && path.isAbsolute(root), "The resolver root must be explicit");
    for (const target of [process.cwd(), fs.realpathSync("node_modules")]) {
      const relative = path.relative(root, target);
      assert.ok(!path.isAbsolute(relative) && !relative.split(path.sep).includes(".."),
        "Sources and real dependency paths must stay inside the resolver root");
    }
    assert.ok(!fs.existsSync(".next-build"), "Other build copies must not be copied recursively");
    assert.ok(!fs.existsSync(".next-dev"), "Development output must not enter the build");
    assert.ok(!fs.existsSync("out"), "The build must start without stale exported pages");
    assert.equal(process.env.PERIONOTE_NEXT_DIST_DIR, undefined);
    fs.writeFileSync("tsconfig.json", "generated build config");
    if (process.argv.includes("--fail")) process.exit(17);
    if (!process.argv.includes("--no-export")) {
      fs.mkdirSync("out");
      fs.writeFileSync("out/index.html", JSON.stringify(process.argv.slice(2)));
    }
  `);
  return directory;
}

function build(directory: string, ...args: string[]) {
  return spawnSync(process.execPath, ["scripts/build-next.mjs", ...args], {
    cwd: directory,
    encoding: "utf8",
    timeout: 10_000,
    env: {
      ...process.env,
      PERIONOTE_NEXT_DIST_DIR: ".next-dev",
      PERIONOTE_NEXT_ROOT_DIR: "must-be-overridden",
    },
  });
}

function expectIsolationAndCleanup(directory: string) {
  expect(readFileSync(path.join(directory, "tsconfig.json"), "utf8")).toBe("original config");
  expect(readFileSync(path.join(directory, ".next-dev/sentinel"), "utf8")).toBe("active dev output");
  expect(readdirSync(path.join(directory, ".next-build"))).toEqual(["other-build"]);
  expect(readFileSync(path.join(directory, ".next-build/other-build/sentinel"), "utf8")).toBe("other build");
}

describe("isolated Next.js build wrapper", () => {
  it("keeps sources and linked dependencies inside the root and forwards build flags", () => {
    const directory = fixture();
    const result = build(directory, "--turbopack");

    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(readFileSync(path.join(directory, "out/index.html"), "utf8"))).toEqual([
      "build", "--turbopack",
    ]);
    expectIsolationAndCleanup(directory);
  });

  it("preserves the previous export and cleans its staging directory after a build failure", () => {
    const directory = fixture();
    const result = build(directory, "--fail");

    expect(result.status, result.stderr).toBe(17);
    expect(readFileSync(path.join(directory, "out/index.html"), "utf8")).toBe("previous export");
    expectIsolationAndCleanup(directory);
  });

  it("rejects a build without an export and preserves the previous output", () => {
    const directory = fixture();
    const result = build(directory, "--no-export");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("did not create the expected export");
    expect(readFileSync(path.join(directory, "out/index.html"), "utf8")).toBe("previous export");
    expectIsolationAndCleanup(directory);
  });
});
