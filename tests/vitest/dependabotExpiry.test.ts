import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  expireDependabotIgnores,
  findExpiryMarkers,
} from "../../scripts/expire-dependabot-ignores.mjs";

const permanent = `      # Coordinate this migration separately.
      - dependency-name: "@changesets/cli"
        update-types: [version-update:semver-major]
`;
const temporary = `      # ignore-until: 2026-10-28
      - dependency-name: "@types/node"
        versions: ["^26.0.0"]
`;
const future = `      # ignore-until: 2027-01-01
      - dependency-name: example
        versions:
          - "^2.0.0"
`;
const config = (entries: string) => `version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    ignore:
${entries}    open-pull-requests-limit: 5
`;

describe("Dependabot ignore expiry", () => {
  it("does nothing before expiry, preserving formatting and undated rules", async () => {
    const source = config(permanent + temporary + future);
    const result = await expireDependabotIgnores(source, "2026-10-27");
    expect(result).toEqual({ text: source, expired: [] });
    expect(findExpiryMarkers(source, "2026-10-27").some(({ expired }) => expired)).toBe(false);
  });

  it.each(["2026-10-28", "2026-10-29"])("removes only the due entry on %s and is repeatable", async (today) => {
    const result = await expireDependabotIgnores(config(permanent + temporary + future), today);
    expect(result.text).toBe(config(permanent + future));
    expect(result.expired).toEqual([{ dependency: "@types/node", ecosystem: "npm", date: "2026-10-28" }]);
    expect(await expireDependabotIgnores(result.text, today)).toEqual({ text: result.text, expired: [] });
  });

  it("preserves CRLF and adjacent comments belonging to another rule", async () => {
    const source = config(temporary + permanent).replaceAll("\n", "\r\n");
    const result = await expireDependabotIgnores(source, "2026-10-28");
    expect(result.text).toBe(config(permanent).replaceAll("\n", "\r\n"));
  });

  it("removes an emptied ignore key while retaining other update settings", async () => {
    const result = await expireDependabotIgnores(config(temporary), "2026-10-28");
    expect(result.text).toBe(config("").replace("    ignore:\n", ""));
    expect(parse(result.text).updates[0]).not.toHaveProperty("ignore");
    expect(parse(result.text).updates[0]["open-pull-requests-limit"]).toBe(5);
  });

  it("handles multiple ecosystems and entries ending at EOF", async () => {
    const source = config(temporary) + config(temporary)
      .replace("version: 2\nupdates:\n", "")
      .replace("npm", "github-actions")
      .replace("@types/node", "example/action")
      .replace("    open-pull-requests-limit: 5\n", "")
      .trimEnd();
    const result = await expireDependabotIgnores(source, "2026-10-28");
    expect(result.expired.map(({ ecosystem }) => ecosystem)).toEqual(["npm", "github-actions"]);
    expect(parse(result.text).updates.every((update: object) => !("ignore" in update))).toBe(true);
  });

  it.each(["2026-02-30", "2026-13-01", "2026-2-01", "tomorrow"])("rejects invalid date %s", (date) => {
    expect(() => findExpiryMarkers(config(temporary.replace("2026-10-28", date)), "2026-10-28")).toThrow();
  });

  it("accepts a leap day and rejects an invalid evaluation date", async () => {
    expect((await expireDependabotIgnores(config(temporary.replace("2026-10-28", "2028-02-29")), "2028-02-29")).expired).toHaveLength(1);
    expect(() => findExpiryMarkers(config(temporary), "2026-02-29")).toThrow();
  });

  it.each([
    config(temporary).replace("    ignore:", "    allow:"),
    config(temporary).replace("      - dependency", "        - dependency"),
    config(temporary).replace("      - dependency", "\n      - dependency"),
    config(temporary).replace("      - dependency", "      # ignore-until: 2026-11-01\n      - dependency"),
    config(temporary).replace("versions: [\"^26.0.0\"]", "versions: ["),
    config(temporary).replace("versions:", "dependency-name: duplicate\n        versions:"),
  ])("refuses malformed or misplaced annotations without producing an edit", async (source) => {
    await expect(expireDependabotIgnores(source, "2026-10-28")).rejects.toThrow();
  });

  it("validates annotations in the checked-in configuration", async () => {
    const source = readFileSync(".github/dependabot.yml", "utf8");
    expect((await expireDependabotIgnores(source, "1900-01-01")).text).toBe(source);
  });

  it("provides a non-mutating preflight/preview and writes only after full validation", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "hygienenote-expiry-"));
    try {
      const file = path.join(directory, "dependabot.yml");
      const output = path.join(directory, "output");
      const source = config(permanent + temporary);
      writeFileSync(file, source);
      const run = (mode: string, date = "2026-10-28") => execFileSync(process.execPath,
        ["scripts/expire-dependabot-ignores.mjs", mode, "--file", file, "--date", date],
        { encoding: "utf8", env: { ...process.env, GITHUB_OUTPUT: output }, stdio: "pipe" });
      run("--check", "2026-10-27");
      run("--check");
      expect(readFileSync(output, "utf8")).toBe("due=false\ndue=true\n");
      expect(run("--preview")).toBe(config(permanent));
      expect(readFileSync(file, "utf8")).toBe(source);
      run("--write");
      expect(readFileSync(file, "utf8")).toBe(config(permanent));
      const invalid = config(temporary).replace("    ignore:", "    allow:");
      writeFileSync(file, invalid);
      expect(() => run("--write")).toThrow();
      expect(readFileSync(file, "utf8")).toBe(invalid);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
