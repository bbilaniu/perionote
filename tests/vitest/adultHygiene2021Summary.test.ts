import { describe, expect, it } from "vitest";
import {
  createEmptyAdultHygiene2021Form,
  hasRequiredAdultHygiene2021Fields,
} from "@/lib/templates/adultHygiene2021";
import { adultHygiene2021Fixture } from "@/lib/templates/fixtures/adultHygiene2021.fixture";
import { applyPatientChiefConcernSelectionRules } from "@/lib/templates/patientChiefConcern";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { createGingivalDescriptionWnlAssessment } from "@/lib/templates/gingivalDescriptionCatalog";

describe("buildAdultHygiene2021Summary", () => {
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
Last Recall Date: 2026-01-15

Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: Yes.
Miele Sterilization Codes Scanned: SYNTH-AH-001
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
Health/Gingivitis: Synthetic gingival-health documentation.
Gingival Description:
  - Color: coral pink; extent: generalized.
  - Position / Size: gingival recession; extent: localized; location: facial 31–33; measurement: 2 mm; notes: synthetic finding.
Periodontitis Stage: Stage II (P2).
Periodontitis Grade: Grade B: moderate rate.

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
Recommended Recall Interval: 6-month recall.
Recommended Hygiene Interval: 4-month scale.
Next visit: Synthetic hygiene follow-up.
Date Booked: 2026-11-15`);
    expect(summary).not.toContain("\n\n\n");
    expect(summary).not.toContain("Not documented");
  });

  it("preserves old-shaped output when gingival description is absent", () => {
    const current = createEmptyAdultHygiene2021Form();
    current.healthGingivitis = "Health intact";
    const oldShape = { ...current };
    delete oldShape.gingivalDescription;
    expect(buildAdultHygiene2021Summary(oldShape)).toBe(
      "Health/Gingivitis: Health intact."
    );
  });

  it("formats explicit gingival WNL from the reviewed preset", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.gingivalDescription = createGingivalDescriptionWnlAssessment();
    expect(
      form.gingivalDescription.findings.map(({ optionId }) => optionId)
    ).toHaveLength(10);
    expect(buildAdultHygiene2021Summary(form)).toBe(
      "Gingival Description: Gingiva coral pink, firm and resilient, with knife-edged margins, papillae filling the embrasures, appropriate stippling of attached gingiva, and no recession or overgrowth noted."
    );
  });

  it("keeps original periodontal lines beside ordered structured findings", () => {
    const form = createEmptyAdultHygiene2021Form();
    form.bleedingChoice = "Localized mild";
    form.recession = "Existing unrestricted recession";
    form.healthGingivitis = "Existing health value";
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
      ],
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(`Bleeding: Localized mild.

Recession: Existing unrestricted recession.
Health/Gingivitis: Existing health value.
Gingival Description:
  - Color: physiologic pigmentation; extent: generalized; notes: normal variation.
  - Position / Size: gingival recession; extent: localized; location: Q1, tooth 13 facial; measurement: 1.5 mm; notes: monitored.`);
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

  it("can list chief concerns on separate note lines", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      patientChiefConcern: [
        "Food catches between teeth",
        "Sensitivity to hot and cold",
      ],
      listChiefConcerns: true,
    };

    expect(buildAdultHygiene2021Summary(form)).toBe(`Patient Chief Concern:
  - Food catches between teeth
  - Sensitivity to hot and cold`);
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

  it("keeps stage, grade, compliance, and interval comments independent", () => {
    const form = {
      ...createEmptyAdultHygiene2021Form(),
      periodontitisStageChoice: "Stage II (P2)",
      periodontitisStageComments: "Synthetic stage context",
      periodontitisGradeChoice: "Grade B: moderate rate",
      periodontitisGradeComments: "Synthetic grade context",
      oralHygieneCompliance: "Good",
      oralHygieneComplianceComment: "Synthetic compliance context",
      recallInterval: "6-month recall",
      recallIntervalComments: "Synthetic recall context",
      hygieneInterval: "4-month scale",
      hygieneIntervalComments: "Synthetic hygiene context",
    };

    expect(buildAdultHygiene2021Summary(form))
      .toBe(`Periodontitis Stage: Stage II (P2).
Periodontitis stage comments: Synthetic stage context.
Periodontitis Grade: Grade B: moderate rate.
Periodontitis grade comments: Synthetic grade context.

Oral hygiene compliance: Good.
Oral hygiene compliance comment: Synthetic compliance context.

Recommended Recall Interval: 6-month recall.
Recommended recall interval comments: Synthetic recall context.
Recommended Hygiene Interval: 4-month scale.
Recommended hygiene interval comments: Synthetic hygiene context.`);
  });
});
