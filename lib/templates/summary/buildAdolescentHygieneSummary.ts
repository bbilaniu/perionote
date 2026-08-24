import type {
  AdolescentDocumentationStatus,
  AdolescentHygieneForm,
  AdolescentRetainerStatus,
} from "@/lib/templates/adolescentHygiene";
import { formatHealthGingivitisBlock } from "@/lib/templates/periodontalClassification";
import {
  formatAdultHygieneFindingLine,
  formatAdultHygieneTreatmentCompleted,
  formatPatientSpecificGradeEvidence,
  formatPatientSpecificStageEvidence,
  formatPeriodontalAssessmentFindings,
  formatPeriodontalClassification,
} from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { formatLocalTime24 } from "@/lib/templates/date";
import { formatLocalAnesthesiaSummary } from "@/lib/templates/localAnesthesia";

type BuildAdolescentHygieneSummaryOptions = {
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

function joinNaturalLanguageList(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
}

function yesNoLine(
  label: string,
  status: AdolescentDocumentationStatus,
  details = "",
): string {
  if (status === "not-documented") return "";
  const answer = status === "yes" ? "Yes" : "No";
  return trimmed(details)
    ? `${label}: ${answer} — ${withTerminalPunctuation(details)}`
    : `${label}: ${answer}.`;
}

function retainerLine(
  status: AdolescentRetainerStatus,
  details: string,
): string {
  if (status === "not-documented") return "";
  const value =
    status === "none"
      ? "No"
      : status === "fixed-and-removable"
        ? "Fixed and removable"
        : `${status[0].toUpperCase()}${status.slice(1)}`;
  return trimmed(details)
    ? `Retainers: ${value} — ${withTerminalPunctuation(details)}`
    : `Retainers: ${value}.`;
}

function lineWithDetails(label: string, value: string): string {
  return trimmed(value) ? `${label}: ${withTerminalPunctuation(value)}` : "";
}

function group(lines: string[]): string {
  return lines.filter(Boolean).join("\n");
}

export function formatAdolescentHygieneLocalTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatAdolescentHygieneNoteHeader(date: Date): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `----- ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${formatLocalTime24(date)} -----`;
}

