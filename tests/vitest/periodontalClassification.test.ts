import { describe, expect, it } from "vitest";
import {
  classifyGingivalHealthCandidate,
  classifyPeriodontalCandidate,
  classifyPeriodontalDiagnosisCandidates,
  createEmptyPeriodontalClassification,
  formatHealthGingivitisBlock,
  formatPeriodontalEvidence,
  isPeriodontalStatusCompatibleWithContext,
  type GingivalHealthAssessment,
  type HealthGingivitisContext,
  type PeriodontalDiagnosis,
  type PeriodontalClassification,
} from "@/lib/templates/periodontalClassification";

function periodontitis(
  patch: Partial<PeriodontalClassification> = {}
): PeriodontalClassification {
  return {
    ...createEmptyPeriodontalClassification(),
    diagnosis: "periodontitis",
    ...patch,
  };
}

describe("classifyPeriodontalDiagnosisCandidates", () => {
  it("keeps all supported categories possible when no evidence is entered", () => {
    const result = classifyPeriodontalDiagnosisCandidates(
      createEmptyPeriodontalClassification(),
    );

    expect(result.possibilities.map(({ diagnosis }) => diagnosis)).toEqual([
      "health",
      "gingivitis",
      "periodontitis",
    ]);
    expect(result.missingFields.map(({ id }) => id)).toEqual([
      "periodontal-support",
      "bop-percentage",
      "maximum-ppd",
      "attachment-loss",
      "radiographic-bone-loss",
    ]);
  });

  it("narrows an intact periodontium with BOP below 10% to health", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "intact",
      bopPercent: { operator: "eq", value: 5, unit: "percent" },
      maximumPpd: { operator: "eq", value: 3, unit: "mm" },
      attachmentLoss: "absent",
      radiographicBoneLoss: "absent",
    };

    expect(
      classifyPeriodontalDiagnosisCandidates(classification).possibilities.map(
        ({ diagnosis }) => diagnosis,
      ),
    ).toEqual(["health"]);
  });

  it("narrows an intact periodontium with BOP at least 10% to gingivitis", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "intact",
      bopPercent: { operator: "eq", value: 20, unit: "percent" },
      maximumPpd: { operator: "eq", value: 3, unit: "mm" },
      attachmentLoss: "absent",
      radiographicBoneLoss: "absent",
    };

    expect(
      classifyPeriodontalDiagnosisCandidates(classification).possibilities.map(
        ({ diagnosis }) => diagnosis,
      ),
    ).toEqual(["gingivitis"]);
  });

  it("keeps treated-periodontitis findings in the periodontitis/history category", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "reduced-treated-periodontitis",
      bopPercent: { operator: "eq", value: 5, unit: "percent" },
      maximumPpd: { operator: "eq", value: 4, unit: "mm" },
      attachmentLoss: "present",
      radiographicBoneLoss: "present",
    };

    const result = classifyPeriodontalDiagnosisCandidates(classification);
    expect(result.possibilities.map(({ diagnosis }) => diagnosis)).toEqual([
      "periodontitis",
    ]);
    expect(result.possibilities[0].reasons).toContainEqual(
      expect.stringContaining("treated-periodontitis history"),
    );
  });
});

