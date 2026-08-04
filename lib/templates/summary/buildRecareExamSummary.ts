import type {
  DocumentationStatus,
  ExamStatus,
  RecareExamForm,
  RecareToothFinding,
  RecareTreatmentEntry,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import type { RecareToothOption } from "@/lib/templates/recareTeethCatalog";
import { recareToothOptions } from "@/lib/templates/recareTeethCatalog";
import { formatPatientChiefConcerns } from "@/lib/templates/patientChiefConcern";
import {
  recareIntraoralOptionById,
  recareIntraoralStructures,
} from "@/lib/templates/recareIntraoralCatalog";

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

function hasMeaningfulToothFinding(
  finding: RecareToothFinding,
  option: RecareToothOption,
): boolean {
  const optionIsCompleteWithoutAnnotations =
    !option.supportsTooth &&
    !option.supportsSurface &&
    !option.supportsActivity &&
    (!option.supportsGrade || Boolean(option.fixedGrade));

  return (
    optionIsCompleteWithoutAnnotations ||
    Boolean(finding.toothAreas?.map(trimmed).filter(Boolean).length) ||
    Boolean(trimmed(finding.surface ?? "")) ||
    Boolean(finding.activity) ||
    Boolean(finding.millerGrade) ||
    Boolean(trimmed(finding.comment ?? ""))
  );
}

function toothFindingEntry(
  finding: RecareToothFinding,
  option: RecareToothOption,
): string {
  const toothAreas = finding.toothAreas?.map(trimmed).filter(Boolean) ?? [];
  const surface = option.supportsSurface
    ? trimmed(finding.surface ?? "")
    : "";
  const primary = [toothAreas.join(", "), surface].filter(Boolean).join(" ");
  const descriptors = [
    option.supportsActivity ? finding.activity : "",
    option.fixedGrade ??
      (option.supportsGrade ? finding.millerGrade : undefined),
  ].filter(Boolean);
  const summary = primary
    ? `${primary}${descriptors.length ? ` (${descriptors.join("; ")})` : ""}`
    : descriptors.join("; ");
  const comment = trimmed(finding.comment ?? "").replace(/\.$/, "");

  return [summary, comment].filter(Boolean).join(" — ");
}

function toothFindingHeading(option: RecareToothOption, count: number): string {
  if (count === 1) return option.label;
  if (option.id === "ioe.teeth.initial_noncavitated_caries") {
    return "Initial/noncavitated caries lesions";
  }
  if (option.id === "ioe.teeth.fracture") return "Fractures";
  return option.label;
}

function teethSummary(form: RecareExamForm): string {
  if (form.teethStatus === "wnl")
    return "Teeth intact, with no caries or mobility noted.";
  if (form.teethStatus !== "findings") return "";

  const findings = form.toothFindings ?? [];
  const lines = recareToothOptions.flatMap((option) => {
    const optionFindings = findings.filter(
      (finding) =>
        finding.optionId === option.id &&
        hasMeaningfulToothFinding(finding, option),
    );
    if (!optionFindings.length) return [];

    const entries = optionFindings
      .map((finding) => toothFindingEntry(finding, option))
      .filter(Boolean);
    const heading = toothFindingHeading(option, optionFindings.length);

    return [
      `  - ${heading}${entries.length ? `: ${entries.join("; ")}` : ""}.`,
    ];
  });
  const additional = trimmed(form.additionalToothFindings ?? "");
  if (additional)
    lines.push(
      `  Additional observations: ${withTerminalPunctuation(additional)}`
    );
  return lines.length ? `Teeth:\n${lines.join("\n")}` : "";
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
  notes: string
): string {
  const cleanFactors = factors.map(trimmed).filter(Boolean);
  const cleanNotes = trimmed(notes);
  if (!level && cleanFactors.length === 0 && !cleanNotes) return "";

  let line = level
    ? `${level} caries risk`
    : cleanFactors.length
    ? `Factors include ${joinNaturalLanguageList(
        cleanFactors.map(cariesRiskFactor)
      )}`
    : "";

  if (level && cleanFactors.length) {
    line += ` due to ${joinNaturalLanguageList(
      cleanFactors.map(cariesRiskFactor)
    )}`;
  }

  if (!line) return `Caries risk: ${withTerminalPunctuation(cleanNotes)}`;
  if (!cleanNotes) return `Caries risk: ${line}`;
  return `Caries risk: ${line}. ${withTerminalPunctuation(cleanNotes)}`;
}

function yesNoLine(
  label: string,
  status: DocumentationStatus,
  details = ""
): string {
  if (status === "not-documented") return "";
  return appendDetails(`${label}: ${status === "yes" ? "Yes" : "No"}`, details);
}

function intraoralPhotosLine(
  status: DocumentationStatus,
  details: string,
): string {
  if (status === "not-documented") return "";
  if (status === "no") return "Intraoral photos: No.";

  const cleanDetails = trimmed(details);
  return cleanDetails
    ? `Intraoral photos: ${withTerminalPunctuation(cleanDetails)}`
    : "Intraoral photos: Yes.";
}

function examLine(label: string, status: ExamStatus, findings: string): string {
  if (status === "wnl") return `${label}: WNL.`;
  if (status === "findings" && trimmed(findings)) {
    return `${label}: ${withTerminalPunctuation(findings)}`;
  }
  return "";
}

function intraoralLines(form: RecareExamForm): string[] {
  if (form.intraoralStatus !== "findings") {
    const statusLine = examLine(
      "Intraoral",
      form.intraoralStatus,
      form.intraoralFindings
    );
    return statusLine ? [statusLine] : [];
  }
  const selectedByOptionId = new Map(
    (form.structuredIntraoralFindings ?? []).flatMap((finding) => {
      const definition = recareIntraoralOptionById.get(finding.optionId);
      if (!definition || definition.structure.id !== finding.structureId)
        return [];
      return [[finding.optionId, finding] as const];
    })
  );
  const findings = recareIntraoralStructures.flatMap((structure) => {
    const optionFragments = structure.options.flatMap((option) => {
      const finding = selectedByOptionId.get(option.id);
      if (!finding) return [];
      const annotations: string[] = [];
      const locations = option.supportsLocation
        ? (finding.locations ?? []).map(trimmed).filter(Boolean)
        : [];
      const locationParts = [...locations];
      if (option.supportsLaterality && trimmed(finding.laterality ?? "")) {
        locationParts.push(trimmed(finding.laterality ?? ""));
      }
      if (locationParts.length)
        annotations.push(`location: ${locationParts.join(", ")}`);
      if (option.supportsMeasurement && trimmed(finding.measurement ?? "")) {
        const allowedUnit = option.measurementUnits.includes(
          finding.measurementUnit ?? ""
        )
          ? finding.measurementUnit
          : option.measurementUnits[0];
        annotations.push(
          `measurement: ${trimmed(finding.measurement ?? "")}${
            allowedUnit ? ` ${allowedUnit}` : ""
          }`
        );
      }
      if (structure.supportsComment && trimmed(finding.comment ?? "")) {
        annotations.push(`notes: ${trimmed(finding.comment ?? "")}`);
      }
      return [
        annotations.length
          ? `${option.noteFragment} (${annotations.join("; ")})`
          : option.noteFragment,
      ];
    });
    return optionFragments.length
      ? [
          `  - ${structure.label}: ${withTerminalPunctuation(
            optionFragments.join("; ")
          )}`,
        ]
      : [];
  });
  if (!findings.length) {
    const legacy = examLine(
      "Intraoral",
      form.intraoralStatus,
      form.intraoralFindings
    );
    return legacy ? [legacy] : [];
  }
  return [
    "Intraoral:",
    ...findings,
    ...(trimmed(form.intraoralFindings)
      ? [`  Observations: ${withTerminalPunctuation(form.intraoralFindings)}`]
      : []),
  ];
}

function additionalOcclusalFindingLine(form: RecareExamForm): string {
  const findings = (form.additionalOcclusalFindings ?? []).flatMap((entry) => {
    const finding = trimmed(entry.finding);
    if (!finding) return [];
    const locations = (entry.locations ?? []).map(trimmed).filter(Boolean);
    return [
      locations.length
        ? `${finding} (location: ${locations.join(", ")})`
        : finding,
    ];
  });
  return findings.length
    ? `Additional occlusal findings: ${withTerminalPunctuation(
        findings.join("; ")
      )}`
    : "";
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
  useStatus: DocumentationStatus
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
  label: string,
  values: RecareTreatmentEntry[],
  asList: boolean
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
  return asList
    ? [
        `${label}:`,
        ...entries.map((entry, index) => `  ${index + 1}. ${entry}`),
      ]
    : [`${label}: ${entries.join("; ")}`];
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
  options: BuildRecareExamSummaryOptions = {}
): string {
  const hasPatientOrTeam = [
    form.patientId,
    form.dentist,
    form.rda,
    form.rdh,
  ].some((value) => Boolean(trimmed(value)));
  const showPatientAndTeam = Boolean(options.startedAt) || hasPatientOrTeam;
  const patientAndTeam = [
    options.startedAt ? formatNoteHeaderLocalTimestamp(options.startedAt) : "",
    showPatientAndTeam
      ? `PATIENT ID: ${trimmed(form.patientId)}`.trimEnd()
      : "",
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
        `Informed verbal consent given by ${joinNaturalLanguageList(
          consentSources
        )} for treatment today.`,
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
      ? `Medical history reviewed: ${withTerminalPunctuation(
          form.medicalHistoryReview
        )}`
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
  const records = [
    radiographs.length ? `Radiographs: ${radiographs.join("; ")}` : "",
    intraoralPhotosLine(
      form.intraoralPhotosStatus,
      form.intraoralPhotosDetails,
    ),
  ];

  const chiefConcern = formatPatientChiefConcerns(
    "Patient's chief concern",
    form.chiefConcern,
    form.listChiefConcerns,
  );
  const chiefConcernSection = chiefConcern ? [`a) ${chiefConcern}`] : [];

  const extraoral = examLine(
    "Extraoral",
    form.extraoralStatus,
    form.extraoralFindings,
  );
  const extraoralSection = extraoral ? [`b) ${extraoral}`] : [];

  const tmjLines = [
    examLine("TMJ", form.tmjStatus, form.tmjFindings),
    examLine(
      "Masseter palpation",
      form.masseterStatus,
      form.masseterFindings,
    ),
    examLine(
      "TMJ loading test",
      form.tmjLoadStatus,
      form.tmjLoadFindings,
    ),
  ].filter(Boolean);
  const tmjSection = tmjLines.length
    ? tmjLines[0].startsWith("TMJ:")
      ? [`c) ${tmjLines[0]}`, ...tmjLines.slice(1)]
      : ["c) TMJ examination:", ...tmjLines]
    : [];

  const intraoral = intraoralLines(form);
  const letteredIntraoral = intraoral.length
    ? [`d) ${intraoral[0]}`, ...intraoral.slice(1)]
    : [];

  const intraoralAndOcclusion = [
    ...letteredIntraoral,
    trimmed(form.oralHabits)
      ? `Oral habits: ${withTerminalPunctuation(form.oralHabits)}`
      : "",
    form.rightMolarOcclusionNotApplicable
      ? "Molar occlusion—right: N/A."
      : trimmed(form.rightMolarOcclusion)
      ? `Molar occlusion—right: ${withTerminalPunctuation(
          form.rightMolarOcclusion
        )}`
      : "",
    form.leftMolarOcclusionNotApplicable
      ? "Molar occlusion—left: N/A."
      : trimmed(form.leftMolarOcclusion)
      ? `Molar occlusion—left: ${withTerminalPunctuation(
          form.leftMolarOcclusion
        )}`
      : "",
    form.skeletalOcclusionNotApplicable
      ? "Skeletal occlusion: N/A."
      : trimmed(form.skeletalOcclusion)
      ? `Skeletal occlusion: ${withTerminalPunctuation(form.skeletalOcclusion)}`
      : "",
    trimmed(form.overjetMm) ? `Overjet: ${trimmed(form.overjetMm)} mm.` : "",
    trimmed(form.overbitePercent) && trimmed(form.overbiteMm ?? "")
      ? `Overbite: ${trimmed(form.overbitePercent)}%; ${trimmed(
          form.overbiteMm ?? ""
        )} mm.`
      : trimmed(form.overbitePercent)
      ? `Overbite: ${trimmed(form.overbitePercent)}%.`
      : trimmed(form.overbiteMm ?? "")
      ? `Overbite: ${trimmed(form.overbiteMm ?? "")} mm.`
      : "",
    additionalOcclusalFindingLine(form),
  ];

  const appliancesAndHistory = [
    ownershipUseLine("CPAP", form.cpapStatus, form.cpapUseStatus),
    ownershipUseLine(
      "Occlusal splint",
      form.occlusalSplintStatus,
      form.occlusalSplintUseStatus
    ),
    yesNoLine("Orthodontic history", form.orthodonticHistoryStatus),
    retainerLine(form.retainerStatus),
    yesNoLine(
      "Partial/complete removable dentures",
      form.removableDenturesStatus
    ),
  ];

  const patientRequests = [
    trimmed(form.improvementRequest)
      ? `Patient-requested smile or dental improvements: ${withTerminalPunctuation(
          form.improvementRequest
        )}`
      : "",
    trimmed(form.additionalComments)
      ? `Additional comments: ${withTerminalPunctuation(
          form.additionalComments
        )}`
      : "",
  ];

  const odontogramAndCariesRisk = [
    teethSummary(form),
    form.odontogramUpToDate ? "ODONTOGRAM UP TO DATE" : "",
    cariesRiskLine(
      form.cariesRiskLevel,
      form.cariesRiskFactors,
      form.cariesRiskNotes
    ),
  ];

  const nextVisit = [
    trimmed(form.nextVisit) ? `Next Visit: ${trimmed(form.nextVisit)}` : "",
    trimmed(form.dateBooked) ? `Date Booked: ${trimmed(form.dateBooked)}` : "",
  ];

  const groups = [
    patientAndTeam,
    consentHistoryAndSterilization,
    records,
    chiefConcernSection,
    extraoralSection,
    tmjSection,
    intraoralAndOcclusion,
    appliancesAndHistory,
    patientRequests,
    odontogramAndCariesRisk,
    treatmentBlock(
      "Treatment Options",
      form.treatmentOptions,
      form.listTreatmentOptions
    ),
    treatmentBlock(
      "Treatment Plan",
      form.treatmentPlan,
      form.listTreatmentPlan
    ),
    nextVisit,
  ]
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length > 0)
    .map((group) => group.join("\n"));

  return groups.join("\n\n");
}
