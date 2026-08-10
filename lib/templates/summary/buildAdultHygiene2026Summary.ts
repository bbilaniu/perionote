import {
  type AdultHygiene2026Output,
  type AdultHygiene2026Form,
  orderTreatmentToothAreas,
  resolveOcclusalSplintState,
  standardOheStatement,
} from "@/lib/templates/adultHygiene2026";
import {
  formatAdultHygieneTreatmentCompletedEntries,
  migrateLegacyDesensitizerToTreatmentCompleted,
} from "@/lib/templates/adultHygieneTreatment";
import { formatLocalAnesthesiaSummary } from "@/lib/templates/localAnesthesia";
import {
  choiceLabel,
  formatClinicalMeasurement,
  formatDiabetesModifier,
  formatHealthGingivitisBlock,
  formatPeriodontalEvidence,
  formatSmokingModifier,
  isPeriodontalStatusCompatibleWithContext,
  periodontalPeriodontiumChoices,
  periodontalStageCriterionCatalogue,
  periodontalStageEvidence,
  periodontalStatusChoices,
  type PeriodontalClassification,
} from "@/lib/templates/periodontalClassification";
import type {
  DocumentationStatus,
  ExamStatus,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import { formatPatientChiefConcerns } from "@/lib/templates/patientChiefConcern";
import {
  formatNoteHeaderLocalTimestamp,
  formatRecareExtraoralLines,
  formatRecareIntraoralLines,
  formatRecareTeethSummary,
} from "@/lib/templates/summary/buildRecareExamSummary";
import {
  gingivalDescriptionCatalog,
  type GingivalDescriptionAssessment,
} from "@/lib/templates/gingivalDescriptionCatalog";

type BuildAdultHygiene2026SummaryOptions = {
  startedAt?: Date;
  output?: AdultHygiene2026Output;
};

function trimmed(value: string): string {
  return value.trim();
}

function withTerminalPunctuation(value: string): string {
  const cleanValue = trimmed(value);
  if (!cleanValue) return "";
  return /[.!?]$/.test(cleanValue) ? cleanValue : `${cleanValue}.`;
}

function examLine(label: string, status: ExamStatus, findings: string): string {
  if (status === "wnl") return `${label}: WNL.`;
  if (status === "findings" && trimmed(findings)) {
    return `${label}: ${withTerminalPunctuation(findings)}`;
  }
  return "";
}

function intraoralPhotosLine(
  status: DocumentationStatus,
  details: string,
): string {
  if (status === "not-documented") return "";
  if (status === "no") return "Intraoral photos: No.";
  return trimmed(details)
    ? `Intraoral photos: ${withTerminalPunctuation(details)}`
    : "Intraoral photos: Yes.";
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

function additionalOcclusalFindingLine(form: AdultHygiene2026Form): string {
  const findings = (form.additionalOcclusalFindings ?? []).flatMap((entry) => {
    const finding = trimmed(entry.finding);
    if (!finding) return [];
    const locations = entry.locations.map(trimmed).filter(Boolean);
    return [
      locations.length
        ? `${finding} (location: ${locations.join(", ")})`
        : finding,
    ];
  });
  if (!findings.length) return "";
  return form.listAdditionalOcclusalFindings
    ? `Additional occlusal findings:\n${findings
        .map((finding) => `  - ${withTerminalPunctuation(finding)}`)
        .join("\n")}`
    : `Additional occlusal findings: ${withTerminalPunctuation(
        findings.join("; "),
      )}`;
}

function formatTreatmentEntries(
  label: string,
  entries: AdultHygiene2026Form["treatmentPlan"],
  includeCareType: boolean,
): string[] {
  const lines = entries.flatMap((entry) => {
    const treatmentType = trimmed(entry.treatmentType);
    if (!treatmentType) return [];
    const careType = includeCareType
      ? entry.careType === "preventive"
        ? "Preventive"
        : entry.careType === "restorative"
          ? "Restorative"
          : "Other"
      : "";
    const toothArea = trimmed(entry.toothArea);
    return [
      `${careType ? `[${careType}] ` : ""}${treatmentType}${
        toothArea ? ` — ${toothArea}` : ""
      }`,
    ];
  });
  return lines.length
    ? [label + ":", ...lines.map((line, index) => `  ${index + 1}. ${line}`)]
    : [];
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
  level: AdultHygiene2026Form["cariesRiskLevel"],
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

function oheTopicLine(values: string[]): string {
  const cleanValues = values.map(trimmed).filter(Boolean);
  const selected = new Set(cleanValues);
  const handled = new Set<string>();
  const topics: string[] = [];

  for (const value of cleanValues) {
    if (handled.has(value)) continue;

    if (
      (value === "Caries theory" || value === "Caries risk factors") &&
      selected.has("Caries theory") &&
      selected.has("Caries risk factors")
    ) {
      topics.push("Caries theory and risk factors");
      handled.add("Caries theory");
      handled.add("Caries risk factors");
    } else if (
      (value === "Periodontitis theory" ||
        value === "Periodontitis risk factors") &&
      selected.has("Periodontitis theory") &&
      selected.has("Periodontitis risk factors")
    ) {
      topics.push("Periodontitis theory and risk factors");
      handled.add("Periodontitis theory");
      handled.add("Periodontitis risk factors");
    } else {
      topics.push(value);
      handled.add(value);
    }
  }

  return topics.length ? `OHE: ${topics.join("; ")}.` : "";
}

function labelledLine(label: string, value: string): string {
  const cleanValue = trimmed(value);
  return cleanValue ? `${label}: ${withTerminalPunctuation(cleanValue)}` : "";
}

export function formatAdultHygieneFindingLine(
  label: string,
  finding: string,
  comment: string,
  areas: string[] = [],
): string {
  const cleanFinding = trimmed(finding);
  const cleanComment = trimmed(comment);
  const cleanAreas = /^localized\b/i.test(cleanFinding)
    ? orderTreatmentToothAreas(areas)
    : [];
  const findingWithAreas = cleanAreas.length
    ? `${cleanFinding} — areas: ${cleanAreas.join(", ")}`
    : cleanFinding;
  if (findingWithAreas && cleanComment) {
    return `${label}: ${withTerminalPunctuation(
      `${findingWithAreas}; ${cleanComment}`
    )}`;
  }
  return findingWithAreas
    ? labelledLine(label, findingWithAreas)
    : labelledLine(`${label} comment`, cleanComment);
}

export function formatGingivalDescription(
  assessment: GingivalDescriptionAssessment | undefined
): string {
  if (!assessment || assessment.status === "not_assessed") return "";
  if (assessment.status === "wnl") {
    return `Gingival Description: ${withTerminalPunctuation(
      gingivalDescriptionCatalog.wnlPreset.generatedNoteText
    )}`;
  }

  const customFindings = trimmed(assessment.customFindings ?? "");
  const selected = new Map(
    assessment.findings.map((finding) => [finding.optionId, finding])
  );
  const lines = gingivalDescriptionCatalog.dimensions.flatMap((dimension) => {
    const optionFragments = dimension.options.flatMap((option) => {
      const finding = selected.get(option.id);
      if (!finding) return [];
      const annotations: string[] = [];
      if (finding.extent) annotations.push(`extent: ${finding.extent}`);
      if (
        (dimension.supportsLocation ||
          ("supportsLocation" in option && option.supportsLocation)) &&
        finding.locations.length
      ) {
        annotations.push(
          `location: ${finding.locations
            .map(trimmed)
            .filter(Boolean)
            .join(", ")}`
        );
      }
      if (
        "supportsMeasurement" in option &&
        option.supportsMeasurement &&
        trimmed(finding.measurement)
      ) {
        annotations.push(
          `measurement: ${trimmed(finding.measurement)} ${
            option.measurementUnit
          }`
        );
      }
      if (trimmed(finding.comment))
        annotations.push(`notes: ${trimmed(finding.comment)}`);
      return [
        annotations.length
          ? `${option.noteFragment} (${annotations.join("; ")})`
          : option.noteFragment,
      ];
    });
    return optionFragments.length
      ? [
          `  - ${dimension.label}: ${withTerminalPunctuation(
            optionFragments.join("; ")
          )}`,
        ]
      : [];
  });
  if (!lines.length) {
    return customFindings
      ? `Gingival Description: ${withTerminalPunctuation(customFindings)}`
      : "";
  }
  return [
    "Gingival Description:",
    ...lines,
    ...(customFindings
      ? [`  Observations: ${withTerminalPunctuation(customFindings)}`]
      : []),
  ].join("\n");
}

function documentationStatusLine(
  label: string,
  status: DocumentationStatus,
  details = "",
): string {
  if (status === "not-documented") return "";
  if (status === "yes" && trimmed(details)) {
    return `${label}: Yes—${withTerminalPunctuation(details)}`;
  }
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
  otherTreatment: string
): string[] {
  const entries = [
    ...(hygieneMaintenance ? ["HYGIENE MAINTENANCE"] : []),
    ...otherTreatment.split(/\r?\n/).map(trimmed).filter(Boolean),
  ];
  return entries.length
    ? ["Treatment recommended:", ...entries.map((entry) => `  - ${entry}`)]
    : [];
}

export function formatAdultHygieneTreatmentCompleted(
  entries: AdultHygiene2026Form["treatmentCompleted"],
): string {
  return formatAdultHygieneTreatmentCompletedEntries(
    entries,
    orderTreatmentToothAreas,
  );
}

function psrPocketingLine(
  values: AdultHygiene2026Form["psrPocketing"]
): string {
  if (!values.some((value) => trimmed(value))) return "";
  const positions = values.map((value) => trimmed(value) || "_");
  return `PSR/Pocketing: ${positions.slice(0, 3).join(" ")} / ${positions
    .slice(3)
    .join(" ")}`;
}

export function formatPeriodontalClassification(
  classification: PeriodontalClassification
): string[] {
  const diagnosisLabels = {
    health: "Periodontal health",
    gingivitis: "Gingivitis",
    periodontitis: "Periodontitis",
    other: "Other periodontal condition",
  } as const;
  const extentLabels = {
    localized: "Localized",
    generalized: "Generalized",
    "molar-incisor": "Molar/incisor pattern",
  } as const;
  const diagnosis = classification.diagnosis
    ? diagnosisLabels[classification.diagnosis]
    : "";
  const stageCanBeCharted = Boolean(
    classification.diagnosis === "periodontitis" &&
      classification.stage,
  );
  const gradeCanBeCharted = Boolean(
    classification.diagnosis === "periodontitis" &&
      classification.grade,
  );
  const statusCanBeCharted = Boolean(
    classification.diagnosis &&
      classification.status &&
      isPeriodontalStatusCompatibleWithContext(
        classification.status,
        classification.gingivalHealth.context,
        Boolean(classification.gingivalHealth.context)
      )
  );
  const diagnosisParts = [
    classification.diagnosis === "periodontitis" && classification.extent
      ? `${extentLabels[classification.extent]} ${diagnosis.toLocaleLowerCase(
          "en-CA"
        )}`
      : classification.diagnosis === "periodontitis" ||
        classification.diagnosis === "other"
      ? diagnosis
      : "",
    stageCanBeCharted
      ? `Stage ${classification.stage}`
      : "",
    gradeCanBeCharted
      ? `Grade ${classification.grade}`
      : "",
  ].filter(Boolean);
  return [
    diagnosisParts.length
      ? `Periodontal diagnosis: ${withTerminalPunctuation(
          diagnosisParts.join(", ")
        )}`
      : "",
    stageCanBeCharted &&
    trimmed(classification.stageOverrideReason)
      ? `Stage override: ${withTerminalPunctuation(
          classification.stageOverrideReason
        )}`
      : "",
    gradeCanBeCharted &&
    trimmed(classification.gradeOverrideReason)
      ? `Grade override: ${withTerminalPunctuation(
          classification.gradeOverrideReason
        )}`
      : "",
    statusCanBeCharted
      ? `Periodontal status: ${withTerminalPunctuation(
          choiceLabel(periodontalStatusChoices, classification.status)
        )}`
      : "",
    statusCanBeCharted && trimmed(classification.statusComment)
      ? `Periodontal status comment: ${withTerminalPunctuation(
          classification.statusComment
        )}`
      : "",
  ].filter(Boolean);
}

export function formatPeriodontalAssessmentFindings(
  classification: PeriodontalClassification
): string {
  const assessment = classification.gingivalHealth;
  const findings = [
    assessment.periodontium
      ? `Periodontal support: ${withTerminalPunctuation(
          choiceLabel(periodontalPeriodontiumChoices, assessment.periodontium)
        )}`
      : "",
    assessment.bopPercent
      ? `Bleeding on probing (BOP): ${formatClinicalMeasurement(
          assessment.bopPercent,
          "ascii"
        )}.`
      : "",
    assessment.maximumPpd
      ? `Maximum PPD: ${formatClinicalMeasurement(
          assessment.maximumPpd,
          "ascii"
        )}.`
      : "",
    assessment.attachmentLoss === "absent"
      ? "Probing attachment loss: Absent."
      : assessment.attachmentLoss === "present"
      ? "Probing attachment loss: Present."
      : "",
    assessment.radiographicBoneLoss === "absent"
      ? "Radiographic bone loss (RBL): Absent."
      : assessment.radiographicBoneLoss === "present"
      ? "Radiographic bone loss (RBL): Present."
      : "",
    assessment.ppd4OrGreaterWithBop === "no"
      ? "Sites with PPD >=4 mm and BOP: None."
      : assessment.ppd4OrGreaterWithBop === "yes"
      ? "Sites with PPD >=4 mm and BOP: One or more."
      : "",
    assessment.progressiveDestruction === "no"
      ? "Evidence of progressive periodontal destruction: No."
      : assessment.progressiveDestruction === "yes"
      ? "Evidence of progressive periodontal destruction: Yes."
      : "",
  ].filter(Boolean);
  return findings.length
    ? [
        "Periodontal assessment findings:",
        ...findings.map((line) => `  - ${line}`),
      ].join("\n")
    : "";
}

function formatEvidenceSubsection(label: string, items: string[]): string[] {
  return items.length
    ? [
        `  ${label}:`,
        ...items.map((item) => `    - ${withTerminalPunctuation(item)}`),
      ]
    : [];
}

export function formatPatientSpecificStageEvidence(
  classification: PeriodontalClassification
): string {
  const evidence = periodontalStageEvidence(classification);
  const evidenceForGroup = (group: "severity" | "complexity") =>
    evidence
      .filter(({ criterionId }) =>
        periodontalStageCriterionCatalogue.some(
          (criterion) =>
            criterion.id === criterionId && criterion.group === group
        )
      )
      .map((item) => formatPeriodontalEvidence(item, "ascii"))
      .filter(Boolean);
  const lines = [
    ...formatEvidenceSubsection(
      "Severity evidence",
      evidenceForGroup("severity")
    ),
    ...formatEvidenceSubsection(
      "Complexity evidence",
      evidenceForGroup("complexity")
    ),
  ];

  return lines.length
    ? ["Patient-specific stage evidence:", ...lines].join("\n")
    : "";
}

export function formatPatientSpecificGradeEvidence(
  classification: PeriodontalClassification
): string {
  const progressionEvidence = classification.gradeBasis
    .map((evidence) => formatPeriodontalEvidence(evidence, "ascii"))
    .filter(Boolean);
  const smoking = formatSmokingModifier(classification.smoking, "ascii");
  const diabetes = formatDiabetesModifier(classification.diabetes, "ascii");
  const modifiers = [
    smoking ? `Smoking: ${smoking}` : "",
    diabetes ? `Diabetes: ${diabetes}` : "",
  ].filter(Boolean);
  const lines = [
    ...formatEvidenceSubsection("Progression evidence", progressionEvidence),
    ...formatEvidenceSubsection("Grade modifiers", modifiers),
  ];

  return lines.length
    ? ["Patient-specific grade evidence:", ...lines].join("\n")
    : "";
}

export function buildAdultHygiene2026Summary(
  form: AdultHygiene2026Form,
  options: BuildAdultHygiene2026SummaryOptions = {}
): string {
  const output = options.output ?? "complete";
  const includesHygiene = output !== "recare";
  const includesRecare = output !== "hygiene";
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
    trimmed(form.noteLastRecallDate)
      ? `Last Recare Date: ${trimmed(form.noteLastRecallDate)}`
      : "",
  ];

  const consentSources = [
    ...(form.consentPatient ? ["PATIENT"] : []),
    ...(form.consentParent ? ["PARENT"] : []),
    ...(form.consentLegalGuardian ? ["LEGAL GUARDIAN"] : []),
  ];
  const consentLine = consentSources.length
    ? [
        `Informed verbal consent given by ${joinConsentSources(
          consentSources
        )} for treatment today.`,
        trimmed(form.consentDetails)
          ? withTerminalPunctuation(form.consentDetails)
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const sterilization = [
    form.class5IndicatorStatus === "not-documented"
      ? ""
      : `Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: ${
          form.class5IndicatorStatus === "yes" ? "Yes" : "No"
        }.`,
    trimmed(form.mieleCodes)
      ? `Sterilization Codes Scanned: ${trimmed(form.mieleCodes)}`
      : "",
  ];

  const consentAndHistory = [
    consentLine,
    labelledLine("Medical history reviewed", form.medicalHistoryReview),
    form.premedicationStatus === "not-required"
      ? "Premedication Required: No."
      : form.premedicationStatus === "required"
      ? trimmed(form.premedicationDetails)
        ? `Premedication Required: Yes—${withTerminalPunctuation(
            form.premedicationDetails
          )}`
        : "Premedication Required: Yes."
      : "",
  ];

  const concerns = [
    formatPatientChiefConcerns(
      "Patient Chief Concern",
      form.patientChiefConcern,
      form.listChiefConcerns
    ),
  ];
  const hygieneConcerns = [
    labelledLine("Hygiene Area of Concern", form.hygieneAreaOfConcern),
  ];

  const records = [
    form.radiographs.map(trimmed).filter(Boolean).length
      ? `Radiographs: ${form.radiographs.map(trimmed).filter(Boolean).join("; ")}`
      : "",
    intraoralPhotosLine(
      form.intraoralPhotosStatus,
      form.intraoralPhotosDetails,
    ),
  ];

  const extraoral = formatRecareExtraoralLines(form);
  const extraoralExam = [
    ...extraoral.map((line, index) =>
      index === 0 ? line.replace(/^Extraoral/, "EOE") : line,
    ),
    examLine("TMJ", form.tmjStatus, form.tmjFindings),
    examLine("Masseter palpation", form.masseterStatus, form.masseterFindings),
    examLine("TMJ loading test", form.tmjLoadStatus, form.tmjLoadFindings),
  ];
  const intraoralExam = [
    ...formatRecareIntraoralLines(form).map((line, index) =>
      index === 0 ? line.replace(/^Intraoral/, "IOE") : line,
    ),
  ];

  const teethAndOdontogram = [
    formatRecareTeethSummary(form),
    form.odontogramUpToDate ? "ODONTOGRAM UP TO DATE" : "",
  ];

  const occlusionAndHabits = [
    labelledLine("Oral habits", form.oralHabits),
    form.rightMolarOcclusionNotApplicable
      ? "Molar occlusion—right: N/A."
      : labelledLine("Molar occlusion—right", form.rightMolarOcclusion),
    form.leftMolarOcclusionNotApplicable
      ? "Molar occlusion—left: N/A."
      : labelledLine("Molar occlusion—left", form.leftMolarOcclusion),
    form.skeletalOcclusionNotApplicable
      ? "Skeletal occlusion: N/A."
      : labelledLine("Skeletal occlusion", form.skeletalOcclusion),
    trimmed(form.overjetMm) ? `Overjet: ${trimmed(form.overjetMm)} mm.` : "",
    trimmed(form.overbitePercent) && trimmed(form.overbiteMm ?? "")
      ? `Overbite: ${trimmed(form.overbitePercent)}%; ${trimmed(
          form.overbiteMm ?? "",
        )} mm.`
      : trimmed(form.overbitePercent)
        ? `Overbite: ${trimmed(form.overbitePercent)}%.`
        : trimmed(form.overbiteMm ?? "")
          ? `Overbite: ${trimmed(form.overbiteMm ?? "")} mm.`
          : "",
    additionalOcclusalFindingLine(form),
  ];

  const hygieneFindings = [
    formatAdultHygieneFindingLine(
      "Plaque",
      form.plaqueChoice,
      form.plaqueComment,
      form.plaqueAreas ?? [],
    ),
    formatAdultHygieneFindingLine(
      "Stain",
      form.stainChoice,
      form.stainComment,
      form.stainAreas ?? [],
    ),
    formatAdultHygieneFindingLine(
      "Calculus",
      form.calculusChoice,
      form.calculusComment,
      form.calculusAreas ?? [],
    ),
    formatAdultHygieneFindingLine(
      "Bleeding",
      form.bleedingChoice,
      form.bleedingComment,
      form.bleedingAreas ?? [],
    ),
  ];

  const healthGingivitisBlock = formatHealthGingivitisBlock(
    form.periodontalClassification
  );
  const periodontalClassificationLines = formatPeriodontalClassification(
    form.periodontalClassification
  );
  const periodontalScreening = [
    psrPocketingLine(form.psrPocketing),
    labelledLine("Recession", form.recession),
    labelledLine("FMP Done", form.fmpDone),
  ];
  const gingivalDescription = [
    formatGingivalDescription(form.gingivalDescription),
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
    healthGingivitisBlock,
    ...periodontalClassificationLines,
  ];
  const cariesRisk = [
    cariesRiskLine(
      form.cariesRiskLevel,
      form.cariesRiskFactors,
      form.cariesRiskNotes
    ),
  ];

  const currentHabits = [
    trimmed(form.flossingFrequency),
    trimmed(form.brushingFrequency),
  ].filter(Boolean);

  const oralHygieneAndEducation = [
    labelledLine("Oral hygiene compliance", form.oralHygieneCompliance),
    labelledLine(
      "Oral hygiene compliance comment",
      form.oralHygieneComplianceComment
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
    form.standardOheStatementApplies
      ? withTerminalPunctuation(standardOheStatement)
      : "",
    oheTopicLine(form.oheTopicsReviewed),
    labelledLine("OHE notes", form.oheNotes),
    currentHabits.length
      ? `Patient is currently: ${currentHabits.join("; ")}.`
      : "",
    labelledLine("Hygiene goal", form.hygieneGoal),
  ];

  const dentalTreatmentOptions = formatTreatmentEntries(
    "Dental Treatment Options Discussed",
    form.treatmentOptions,
    false,
  );
  const hygieneTreatmentOptions = formatTreatmentEntries(
    "Hygiene Treatment Options Discussed",
    form.hygieneTreatmentOptions,
    false,
  );
  const combinedTreatmentPlan = form.treatmentPlan.some((entry) =>
    Boolean(entry.treatmentType.trim()),
  )
    ? formatTreatmentEntries(
        "Combined Treatment Plan",
        form.treatmentPlan,
        true,
      )
    : treatmentRecommendedBlock(
        form.treatmentRecommendedHygieneMaintenance,
        form.otherTreatmentRecommended,
      );

  const treatmentCompleted = [
    formatAdultHygieneTreatmentCompleted(
      migrateLegacyDesensitizerToTreatmentCompleted(
        form.treatmentCompleted,
        form.desensitizer,
      ),
    ),
    formatLocalAnesthesiaSummary(form),
  ];

  const occlusalSplintState = resolveOcclusalSplintState(form);
  const occlusalSplint = ownershipUseLine(
    "Occlusal splint (night guard)",
    occlusalSplintState.status,
    occlusalSplintState.useStatus,
  );

  const hygieneAppliancesAndHistory = [
    occlusalSplint,
    documentationStatusLine(
      "Orthodontic history",
      form.orthodonticHistoryStatus
    ),
    retainerLine(form.retainerStatus),
    labelledLine("Additional Notes", form.additionalNotes),
  ];

  const recareAppliancesAndHistory = [
    ownershipUseLine("CPAP", form.cpapStatus, form.cpapUseStatus),
    occlusalSplint,
    documentationStatusLine(
      "Orthodontic history",
      form.orthodonticHistoryStatus,
    ),
    retainerLine(form.retainerStatus),
    documentationStatusLine(
      "Partial/complete removable dentures",
      form.removableDenturesStatus,
      form.removableDenturesComment,
    ),
    labelledLine(
      "Patient-requested smile or dental improvements",
      form.improvementRequest,
    ),
    labelledLine("Additional recare comments", form.recareAdditionalComments),
  ];

  const combinedAppliancesAndHistory = [
    ...recareAppliancesAndHistory,
    labelledLine("Additional Notes", form.additionalNotes),
  ];

  const hygieneFollowUp = [
    form.ppeStatementApplies
      ? "-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES"
      : "",
    labelledLine("Recommended Hygiene Interval", form.hygieneInterval),
    labelledLine(
      "Recommended hygiene interval comments",
      form.hygieneIntervalComments
    ),
    labelledLine("Next Hygiene Visit", form.nextVisit),
    trimmed(form.dateBooked)
      ? `Hygiene Date Booked: ${trimmed(form.dateBooked)}`
      : "",
  ];

  const recareFollowUp = [
    labelledLine("Recommended Recare Interval", form.recallInterval),
    labelledLine(
      "Recommended recare interval comments",
      form.recallIntervalComments,
    ),
    labelledLine("Next Dental Visit", form.dentalNextVisit),
    trimmed(form.dentalDateBooked)
      ? `Dental Date Booked: ${trimmed(form.dentalDateBooked)}`
      : "",
  ];

  const groups = [
    patientAndTeam,
    sterilization,
    consentAndHistory,
    concerns,
    ...(includesRecare
      ? [
          records,
          extraoralExam,
          intraoralExam,
          teethAndOdontogram,
          occlusionAndHabits,
        ]
      : []),
    ...(includesRecare
      ? [
          output === "complete"
            ? combinedAppliancesAndHistory
            : recareAppliancesAndHistory,
        ]
      : []),
    ...(includesHygiene
      ? [
          hygieneConcerns,
          hygieneFindings,
          periodontalScreening,
          gingivalDescription,
          periodontalAssessmentFindings,
          patientSpecificStageEvidence,
          patientSpecificGradeEvidence,
          periodontalDiagnosis,
        ]
      : []),
    cariesRisk,
    ...(includesHygiene ? [oralHygieneAndEducation] : []),
    dentalTreatmentOptions,
    hygieneTreatmentOptions,
    combinedTreatmentPlan,
    ...(includesHygiene ? [treatmentCompleted] : []),
    ...(output === "hygiene" ? [hygieneAppliancesAndHistory] : []),
    ...(output === "complete"
      ? [recareFollowUp, hygieneFollowUp]
      : output === "recare"
        ? [recareFollowUp]
        : [hygieneFollowUp]),
  ]
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length > 0)
    .map((group) => group.join("\n"));

  return groups.join("\n\n");
}
