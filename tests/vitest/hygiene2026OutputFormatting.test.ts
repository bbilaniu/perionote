import { describe, expect, it } from "vitest";
import { createEmptyAdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import {
  buildAdolescentHygiene2026Summary,
  createEmptyAdolescentHygiene2026Form,
} from "@/lib/templates/adolescentHygiene2026";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";

describe.each([
  {
    template: "Adult",
    createForm: createEmptyAdultHygiene2026Form,
    buildSummary: buildAdultHygiene2026Summary,
  },
  {
    template: "Adolescent",
    createForm: createEmptyAdolescentHygiene2026Form,
    buildSummary: buildAdolescentHygiene2026Summary,
  },
])("2026 $template output formatting", ({ createForm, buildSummary }) => {
  it("groups PPE, vitals, caries risk, habits, education, goals, and follow-up", () => {
    const form = createForm();
    Object.assign(form, {
      class5IndicatorStatus: "yes",
      mieleCodes: "SYNTH-STERI-2026",
      ppeStatementApplies: true,
      consentPatient: true,
      medicalHistoryReview: "Synthetic history reviewed",
      vitalsReadings: [
        { systolic: "120", diastolic: "80", heartRate: "70", time: "09:00" },
        { systolic: "124", diastolic: "82", heartRate: "74", time: "09:02" },
      ],
      oralHygieneCompliance: "Fair",
      oralHygieneComplianceComment: "Synthetic compliance context",
      flossingFrequency: "Flossing 1x/day",
      brushingFrequency: "Brushing 2x/day",
      homeCareInstructionReviewed: true,
      standardOheStatementApplies: true,
      hygieneGoal: "Synthetic home-care goal",
      recallInterval: "6-month recall",
      dentalNextVisit: "Synthetic dental follow-up",
      hygieneInterval: "4-month scale",
      nextVisit: "Synthetic hygiene follow-up",
    });
    form.cambra123Assessment = {
      ...form.cambra123Assessment,
      completionStatus: "complete",
      yesItemIds: ["protective.fluoridated-water", "risk.heavy-plaque"],
      finalRiskLevel: "Moderate",
    };

    expect(buildSummary(form)).toBe(`Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: Yes.
Sterilization Codes Scanned: SYNTH-STERI-2026
ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES

Informed verbal consent given by PATIENT for treatment today.
Medical history reviewed: Synthetic history reviewed.

Vitals reading 1: BP: 120/80 mmHg, HR: 70 bpm (at 09:00)
Vitals reading 2: BP: 124/82 mmHg, HR: 74 bpm (at 09:02)
Average BP: 122/81 mmHg, HR: 72 bpm

Caries risk category: Moderate.
  CAMBRA123 2021, ages 6–adult, score: 1 (Column 1: -1; Column 2: +2; Column 3: +0).
  Protective factors — Yes: Fluoridated water.
  Biological/environmental risk factors — Yes: Heavy plaque on the teeth.
  Disease indicators — Yes: None.

Oral hygiene compliance: Fair.
Oral hygiene compliance comment: Synthetic compliance context.
Patient is currently: Flossing 1x/day; Brushing 2x/day.

Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY
Patient's diagnoses and risk factors were explained to them. OHE on etiology of periodontitis and caries; and their risk factors. Demonstration of bass brushing, c-shape flossing technique. Reviewed benefits of Prevident 5000 or Opti-Rinse 0.05%.

Hygiene goal: Synthetic home-care goal.

Recommended Recare Interval: 6-month recall.
Next Dental Visit: Synthetic dental follow-up.

Recommended Hygiene Interval: 4-month scale.
Next Hygiene Visit: Synthetic hygiene follow-up.`);
  });

  describe.each(["complete", "hygiene", "recare"] as const)("%s note", (output) => {
    it("includes checked PPE once with sterilization, even without codes", () => {
      const form = createForm();
      form.ppeStatementApplies = true;
      form.medicalHistoryReview = "Synthetic review";
      const ppe = "ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES";

      expect(buildSummary(form, { output })).toBe(
        `${ppe}\n\nMedical history reviewed: Synthetic review.`,
      );
      form.ppeStatementApplies = false;
      expect(buildSummary(form, { output })).toBe(
        "Medical history reviewed: Synthetic review.",
      );
    });

    it("omits an untouched assessment and makes no empty-note assertions", () => {
      const form = createForm();
      form.cambra123Assessment.notes = "  ";
      expect(buildSummary(form, { output })).toBe("");
    });

    it.each(["not-started", "in-progress"] as const)(
      "marks a filled %s assessment incomplete without a score or inferred category",
      (completionStatus) => {
        const form = createForm();
        form.cambra123Assessment = {
          ...form.cambra123Assessment,
          completionStatus,
          yesItemIds: ["risk.heavy-plaque"],
          notes: "Synthetic review pending",
        };
        expect(buildSummary(form, { output })).toBe(`Caries risk category: Not documented.
  CAMBRA123 2021, ages 6–adult: Incomplete.
  Biological/environmental risk factors — Yes: Heavy plaque on the teeth.
  CAMBRA123 notes: Synthetic review pending.`);
      },
    );

    it("retains a documented category and notes on an incomplete assessment", () => {
      const form = createForm();
      form.cambra123Assessment = {
        ...form.cambra123Assessment,
        completionStatus: "in-progress",
        finalRiskLevel: "High",
        notes: "Synthetic assessment awaiting completion",
      };
      expect(buildSummary(form, { output })).toBe(`Caries risk category: High.
  CAMBRA123 2021, ages 6–adult: Incomplete.
  CAMBRA123 notes: Synthetic assessment awaiting completion.`);
    });

    it("distinguishes an explicitly completed all-No assessment from an untouched one", () => {
      const form = createForm();
      form.cambra123Assessment.completionStatus = "complete";
      expect(buildSummary(form, { output })).toBe(`Caries risk category: Not documented.
  CAMBRA123 2021, ages 6–adult, score: 0 (Column 1: 0; Column 2: +0; Column 3: +0).
  Protective factors — Yes: None.
  Biological/environmental risk factors — Yes: None.
  Disease indicators — Yes: None.`);
    });

    it("separates vitals from history without adding leading or empty paragraphs", () => {
      const form = createForm();
      form.medicalHistoryReview = "Synthetic review";
      form.premedicationStatus = "not-required";
      form.vitalsReadings = [{ systolic: "", diastolic: "", heartRate: "", time: "" }];
      expect(buildSummary(form, { output })).toBe(
        "Medical history reviewed: Synthetic review.\nPremedication Required: No.",
      );
      form.vitalsReadings = [{ systolic: "120", diastolic: "80", heartRate: "70", time: "" }];
      expect(buildSummary(form, { output })).toBe(
        "Medical history reviewed: Synthetic review.\nPremedication Required: No.\n\nVitals reading 1: BP: 120/80 mmHg, HR: 70 bpm",
      );
      form.premedicationStatus = "required";
      expect(buildSummary(form, { output })).toBe(
        "Medical history reviewed: Synthetic review.\nPremedication Required: Yes.\n\nVitals reading 1: BP: 120/80 mmHg, HR: 70 bpm",
      );
      form.premedicationDetails = "Synthetic premedication details";
      expect(buildSummary(form, { output })).toBe(
        "Medical history reviewed: Synthetic review.\nPremedication Required: Yes—Synthetic premedication details.\n\nVitals reading 1: BP: 120/80 mmHg, HR: 70 bpm",
      );
      form.medicalHistoryReview = "";
      expect(buildSummary(form, { output })).toBe(
        "Premedication Required: Yes—Synthetic premedication details.\n\nVitals reading 1: BP: 120/80 mmHg, HR: 70 bpm",
      );
      form.premedicationStatus = "not-documented";
      expect(buildSummary(form, { output })).toBe(
        "Vitals reading 1: BP: 120/80 mmHg, HR: 70 bpm",
      );
    });
  });

  it("keeps one blank line between remaining hygiene paragraphs when education is omitted", () => {
    const form = createForm();
    form.brushingFrequency = "Brushing 2x/day";
    form.hygieneGoal = "Synthetic goal";
    for (const output of ["complete", "hygiene"] as const) {
      expect(buildSummary(form, { output })).toBe(
        "Patient is currently: Brushing 2x/day.\n\nHygiene goal: Synthetic goal.",
      );
    }
    expect(buildSummary(form, { output: "recare" })).toBe("");
  });
});
