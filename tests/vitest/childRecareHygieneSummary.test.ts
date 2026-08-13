import { describe, expect, it } from "vitest";
import {
  createEmptyChildRecareHygieneForm,
  hasRequiredChildRecareHygieneFields,
} from "@/lib/templates/childRecareHygiene";
import { childRecareHygieneFixture } from "@/lib/templates/fixtures/childRecareHygiene.fixture";
import { buildChildRecareHygieneSummary } from "@/lib/templates/summary/buildChildRecareHygieneSummary";
import { isValidChildRecareHygieneForm } from "@/components/templates/native/ChildRecareHygieneTemplate";

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

  it("accepts drafts created before structured consent and PPE", () => {
    const legacyDraft = { ...createEmptyChildRecareHygieneForm() } as Record<
      string,
      unknown
    >;
    delete legacyDraft.consentPatient;
    delete legacyDraft.consentParent;
    delete legacyDraft.consentLegalGuardian;
    delete legacyDraft.consentDetails;
    delete legacyDraft.ppeStatementApplies;
    legacyDraft.consentBy = "Grandparent";

    expect(isValidChildRecareHygieneForm(legacyDraft)).toBe(true);
    expect(
      buildChildRecareHygieneSummary({
        ...createEmptyChildRecareHygieneForm(),
        ...legacyDraft,
      } as ReturnType<typeof createEmptyChildRecareHygieneForm>),
    ).toContain(
      "Informed verbal consent for treatment today given by: Grandparent.",
    );
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
    expect(combined).toContain(
      "Medical history reviewed: Reviewed; no changes reported.",
    );
    expect(combined).toContain(
      "Informed verbal consent for treatment today given by: Parent.",
    );
    expect(combined).toContain(
      "-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES",
    );
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

  it("includes the 24-hour note start in generated output", () => {
    const summary = buildChildRecareHygieneSummary(
      createEmptyChildRecareHygieneForm(),
      { startedAt: new Date(2026, 7, 12, 18, 21) },
    );

    expect(summary).toContain("----- August 12, 2026 18:21 -----");
  });
});
