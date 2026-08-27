import { describe, expect, it } from "vitest";
import {
  assessCambra123SixAdult,
  cambra123SixAdultItems,
  createEmptyCambra123SixAdultAssessment,
  type Cambra123SixAdultItemId,
} from "@/lib/templates/cambra123";

function completedWith(
  ...yesItemIds: Cambra123SixAdultItemId[]
) {
  return {
    ...createEmptyCambra123SixAdultAssessment(),
    completionStatus: "complete" as const,
    yesItemIds,
  };
}

describe("CAMBRA123 2021 ages 6–adult", () => {
  it("contains the published 8 protective, 8 risk, and 4 disease items", () => {
    expect(
      cambra123SixAdultItems.filter((item) => item.kind === "protective"),
    ).toHaveLength(8);
    expect(
      cambra123SixAdultItems.filter((item) => item.kind === "risk"),
    ).toHaveLength(8);
    expect(
      cambra123SixAdultItems.filter(
        (item) => item.kind === "disease-indicator",
      ),
    ).toHaveLength(4);
  });

  it("does not suggest a category before completion", () => {
    const result = assessCambra123SixAdult({
      ...createEmptyCambra123SixAdultAssessment(),
      completionStatus: "in-progress",
      yesItemIds: ["risk.frequent-snacking"],
    });

    expect(result.totalScore).toBe(2);
    expect(result.suggestedLevel).toBe("");
    expect(result.warnings).toContainEqual(
      expect.stringContaining("Complete the assessment"),
    );
  });

  it("scores each column and suggests Low when protective factors prevail", () => {
    const protectiveIds = cambra123SixAdultItems
      .filter((item) => item.kind === "protective")
      .map((item) => item.id);
    const result = assessCambra123SixAdult(completedWith(...protectiveIds));

    expect(result).toMatchObject({
      protectiveYesCount: 8,
      column1Score: -8,
      column2Score: 0,
      column3Score: 0,
      totalScore: -8,
      scoreLevel: "Low",
      suggestedLevel: "Low",
    });
  });

  it("uses the CAMBRA123 quantitative bands", () => {
    expect(
      assessCambra123SixAdult(
        completedWith("risk.frequent-snacking"),
      ).suggestedLevel,
    ).toBe("Moderate");
    expect(
      assessCambra123SixAdult(
        completedWith(
          "risk.frequent-snacking",
          "risk.hyposalivatory-medications",
        ),
      ).suggestedLevel,
    ).toBe("High");
    expect(
      assessCambra123SixAdult(
        completedWith(
          "risk.frequent-snacking",
          "risk.hyposalivatory-medications",
          "risk.recreational-drug-use",
          "disease.new-dentin-cavities",
          "disease.new-white-spots",
          "disease.new-enamel-lesions",
          "disease.recent-restorations",
        ),
      ).suggestedLevel,
    ).toBe("Extreme");
  });

  it("treats a disease indicator as at least High guidance", () => {
    const result = assessCambra123SixAdult(
      completedWith(
        "protective.fluoridated-water",
        "protective.f-toothpaste-daily",
        "protective.f-toothpaste-twice-daily",
        "protective.f-varnish-six-months",
        "disease.new-white-spots",
      ),
    );

    expect(result.totalScore).toBe(-1);
    expect(result.scoreLevel).toBe("Moderate");
    expect(result.suggestedLevel).toBe("High");
  });

  it("suggests Extreme for High risk with measured low salivary flow", () => {
    const result = assessCambra123SixAdult(
      completedWith(
        "risk.reduced-salivary-function",
        "disease.new-dentin-cavities",
      ),
    );

    expect(result.totalScore).toBe(5);
    expect(result.suggestedLevel).toBe("Extreme");
  });

  it("does not double-score a duplicated stored item", () => {
    const result = assessCambra123SixAdult(
      completedWith("risk.frequent-snacking", "risk.frequent-snacking"),
    );

    expect(result.riskYesCount).toBe(1);
    expect(result.totalScore).toBe(2);
  });
});
