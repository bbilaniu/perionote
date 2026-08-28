import type {
  ChildDocumentationStatus,
  ChildExamStatus,
  ChildRecareHygieneForm,
  ChildRecareHygieneOutput,
} from "@/lib/templates/childRecareHygiene";
import { formatNoteHeaderLocalTimestamp } from "@/lib/templates/summary/buildRecareExamSummary";
import { formatAdultHygieneTreatmentCompleted } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { formatLocalAnesthesiaSummary } from "@/lib/templates/localAnesthesia";
import {
  assessCambra123SixAdult,
  assessCambra123ZeroToSix,
  cambra123SixAdultItemsByKind,
  cambra123ZeroToSixItemsByKind,
  hasCambra123SixAdultContent,
  hasCambra123ZeroToSixContent,
  type Cambra123ItemKind,
  type Cambra123SixAdultAssessment,
  type Cambra123ZeroToSixAssessment,
} from "@/lib/templates/cambra123";

function sentence(label: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `${label}: ${trimmed}${/[.!?]$/.test(trimmed) ? "" : "."}`;
}

function statusLabel(status: ChildDocumentationStatus): string {
  if (status === "yes") return "Yes";
  if (status === "no") return "No";
  return "";
}

function statusSentence(
  label: string,
  status: ChildDocumentationStatus,
  detail = "",
): string {
  const value = statusLabel(status);
  if (!value) return "";
  const trimmedDetail = detail.trim();
  const line = `${label}: ${value}${trimmedDetail ? ` — ${trimmedDetail}` : ""}`;
  return `${line}${/[.!?]$/.test(line) ? "" : "."}`;
}

function examSentence(
  label: string,
  status: ChildExamStatus,
  findings: string,
): string {
  if (status === "not-assessed") return "";
  if (status === "wnl") return `${label}: WNL.`;
  return sentence(label, findings) || `${label}: Findings documented.`;
}

function section(lines: string[]): string {
  return lines.filter(Boolean).join("\n");
}

