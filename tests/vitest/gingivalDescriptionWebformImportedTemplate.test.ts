import { describe, expect, it } from "vitest";
import {
  buildDemoForm,
  buildInitialForm,
  buildSummaryText,
} from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";

function buildBaseDisposition() {
  return [
    {
      key: "reEval",
      label: "DH Re-eval",
      enabled: false,
      interval: "4-6",
      unit: "weeks",
      trailingLabel: "",
    },
    {
      key: "reCare",
      label: "DH Re-care",
      enabled: false,
      interval: "3-4",
      unit: "months",
      trailingLabel: "interval",
    },
  ];
}

function buildBaseForm() {
  return {
    date: "2026-03-18",
    providerName: "",
    patientConcerns: "",
    patientPresentsForHygieneNoOtherConcerns: false,
    medicalHistoryNoChange: false,
    medicalHistory: "",
    vitalsReadings: [
      {
        systolic: "",
        diastolic: "",
        heartRate: "",
        time: "",
      },
    ],
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
    disposition: buildBaseDisposition(),
    otherClinicalFindings: "",
  };
}

describe("buildSummaryText", () => {
  it("keeps gingival findings cleared when the provided fixture has none", () => {
    const form = buildInitialForm(gingivalDescriptionWebformFixture);

    expect(form.date).toBe("2026-03-09");
    expect(form.medicalHistoryNoChange).toBe(false);
    expect(form.medicalHistory).toBe("");
    expect(form.disposition).toMatchObject(buildBaseDisposition());
    expect(form.findings.color.Red).toMatchObject({
      presence: false,
      extent: "generalized",
      toothNumbers: "",
      locations: [],
      distributions: [],
      notes: "",
    });
  });

  it("builds the demo form from the same fixture-backed baseline", () => {
    const form = buildDemoForm(gingivalDescriptionWebformFixture);

    expect(form.date).toBe("2026-03-09");
    expect(form.findings.color.Red.presence).toBe(false);
    expect(form.disposition).toMatchObject([
      { key: "reEval", enabled: true, interval: "4-6", unit: "weeks" },
      {
        key: "reCare",
        enabled: true,
        interval: "3-4",
        unit: "months",
        trailingLabel: "interval",
      },
    ]);
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

  it("renders patient concerns checkbox text on the heading line and textarea text below it", () => {
    const form = buildBaseForm();
    form.patientPresentsForHygieneNoOtherConcerns = true;
    form.patientConcerns = "Blah";

    const summary = buildSummaryText(form, []);

    expect(summary).toContain(
      [
        "Patient concerns: Patient presents for hygiene, no other concerns.",
        "   Blah.",
      ].join("\n"),
    );
  });

  it("formats the medical history block with indented detail lines and combined vitals", () => {
    const form = buildBaseForm();
    form.medicalHistory = "Med/dent history updated. No new contraindications reported.";
    form.vitalsReadings = [
      {
        systolic: "118",
        diastolic: "76",
        heartRate: "72",
        time: "09:15",
      },
    ];

    const summary = buildSummaryText(form, []);

    expect(summary).toContain(
      [
        "Medical history update:",
        "   Med/dent history updated. No new contraindications reported.",
        "   BP: 118/76 mmHg, HR: 72 bpm (at 9:15 AM)",
      ].join("\n"),
    );
  });

  it("renders the medical history no-change checkbox selection in the summary", () => {
    const form = buildBaseForm();
    form.medicalHistoryNoChange = true;
    form.medicalHistory = "Blah";

    const summary = buildSummaryText(form, []);

    expect(summary).toContain(
      [
        "Medical history update: Patient reports no change.",
        "   Blah.",
      ].join("\n"),
    );
  });

  it("renders Date and Provider at the top when present", () => {
    const form = buildBaseForm();
    form.date = "2026-03-18";
    form.providerName = "Dr. Example";

    const summary = buildSummaryText(form, []);

    expect(summary).toBe("Date: 2026-03-18\nProvider: Dr. Example");
  });

  it("renders each vitals reading and averages when multiple valid readings exist", () => {
    const form = buildBaseForm();
    form.vitalsReadings = [
      { systolic: "142", diastolic: "88", heartRate: "78", time: "09:05" },
      { systolic: "136", diastolic: "84", heartRate: "74", time: "09:15" },
    ];

    const summary = buildSummaryText(form, []);

    expect(summary).toContain("   BP: 142/88 mmHg, HR: 78 bpm (at 9:05 AM)");
    expect(summary).toContain("   BP: 136/84 mmHg, HR: 74 bpm (at 9:15 AM)");
    expect(summary).toContain("   Average BP: 139/86 mmHg, HR: 76 bpm");
  });

  it("omits average line when only one valid reading is present", () => {
    const form = buildBaseForm();
    form.vitalsReadings = [
      { systolic: "118", diastolic: "76", heartRate: "72", time: "" },
    ];

    const summary = buildSummaryText(form, []);

    expect(summary).toContain("   BP: 118/76 mmHg, HR: 72 bpm");
    expect(summary).not.toContain("Average BP:");
  });

  it("formats local anesthesia as a heading with indented detail lines", () => {
    const form = buildBaseForm();
    form.localAnesthesiaNoContraindication = true;
    form.localAnesthesiaBenzocaineApplied = true;
    form.localAnesthesiaEntries = [
      {
        injectionType: "IA/L",
        quadrant: "Q3",
        anestheticProduct: "Mepivacaine 3% without epinephrine",
        amountMl: "1.8",
        timeAdministered: "09:25",
      },
    ];
    form.localAnesthesiaNoAdverseReactions = true;
    form.localAnesthesiaAdequateAchieved = true;
    form.localAnesthesiaNotes =
      "Patient tolerated injections well and post-op instructions reviewed";

    const summary = buildSummaryText(form, []);

    expect(summary).toContain("Local anesthetic administered: No C/I to LA");
    expect(summary).toContain(
      "   Benzocaine 20% applied to the injection site",
    );
    expect(summary).toContain(
      "   IA/L Q3: Mepivacaine 3% without epinephrine 1.8 ml (at 9:25 AM)",
    );
    expect(summary).toContain(
      "   Total: Mepivacaine 3% without epinephrine 1.8 ml",
    );
    expect(summary).toContain("   No adverse reactions noted");
    expect(summary).toContain("   Adequate anesthesia achieved");
    expect(summary).toContain(
      "   Patient tolerated injections well and post-op instructions reviewed",
    );
  });

  it("formats disposition under a Continuity of Care heading", () => {
    const form = buildBaseForm();
    form.disposition = form.disposition.map((entry) =>
      entry.key === "reEval"
        ? { ...entry, enabled: true }
        : entry.key === "reCare"
          ? { ...entry, enabled: true, interval: "6" }
          : entry,
    );

    const summary = buildSummaryText(form, []);

    expect(summary).toContain(
      [
        "Continuity of Care",
        "   DH Re-eval at 4-6 weeks",
        "   DH Re-care at 6 months interval",
      ].join("\n"),
    );
  });
});