describe("classifyPeriodontalCandidate", () => {
  it("uses the highest applicable stage across severity and complexity", () => {
    const candidate = classifyPeriodontalCandidate(
      periodontitis({
        stageBasis: [
          {
            criterionId: "stage.interdental-cal",
            measurement: { operator: "eq", value: 3, unit: "mm" },
          },
          {
            criterionId: "stage.tooth-loss",
            measurement: { operator: "eq", value: 2, unit: "teeth" },
          },
          { criterionId: "stage.masticatory-dysfunction" },
        ],
      })
    );

    expect(candidate.stage).toBe("IV");
    expect(candidate.stageReasonIds).toEqual([
      "stage.masticatory-dysfunction",
    ]);
    expect(candidate.warnings).toContain(
      "Stage evidence spans multiple levels; the candidate uses the highest applicable stage."
    );
  });

  it("gives direct grade evidence precedence and lets modifiers raise it", () => {
    const candidate = classifyPeriodontalCandidate(
      periodontitis({
        gradeBasis: [
          {
            criterionId: "grade.progression-five-years",
            measurement: { operator: "eq", value: 0, unit: "mm" },
          },
          {
            criterionId: "grade.bone-loss-age-ratio",
            measurement: { operator: "eq", value: 1.2, unit: "ratio" },
          },
        ],
        smoking: {
          status: "cigarettes",
          measurement: {
            operator: "eq",
            value: 12,
            unit: "cigarettes-per-day",
          },
        },
      })
    );

    expect(candidate.gradeSource).toBe("direct");
    expect(candidate.grade).toBe("C");
    expect(candidate.gradeReasonIds).toEqual([
      "grade.progression-five-years",
      "modifier.smoking",
    ]);
  });

  it("uses Grade B only as an explicit working assumption for periodontitis", () => {
    const candidate = classifyPeriodontalCandidate(periodontitis());

    expect(candidate.stage).toBe("");
    expect(candidate.grade).toBe("B");
    expect(candidate.gradeSource).toBe("assumed");
    expect(candidate.warnings).toContain(
      "Grade B is a working assumption because direct, indirect, and phenotype evidence are missing."
    );
  });

  it("does not classify stage or grade outside a periodontitis diagnosis", () => {
    const candidate = classifyPeriodontalCandidate({
      ...createEmptyPeriodontalClassification(),
      diagnosis: "gingivitis",
      stageBasis: [{ criterionId: "stage.masticatory-dysfunction" }],
      smoking: {
        status: "cigarettes",
        measurement: {
          operator: "eq",
          value: 12,
          unit: "cigarettes-per-day",
        },
      },
    });

    expect(candidate.stage).toBe("");
    expect(candidate.grade).toBe("");
    expect(candidate.warnings).toEqual([
      "Stage and grade candidates are available only for a periodontitis diagnosis.",
    ]);
  });

  it("does not infer stage from zero RBL or fractional tooth counts", () => {
    const candidate = classifyPeriodontalCandidate(
      periodontitis({
        stageBasis: [
          {
            criterionId: "stage.rbl-percent",
            measurement: { operator: "eq", value: 0, unit: "percent" },
          },
          {
            criterionId: "stage.tooth-loss",
            measurement: { operator: "eq", value: 0.5, unit: "teeth" },
          },
        ],
      })
    );

    expect(candidate.stage).toBe("");
    expect(candidate.warnings).toContain(
      "Entered stage evidence does not cross a supported classification threshold."
    );
  });

  it.each([
    { value: 2.9, expected: "I" },
    { value: 3, expected: "II" },
    { value: 4.9, expected: "II" },
    { value: 5, expected: "III" },
  ])(
    "uses continuous CAL boundaries at $value mm",
    ({ value, expected }) => {
      const candidate = classifyPeriodontalCandidate(
        periodontitis({
          stageBasis: [
            {
              criterionId: "stage.interdental-cal",
              measurement: { operator: "eq", value, unit: "mm" },
            },
          ],
        })
      );

      expect(candidate.stage).toBe(expected);
    }
  );

  it.each([
    { value: 14.9, expected: "I" },
    { value: 15, expected: "II" },
    { value: 33, expected: "II" },
    { value: 33.1, expected: "III" },
  ])(
    "uses concrete RBL percentage boundaries at $value%",
    ({ value, expected }) => {
      const candidate = classifyPeriodontalCandidate(
        periodontitis({
          stageBasis: [
            {
              criterionId: "stage.rbl-percent",
              measurement: { operator: "eq", value, unit: "percent" },
            },
          ],
        })
      );

      expect(candidate.stage).toBe(expected);
    }
  );

  it.each([
    { value: 1, expected: "III" },
    { value: 4, expected: "III" },
    { value: 5, expected: "IV" },
  ])(
    "uses concrete periodontitis-related tooth-loss boundaries at $value",
    ({ value, expected }) => {
      const candidate = classifyPeriodontalCandidate(
        periodontitis({
          stageBasis: [
            {
              criterionId: "stage.tooth-loss",
              measurement: { operator: "eq", value, unit: "teeth" },
            },
          ],
        })
      );

      expect(candidate.stage).toBe(expected);
    }
  );

  it.each([
    { value: 0.9, expected: "" },
    { value: 4.9, expected: "I" },
    { value: 5, expected: "II" },
    { value: 5.9, expected: "II" },
    { value: 6, expected: "III" },
  ])(
    "uses continuous maximum-PPD boundaries at $value mm",
    ({ value, expected }) => {
      const classification = periodontitis();
      classification.gingivalHealth.maximumPpd = {
        operator: "eq",
        value,
        unit: "mm",
      };

      expect(classifyPeriodontalCandidate(classification).stage).toBe(
        expected
      );
    }
  );

  it("does not convert other nicotine exposure or unknown HbA1c", () => {
    const candidate = classifyPeriodontalCandidate(
      periodontitis({
        smoking: {
          status: "other-exposure",
          details: "Vaping documented",
        },
        diabetes: { status: "diabetes-hba1c-unknown" },
      })
    );

    expect(candidate.grade).toBe("B");
    expect(candidate.warnings).toEqual(
      expect.arrayContaining([
        "Other tobacco/nicotine exposure is documented but is not converted to a cigarette-equivalent grade.",
        "Diabetes is present, but grade cannot be modified without a current HbA1c.",
      ])
    );
  });

  it("warns when selected grade modifiers lack usable measurements", () => {
    const candidate = classifyPeriodontalCandidate(
      periodontitis({
        smoking: { status: "cigarettes" },
        diabetes: { status: "diabetes" },
      })
    );

    expect(candidate.grade).toBe("B");
    expect(candidate.warnings).toEqual(
      expect.arrayContaining([
        "Cigarette exposure is selected, but a positive whole-number cigarettes/day value is missing.",
        "Diabetes with current HbA1c is selected, but a positive HbA1c value is missing.",
      ])
    );
  });

  it.each([
    { value: 0, expected: "A" },
    { value: 0.1, expected: "B" },
    { value: 1.9, expected: "B" },
    { value: 2, expected: "C" },
  ])(
    "uses concrete direct-progression grade boundaries at $value mm",
    ({ value, expected }) => {
      const candidate = classifyPeriodontalCandidate(
        periodontitis({
          gradeBasis: [
            {
              criterionId: "grade.progression-five-years",
              measurement: { operator: "eq", value, unit: "mm" },
            },
          ],
        })
      );

      expect(candidate.grade).toBe(expected);
    }
  );

  it.each([
    { value: 0.24, expected: "A" },
    { value: 0.25, expected: "B" },
    { value: 1, expected: "B" },
    { value: 1.01, expected: "C" },
  ])(
    "uses concrete bone-loss/age grade boundaries at $value",
    ({ value, expected }) => {
      const candidate = classifyPeriodontalCandidate(
        periodontitis({
          gradeBasis: [
            {
              criterionId: "grade.bone-loss-age-ratio",
              measurement: { operator: "eq", value, unit: "ratio" },
            },
          ],
        })
      );

      expect(candidate.grade).toBe(expected);
    }
  );

  it.each([
    { value: 1, expected: "B" },
    { value: 9, expected: "B" },
    { value: 10, expected: "C" },
  ])(
    "uses concrete cigarette modifier boundaries at $value per day",
    ({ value, expected }) => {
      const candidate = classifyPeriodontalCandidate(
        periodontitis({
          smoking: {
            status: "cigarettes",
            measurement: {
              operator: "eq",
              value,
              unit: "cigarettes-per-day",
            },
          },
        })
      );

      expect(candidate.grade).toBe(expected);
    }
  );

  it.each([
    { value: 6.9, expected: "B" },
    { value: 7, expected: "C" },
  ])(
    "uses concrete HbA1c modifier boundaries at $value%",
    ({ value, expected }) => {
      const candidate = classifyPeriodontalCandidate(
        periodontitis({
          diabetes: {
            status: "diabetes",
            measurement: { operator: "eq", value, unit: "percent" },
          },
        })
      );

      expect(candidate.grade).toBe(expected);
    }
  );

  it("generates evidence wording from the checked-in catalogue", () => {
    expect(
      formatPeriodontalEvidence({
        criterionId: "stage.max-ppd",
        measurement: { operator: "gte", value: 6, unit: "mm" },
      })
    ).toBe("maximum PPD ≥6 mm");
    expect(
      formatPeriodontalEvidence(
        {
          criterionId: "stage.max-ppd",
          measurement: { operator: "gte", value: 6, unit: "mm" },
        },
        "ascii"
      )
    ).toBe("maximum PPD >=6 mm");
  });
});

