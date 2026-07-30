import { describe, expect, it } from "vitest";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import {
  createEmptyRecareExamForm,
  hasRequiredRecareExamFields,
} from "@/lib/templates/recareExam";
import {
  createRecareNormalStructuredIntraoralFindings,
  recareNormalStructuredObservationIds,
} from "@/lib/templates/recareIntraoralCatalog";
import {
  buildRecareExamSummary,
  formatNoteHeaderLocalTimestamp,
  formatRecareExamLocalTimestamp,
} from "@/lib/templates/summary/buildRecareExamSummary";

describe("buildRecareExamSummary", () => {
  it("starts empty without inferring findings or treatment", () => {
    const emptyForm = createEmptyRecareExamForm();

    expect(buildRecareExamSummary(emptyForm)).toBe("");
    expect(hasRequiredRecareExamFields(emptyForm)).toBe(false);
  });

  it("builds the accepted output in mapped order with one blank line between groups", () => {
    const startedAt = new Date(2026, 6, 25, 13, 45, 12);
    const summary = buildRecareExamSummary(recareExamFixture, {
      startedAt,
    });

    expect(summary).toBe(`----- July 25, 2026 1:45:12 PM -----
PATIENT ID: TEST-1001
DENTIST: Dr. Example
RDA:
RDH: Example RDH

Informed verbal consent given by PATIENT for treatment today.
Medical history reviewed: Synthetic medication list reviewed.
Premedication required: No.
Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments.
Miele Sterilization codes scanned: SYNTH-001

Radiographs: 4 BW; 2 PA
Intraoral photos: No.
Patient's chief concern: Food catches between teeth; Synthetic concern for demonstration.

Extraoral: WNL.
TMJ: Synthetic bilateral clicking without discomfort.
Palpation of the masseter test: WNL.
Load TMJ joint test: WNL.

Intraoral:
  - Tongue: fissured (notes: Synthetic observation).
  - Saliva: normal flow.
Oral habits: Synthetic clenching history.
Molar occlusion—right: Synthetic Class I.
Molar occlusion—left: N/A.
Skeletal occlusion: N/A.
Overjet: 2 mm.
Overbite: 30%; 3 mm.
Additional occlusal findings: Crossbite (location: Posterior, Left).

CPAP: No.
Occlusal splint: Yes; uses.
Orthodontic history: Yes.
Retainers: Fixed.
Partial/complete removable dentures: No.

Patient would like to improve: Synthetic request to discuss whitening.
Additional comments: Synthetic demonstration data only.

ODONTOGRAM UP TO DATE
Caries risk: Moderate caries risk due to high frequency of sugar intake, insufficient exposure to fluoride and history of active decay in the last 36 months. Synthetic diet and home-care factors reviewed.

Treatment Options:
  1. Hygiene maintenance
  2. Synthetic restorative consultation — teeth 14, 15

Treatment Plan:
  1. Hygiene maintenance

Next Visit: Synthetic hygiene maintenance visit
Date Booked: 2026-08-15`);
    expect(summary).not.toContain("\n\n\n");
  });

  it("supports independent consent sources and catalogue-backed medical history text", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      consentPatient: true,
      consentParent: true,
      consentLegalGuardian: true,
      consentDetails: "Synthetic consent detail",
      medicalHistoryReview: "YES- NO CHANGES",
    };

    expect(buildRecareExamSummary(form)).toBe(
      `Informed verbal consent given by PATIENT, PARENT and LEGAL GUARDIAN for treatment today. Synthetic consent detail.
Medical history reviewed: YES- NO CHANGES.`
    );
  });

  it("can list chief concerns on separate note lines", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      chiefConcern: [
        "Food catches between teeth",
        "Sensitivity to hot and cold",
      ],
      listChiefConcerns: true,
    };

    expect(buildRecareExamSummary(form)).toBe(`Patient's chief concern:
  - Food catches between teeth
  - Sensitivity to hot and cold`);
  });

  it("preserves documented No answers and unknown editable values", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      patientId: " TEST-2002 ",
      rda: " Example RDA ",
      radiographs: ["Imported value ZX/7", "Imported value ZX/7"],
      cpapStatus: "yes" as const,
      cpapUseStatus: "no" as const,
      occlusalSplintStatus: "no" as const,
      retainerStatus: "none" as const,
      treatmentOptions: [
        {
          id: "option-1",
          treatmentType: "Second option",
          toothArea: "teeth 14, 15",
        },
        {
          id: "option-2",
          treatmentType: "First option",
          toothArea: "",
        },
      ],
      treatmentPlan: [
        {
          id: "plan-1",
          treatmentType: "First option",
          toothArea: "upper right",
        },
      ],
    };

    expect(hasRequiredRecareExamFields(form)).toBe(true);
    expect(buildRecareExamSummary(form)).toBe(`PATIENT ID: TEST-2002
DENTIST:
RDA: Example RDA
RDH:

Radiographs: Imported value ZX/7; Imported value ZX/7

CPAP: Yes; does not use.
Occlusal splint: No.
Retainers: None.

Treatment Options:
  1. Second option — teeth 14, 15
  2. First option

Treatment Plan:
  1. First option — upper right`);
  });

  it("can render treatment options and treatment plan inline independently", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      treatmentOptions: [
        {
          id: "option-1",
          treatmentType: "Hygiene maintenance",
          toothArea: "",
        },
        {
          id: "option-2",
          treatmentType: "Restorative consultation",
          toothArea: "tooth 36",
        },
      ],
      listTreatmentOptions: false,
      treatmentPlan: [
        {
          id: "plan-1",
          treatmentType: "Hygiene maintenance",
          toothArea: "",
        },
      ],
      listTreatmentPlan: false,
    };

    expect(buildRecareExamSummary(form))
      .toBe(`Treatment Options: Hygiene maintenance; Restorative consultation — tooth 36

Treatment Plan: Hygiene maintenance`);
  });

  it("documents odontogram status and ordered caries risk details without inferring values", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      odontogramUpToDate: true,
      cariesRiskFactors: [
        "Imported dry-mouth factor",
        "History of caries in the last 36 months",
      ],
    };

    expect(buildRecareExamSummary(form)).toBe(`ODONTOGRAM UP TO DATE
Caries risk: Factors include imported dry-mouth factor and history of active decay in the last 36 months`);

    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        cariesRiskNotes: "Synthetic rationale only",
      })
    ).toBe("Caries risk: Synthetic rationale only.");
  });

  it("uses browser-local timestamp components", () => {
    expect(formatRecareExamLocalTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
      "2026-01-02 03:04"
    );
    expect(formatNoteHeaderLocalTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
      "----- January 2, 2026 3:04:05 AM -----"
    );
    expect(
      formatNoteHeaderLocalTimestamp(new Date(2026, 6, 24, 10, 21, 44))
    ).toBe("----- July 24, 2026 10:21:44 AM -----");
  });

  it("preserves legacy intraoral output and formats Slice 2 findings safely", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        structuredIntraoralFindings: undefined,
        intraoralStatus: "wnl",
      })
    ).toBe("Intraoral: WNL.");
    const hiddenStructuredFinding = {
      optionId: "ioe.saliva.normal_flow",
      structureId: "ioe.saliva",
    };
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "not-assessed",
        structuredIntraoralFindings: [hiddenStructuredFinding],
      })
    ).toBe("");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "wnl",
        structuredIntraoralFindings: [hiddenStructuredFinding],
      })
    ).toBe("Intraoral: WNL.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        intraoralFindings: "Legacy observation",
      })
    ).toBe("Intraoral: Legacy observation.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        intraoralFindings: "Free text",
        structuredIntraoralFindings: [
          {
            optionId: "ioe.buccal_mucosa.ulcer",
            structureId: "ioe.buccal_mucosa",
            locations: ["Right posterior"],
            measurement: "4",
            measurementUnit: "mm",
            comment: "Synthetic note",
          },
          {
            optionId: "ioe.unknown.retired",
            structureId: "ioe.tongue",
            comment: "must be ignored",
          },
        ],
      })
    ).toBe(`Intraoral:
  - Buccal mucosa: ulcer (location: Right posterior; measurement: 4 mm; notes: Synthetic note).
  Observations: Free text.`);
  });

  it("applies the explicit reviewed normal observations with compact per-structure output", () => {
    expect(recareNormalStructuredObservationIds).toEqual([
      "ioe.buccal_mucosa.pink",
      "ioe.buccal_mucosa.moist",
      "ioe.buccal_mucosa.no_lesions",
      "ioe.buccal_mucosa.no_swelling",
      "ioe.tongue.pink",
      "ioe.tongue.moist",
      "ioe.tongue.symmetrical",
      "ioe.tongue.no_lesions",
      "ioe.floor_of_mouth.pink",
      "ioe.floor_of_mouth.smooth",
      "ioe.floor_of_mouth.no_swelling",
      "ioe.floor_of_mouth.no_discoloration",
      "ioe.palate.pink",
      "ioe.palate.intact",
      "ioe.palate.no_lesions",
      "ioe.palate.no_abnormal_growths",
      "ioe.oropharynx.uvula_midline",
      "ioe.oropharynx.no_redness",
      "ioe.oropharynx.no_swelling",
      "ioe.oropharynx.no_exudate",
      "ioe.saliva.clear",
      "ioe.saliva.normal_flow",
    ]);

    const structuredIntraoralFindings =
      createRecareNormalStructuredIntraoralFindings();
    expect(structuredIntraoralFindings).toHaveLength(22);
    expect(structuredIntraoralFindings.map(({ optionId }) => optionId)).toEqual(
      recareNormalStructuredObservationIds
    );
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        structuredIntraoralFindings,
      })
    ).toBe(`Intraoral:
  - Buccal mucosa: pink; moist; no lesions; no swelling.
  - Tongue: pink; moist; symmetrical; no lesions.
  - Floor of mouth: pink; smooth; no swelling; no discoloration.
  - Palate (hard/soft): pink; intact; no lesions; no abnormal growths.
  - Oropharynx: uvula midline; no redness; no swelling; no exudate.
  - Saliva: clear; normal flow.`);
  });

  it("groups structured observations in catalogue order regardless of selection order", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        structuredIntraoralFindings: [
          {
            optionId: "ioe.saliva.normal_flow",
            structureId: "ioe.saliva",
          },
          {
            optionId: "ioe.buccal_mucosa.ulcer",
            structureId: "ioe.buccal_mucosa",
            locations: ["Right"],
            comment: "monitor",
          },
          {
            optionId: "ioe.buccal_mucosa.pink",
            structureId: "ioe.buccal_mucosa",
          },
          {
            optionId: "ioe.tongue.fissured",
            structureId: "ioe.tongue",
          },
        ],
      })
    ).toBe(`Intraoral:
  - Buccal mucosa: pink; ulcer (location: Right; notes: monitor).
  - Tongue: fissured.
  - Saliva: normal flow.`);
  });

  it("supports percent, millimetre, and dual overbite output", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        overbitePercent: "25",
      })
    ).toBe("Overbite: 25%.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        overbiteMm: "2",
      })
    ).toBe("Overbite: 2 mm.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        overbitePercent: "25",
        overbiteMm: "2",
      })
    ).toBe("Overbite: 25%; 2 mm.");
  });
});

describe("interactive template lifecycle", () => {
  it("publishes pilots while excluding drafts from production", () => {
    expect(isTemplateAvailableForBuild("draft", "production")).toBe(false);
    expect(isTemplateAvailableForBuild("draft", "development")).toBe(true);
    expect(isTemplateAvailableForBuild("ready", "production")).toBe(true);
    expect(isTemplateAvailableForBuild("pilot", "production")).toBe(true);
  });
});
