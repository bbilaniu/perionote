import { describe, expect, it } from "vitest";
import { hygieneNoteFixture } from "@/lib/templates/fixtures/hygieneNote.fixture";
import { buildHygieneNoteSummary } from "@/lib/templates/summary/buildHygieneNoteSummary";

describe("buildHygieneNoteSummary", () => {
  it("includes recommendations as bulleted lines", () => {
    const summary = buildHygieneNoteSummary(hygieneNoteFixture);

    expect(summary).toContain("Recommendations:");
    expect(summary).toContain("- Daily flossing with posterior focus");
    expect(summary).toContain("Plaque:");
    expect(summary).toContain("Calculus:");
  });
});
