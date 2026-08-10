import { describe, expect, it } from "vitest";
import {
  bleedingChoices,
  calculusChoices,
  createEmptyAdultHygiene2021Form,
  hasRequiredAdultHygiene2021Fields,
  plaqueChoices,
  standardOheStatement,
  standardTreatmentCompletedPreset,
} from "@/lib/templates/adultHygiene2021";
import { adultHygiene2021Fixture } from "@/lib/templates/fixtures/adultHygiene2021.fixture";
import {
  applyPatientChiefConcernSelectionRules,
  patientChiefConcernSeedValues,
} from "@/lib/templates/patientChiefConcern";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import {
  applyGingivitisObservationPreset,
  createGingivalDescriptionWnlAssessment,
  hasConflictingGingivitisPresetObservations,
} from "@/lib/templates/gingivalDescriptionCatalog";

describe("buildAdultHygiene2021Summary", () => {
  it("offers None as a reviewed hygiene finding", () => {
    expect(plaqueChoices[0]).toBe("None");
    expect(calculusChoices[0]).toBe("None");
    expect(bleedingChoices[0]).toBe("None");
  });

  it("documents explicit None hygiene findings", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      plaqueChoice: "None",
      bleedingChoice: "None",
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(`Plaque: None.
Bleeding: None.`);
  });

  it("starts empty without inferring clinical documentation", () => {
    const form = createEmptyAdultHygiene2021Form();
    expect(buildAdultHygiene2021Summary(form)).toBe("");
    expect(hasRequiredAdultHygiene2021Fields(form)).toBe(false);
  });

  it("builds the accepted source-ordered note from synthetic data", () => {
    const summary = buildAdultHygiene2021Summary(adultHygiene2021Fixture, {
      startedAt: new Date(2026, 6, 25, 14, 5, 6),
    });

    expect(summary).toBe(`----- July 25, 2026 2:05:06 PM -----
PATIENT ID: TEST-AH-1001
DENTIST: Dr. Example
RDA:
RDH: Example RDH
Last Recare Date: 2026-01-15

Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: Yes.
Sterilization Codes Scanned: SYNTH-AH-001

Informed verbal consent given by PATIENT for treatment today.
Medical history reviewed: Synthetic history reviewed with no changes.
Premedication Required: No.

Patient Chief Concern: Sensitivity to hot and cold; Food catches between teeth.
Hygiene Area of Concern: Synthetic lower anterior concern.

Plaque: Localized moderate interproximal.
Stain: Localized slight.
Calculus: Localized moderate marginal.
Bleeding: Localized mild.

PSR/Pocketing: 1 2 2 / 2 1 2
Recession: Synthetic localized recession.
FMP Done: Synthetic FMP documentation.

Gingival Description:
  - Color: coral pink (extent: generalized).
  - Position / Size: gingival recession (extent: localized; location: facial 31–33; measurement: 2 mm; notes: synthetic finding).

Periodontal assessment findings:
  - Periodontal support: Reduced support (with a history of treated periodontitis).
  - Bleeding on probing (BOP): 18%.
  - Maximum PPD: 3 mm.
  - Probing attachment loss: Present.
  - Radiographic bone loss (RBL): Present.
  - Sites with PPD >=4 mm and BOP: None.
  - Evidence of progressive periodontal destruction: No.

Patient-specific stage evidence:
  Severity evidence:
    - radiographic bone loss 20%.
    - interdental CAL 3 mm.
  Complexity evidence:
    - maximum PPD 3 mm.
    - mostly horizontal bone loss.

Patient-specific grade evidence:
  Progression evidence:
    - bone-loss/age ratio 0.72.
    - destruction commensurate with biofilm.
  Grade modifiers:
    - Smoking: non-smoker.
    - Diabetes: no diagnosis of diabetes / normoglycemic.

Health/Gingivitis: GINGIVAL INFLAMMATION - PATIENT WITH HISTORY OF PERIODONTITIS
Periodontal diagnosis: Localized periodontitis, Stage II, Grade B.
Periodontal status: Periodontal disease remission/control.
Periodontal status comment: Synthetic periodontal status comment.

Caries risk: Moderate caries risk due to high frequency of sugar intake, insufficient exposure to fluoride and history of active decay in the last 36 months. Synthetic diet and home-care factors reviewed.

Oral hygiene compliance: Good.
Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY
OH Aids Reviewed/Recommended: Synthetic interdental aid; Synthetic brushing aid
REVIEWED DISEASE PROCESS WITH PATIENT TODAY
Patient is currently: Flossing 1x/day; Brushing 2x/day.
Hygiene goal: Synthetic daily interdental cleaning goal.

Treatment recommended:
  - HYGIENE MAINTENANCE
  - Synthetic follow-up assessment
Treatment completed today: Synthetic scaling — Q2, Q3, teeth 14–16; Synthetic polishing — maxilla
Anesthetic: Synthetic anesthetic documentation.
Desensitizer: Synthetic desensitizer documentation.

Night guard: Yes; uses.
Orthodontic history: Yes.
Retainers: Fixed.
Additional Notes: Synthetic demonstration data only.

-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES
Recommended Recare Interval: 6-month recall.
Recommended Hygiene Interval: 4-month scale.
Next visit: Synthetic hygiene follow-up.
Date Booked: 2026-11-15`);
    expect(summary).not.toContain("\n\n\n");
    expect(summary).not.toContain("Not documented");
    expect(summary).not.toMatch(
      /^(Stage basis|Grade basis|Grade modifiers):/m
    );
  });

  it("omits a current status that contradicts a confirmed treated context", () => {
    const form = {
      ...adultHygiene2021Fixture,
      periodontalClassification: {
        ...adultHygiene2021Fixture.periodontalClassification,
        status: "stable" as const,
      },
    };

    expect(buildAdultHygiene2021Summary(form)).not.toContain(
      "Periodontal status:"
    );
  });

  it("charts status for any assessed periodontal diagnosis without carrying stage or grade", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.periodontalClassification = {
      ...form.periodontalClassification,
      diagnosis: "health",
      status: "stable",
      statusComment: "Clinician-confirmed current status",
      stage: "II",
      grade: "B",
    };

    const summary = buildAdultHygiene2021Summary(form);
    expect(summary).toContain(
      "Periodontal status: Periodontal disease stability."
    );
    expect(summary).toContain(
      "Periodontal status comment: Clinician-confirmed current status."
    );
    expect(summary).not.toMatch(/Stage II|Grade B/);
  });

  it("preserves output when the optional gingival description is absent", () => {
    const current = createEmptyAdultHygiene2021Form();
    const oldShape = { ...current };
    delete oldShape.gingivalDescription;
    expect(buildAdultHygiene2021Summary(oldShape)).toBe("");
    current.gingivalDescription = {
      status: "not_assessed",
      customFindings: "Retained custom observation",
      findings: [
        {
          optionId: "gingiva.color.coral_pink",
          extent: "generalized",
          locations: [],
          measurement: "",
          comment: "retained but hidden",
        },
      ],
    };
    expect(buildAdultHygiene2021Summary(current)).toBe("");
  });

  it("charts entered grade modifiers while suppressing another diagnosis interpretation", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.periodontalClassification = {
      ...form.periodontalClassification,
      diagnosis: "gingivitis",
      smoking: {
        status: "cigarettes",
        measurement: {
          operator: "eq",
          value: 12,
          unit: "cigarettes-per-day",
        },
      },
    };

    const summary = buildAdultHygiene2021Summary(form);
    expect(summary).toBe(`Patient-specific grade evidence:
  Grade modifiers:
    - Smoking: smokes 12 cigarettes/day.`);
    expect(summary).not.toContain("Periodontal diagnosis:");
  });

  it("charts cigarette smoking when cigarettes per day is not entered", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.periodontalClassification = {
      ...form.periodontalClassification,
      smoking: { status: "cigarettes" },
    };

    expect(buildAdultHygiene2021Summary(form))
      .toBe(`Patient-specific grade evidence:
  Grade modifiers:
    - Smoking: smokes cigarettes; cigarettes/day not entered.`);
  });

  it("charts ordered caries risk details without inferring missing values", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      cariesRiskFactors: [
        "Imported dry-mouth factor",
        "History of caries in the last 36 months",
      ],
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Caries risk: Factors include imported dry-mouth factor and history of active decay in the last 36 months"
    );
    expect(
      buildAdultHygiene2021Summary({
        ...createEmptyAdultHygiene2021Form(),
        cariesRiskNotes: "Synthetic rationale only",
      })
    ).toBe("Caries risk: Synthetic rationale only.");
  });

  it("charts entered structured periodontal observations before classification", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.periodontalClassification = {
      ...form.periodontalClassification,
      gingivalHealth: {
        ...form.periodontalClassification.gingivalHealth,
        periodontium: "intact",
        bopPercent: { operator: "eq", value: 6, unit: "percent" },
        maximumPpd: { operator: "eq", value: 3, unit: "mm" },
        attachmentLoss: "absent",
        radiographicBoneLoss: "absent",
        ppd4OrGreaterWithBop: "no",
        progressiveDestruction: "no",
      },
      stageBasis: [
        {
          criterionId: "stage.interdental-cal",
          measurement: { operator: "eq", value: 3, unit: "mm" },
        },
      ],
      gradeBasis: [
        {
          criterionId: "grade.bone-loss-age-ratio",
          measurement: { operator: "eq", value: 0.72, unit: "ratio" },
        },
      ],
    };

    expect(buildAdultHygiene2021Summary(form))
      .toBe(`Periodontal assessment findings:
  - Periodontal support: Intact periodontal support.
  - Bleeding on probing (BOP): 6%.
  - Maximum PPD: 3 mm.
  - Probing attachment loss: Absent.
  - Radiographic bone loss (RBL): Absent.
  - Sites with PPD >=4 mm and BOP: None.
  - Evidence of progressive periodontal destruction: No.

Patient-specific stage evidence:
  Severity evidence:
    - interdental CAL 3 mm.
  Complexity evidence:
    - maximum PPD 3 mm.

Patient-specific grade evidence:
  Progression evidence:
    - bone-loss/age ratio 0.72.`);
  });

  it("formats explicit gingival WNL from the reviewed preset", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.gingivalDescription = createGingivalDescriptionWnlAssessment();
    expect(
      form.gingivalDescription.findings.map(({ optionId }) => optionId)
    ).toHaveLength(10);
    expect(
      form.gingivalDescription.findings.every(
        ({ extent }) => extent === "generalized",
      ),
    ).toBe(true);
    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Gingival Description: Generalized Gingiva coral pink, Generalized firm and resilient, Generalized with knife-edged margins, Generalized papillae filling the embrasures, Generalized appropriate stippling of attached gingiva, and no recession or overgrowth noted."
    );
  });

  it("applies generalized gingivitis observations while preserving unrelated findings", () => {
    const form = createEmptyAdultHygiene2021Form();
    const current = {
      status: "findings" as const,
      customFindings: "Synthetic additional observation",
      findings: [
        {
          optionId: "gingiva.color.coral_pink",
          extent: "generalized" as const,
          locations: [],
          measurement: "",
          comment: "",
        },
        {
          optionId: "gingiva.position.no_recession",
          extent: "" as const,
          locations: [],
          measurement: "",
          comment: "",
        },
      ],
    };

    expect(hasConflictingGingivitisPresetObservations(current)).toBe(true);
    form.gingivalDescription = applyGingivitisObservationPreset(current);

    expect(form.gingivalDescription.findings.map(({ optionId }) => optionId))
      .toEqual([
        "gingiva.position.no_recession",
        "gingiva.color.marginal_redness",
        "gingiva.contour.rolled_margins",
        "gingiva.consistency.spongy",
        "gingiva.surface.smooth_attached",
      ]);
    expect(
      hasConflictingGingivitisPresetObservations(form.gingivalDescription),
    ).toBe(false);
    expect(
      applyGingivitisObservationPreset(form.gingivalDescription).findings,
    ).toEqual(form.gingivalDescription.findings);
    const localizedPreset = {
      ...form.gingivalDescription,
      findings: form.gingivalDescription.findings.map((finding) =>
        finding.optionId === "gingiva.color.marginal_redness"
          ? { ...finding, extent: "localized" as const, locations: ["Q1"] }
          : finding,
      ),
    };
    expect(hasConflictingGingivitisPresetObservations(localizedPreset)).toBe(
      true,
    );
    expect(
      applyGingivitisObservationPreset(localizedPreset).findings.find(
        ({ optionId }) => optionId === "gingiva.color.marginal_redness",
      ),
    ).toMatchObject({ extent: "generalized", locations: [] });
    expect(buildAdultHygiene2021Summary(form)).toBe(`Gingival Description:
  - Color: marginal redness (extent: generalized).
  - Contour / Shape: rolled margins (extent: generalized).
  - Consistency: spongy (extent: generalized).
  - Surface / Texture: smooth attached gingiva (extent: generalized).
  - Position / Size: no recession.
  Observations: Synthetic additional observation.`);
  });

  it("formats custom gingival findings alone or beside structured observations", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.gingivalDescription = {
      status: "findings",
      findings: [],
      customFindings: "Custom gingival observation",
    };
    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Gingival Description: Custom gingival observation."
    );

    form.gingivalDescription.findings = [
      {
        optionId: "gingiva.color.coral_pink",
        extent: "",
        locations: [],
        measurement: "",
        comment: "",
      },
    ];
    expect(buildAdultHygiene2021Summary(form)).toBe(`Gingival Description:
  - Color: coral pink.
  Observations: Custom gingival observation.`);
  });

  it("keeps original periodontal lines beside ordered structured findings", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.bleedingChoice = "Localized mild";
    form.recession = "Existing unrestricted recession";
    form.gingivalDescription = {
      status: "findings",
      findings: [
        {
          optionId: "retired.option",
          extent: "localized",
          locations: ["ignored"],
          measurement: "7",
          comment: "ignored",
        },
        {
          optionId: "gingiva.position.recession",
          extent: "localized",
          locations: ["Q1", "tooth 13 facial"],
          measurement: "1.5",
          comment: "monitored",
        },
        {
          optionId: "gingiva.color.physiologic_pigmentation",
          extent: "generalized",
          locations: [],
          measurement: "unsupported",
          comment: "normal variation",
        },
        {
          optionId: "gingiva.color.coral_pink",
          extent: "",
          locations: [],
          measurement: "",
          comment: "",
        },
      ],
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(`Bleeding: Localized mild.

Recession: Existing unrestricted recession.

Gingival Description:
  - Color: coral pink; physiologic pigmentation (extent: generalized; notes: normal variation).
  - Position / Size: gingival recession (extent: localized; location: Q1, tooth 13 facial; measurement: 1.5 mm; notes: monitored).`);
  });

  it("supports independent consent sources and position-preserving partial PSR values", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      patientId: " TEST-AH-2002 ",
      rda: " Example RDA ",
      consentPatient: true,
      consentParent: true,
      consentLegalGuardian: true,
      psrPocketing: ["1", "", "3", "", "2", ""] as [
        string,
        string,
        string,
        string,
        string,
        string
      ],
    };

    expect(hasRequiredAdultHygiene2021Fields(form)).toBe(true);
    expect(buildAdultHygiene2021Summary(form)).toBe(`PATIENT ID: TEST-AH-2002
DENTIST:
RDA: Example RDA
RDH:

Informed verbal consent given by PATIENT, PARENT and LEGAL GUARDIAN for treatment today.

PSR/Pocketing: 1 _ 3 / _ 2 _`);
  });

  it("keeps hygiene findings and their comments independent", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      plaqueChoice: "Localized mild interproximal",
      plaqueComment: "Most notable posteriorly",
      stainChoice: "Generalized moderate",
      stainComment: "Synthetic extrinsic stain note",
      calculusChoice: "Localized moderate marginal",
      calculusComment: "Synthetic calculus note",
      bleedingChoice: "Generalized mild",
      bleedingComment: "Synthetic bleeding note",
    };

    expect(buildAdultHygiene2021Summary(form))
      .toBe(`Plaque: Localized mild interproximal; Most notable posteriorly.
Stain: Generalized moderate; Synthetic extrinsic stain note.
Calculus: Localized moderate marginal; Synthetic calculus note.
Bleeding: Generalized mild; Synthetic bleeding note.`);
  });

  it("adds areas only to localized hygiene findings", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      plaqueChoice: "Localized moderate interproximal",
      plaqueAreas: ["S4", "Q1", "teeth 14–16"],
      stainChoice: "Generalized slight",
      stainAreas: ["Q2"],
      bleedingChoice: "Localized mild",
      bleedingAreas: ["mandible"],
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(`Plaque: Localized moderate interproximal — areas: Q1, S4, teeth 14–16.
Stain: Generalized slight.
Bleeding: Localized mild — areas: mandible.`);
  });

  it("emits a hygiene comment without requiring a structured finding", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      calculusComment: "Encounter-specific calculus comment",
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Calculus comment: Encounter-specific calculus comment."
    );
  });

  it("makes Nothing mutually exclusive with other chief concerns", () => {
    expect(
      applyPatientChiefConcernSelectionRules(
        ["Food catches between teeth"],
        ["Food catches between teeth", "Nothing"]
      )
    ).toEqual(["Nothing"]);

    expect(
      applyPatientChiefConcernSelectionRules(
        ["Nothing"],
        ["Nothing", "Sore gums upon brushing/flossing"]
      )
    ).toEqual(["Sore gums upon brushing/flossing"]);
  });

  it("offers periodic examination or recare as a chief concern", () => {
    expect(patientChiefConcernSeedValues).toContainEqual([
      "periodic-examination-recare",
      "Patient presents for periodic examination/recare",
    ]);
  });

  it("can list chief concerns on separate note lines", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      patientChiefConcern: [
        "Food catches between teeth",
        "Sensitivity to hot and cold",
      ],
      listChiefConcerns: true,
      plaqueChoice: "Localized moderate interproximal",
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(`Patient Chief Concern:
  - Food catches between teeth
  - Sensitivity to hot and cold

Plaque: Localized moderate interproximal.`);
  });

  it("adds optional OHE topics and notes without replacing existing OHE lines", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      diseaseProcessReviewed: true,
      oheTopicsReviewed: [
        "Bass brushing",
        "Caries theory",
        "Caries risk factors",
        "Periodontitis theory",
        "Periodontitis risk factors",
        "Importance of maintaining the recommended hygiene interval",
      ],
      oheNotes: "Demonstrated brushing modifications",
    };

    expect(buildAdultHygiene2021Summary(form))
      .toBe(`REVIEWED DISEASE PROCESS WITH PATIENT TODAY
OHE: Bass brushing; Caries theory and risk factors; Periodontitis theory and risk factors; Importance of maintaining the recommended hygiene interval.
OHE notes: Demonstrated brushing modifications.`);
  });

  it("emits the reviewed standard and additional OHE wording only when selected", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      standardOheStatementApplies: true,
      oheTopicsReviewed: [
        "Review of benefits of a bruxism guard, effects of clenching and grinding on hard and soft tissues",
        "Review of importance of maintaining a 4-month recall",
      ],
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(`${standardOheStatement}.
OHE: Review of benefits of a bruxism guard, effects of clenching and grinding on hard and soft tissues; Review of importance of maintaining a 4-month recall.`);
  });

  it("accepts custom flossing and brushing frequencies directly", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      flossingFrequency: "Uses floss picks most evenings",
      brushingFrequency: "Brushes after each meal",
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Patient is currently: Uses floss picks most evenings; Brushes after each meal."
    );
  });

  it("adds multiple fixed and encounter-only tooth areas to a treatment", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      treatmentCompleted: [
        {
          id: "completed-1",
          treatmentType: "Synthetic scaling",
          toothAreas: ["Q3", "teeth 14–16", "q2", "TEETH 14–16"],
        },
        {
          id: "completed-2",
          treatmentType: "Synthetic polishing",
          toothAreas: [],
        },
        {
          id: "completed-3",
          treatmentType: "",
          toothAreas: ["full mouth"],
        },
      ],
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Treatment completed today: Synthetic scaling — Q2, Q3, teeth 14–16; Synthetic polishing"
    );
  });

  it("formats the standard treatment preset without local anesthesia", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.treatmentCompleted = [
      ...standardTreatmentCompletedPreset.map((entry, index) => ({
        ...entry,
        id: `standard-${index}`,
        toothAreas: [...entry.toothAreas],
        instrumentation: entry.instrumentation
          ? [...entry.instrumentation]
          : undefined,
      })),
    ];

    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Treatment completed today: FMP — full mouth; Full mouth scaling with hand and Cavitron instrumentation (3U Scale); Selective polish with Enamel Pro® Prophy Paste with Fluoride (Strawberry) (1U Polish); OHE; Oral Science Inc. FluoriMax 2.5% NaF Varnish application — full mouth",
    );
  });

  it("keeps classification overrides, compliance, and interval comments independent", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      periodontalClassification: {
        ...createEmptyAdultHygiene2021Form().periodontalClassification,
        diagnosis: "periodontitis" as const,
        extent: "generalized" as const,
        stage: "II" as const,
        grade: "B" as const,
        stageOverrideReason: "Synthetic stage context",
        gradeOverrideReason: "Synthetic grade context",
      },
      oralHygieneCompliance: "Good",
      oralHygieneComplianceComment: "Synthetic compliance context",
      recallInterval: "6-month recall",
      recallIntervalComments: "Synthetic recall context",
      hygieneInterval: "4-month scale",
      hygieneIntervalComments: "Synthetic hygiene context",
    };

    expect(buildAdultHygiene2021Summary(form))
      .toBe(`Periodontal diagnosis: Generalized periodontitis, Stage II, Grade B.
Stage override: Synthetic stage context.
Grade override: Synthetic grade context.

Oral hygiene compliance: Good.
Oral hygiene compliance comment: Synthetic compliance context.

Recommended Recare Interval: 6-month recall.
Recommended recare interval comments: Synthetic recall context.
Recommended Hygiene Interval: 4-month scale.
Recommended hygiene interval comments: Synthetic hygiene context.`);
  });

  it("charts manual stage and grade selections without requiring reasons", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.periodontalClassification = {
      ...form.periodontalClassification,
      diagnosis: "periodontitis",
      stage: "IV",
      grade: "C",
      stageBasis: [
        {
          criterionId: "stage.interdental-cal",
          measurement: { operator: "eq", value: 3, unit: "mm" },
        },
      ],
      gradeBasis: [
        {
          criterionId: "grade.bone-loss-age-ratio",
          measurement: { operator: "eq", value: 0.5, unit: "ratio" },
        },
      ],
    };

    const summary = buildAdultHygiene2021Summary(form);
    expect(summary)
      .toBe(`Patient-specific stage evidence:
  Severity evidence:
    - interdental CAL 3 mm.

Patient-specific grade evidence:
  Progression evidence:
    - bone-loss/age ratio 0.5.

Periodontal diagnosis: Periodontitis, Stage IV, Grade C.`);
    expect(summary).not.toMatch(/Stage override:|Grade override:/);
  });
});
