import { describe, expect, it } from "vitest";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import {
  createEmptyRecareExamForm,
  hasRequiredRecareExamFields,
} from "@/lib/templates/recareExam";
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
Patient's chief concern: Synthetic concern for demonstration.

Extraoral: WNL.
TMJ: Synthetic bilateral clicking without discomfort.
Palpation of the masseter test: WNL.
Load TMJ joint test: WNL.

Intraoral: WNL.
Oral habits: Synthetic clenching history.
Molar occlusion—right: Synthetic Class I.
Molar occlusion—left: N/A.
Skeletal occlusion: N/A.
Overjet: 2 mm.
Overbite: 30%.

CPAP: No.
Occlusal splint: Yes; uses.
Orthodontic history: Yes.
Retainers: Fixed.
Partial/complete removable dentures: No.

Patient would like to improve: Synthetic request to discuss whitening.
Additional comments: Synthetic demonstration data only.

Treatment Options:
  - Hygiene maintenance
  - Synthetic restorative consultation — teeth 14, 15

Treatment Plan:
  - Hygiene maintenance

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
Medical history reviewed: YES- NO CHANGES.`,
    );
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
  - Second option — teeth 14, 15
  - First option

Treatment Plan:
  - First option — upper right`);
  });

  it("uses browser-local timestamp components", () => {
    expect(formatRecareExamLocalTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
      "2026-01-02 03:04",
    );
    expect(formatNoteHeaderLocalTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
      "----- January 2, 2026 3:04:05 AM -----",
    );
    expect(formatNoteHeaderLocalTimestamp(new Date(2026, 6, 24, 10, 21, 44))).toBe(
      "----- July 24, 2026 10:21:44 AM -----",
    );
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
