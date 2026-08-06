import { describe, expect, it } from "vitest";
import { adolescentHygieneFixture } from "@/lib/templates/fixtures/adolescentHygiene.fixture";
import {
  createEmptyAdolescentHygieneForm,
  hasRequiredAdolescentHygieneFields,
} from "@/lib/templates/adolescentHygiene";
import { buildAdolescentHygieneSummary } from "@/lib/templates/summary/buildAdolescentHygieneSummary";

describe("buildAdolescentHygieneSummary", () => {
  it("starts empty without inferring clinical answers", () => {
    const emptyForm = createEmptyAdolescentHygieneForm();

    expect(buildAdolescentHygieneSummary(emptyForm)).toBe("");
    expect(hasRequiredAdolescentHygieneFields(emptyForm)).toBe(false);
  });

  it("requires Patient ID and at least one documented provider", () => {
    const form = {
      ...createEmptyAdolescentHygieneForm(),
      patientId: "ADO-001",
      rdh: "Synthetic RDH",
    };

    expect(hasRequiredAdolescentHygieneFields(form)).toBe(true);
    expect(
      hasRequiredAdolescentHygieneFields({ ...form, patientId: "" }),
    ).toBe(false);
    expect(
      hasRequiredAdolescentHygieneFields({
        ...form,
        dentist: "",
        rdh: "",
        rda: "",
      }),
    ).toBe(false);
  });

  it("builds the synthetic draft in mapped source order", () => {
    const summary = buildAdolescentHygieneSummary(adolescentHygieneFixture);

    expect(summary).toContain(`PATIENT ID: TEST-ADOLESCENT-001
DENTIST: Dr. Example
RDH: Example RDH
RDA:`);
    expect(summary).toContain(
      "Informed verbal consent given by PARENT for treatment today. Synthetic consent example.",
    );
    expect(summary).toContain(
      "Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments.",
    );
    expect(summary).toContain(`Plaque: Localized moderate interproximal — areas: posterior; Synthetic plaque observation.
Calculus: Localized mild marginal — areas: mandibular anterior; Synthetic calculus observation.
Intraoral Images: No.`);
    expect(summary).toContain(`Periodontal assessment findings:
  - Periodontal support: Intact periodontal support.
  - Bleeding on probing (BOP): 18%.
  - Maximum PPD: 3 mm.`);
    expect(summary).toContain(
      "Health/Gingivitis: GINGIVITIS - INTACT PERIODONTIUM",
    );
    expect(summary).toContain(`OHI Reviewed
OHI techniques reviewed: Bass brushing; C-shape flossing technique.
OHE notes: Synthetic technique review.
Patient is currently: Flossing 1x/day; Brushing 2x/day.`);
    expect(summary).toContain(`Scaling: Yes — 0.5 units.
Polish: Yes — Selective polish with synthetic demonstration product.
Treatment completed today: 2BW; Dentist Recall Exam; 0.5U scale with hand and power instrumentation — full mouth; Selective polish — full mouth; OHE; FluoriMax 2.5% NaF Varnish application — full mouth
Fluoride: Yes — Synthetic fluoride varnish application — full mouth.`);
    expect(summary).toContain(
      "-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES",
    );
    expect(summary).not.toContain("Not documented");
    expect(summary).not.toContain("\n\n\n");
  });

  it("omits unanswered controls while preserving entered unknown text", () => {
    const form = {
      ...createEmptyAdolescentHygieneForm(),
      plaqueChoice: "Imported clinical wording",
      plaqueComment: "Imported plaque comment",
      calculusChoice: "Unknown imported calculus wording",
      treatmentCompleted: [
        {
          id: "imported-treatment",
          treatmentType: "Unknown imported treatment wording",
          toothAreas: [],
        },
      ],
    };

    expect(buildAdolescentHygieneSummary(form)).toBe(`Plaque: Imported clinical wording; Imported plaque comment.
Calculus: Unknown imported calculus wording.

Treatment completed today: Unknown imported treatment wording`);
  });

  it("does not emit the PPE statement unless it is explicitly checked", () => {
    const unchecked = {
      ...createEmptyAdolescentHygieneForm(),
      comments: "Synthetic comment",
    };

    expect(buildAdolescentHygieneSummary(unchecked)).not.toContain(
      "ALL PROPER PPE",
    );
    expect(
      buildAdolescentHygieneSummary({ ...unchecked, properPpeWorn: true }),
    ).toContain("ALL PROPER PPE");
  });
});