describe("Health/Gingivitis classification", () => {
  const cases: Array<{
    diagnosis: PeriodontalDiagnosis;
    assessment: Partial<GingivalHealthAssessment>;
    expected: HealthGingivitisContext;
  }> = [
    {
      diagnosis: "health",
      assessment: {
        periodontium: "intact",
        bopPercent: { operator: "eq", value: 6, unit: "percent" },
        maximumPpd: { operator: "eq", value: 3, unit: "mm" },
        attachmentLoss: "absent",
        radiographicBoneLoss: "absent",
      },
      expected: "health-intact",
    },
    {
      diagnosis: "gingivitis",
      assessment: {
        periodontium: "intact",
        bopPercent: { operator: "eq", value: 18, unit: "percent" },
        maximumPpd: { operator: "eq", value: 3, unit: "mm" },
        attachmentLoss: "absent",
        radiographicBoneLoss: "absent",
      },
      expected: "gingivitis-intact",
    },
    {
      diagnosis: "health",
      assessment: {
        periodontium: "reduced-non-periodontitis",
        bopPercent: { operator: "eq", value: 5, unit: "percent" },
        maximumPpd: { operator: "eq", value: 3, unit: "mm" },
        attachmentLoss: "present",
        radiographicBoneLoss: "absent",
      },
      expected: "health-reduced-non-periodontitis",
    },
    {
      diagnosis: "gingivitis",
      assessment: {
        periodontium: "reduced-non-periodontitis",
        bopPercent: { operator: "eq", value: 20, unit: "percent" },
        maximumPpd: { operator: "eq", value: 3, unit: "mm" },
        attachmentLoss: "present",
        radiographicBoneLoss: "present",
      },
      expected: "gingivitis-reduced-non-periodontitis",
    },
    {
      diagnosis: "periodontitis",
      assessment: {
        periodontium: "reduced-treated-periodontitis",
        bopPercent: { operator: "eq", value: 5, unit: "percent" },
        maximumPpd: { operator: "eq", value: 4, unit: "mm" },
        attachmentLoss: "present",
        radiographicBoneLoss: "present",
        ppd4OrGreaterWithBop: "no",
        progressiveDestruction: "no",
      },
      expected: "health-treated-stable-periodontitis",
    },
    {
      diagnosis: "periodontitis",
      assessment: {
        periodontium: "reduced-treated-periodontitis",
        bopPercent: { operator: "eq", value: 18, unit: "percent" },
        maximumPpd: { operator: "eq", value: 3, unit: "mm" },
        attachmentLoss: "present",
        radiographicBoneLoss: "present",
        ppd4OrGreaterWithBop: "no",
        progressiveDestruction: "no",
      },
      expected: "inflammation-periodontitis-history",
    },
  ];

  it.each(cases)("calculates $expected", ({ diagnosis, assessment, expected }) => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = diagnosis;
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      ...assessment,
    };

    expect(classifyGingivalHealthCandidate(classification)).toEqual({
      context: expected,
      missingFields: [],
      warnings: [],
    });
  });

  it("returns human-readable missing fields for candidate navigation", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "health";

    expect(classifyGingivalHealthCandidate(classification)).toEqual({
      context: "",
      missingFields: [
        { id: "periodontal-support", label: "Periodontal support" },
        { id: "bop-percentage", label: "BOP percentage" },
        { id: "maximum-ppd", label: "Maximum PPD" },
        { id: "attachment-loss", label: "Probing attachment loss" },
        {
          id: "radiographic-bone-loss",
          label: "Radiographic bone loss (RBL)",
        },
      ],
      warnings: [],
    });
  });

  it("uses shared maximum PPD for stage without duplicating encounter state", () => {
    const classification = periodontitis({
      gingivalHealth: {
        ...createEmptyPeriodontalClassification().gingivalHealth,
        maximumPpd: { operator: "eq", value: 6, unit: "mm" },
      },
    });

    expect(classifyPeriodontalCandidate(classification).stage).toBe("III");
  });

  it("requires maximum PPD below 4 mm for remission/control context", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "periodontitis";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "reduced-treated-periodontitis",
      bopPercent: { operator: "eq", value: 18, unit: "percent" },
      maximumPpd: { operator: "eq", value: 4, unit: "mm" },
      attachmentLoss: "present",
      radiographicBoneLoss: "present",
      ppd4OrGreaterWithBop: "no",
      progressiveDestruction: "no",
    };

    expect(classifyGingivalHealthCandidate(classification)).toMatchObject({
      context: "",
      missingFields: [],
    });
  });

  it("formats selected candidates like the ClearDent field", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "health";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "intact",
      bopPercent: { operator: "eq", value: 6, unit: "percent" },
      maximumPpd: { operator: "eq", value: 3, unit: "mm" },
      attachmentLoss: "absent",
      radiographicBoneLoss: "absent",
      context: "health-intact",
    };

    expect(formatHealthGingivitisBlock(classification)).toBe(
      "Health/Gingivitis: HEALTH - INTACT PERIODONTIUM",
    );
  });

  it("keeps ClearDent wording for a selected treated-periodontitis context", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "periodontitis";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "reduced-treated-periodontitis",
      bopPercent: { operator: "eq", value: 5, unit: "percent" },
      maximumPpd: { operator: "eq", value: 4, unit: "mm" },
      attachmentLoss: "present",
      radiographicBoneLoss: "present",
      ppd4OrGreaterWithBop: "no",
      progressiveDestruction: "no",
      context: "health-treated-stable-periodontitis",
    };

    expect(formatHealthGingivitisBlock(classification)).toBe(
      "Health/Gingivitis: HEALTH - SUCCESSFULLY TREATED, STABLE PERIODONTITIS PATIENT",
    );
  });

  it("charts declared bone loss instead of a generic possibility", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "gingivitis";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "reduced-non-periodontitis",
      bopPercent: { operator: "eq", value: 22, unit: "percent" },
      maximumPpd: { operator: "eq", value: 3, unit: "mm" },
      attachmentLoss: "present",
      radiographicBoneLoss: "absent",
      context: "gingivitis-reduced-non-periodontitis",
    };

    expect(formatHealthGingivitisBlock(classification)).toBe(
      "Health/Gingivitis: GINGIVITIS - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT",
    );
  });

  it("omits a selected treated context when periodontal support is incompatible", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "periodontitis";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "intact",
      context: "health-treated-stable-periodontitis",
    };

    expect(formatHealthGingivitisBlock(classification)).toBe("");
  });

  it("formats an optional Health/Gingivitis override reason", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "health";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "intact",
      bopPercent: { operator: "eq", value: 12, unit: "percent" },
      maximumPpd: { operator: "eq", value: 3, unit: "mm" },
      attachmentLoss: "absent",
      radiographicBoneLoss: "absent",
      context: "health-intact",
      overrideReason: "Clinician-confirmed exception",
    };

    expect(formatHealthGingivitisBlock(classification))
      .toBe(`Health/Gingivitis: HEALTH - INTACT PERIODONTIUM
Health/Gingivitis override: Clinician-confirmed exception.`);
  });

  it("charts a context override without requiring a reason", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "health";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "intact",
      bopPercent: { operator: "eq", value: 12, unit: "percent" },
      maximumPpd: { operator: "eq", value: 3, unit: "mm" },
      attachmentLoss: "absent",
      radiographicBoneLoss: "absent",
      context: "health-intact",
      overrideReason: "",
    };

    expect(formatHealthGingivitisBlock(classification)).toBe(
      "Health/Gingivitis: HEALTH - INTACT PERIODONTIUM",
    );
  });

  it("requires treated contexts and current periodontal status to agree", () => {
    expect(
      isPeriodontalStatusCompatibleWithContext(
        "stable",
        "health-treated-stable-periodontitis",
        true
      )
    ).toBe(true);
    expect(
      isPeriodontalStatusCompatibleWithContext(
        "unstable-recurrent",
        "health-treated-stable-periodontitis",
        true
      )
    ).toBe(false);
    expect(
      isPeriodontalStatusCompatibleWithContext(
        "remission-control",
        "inflammation-periodontitis-history",
        true
      )
    ).toBe(true);
    expect(
      isPeriodontalStatusCompatibleWithContext(
        "stable",
        "inflammation-periodontitis-history",
        false
      )
    ).toBe(true);
  });
});
