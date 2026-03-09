import { describe, expect, it } from "vitest";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";
import { buildGingivalDescriptionWebformSummary } from "@/lib/templates/summary/buildGingivalDescriptionWebformSummary";

describe("buildGingivalDescriptionWebformSummary", () => {
  it("formats findings in the imported webform line style", () => {
    const summary = buildGingivalDescriptionWebformSummary(gingivalDescriptionWebformFixture);

    expect(summary).toContain("Date: 2026-03-09");
    expect(summary).toContain("Color - Red | LOC");
    expect(summary).toContain("Bleeding & Exudate - BOP | GEN");
    expect(summary).toContain("Dental Hygiene Diagnosis:");
  });
});
