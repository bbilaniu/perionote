import type {
  DocumentationStatus,
  ExamStatus,
  RecareExamForm,
  RetainerStatus,
} from "@/lib/templates/recareExam";

type BuildRecareExamSummaryOptions = {
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

function appendDetails(base: string, details: string): string {
  const cleanDetails = trimmed(details);
  return cleanDetails
    ? withTerminalPunctuation(`${base}—${cleanDetails}`)
    : `${base}.`;
}

function joinConsentSources(sources: string[]): string {
  if (sources.length <= 1) return sources[0] ?? "";
  if (sources.length === 2) return `${sources[0]} and ${sources[1]}`;
  return `${sources.slice(0, -1).join(", ")} and ${sources.at(-1)}`;
}

function yesNoLine(
  label: string,
  status: DocumentationStatus,
  details = "",
): string {
  if (status === "not-documented") return "";
  return appendDetails(`${label}: ${status === "yes" ? "Yes" : "No"}`, details);
}

function examLine(
  label: string,
  status: ExamStatus,
  findings: string,
): string {
  if (status === "wnl") return `${label}: WNL.`;
  if (status === "findings" && trimmed(findings)) {
    return `${label}: ${withTerminalPunctuation(findings)}`;
  }
  return "";
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

function treatmentBlock(
  heading: string,
  hygieneMaintenance: boolean,
  otherValues: string,
): string[] {
  const entries = [
    ...(hygieneMaintenance ? ["Hygiene maintenance"] : []),
    ...otherValues
      .split(/\r?\n/)
      .map(trimmed)
      .filter(Boolean),
  ];

  if (entries.length === 0) return [];
  return [heading, ...entries.map((entry) => `  - ${entry}`)];
}

export function formatRecareExamLocalTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function buildRecareExamSummary(
  form: RecareExamForm,
  options: BuildRecareExamSummaryOptions = {},
): string {
  const patientAndTeam = [
    trimmed(form.patientId) ? `PATIENT ID: ${trimmed(form.patientId)}` : "",
    options.startedAt
      ? `NOTE STARTED: ${formatRecareExamLocalTimestamp(options.startedAt)}`
      : "",
    trimmed(form.dentist) ? `DENTIST: ${trimmed(form.dentist)}` : "",
    trimmed(form.rda) ? `RDA: ${trimmed(form.rda)}` : "",
    trimmed(form.rdh) ? `RDH: ${trimmed(form.rdh)}` : "",
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
    consentLine,
    trimmed(form.medicalHistoryReview)
      ? `Medical history reviewed: ${withTerminalPunctuation(form.medicalHistoryReview)}`
      : "",
    form.premedicationStatus === "not-required"
      ? "Premedication required: No."
      : form.premedicationStatus === "required"
        ? appendDetails("Premedication required: Yes", form.premedicationDetails)
        : "",
    form.class5IndicatorsChecked
      ? "Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments."
      : "",
    trimmed(form.mieleCodes)
      ? `Miele Sterilization codes scanned: ${trimmed(form.mieleCodes)}`
      : "",
  ];

  const recordsAndConcern = [
    yesNoLine(
      "Radiographs",
      form.radiographsStatus,
      form.radiographsDetails,
    ),
    yesNoLine(
      "Intraoral photos",
      form.intraoralPhotosStatus,
      form.intraoralPhotosDetails,
    ),
    trimmed(form.chiefConcern)
      ? `Patient's chief concern: ${withTerminalPunctuation(form.chiefConcern)}`
      : "",
  ];

  const extraoralAndTmj = [
    examLine("Extraoral", form.extraoralStatus, form.extraoralFindings),
    examLine("TMJ", form.tmjStatus, form.tmjFindings),
    examLine(
      "Palpation of the masseter test",
      form.masseterStatus,
      form.masseterFindings,
    ),
    examLine(
      "Load TMJ joint test",
      form.tmjLoadStatus,
      form.tmjLoadFindings,
    ),
  ];

  const intraoralAndOcclusion = [
    examLine("Intraoral", form.intraoralStatus, form.intraoralFindings),
    trimmed(form.oralHabits)
      ? `Oral habits: ${withTerminalPunctuation(form.oralHabits)}`
      : "",
    form.rightMolarOcclusionNotApplicable
      ? "Molar occlusion—right: N/A."
      : trimmed(form.rightMolarOcclusion)
        ? `Molar occlusion—right: ${withTerminalPunctuation(form.rightMolarOcclusion)}`
        : "",
    form.leftMolarOcclusionNotApplicable
      ? "Molar occlusion—left: N/A."
      : trimmed(form.leftMolarOcclusion)
        ? `Molar occlusion—left: ${withTerminalPunctuation(form.leftMolarOcclusion)}`
        : "",
    form.skeletalOcclusionNotApplicable
      ? "Skeletal occlusion: N/A."
      : trimmed(form.skeletalOcclusion)
        ? `Skeletal occlusion: ${withTerminalPunctuation(form.skeletalOcclusion)}`
        : "",
    trimmed(form.overjetMm) ? `Overjet: ${trimmed(form.overjetMm)} mm.` : "",
    trimmed(form.overbitePercent)
      ? `Overbite: ${trimmed(form.overbitePercent)}%.`
      : "",
  ];

  const occlusalSplint =
    form.occlusalSplintStatus === "no"
      ? "Occlusal splint: No."
      : form.occlusalSplintStatus === "yes"
        ? form.occlusalSplintUseStatus === "yes"
          ? "Occlusal splint: Yes; uses."
          : form.occlusalSplintUseStatus === "no"
            ? "Occlusal splint: Yes; does not use."
            : "Occlusal splint: Yes; use not documented."
        : "";

  const appliancesAndHistory = [
    yesNoLine("CPAP use", form.cpapStatus),
    occlusalSplint,
    yesNoLine("Orthodontic history", form.orthodonticHistoryStatus),
    retainerLine(form.retainerStatus),
    yesNoLine(
      "Partial/complete removable dentures",
      form.removableDenturesStatus,
    ),
  ];

  const patientRequests = [
    trimmed(form.improvementRequest)
      ? `Patient would like to improve: ${withTerminalPunctuation(form.improvementRequest)}`
      : "",
    trimmed(form.additionalComments)
      ? `Additional comments: ${withTerminalPunctuation(form.additionalComments)}`
      : "",
  ];

  const nextVisit = [
    trimmed(form.nextVisit) ? `Next Visit: ${trimmed(form.nextVisit)}` : "",
    trimmed(form.dateBooked) ? `Date Booked: ${trimmed(form.dateBooked)}` : "",
  ];

  const groups = [
    patientAndTeam,
    consentHistoryAndSterilization,
    recordsAndConcern,
    extraoralAndTmj,
    intraoralAndOcclusion,
    appliancesAndHistory,
    patientRequests,
    treatmentBlock(
      "Treatment Options:",
      form.treatmentOptionsHygieneMaintenance,
      form.otherTreatmentOptions,
    ),
    treatmentBlock(
      "Treatment Plan:",
      form.treatmentPlanHygieneMaintenance,
      form.otherTreatmentPlan,
    ),
    nextVisit,
  ]
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length > 0)
    .map((group) => group.join("\n"));

  return groups.join("\n\n");
}
