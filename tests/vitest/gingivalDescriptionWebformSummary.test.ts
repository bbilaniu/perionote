import { describe, expect, it } from "vitest";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";
import { buildGingivalDescriptionWebformSummary } from "@/lib/templates/summary/buildGingivalDescriptionWebformSummary";

describe("buildGingivalDescriptionWebformSummary", () => {
  it("omits finding lines when the imported webform fixture has none selected", () => {
    const summary = buildGingivalDescriptionWebformSummary(gingivalDescriptionWebformFixture);

    expect(summary).toBe("Date: 2026-03-09");
    expect(summary).not.toContain("Dental Hygiene Diagnosis:");
  });
});
