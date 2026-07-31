import {
  type AdultHygiene2021Form,
  orderTreatmentToothAreas,
} from "@/lib/templates/adultHygiene2021";
import {
  choiceLabel,
  formatDiabetesModifier,
  formatHealthGingivitisBlock,
  formatPeriodontalEvidence,
  formatSmokingModifier,
  periodontalStageEvidence,
  periodontalStatusChoices,
  type PeriodontalClassification,
} from "@/lib/templates/periodontalClassification";
import type {
  DocumentationStatus,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import { formatPatientChiefConcerns } from "@/lib/templates/patientChiefConcern";
import { formatNoteHeaderLocalTimestamp } from "@/lib/templates/summary/buildRecareExamSummary";
import {
  gingivalDescriptionCatalog,
  type GingivalDescriptionAssessment,
} from "@/lib/templates/gingivalDescriptionCatalog";

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

function findingWithCommentLine(
  label: string,
  finding: string,
  comment: string
): string {
  const cleanFinding = trimmed(finding);
  const cleanComment = trimmed(comment);
  if (cleanFinding && cleanComment) {
    return `${label}: ${withTerminalPunctuation(
      `${cleanFinding}; ${cleanComment}`
    )}`;
  }
  return cleanFinding
    ? labelledLine(label, cleanFinding)
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
  status: DocumentationStatus
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

function psrPocketingLine(
  values: AdultHygiene2021Form["psrPocketing"]
): string {
  if (!values.some((value) => trimmed(value))) return "";
  const positions = values.map((value) => trimmed(value) || "_");
  return `PSR/Pocketing: ${positions.slice(0, 3).join(" ")} / ${positions
    .slice(3)
    .join(" ")}`;
}

function formatPeriodontalClassification(
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
  const diagnosisParts = [
    classification.diagnosis === "periodontitis" && classification.extent
      ? `${extentLabels[classification.extent]} ${diagnosis.toLocaleLowerCase(
          "en-CA"
        )}`
      : classification.diagnosis === "periodontitis" ||
        classification.diagnosis === "other"
      ? diagnosis
      : "",
    classification.stageConfirmed && classification.stage
      ? `Stage ${classification.stage}`
      : "",
    classification.gradeConfirmed && classification.grade
      ? `Grade ${classification.grade}`
      : "",
  ].filter(Boolean);
  const stageBasis =
    classification.stageConfirmed && classification.stage
      ? periodontalStageEvidence(classification)
          .map((evidence) => formatPeriodontalEvidence(evidence, "ascii"))
          .filter(Boolean)
      : [];
  const gradeBasis =
    classification.gradeConfirmed && classification.grade
      ? classification.gradeBasis
          .map((evidence) => formatPeriodontalEvidence(evidence, "ascii"))
          .filter(Boolean)
      : [];
  const modifiers =
    classification.diagnosis === "periodontitis"
      ? [
          formatSmokingModifier(classification.smoking, "ascii"),
          formatDiabetesModifier(classification.diabetes, "ascii"),
        ].filter(Boolean)
      : [];

  return [
    diagnosisParts.length
      ? `Periodontal diagnosis: ${withTerminalPunctuation(
          diagnosisParts.join(", ")
        )}`
      : "",
    stageBasis.length ? `Stage basis: ${stageBasis.join("; ")}.` : "",
    classification.stageConfirmed &&
    trimmed(classification.stageOverrideReason)
      ? `Stage override: ${withTerminalPunctuation(
          classification.stageOverrideReason
        )}`
      : "",
    gradeBasis.length ? `Grade basis: ${gradeBasis.join("; ")}.` : "",
    classification.gradeConfirmed &&
    trimmed(classification.gradeOverrideReason)
      ? `Grade override: ${withTerminalPunctuation(
          classification.gradeOverrideReason
        )}`
      : "",
    modifiers.length ? `Grade modifiers: ${modifiers.join("; ")}.` : "",
    classification.status
      ? `Periodontal status: ${withTerminalPunctuation(
          choiceLabel(periodontalStatusChoices, classification.status)
        )}`
      : "",
  ].filter(Boolean);
}

export function buildAdultHygiene2021Summary(
  form: AdultHygiene2021Form,
  options: BuildAdultHygiene2021SummaryOptions = {}
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
        ? `Premedication Required: Yes—${withTerminalPunctuation(
            form.premedicationDetails
          )}`
        : "Premedication Required: Yes."
      : "",
  ];

  const concernsAndFindings = [
    formatPatientChiefConcerns(
      "Patient Chief Concern",
      form.patientChiefConcern,
      form.listChiefConcerns
    ),
    labelledLine("Hygiene Area of Concern", form.hygieneAreaOfConcern),
    findingWithCommentLine("Plaque", form.plaqueChoice, form.plaqueComment),
    findingWithCommentLine("Stain", form.stainChoice, form.stainComment),
    findingWithCommentLine(
      "Calculus",
      form.calculusChoice,
      form.calculusComment
    ),
    findingWithCommentLine(
      "Bleeding",
      form.bleedingChoice,
      form.bleedingComment
    ),
  ];

  const periodontalAssessment = [
    psrPocketingLine(form.psrPocketing),
    labelledLine("Recession", form.recession),
    labelledLine("FMP Done", form.fmpDone),
    formatHealthGingivitisBlock(form.periodontalClassification),
    formatGingivalDescription(form.gingivalDescription),
    ...formatPeriodontalClassification(form.periodontalClassification),
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
    oheTopicLine(form.oheTopicsReviewed),
    labelledLine("OHE notes", form.oheNotes),
    currentHabits.length
      ? `Patient is currently: ${currentHabits.join("; ")}.`
      : "",
    labelledLine("Hygiene goal", form.hygieneGoal),
  ];

  const treatment = [
    ...treatmentRecommendedBlock(
      form.treatmentRecommendedHygieneMaintenance,
      form.otherTreatmentRecommended
    ),
    (() => {
      const completed = form.treatmentCompleted
        .map((entry) => {
          const treatmentType = trimmed(entry.treatmentType);
          if (!treatmentType) return "";
          const toothAreas = orderTreatmentToothAreas(entry.toothAreas);
          return toothAreas.length
            ? `${treatmentType} — ${toothAreas.join(", ")}`
            : treatmentType;
        })
        .filter(Boolean);
      return completed.length
        ? `Treatment completed today: ${completed.join("; ")}`
        : "";
    })(),
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
      form.orthodonticHistoryStatus
    ),
    retainerLine(form.retainerStatus),
    labelledLine("Additional Notes", form.additionalNotes),
  ];

  const intervalsAndNextVisit = [
    form.ppeStatementApplies
      ? "-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES"
      : "",
    labelledLine("Recommended Recall Interval", form.recallInterval),
    labelledLine(
      "Recommended recall interval comments",
      form.recallIntervalComments
    ),
    labelledLine("Recommended Hygiene Interval", form.hygieneInterval),
    labelledLine(
      "Recommended hygiene interval comments",
      form.hygieneIntervalComments
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
