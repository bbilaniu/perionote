import type {
  ChildDocumentationStatus,
  ChildExamStatus,
  ChildRecareHygieneForm,
  ChildRecareHygieneOutput,
} from "@/lib/templates/childRecareHygiene";

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

export function buildChildRecareHygieneSummary(
  form: ChildRecareHygieneForm,
  options: { output?: ChildRecareHygieneOutput } = {},
): string {
  const output = options.output ?? "combined";
  const includesDentist = output !== "hygienist";
  const includesHygiene = output !== "dentist";

  const header = section([
    sentence("PATIENT ID", form.patientId),
    sentence("Dentist", form.dentist),
    sentence("RDA", form.rda),
    sentence("RDH", form.rdh),
    sentence(
      "Informed verbal consent for treatment today given by",
      form.consentBy,
    ),
    statusSentence(
      "Class 5 indicator strip checked",
      form.class5IndicatorStatus,
    ),
    sentence("Miele sterilization codes scanned", form.mieleCodes),
    "Patient presents for a pediatric recall exam and cleaning.",
    sentence("Patient's chief concern", form.chiefConcern),
    sentence("Medical history", form.medicalHistory),
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
        sentence("Molar occlusion / molar classification", form.molarOcclusion),
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
      ])
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

  return [header, dentist, hygiene, followUp].filter(Boolean).join("\n\n");
}
