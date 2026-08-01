import { describe, expect, it } from "vitest";
import {
  classifyGingivalHealthCandidate,
  classifyPeriodontalCandidate,
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
        maximumPpd: { operator: "eq", value: 5, unit: "mm" },
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

  it("formats confirmed candidates like the ClearDent field", () => {
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
      confirmed: true,
    };

    expect(formatHealthGingivitisBlock(classification))
      .toBe(`Health/Gingivitis: HEALTH - INTACT PERIODONTIUM
- NO PROBING ATTACHMENT LOSS
- MAXIMUM PPD: 3 MM
- BOP: 6%
- NO RADIOGRAPHIC BONE LOSS`);
  });

  it("keeps ClearDent wording for a confirmed treated-periodontitis context", () => {
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
      confirmed: true,
    };

    expect(formatHealthGingivitisBlock(classification))
      .toBe(`Health/Gingivitis: HEALTH - SUCCESSFULLY TREATED, STABLE PERIODONTITIS PATIENT
- PROBING ATTACHMENT LOSS PRESENT
- MAXIMUM PPD: 4 MM
- BOP: 5%
- RADIOGRAPHIC BONE LOSS PRESENT
- SITES WITH PPD >=4 MM AND BOP: NONE
- NO EVIDENCE OF PROGRESSIVE PERIODONTAL DESTRUCTION`);
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
      confirmed: true,
    };

    expect(formatHealthGingivitisBlock(classification))
      .toBe(`Health/Gingivitis: GINGIVITIS - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT
- PROBING ATTACHMENT LOSS PRESENT
- MAXIMUM PPD: 3 MM
- BOP: 22%
- NO RADIOGRAPHIC BONE LOSS`);
  });

  it("omits a confirmed treated context when periodontal support is incompatible", () => {
    const classification = createEmptyPeriodontalClassification();
    classification.diagnosis = "periodontitis";
    classification.gingivalHealth = {
      ...classification.gingivalHealth,
      periodontium: "intact",
      context: "health-treated-stable-periodontitis",
      confirmed: true,
    };

    expect(formatHealthGingivitisBlock(classification)).toBe("");
  });

  it("formats overrides from actual evidence instead of claiming reference criteria", () => {
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
      confirmed: true,
      overrideReason: "Clinician-confirmed exception",
    };

    expect(formatHealthGingivitisBlock(classification))
      .toBe(`Health/Gingivitis: HEALTH - INTACT PERIODONTIUM
- NO PROBING ATTACHMENT LOSS
- MAXIMUM PPD: 3 MM
- BOP: 12%
- NO RADIOGRAPHIC BONE LOSS
- CLINICIAN OVERRIDE: Clinician-confirmed exception`);
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
