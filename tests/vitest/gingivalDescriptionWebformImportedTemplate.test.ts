import { describe, expect, it } from "vitest";
import {
  buildDemoForm,
  buildInitialForm,
  buildSummaryText,
} from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";

function buildBaseForm() {
  return {
    date: "2026-03-18",
    patientConcerns: "",
    patientPresentsForHygieneNoOtherConcerns: false,
    medicalHistory: "Patient reports no changes",
    bloodPressure: "",
    heartRate: "",
    bloodPressureTakenTime: "",
    eoe: "",
    ioe: "",
    eoeWithinNormalLimits: false,
    ioeWithinNormalLimits: false,
    asymptomaticClickOnOpeningClosing: false,
    tmjClickingStatus: [],
    tmjClickingPhase: [],
    asymptomaticClickLaterality: "",
    asymptomaticLymphNodes: false,
    palpableLymphNodeLaterality: "",
    palpableLymphNodeLocation: [],
    palpableLymphNodeSwelling: [],
    ioeFindings: [],
    palatineTorusAtMidline: false,
    palatineTorusProminence: "",
    bilateralMandibularTori: false,
    bilateralMandibularToriProminence: "",
    findings: {},
    plaque: {
      enabled: false,
      amount: "None",
      extent: "Localized",
      locations: [],
      types: [],
      distributions: [],
      details: "",
    },
    calculus: {
      enabled: false,
      amount: "None",
      extent: "Localized",
      locations: [],
      types: [],
      distributions: [],
      details: "",
    },
    extrinsicStain: {
      enabled: false,
      amount: "None",
      extent: "Localized",
      locations: [],
      types: [],
      distributions: [],
      details: "",
    },
    treatmentDoneToday: [],
    treatmentDoneTodayInstrumentationDevices: [],
    treatmentDoneTodayInstrumentationAreas: [],
    treatmentDoneTodayNotes: "",
    nextAppointment: [],
    nextAppointmentInstrumentationDevices: [],
    nextAppointmentInstrumentationAreas: [],
    nextAppointmentNotes: "",
    localAnesthesiaNoContraindication: false,
    localAnesthesiaBenzocaineApplied: false,
    localAnesthesiaNoAdverseReactions: false,
    localAnesthesiaAdequateAchieved: false,
    localAnesthesiaEntries: [],
    localAnesthesiaNotes: "",
    oheTopics: [],
    oheNotes: "",
    recommendations: [],
    recommendationsNotes: "",
    cariesRiskLevel: "",
    cariesRiskFactors: [],
    cariesRiskNotes: "",
    periodontalStatusActivity: "",
    periodontalStatusDiseaseType: "",
    periodontalStatusSeverityStage: "",
    periodontalStatusGrade: "",
    periodontalStatusNotes: "",
    disposition: [],
    otherClinicalFindings: "",
  };
}

describe("buildSummaryText", () => {
  it("seeds the initial form from the provided fixture", () => {
    const form = buildInitialForm(gingivalDescriptionWebformFixture);

    expect(form.date).toBe("2026-03-09");
    expect(form.findings.color.Red).toMatchObject({
      presence: true,
      extent: "localized",
      toothNumbers: "#5, #6-8",
      locations: ["Facial", "Interproximal"],
      distributions: ["Marginal", "Papillary"],
      notes: "More pronounced in maxillary anterior region.",
    });
  });

  it("builds the demo form from the same fixture-backed baseline", () => {
    const form = buildDemoForm(gingivalDescriptionWebformFixture);

    expect(form.date).toBe("2026-03-09");
    expect(form.findings.color.Red.presence).toBe(true);
    expect(form.patientConcerns).toBeTruthy();
  });

  it("includes note-only fields that were previously omitted from the plain-text summary", () => {
    const form = buildBaseForm();
    form.oheNotes = "Reviewed brushing modifications";
    form.recommendationsNotes = "Use Prevident nightly";
    form.treatmentDoneTodayNotes = "Localized debridement completed";
    form.nextAppointmentNotes = "Re-evaluate lower anterior tissue response";
    form.otherClinicalFindings = "Monitor linea alba";

    const summary = buildSummaryText(form, []);

    expect(summary).toContain("OHE: Reviewed brushing modifications.");
    expect(summary).toContain("Recommendations: Use Prevident nightly.");
    expect(summary).toContain(
      "Treatments completed today: Localized debridement completed.",
    );
    expect(summary).toContain(
      "Next Appointment: Re-evaluate lower anterior tissue response.",
    );
    expect(summary).toContain("Other clinical findings: Monitor linea alba.");
  });
});
