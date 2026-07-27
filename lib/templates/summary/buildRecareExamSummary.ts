import type {
  DocumentationStatus,
  ExamStatus,
  RecareExamForm,
  RecareTreatmentEntry,
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

function joinNaturalLanguageList(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
}

function lowerFirst(value: string): string {
  return value ? `${value[0].toLocaleLowerCase("en-CA")}${value.slice(1)}` : "";
}

function cariesRiskFactor(value: string): string {
  const cleanValue = trimmed(value);
  return cleanValue === "History of caries in the last 36 months"
    ? "history of active decay in the last 36 months"
    : lowerFirst(cleanValue);
}

function cariesRiskLine(
  level: RecareExamForm["cariesRiskLevel"],
  factors: string[],
  notes: string,
): string {
  const cleanFactors = factors.map(trimmed).filter(Boolean);
  const cleanNotes = trimmed(notes);
  if (!level && cleanFactors.length === 0 && !cleanNotes) return "";

  let line = level
    ? `${level} caries risk`
    : cleanFactors.length
      ? `Factors include ${joinNaturalLanguageList(
          cleanFactors.map(cariesRiskFactor),
        )}`
      : "";

  if (level && cleanFactors.length) {
    line += ` due to ${joinNaturalLanguageList(
      cleanFactors.map(cariesRiskFactor),
    )}`;
  }

  if (!line) return `Caries risk: ${withTerminalPunctuation(cleanNotes)}`;
  if (!cleanNotes) return `Caries risk: ${line}`;
  return `Caries risk: ${line}. ${withTerminalPunctuation(cleanNotes)}`;
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

function ownershipUseLine(
  label: string,
  ownershipStatus: DocumentationStatus,
  useStatus: DocumentationStatus,
): string {
  return ownershipStatus === "no"
    ? `${label}: No.`
    : ownershipStatus === "yes"
      ? useStatus === "yes"
        ? `${label}: Yes; uses.`
        : useStatus === "no"
          ? `${label}: Yes; does not use.`
          : `${label}: Yes; use not documented.`
      : "";
}

function treatmentBlock(
  heading: string,
  values: RecareTreatmentEntry[],
): string[] {
  const entries = values
    .map((entry) => {
      const treatmentType = trimmed(entry.treatmentType);
      const toothArea = trimmed(entry.toothArea);
      return treatmentType
        ? toothArea
          ? `${treatmentType} — ${toothArea}`
          : treatmentType
        : "";
    })
    .filter(Boolean);
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

export function formatNoteHeaderLocalTimestamp(date: Date): string {
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
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours24 = date.getHours();
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const meridiem = hours24 < 12 ? "AM" : "PM";

  return `----- ${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${meridiem} -----`;
}

export function buildRecareExamSummary(
  form: RecareExamForm,
  options: BuildRecareExamSummaryOptions = {},
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
  ];

  const consentSources = [
    ...(form.consentPatient ? ["PATIENT"] : []),
    ...(form.consentParent ? ["PARENT"] : []),
    ...(form.consentLegalGuardian ? ["LEGAL GUARDIAN"] : []),
  ];
  const consentLine = consentSources.length
    ? [
        `Informed verbal consent given by ${joinNaturalLanguageList(consentSources)} for treatment today.`,
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

  const radiographs = form.radiographs.map(trimmed).filter(Boolean);
  const recordsAndConcern = [
    radiographs.length
      ? `Radiographs: ${radiographs.join("; ")}`
      : "",
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

  const appliancesAndHistory = [
    ownershipUseLine("CPAP", form.cpapStatus, form.cpapUseStatus),
    ownershipUseLine(
      "Occlusal splint",
      form.occlusalSplintStatus,
      form.occlusalSplintUseStatus,
    ),
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

  const odontogramAndCariesRisk = [
    form.odontogramUpToDate ? "ODONTOGRAM UP TO DATE" : "",
    cariesRiskLine(
      form.cariesRiskLevel,
      form.cariesRiskFactors,
      form.cariesRiskNotes,
    ),
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
    odontogramAndCariesRisk,
    treatmentBlock("Treatment Options:", form.treatmentOptions),
    treatmentBlock("Treatment Plan:", form.treatmentPlan),
    nextVisit,
  ]
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length > 0)
    .map((group) => group.join("\n"));

  return groups.join("\n\n");
}
