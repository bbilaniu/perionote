import type {
  AdultHygiene2021Form,
} from "@/lib/templates/adultHygiene2021";
import type {
  DocumentationStatus,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import { formatNoteHeaderLocalTimestamp } from "@/lib/templates/summary/buildRecareExamSummary";

type BuildAdultHygiene2021SummaryOptions = {
  startedAt?: Date;
};

function trimmed(value: string): string {
  return value.trim();
}

function withTerminalPunctuation(value: string): string {
  const cleanValue = trimmed(value);
  if (!cleanValue) return "";
  return /[.!?]$/.test(cleanValue) ? cleanValue : `${cleanValue}.`;
}

function selectedValue(choice: string, other: string): string {
  return trimmed(other) || trimmed(choice);
}

function labelledLine(label: string, value: string): string {
  const cleanValue = trimmed(value);
  return cleanValue ? `${label}: ${withTerminalPunctuation(cleanValue)}` : "";
}

function documentationStatusLine(
  label: string,
  status: DocumentationStatus,
): string {
  if (status === "not-documented") return "";
  return `${label}: ${status === "yes" ? "Yes" : "No"}.`;
}

function joinConsentSources(sources: string[]): string {
  if (sources.length <= 1) return sources[0] ?? "";
  if (sources.length === 2) return `${sources[0]} and ${sources[1]}`;
  return `${sources.slice(0, -1).join(", ")} and ${sources.at(-1)}`;
}

function retainerLine(status: RetainerStatus): string {
  const labels: Record<Exclude<RetainerStatus, "not-documented">, string> = {
    none: "None",
    fixed: "Fixed",
    removable: "Removable",
    "fixed-and-removable": "Fixed and removable",
  };
  return status === "not-documented" ? "" : `Retainers: ${labels[status]}.`;
}

function treatmentRecommendedBlock(
  hygieneMaintenance: boolean,
  otherTreatment: string,
): string[] {
  const entries = [
    ...(hygieneMaintenance ? ["HYGIENE MAINTENANCE"] : []),
    ...otherTreatment
      .split(/\r?\n/)
      .map(trimmed)
      .filter(Boolean),
  ];
  return entries.length
    ? ["Treatment recommended:", ...entries.map((entry) => `  - ${entry}`)]
    : [];
}

function psrPocketingLine(values: AdultHygiene2021Form["psrPocketing"]): string {
  if (!values.some((value) => trimmed(value))) return "";
  const positions = values.map((value) => trimmed(value) || "_");
  return `PSR/Pocketing: ${positions.slice(0, 3).join(" ")} / ${positions.slice(3).join(" ")}`;
}

export function buildAdultHygiene2021Summary(
  form: AdultHygiene2021Form,
  options: BuildAdultHygiene2021SummaryOptions = {},
): string {
  const hasPatientOrTeam = [
    form.patientId,
    form.dentist,
    form.rda,
    form.rdh,
  ].some((value) => Boolean(trimmed(value)));
  const showPatientAndTeam = Boolean(options.startedAt) || hasPatientOrTeam;
  const patientAndTeam = [
    options.startedAt
      ? formatNoteHeaderLocalTimestamp(options.startedAt)
      : "",
    showPatientAndTeam ? `PATIENT ID: ${trimmed(form.patientId)}`.trimEnd() : "",
    showPatientAndTeam ? `DENTIST: ${trimmed(form.dentist)}`.trimEnd() : "",
    showPatientAndTeam ? `RDA: ${trimmed(form.rda)}`.trimEnd() : "",
    showPatientAndTeam ? `RDH: ${trimmed(form.rdh)}`.trimEnd() : "",
    trimmed(form.noteLastRecallDate)
      ? `Last Recall Date: ${trimmed(form.noteLastRecallDate)}`
      : "",
  ];

  const consentSources = [
    ...(form.consentPatient ? ["PATIENT"] : []),
    ...(form.consentParent ? ["PARENT"] : []),
    ...(form.consentLegalGuardian ? ["LEGAL GUARDIAN"] : []),
  ];
  const consentLine = consentSources.length
    ? [
        `Informed verbal consent given by ${joinConsentSources(consentSources)} for treatment today.`,
        trimmed(form.consentDetails)
          ? withTerminalPunctuation(form.consentDetails)
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const consentHistoryAndSterilization = [
    form.class5IndicatorStatus === "not-documented"
      ? ""
      : `Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: ${
          form.class5IndicatorStatus === "yes" ? "Yes" : "No"
        }.`,
    trimmed(form.mieleCodes)
      ? `Miele Sterilization Codes Scanned: ${trimmed(form.mieleCodes)}`
      : "",
    consentLine,
    labelledLine("Medical history reviewed", form.medicalHistoryReview),
    form.premedicationStatus === "not-required"
      ? "Premedication Required: No."
      : form.premedicationStatus === "required"
        ? trimmed(form.premedicationDetails)
          ? `Premedication Required: Yes—${withTerminalPunctuation(form.premedicationDetails)}`
          : "Premedication Required: Yes."
        : "",
  ];

  const concernsAndFindings = [
    labelledLine("Patient Chief Concern", form.patientChiefConcern),
    labelledLine("Hygiene Area of Concern", form.hygieneAreaOfConcern),
    labelledLine("Plaque", selectedValue(form.plaqueChoice, form.plaqueOther)),
    labelledLine("Stain", selectedValue(form.stainChoice, form.stainOther)),
    labelledLine(
      "Calculus",
      selectedValue(form.calculusChoice, form.calculusOther),
    ),
    labelledLine(
      "Bleeding",
      selectedValue(form.bleedingChoice, form.bleedingOther),
    ),
  ];

  const periodontalAssessment = [
    psrPocketingLine(form.psrPocketing),
    labelledLine("Recession", form.recession),
    labelledLine("FMP Done", form.fmpDone),
    labelledLine("Health/Gingivitis", form.healthGingivitis),
    labelledLine(
      "Periodontitis Stage",
      form.periodontitisStageChoice,
    ),
    labelledLine(
      "Periodontitis stage comments",
      form.periodontitisStageComments,
    ),
    labelledLine(
      "Periodontitis Grade",
      form.periodontitisGradeChoice,
    ),
    labelledLine(
      "Periodontitis grade comments",
      form.periodontitisGradeComments,
    ),
  ];

  const currentHabits = [
    selectedValue(
      form.flossingFrequencyChoice,
      form.flossingFrequencyOther,
    ),
    selectedValue(
      form.brushingFrequencyChoice,
      form.brushingFrequencyOther,
    ),
  ].filter(Boolean);

  const oralHygieneAndEducation = [
    labelledLine(
      "Oral hygiene compliance",
      form.oralHygieneCompliance,
    ),
    labelledLine(
      "Oral hygiene compliance comment",
      form.oralHygieneComplianceComment,
    ),
    form.homeCareInstructionReviewed
      ? "Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY"
      : "",
    form.ohiAidsReviewed.length
      ? `OH Aids Reviewed/Recommended: ${form.ohiAidsReviewed.join("; ")}`
      : "",
    form.diseaseProcessReviewed
      ? "REVIEWED DISEASE PROCESS WITH PATIENT TODAY"
      : "",
    currentHabits.length
      ? `Patient is currently: ${currentHabits.join("; ")}.`
      : "",
    labelledLine("Hygiene goal", form.hygieneGoal),
  ];

  const treatment = [
    ...treatmentRecommendedBlock(
      form.treatmentRecommendedHygieneMaintenance,
      form.otherTreatmentRecommended,
    ),
    form.treatmentCompleted.length
      ? `Treatment completed today: ${form.treatmentCompleted.join("; ")}`
      : "",
    labelledLine("Anesthetic", form.anesthetic),
    labelledLine("Desensitizer", form.desensitizer),
  ];

  const nightGuard =
    form.nightGuardStatus === "no"
      ? "Night guard: No."
      : form.nightGuardStatus === "yes"
        ? form.nightGuardUseStatus === "yes"
          ? "Night guard: Yes; uses."
          : form.nightGuardUseStatus === "no"
            ? "Night guard: Yes; does not use."
            : "Night guard: Yes; use not documented."
        : "";

  const appliancesAndHistory = [
    nightGuard,
    documentationStatusLine(
      "Orthodontic history",
      form.orthodonticHistoryStatus,
    ),
    retainerLine(form.retainerStatus),
    labelledLine("Additional Notes", form.additionalNotes),
  ];

  const intervalsAndNextVisit = [
    form.ppeStatementApplies
      ? "-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES"
      : "",
    labelledLine(
      "Recommended Recall Interval",
      form.recallInterval,
    ),
    labelledLine(
      "Recommended recall interval comments",
      form.recallIntervalComments,
    ),
    labelledLine(
      "Recommended Hygiene Interval",
      form.hygieneInterval,
    ),
    labelledLine(
      "Recommended hygiene interval comments",
      form.hygieneIntervalComments,
    ),
    labelledLine("Next visit", form.nextVisit),
    trimmed(form.dateBooked) ? `Date Booked: ${trimmed(form.dateBooked)}` : "",
  ];

  const groups = [
    patientAndTeam,
    consentHistoryAndSterilization,
    concernsAndFindings,
    periodontalAssessment,
    oralHygieneAndEducation,
    treatment,
    appliancesAndHistory,
    intervalsAndNextVisit,
  ]
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length > 0)
    .map((group) => group.join("\n"));

  return groups.join("\n\n");
}
