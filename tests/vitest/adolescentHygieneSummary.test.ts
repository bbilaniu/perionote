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
    expect(summary).toContain(`Gingival Health: Synthetic generalized marginal inflammation.
Plaque Index: Synthetic light generalized plaque.
Calculus: Yes — Synthetic light mandibular anterior calculus.
Intraoral Images: No.`);
    expect(summary).toContain(`OHI Reviewed
Flossing Technique: C-shape flossing reviewed.
Brushing Technique: Bass brushing twice daily reviewed.`);
    expect(summary).toContain(`Scaling: Yes — 0.5 units.
Polish: Yes — Selective polish with synthetic demonstration product.
Treatments done today: Synthetic hygiene visit with scaling, selective polish, OHE, and fluoride varnish.
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
      gingivalHealth: "Imported clinical wording",
      calculusStatus: "yes" as const,
      calculusDetails: "Unknown imported location",
      treatmentCompletedToday: "Unknown imported treatment wording",
    };

    expect(buildAdolescentHygieneSummary(form)).toBe(`Gingival Health: Imported clinical wording.
Calculus: Yes — Unknown imported location.

Treatments done today: Unknown imported treatment wording.`);
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