function joinConsentSources(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function selectedCambraLine(
  label: string,
  complete: boolean,
  itemLabels: string[],
): string {
  if (!itemLabels.length && !complete) return "";
  return `${label}: ${itemLabels.length ? itemLabels.join("; ") : "None"}.`;
}

function cambra123ZeroToSixLines(
  assessment: Cambra123ZeroToSixAssessment,
): string[] {
  if (!hasCambra123ZeroToSixContent(assessment)) return [];
  const result = assessCambra123ZeroToSix(assessment);
  const complete = assessment.completionStatus === "complete";
  const selectedLine = (label: string, kind: Cambra123ItemKind) =>
    selectedCambraLine(
      label,
      complete,
      cambra123ZeroToSixItemsByKind(assessment, kind).map(
        (item) => item.label,
      ),
    );

  return [
    `Caries risk assessment (CAMBRA123 2021, ages 0–6): ${
      complete
        ? "Complete."
        : assessment.completionStatus === "in-progress"
          ? "In progress."
          : "Not started."
    }`,
    selectedLine("Protective factors — Yes", "protective"),
    selectedLine("Biological/environmental risk factors — Yes", "risk"),
    selectedLine("Disease indicators — Yes", "disease-indicator"),
    assessment.severeOrExtensiveRecentDecay
      ? "Very High clinical modifier — extensive or severe recent/existing decay: Yes."
      : "",
    complete
      ? `CAMBRA123 score: ${result.totalScore} (Column 1: ${result.column1Score}; Column 2: +${result.column2Score}; Column 3: +${result.column3Score}).`
      : "",
    assessment.finalRiskLevel
      ? `Final clinician caries-risk category: ${assessment.finalRiskLevel}.`
      : complete
        ? "Final clinician caries-risk category: Not documented."
        : "",
    sentence("CAMBRA123 notes", assessment.notes),
  ].filter(Boolean);
}

function cambra123SixAdultLines(
  assessment: Cambra123SixAdultAssessment,
): string[] {
  if (!hasCambra123SixAdultContent(assessment)) return [];
  const result = assessCambra123SixAdult(assessment);
  const complete = assessment.completionStatus === "complete";
  const selectedLine = (label: string, kind: Cambra123ItemKind) =>
    selectedCambraLine(
      label,
      complete,
      cambra123SixAdultItemsByKind(assessment, kind).map((item) => item.label),
    );

  return [
    `Caries risk assessment (CAMBRA123 2021, ages 6–adult): ${
      complete
        ? "Complete."
        : assessment.completionStatus === "in-progress"
          ? "In progress."
          : "Not started."
    }`,
    selectedLine("Protective factors — Yes", "protective"),
    selectedLine("Biological/environmental risk factors — Yes", "risk"),
    selectedLine("Disease indicators — Yes", "disease-indicator"),
    complete
      ? `CAMBRA123 score: ${result.totalScore} (Column 1: ${result.column1Score}; Column 2: +${result.column2Score}; Column 3: +${result.column3Score}).`
      : "",
    assessment.finalRiskLevel
      ? `Final clinician caries-risk category: ${assessment.finalRiskLevel}.`
      : complete
        ? "Final clinician caries-risk category: Not documented."
        : "",
    sentence("CAMBRA123 notes", assessment.notes),
  ].filter(Boolean);
}

export function buildChildRecareHygieneSummary(
  form: ChildRecareHygieneForm,
  options: { output?: ChildRecareHygieneOutput; startedAt?: Date } = {},
): string {
  const output = options.output ?? "combined";
  const includesDentist = output !== "hygienist";
  const includesHygiene = output !== "dentist";
  const structuredConsentSources = [
    ...(form.consentPatient ? ["Patient"] : []),
    ...(form.consentParent ? ["Parent"] : []),
    ...(form.consentLegalGuardian ? ["Legal guardian"] : []),
  ];
  const consentSource = structuredConsentSources.length
    ? joinConsentSources(structuredConsentSources)
    : form.consentBy;

  const header = section([
    options.startedAt ? formatNoteHeaderLocalTimestamp(options.startedAt) : "",
    sentence("PATIENT ID", form.patientId),
    sentence("Dentist", form.dentist),
    sentence("RDA", form.rda),
    sentence("RDH", form.rdh),
    sentence(
      "Informed verbal consent for treatment today given by",
      consentSource,
    ),
    sentence("Consent details", form.consentDetails),
    statusSentence(
      "Class 5 indicator strip checked",
      form.class5IndicatorStatus,
    ),
    sentence("Miele sterilization codes scanned", form.mieleCodes),
    form.ppeStatementApplies
      ? "-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES"
      : "",
    "Patient presents for a pediatric recall exam and cleaning.",
    sentence("Patient's chief concern", form.chiefConcern),
    sentence("Medical history reviewed", form.medicalHistory),
    statusSentence(
      "Premedication required",
      form.premedicationStatus,
      form.premedicationDetails,
    ),
  ]);

  const dentist = includesDentist
    ? section([
        "DENTAL EXAM",
        sentence("Radiographs", form.radiographs),
        statusSentence(
          "Intraoral photos",
          form.intraoralPhotosStatus,
          form.intraoralPhotosDetails,
        ),
        examSentence("Extraoral", form.extraoralStatus, form.extraoralFindings),
        examSentence("Intraoral", form.intraoralStatus, form.intraoralFindings),
        statusSentence(
          "Oral habits present",
          form.oralHabitsStatus,
          form.oralHabitsDetails,
        ),
        examSentence("TMJ", form.tmjStatus, form.tmjFindings),
        form.occlusionAssessment === "terminal-plane"
          ? sentence("Terminal plane", form.terminalPlane)
          : sentence("Molar classification", form.molarOcclusion),
        sentence("Skeletal classification", form.skeletalClassification),
        sentence("Overjet", form.overjetMm ? `${form.overjetMm.trim()} mm` : ""),
        sentence(
          "Overbite",
          form.overbitePercent ? `${form.overbitePercent.trim()}%` : "",
        ),
        sentence("Doctor comments", form.doctorComments),
        statusSentence("Caries detected", form.cariesStatus, form.cariesDetails),
      ])
    : "";

  const hygiene = includesHygiene
    ? section([
        "HYGIENE",
        statusSentence("Disclosed", form.disclosedStatus),
        sentence("Plaque index", form.plaqueIndex),
        statusSentence("Calculus", form.calculusStatus, form.calculusLocation),
        form.ohiReviewed ? "OHI reviewed." : "",
        sentence("Flossing technique", form.flossingTechnique),
        sentence("Brushing technique", form.brushingTechnique),
        statusSentence(
          "Scaling",
          form.scalingStatus,
          form.scalingUnits ? `${form.scalingUnits.trim()} units` : "",
        ),
        statusSentence("Polish", form.polishStatus, form.polishDetails),
        statusSentence("Fluoride", form.fluorideStatus, form.fluorideDetails),
        formatAdultHygieneTreatmentCompleted(form.treatmentCompleted),
        formatLocalAnesthesiaSummary(form),
      ])
    : "";

  const cambraLines =
    form.cambra123Instrument === "0-6"
      ? cambra123ZeroToSixLines(form.cambra123ZeroToSixAssessment)
      : form.cambra123Instrument === "6-adult"
        ? cambra123SixAdultLines(form.cambra123SixAdultAssessment)
        : [];
  const cariesRisk = cambraLines.length
    ? section(["CARIES RISK ASSESSMENT", ...cambraLines])
    : "";

  const followUp = section([
    statusSentence(
      "Information relayed to parent or legal guardian",
      form.guardianCommunicationStatus,
      form.guardianCommunicationDetails,
    ),
    sentence("Goal for next visit", form.goalForNextVisit),
    sentence("RDH/RDA comments", form.clinicalComments),
    includesDentist ? sentence("Recall interval", form.recallInterval) : "",
    includesHygiene ? sentence("Hygiene interval", form.hygieneInterval) : "",
    sentence("Next visit", form.nextVisit),
    sentence("Booked", form.bookedDate),
  ]);

  return [header, dentist, cariesRisk, hygiene, followUp]
    .filter(Boolean)
    .join("\n\n");
}
