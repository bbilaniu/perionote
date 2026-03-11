import { describe, expect, it } from "vitest";
import { gingivalDescriptionFixture } from "@/lib/templates/fixtures/gingivalDescription.fixture";
import { buildGingivalDescriptionSummary } from "@/lib/templates/summary/buildGingivalDescriptionSummary";

describe("buildGingivalDescriptionSummary", () => {
  it("formats the fixture into a segmented clinical summary", () => {
    const summary = buildGingivalDescriptionSummary(gingivalDescriptionFixture);

    expect(summary).toContain("Visit Details:");
    expect(summary).toContain("History and Exam:");
    expect(summary).toContain("Gingival Description:");
    expect(summary).toContain("Next Appointment:");
    expect(summary).toContain("Date: 2026-03-08");
  });
});
