import { describe, expect, it } from "vitest";
import {
  assessCambra123ZeroToSix,
  assessCambra123SixAdult,
  cambra123ZeroToSixItems,
  cambra123SixAdultItems,
  createEmptyCambra123ZeroToSixAssessment,
  createEmptyCambra123SixAdultAssessment,
  type Cambra123ZeroToSixItemId,
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

function zeroToSixCompletedWith(
  ...yesItemIds: Cambra123ZeroToSixItemId[]
) {
  return {
    ...createEmptyCambra123ZeroToSixAssessment(),
    completionStatus: "complete" as const,
    yesItemIds,
  };
}

describe("CAMBRA123 2021 ages 0–6", () => {
  it("contains the published 4 protective, 6 risk, and 2 disease items", () => {
    expect(
      cambra123ZeroToSixItems.filter((item) => item.kind === "protective"),
    ).toHaveLength(4);
    expect(
      cambra123ZeroToSixItems.filter((item) => item.kind === "risk"),
    ).toHaveLength(6);
    expect(
      cambra123ZeroToSixItems.filter(
        (item) => item.kind === "disease-indicator",
      ),
    ).toHaveLength(2);
  });

  it("uses the ages 0–6 quantitative score bands", () => {
    const protectiveIds = cambra123ZeroToSixItems
      .filter((item) => item.kind === "protective")
      .map((item) => item.id);
    const riskIds = cambra123ZeroToSixItems
      .filter((item) => item.kind === "risk")
      .map((item) => item.id);

    expect(
      assessCambra123ZeroToSix(
        zeroToSixCompletedWith(...protectiveIds),
      ).suggestedLevel,
    ).toBe("Low");
    expect(
      assessCambra123ZeroToSix(
        zeroToSixCompletedWith("risk.frequent-snacking"),
      ).suggestedLevel,
    ).toBe("Moderate");
    expect(
      assessCambra123ZeroToSix(
        zeroToSixCompletedWith(
          "risk.frequent-snacking",
          "risk.bottle-nonspill-cup",
        ),
      ).suggestedLevel,
    ).toBe("High");
    expect(
      assessCambra123ZeroToSix(
        zeroToSixCompletedWith(
          ...riskIds,
          "disease.evident-decay-white-spots",
        ),
      ).suggestedLevel,
    ).toBe("Very High");
  });

  it("treats disease or household recent decay as at least High guidance", () => {
    const protectiveIds = cambra123ZeroToSixItems
      .filter((item) => item.kind === "protective")
      .map((item) => item.id);

    expect(
      assessCambra123ZeroToSix(
        zeroToSixCompletedWith(
          ...protectiveIds,
          "disease.evident-decay-white-spots",
        ),
      ).suggestedLevel,
    ).toBe("High");
    expect(
      assessCambra123ZeroToSix(
        zeroToSixCompletedWith(
          ...protectiveIds,
          "risk.household-recent-decay",
        ),
      ).suggestedLevel,
    ).toBe("High");
  });

  it("uses extensive or severe decay to elevate High guidance to Very High", () => {
    const result = assessCambra123ZeroToSix({
      ...zeroToSixCompletedWith(
        "risk.frequent-snacking",
        "risk.bottle-nonspill-cup",
      ),
      severeOrExtensiveRecentDecay: true,
    });

    expect(result.totalScore).toBe(4);
    expect(result.scoreLevel).toBe("High");
    expect(result.suggestedLevel).toBe("Very High");
  });
});

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

  it("recalculates and suggests a category while responses are changing", () => {
    const result = assessCambra123SixAdult({
      ...createEmptyCambra123SixAdultAssessment(),
      completionStatus: "in-progress",
      yesItemIds: ["risk.frequent-snacking"],
    });

    expect(result.totalScore).toBe(2);
    expect(result.suggestedLevel).toBe("Moderate");
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