export function buildAdolescentHygieneSummary(
  form: AdolescentHygieneForm,
  options: BuildAdolescentHygieneSummaryOptions = {},
): string {
  const hasPatientOrTeam = [
    form.patientId,
    form.dentist,
    form.rdh,
    form.rda,
  ].some((value) => Boolean(trimmed(value)));
  const showHeader = Boolean(options.startedAt) || hasPatientOrTeam;
  const header = showHeader
    ? [
        options.startedAt
          ? formatAdolescentHygieneNoteHeader(options.startedAt)
          : "",
        `PATIENT ID: ${trimmed(form.patientId)}`.trimEnd(),
        `DENTIST: ${trimmed(form.dentist)}`.trimEnd(),
        `RDH: ${trimmed(form.rdh)}`.trimEnd(),
        `RDA: ${trimmed(form.rda)}`.trimEnd(),
      ]
    : [];

  const consentSources = [
    ...(form.consentPatient ? ["PATIENT"] : []),
    ...(form.consentParent ? ["PARENT"] : []),
    ...(form.consentLegalGuardian ? ["LEGAL GUARDIAN"] : []),
  ];
  const consent = consentSources.length
    ? [
        `Informed verbal consent given by ${joinNaturalLanguageList(consentSources)} for treatment today.`,
        trimmed(form.consentDetails)
          ? withTerminalPunctuation(form.consentDetails)
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const historyAndSterilization = [
    consent,
    lineWithDetails("Medical history reviewed", form.medicalHistoryReview),
    form.premedicationStatus === "not-required"
      ? "Premedication required: No."
      : form.premedicationStatus === "required"
        ? trimmed(form.premedicationDetails)
          ? `Premedication required: Yes — ${withTerminalPunctuation(form.premedicationDetails)}`
          : "Premedication required: Yes."
        : "",
    form.class5IndicatorsChecked
      ? "Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments."
      : "",
    trimmed(form.mieleCodes)
      ? `Miele Sterilization Codes Scanned: ${trimmed(form.mieleCodes)}`
      : "",
  ];

  const findings = [
    formatAdultHygieneFindingLine(
      "Plaque",
      form.plaqueChoice,
      form.plaqueComment,
      form.plaqueAreas,
    ),
    formatAdultHygieneFindingLine(
      "Calculus",
      form.calculusChoice,
      form.calculusComment,
      form.calculusAreas,
    ),
    yesNoLine(
      "Intraoral Images",
      form.intraoralImagesStatus,
      form.intraoralImagesDetails,
    ),
  ];

  const periodontalAssessmentFindings = [
    formatPeriodontalAssessmentFindings(form.periodontalClassification),
  ];
  const patientSpecificStageEvidence = [
    formatPatientSpecificStageEvidence(form.periodontalClassification),
  ];
  const patientSpecificGradeEvidence = [
    formatPatientSpecificGradeEvidence(form.periodontalClassification),
  ];
  const periodontalDiagnosis = [
    formatHealthGingivitisBlock(form.periodontalClassification),
    ...formatPeriodontalClassification(form.periodontalClassification),
  ];

  const ohi = [
    form.ohiTechniques.length ||
    trimmed(form.oheNotes) ||
    trimmed(form.flossingFrequency) ||
    trimmed(form.brushingFrequency)
      ? "OHI Reviewed"
      : "",
    form.ohiTechniques.length
      ? `OHI techniques reviewed: ${form.ohiTechniques.join("; ")}.`
      : "",
    lineWithDetails("OHE notes", form.oheNotes),
    [trimmed(form.flossingFrequency), trimmed(form.brushingFrequency)].filter(
      Boolean,
    ).length
      ? `Patient is currently: ${[
          trimmed(form.flossingFrequency),
          trimmed(form.brushingFrequency),
        ]
          .filter(Boolean)
          .join("; ")}.`
      : "",
  ];

  const appliances = [
    yesNoLine("NightGuard", form.nightGuardStatus, form.nightGuardDetails),
    yesNoLine(
      "Orthodontic history",
      form.orthodonticHistoryStatus,
      form.orthodonticHistoryDetails,
    ),
    retainerLine(form.retainerStatus, form.retainerDetails),
  ];

  const treatment = [
    form.scalingStatus === "not-documented"
      ? ""
      : form.scalingStatus === "no"
        ? "Scaling: No."
        : trimmed(form.scalingUnits)
          ? `Scaling: Yes — ${trimmed(form.scalingUnits)} units.`
          : "Scaling: Yes.",
    yesNoLine("Polish", form.polishStatus, form.polishDetails),
    formatAdultHygieneTreatmentCompleted(form.treatmentCompleted),
    formatLocalAnesthesiaSummary(form),
    yesNoLine("Fluoride", form.fluorideStatus, form.fluorideDetails),
    yesNoLine(
      "Relayed info to parent or legal guardian",
      form.informationRelayedStatus,
      form.informationRelayedDetails,
    ),
    lineWithDetails("Goal for next visit", form.nextVisitGoal),
  ];

  const commentsAndScheduling = [
    lineWithDetails("RDH/RDA Comments", form.comments),
    form.properPpeWorn
      ? "-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES"
      : "",
    lineWithDetails("Recall Interval", form.recallInterval),
    lineWithDetails("Hygiene Interval", form.hygieneInterval),
    lineWithDetails("Next Visit", form.nextVisit),
    trimmed(form.dateBooked) ? `Date Booked: ${trimmed(form.dateBooked)}` : "",
  ];

  return [
    group(header),
    group(historyAndSterilization),
    group(findings),
    group(periodontalAssessmentFindings),
    group(patientSpecificStageEvidence),
    group(patientSpecificGradeEvidence),
    group(periodontalDiagnosis),
    group(ohi),
    group(appliances),
    group(treatment),
    group(commentsAndScheduling),
  ]
    .filter(Boolean)
    .join("\n\n");
}
