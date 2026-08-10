import { describe, expect, it } from "vitest";
import { suggestAdultCariesRisk } from "@/lib/templates/cariesRisk";

describe("suggestAdultCariesRisk", () => {
  it("does not infer Low risk from an empty factor list", () => {
    const suggestion = suggestAdultCariesRisk([]);

    expect(suggestion.level).toBe("");
    expect(suggestion.warnings).toContainEqual(
      expect.stringContaining("does not establish Low risk"),
    );
  });

  it.each([
    "High frequency of sugar intake",
    "Hyposalivation",
  ])("suggests High for the mapped high-risk factor %s", (factor) => {
    const suggestion = suggestAdultCariesRisk([factor]);

    expect(suggestion.level).toBe("High");
    expect(suggestion.reasons.length).toBeGreaterThan(0);
  });

  it("uses caries history as a Moderate minimum and explains the missing count", () => {
    const suggestion = suggestAdultCariesRisk([
      "History of caries in the last 36 months",
    ]);

    expect(suggestion.level).toBe("Moderate");
    expect(suggestion.reasons).toContainEqual(
      expect.stringContaining("lesion or restoration count is needed"),
    );
  });

  it("suggests Moderate for other recognized contributing conditions", () => {
    const suggestion = suggestAdultCariesRisk([
      "Inadequate oral hygiene",
      "Insufficient exposure to fluoride",
    ]);

    expect(suggestion.level).toBe("Moderate");
    expect(suggestion.reasons).toContainEqual(
      expect.stringContaining("2 additional documented contributing conditions"),
    );
  });

  it("does not map custom factors silently", () => {
    const suggestion = suggestAdultCariesRisk(["Synthetic custom factor"]);

    expect(suggestion.level).toBe("");
    expect(suggestion.warnings).toContainEqual(
      expect.stringContaining("not mapped to a risk level"),
    );
  });
});
