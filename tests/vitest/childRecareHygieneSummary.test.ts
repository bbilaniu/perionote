import { describe, expect, it } from "vitest";
import {
  createEmptyChildRecareHygieneForm,
  hasRequiredChildRecareHygieneFields,
} from "@/lib/templates/childRecareHygiene";
import { childRecareHygieneFixture } from "@/lib/templates/fixtures/childRecareHygiene.fixture";
import { buildChildRecareHygieneSummary } from "@/lib/templates/summary/buildChildRecareHygieneSummary";

describe("buildChildRecareHygieneSummary", () => {
  it("does not infer unanswered clinical findings", () => {
    const summary = buildChildRecareHygieneSummary(
      createEmptyChildRecareHygieneForm(),
    );

    expect(summary).toBe(
      "Patient presents for a pediatric recall exam and cleaning.\n\nDENTAL EXAM\n\nHYGIENE",
    );
    expect(summary).not.toContain("WNL");
    expect(summary).not.toContain("No.");
  });

  it("requires a patient ID and at least one provider", () => {
    expect(hasRequiredChildRecareHygieneFields(childRecareHygieneFixture)).toBe(
      true,
    );
    expect(
      hasRequiredChildRecareHygieneFields({
        ...childRecareHygieneFixture,
        patientId: "",
      }),
    ).toBe(false);
    expect(
      hasRequiredChildRecareHygieneFields({
        ...childRecareHygieneFixture,
        dentist: "",
        rda: "",
        rdh: "",
      }),
    ).toBe(false);
  });

  it("builds combined, dentist, and hygienist notes from one encounter", () => {
    const combined = buildChildRecareHygieneSummary(
      childRecareHygieneFixture,
    );
    const dentist = buildChildRecareHygieneSummary(childRecareHygieneFixture, {
      output: "dentist",
    });
    const hygienist = buildChildRecareHygieneSummary(
      childRecareHygieneFixture,
      { output: "hygienist" },
    );

    expect(combined).toContain("DENTAL EXAM");
    expect(combined).toContain("HYGIENE");
    expect(combined).toContain("Overjet: 2 mm.");
    expect(combined).toContain("Scaling: Yes — 0.5 units.");
    expect(combined).toContain(
      "Polish: Yes — Enamel Pro® Prophy Paste with Fluoride (Strawberry).",
    );
    expect(combined).toContain(
      "Fluoride: Yes — Oral Science Inc. FluoriMax 2.5% NaF Varnish.",
    );
    expect(dentist).toContain("Recall interval: 6-month recall.");
    expect(dentist).not.toContain("HYGIENE");
    expect(dentist).not.toContain("Hygiene interval:");
    expect(hygienist).toContain("Hygiene interval: 6-month scale.");
    expect(hygienist).not.toContain("DENTAL EXAM");
    expect(hygienist).not.toContain("Recall interval:");
  });
});
