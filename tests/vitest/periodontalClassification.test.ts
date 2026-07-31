import { describe, expect, it } from "vitest";
import {
  classifyPeriodontalCandidate,
  createEmptyPeriodontalClassification,
  formatPeriodontalEvidence,
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
