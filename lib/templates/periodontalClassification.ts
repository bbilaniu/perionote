export const periodontalDiagnosisChoices = [
  { value: "", label: "Not assessed" },
  { value: "health", label: "Periodontal health" },
  { value: "gingivitis", label: "Gingivitis" },
  { value: "periodontitis", label: "Periodontitis" },
  { value: "other", label: "Other periodontal condition" },
] as const;

export const periodontalExtentChoices = [
  { value: "", label: "Not assessed / N/A" },
  { value: "localized", label: "Localized" },
  { value: "generalized", label: "Generalized" },
  { value: "molar-incisor", label: "Molar/incisor pattern" },
] as const;

export const periodontalStageChoices = [
  { value: "", label: "Not assessed / N/A" },
  { value: "I", label: "Stage I (P1)" },
  { value: "II", label: "Stage II (P2)" },
  { value: "III", label: "Stage III (P3)" },
  { value: "IV", label: "Stage IV (P4)" },
] as const;

export const periodontalGradeChoices = [
  { value: "", label: "Not assessed / N/A" },
  { value: "A", label: "Grade A: slow rate" },
  { value: "B", label: "Grade B: moderate rate" },
  { value: "C", label: "Grade C: rapid rate" },
] as const;

export const periodontalStatusChoices = [
  { value: "", label: "Not assessed / insufficient information" },
  { value: "stable", label: "Periodontal disease stability" },
  {
    value: "remission-control",
    label: "Periodontal disease remission/control",
  },
  {
    value: "unstable-recurrent",
    label: "Unstable/recurrent periodontitis",
  },
] as const;

export type PeriodontalDiagnosis =
  (typeof periodontalDiagnosisChoices)[number]["value"];
export type PeriodontalExtent =
  (typeof periodontalExtentChoices)[number]["value"];
export type PeriodontitisStage =
  (typeof periodontalStageChoices)[number]["value"];
export type PeriodontitisGrade =
  (typeof periodontalGradeChoices)[number]["value"];
export type PeriodontalStatus =
  (typeof periodontalStatusChoices)[number]["value"];

export type ClinicalOperator = "eq" | "lt" | "lte" | "gt" | "gte";
export type ClinicalUnit =
  | "mm"
  | "percent"
  | "teeth"
  | "opposing-pairs"
  | "ratio"
  | "cigarettes-per-day";

export interface ClinicalMeasurement {
  operator: ClinicalOperator;
  value: number;
  unit: ClinicalUnit;
}

type StageCriterionDefinition = {
  id: string;
  group: "severity" | "complexity";
  label: string;
  noteLabel: string;
  input: "measurement" | "boolean";
  unit?: ClinicalUnit;
  minimum?: number;
  step?: number;
};

export const periodontalStageCriterionCatalogue = [
  {
    id: "stage.interdental-cal",
    group: "severity",
    label: "Greatest interdental CAL",
    noteLabel: "interdental CAL",
    input: "measurement",
    unit: "mm",
    minimum: 0,
    step: 1,
  },
  {
    id: "stage.rbl-percent",
    group: "severity",
    label: "Radiographic bone loss",
    noteLabel: "radiographic bone loss",
    input: "measurement",
    unit: "percent",
    minimum: 0,
    step: 1,
  },
  {
    id: "stage.rbl-middle-third-or-beyond",
    group: "severity",
    label: "RBL extends to middle third or beyond",
    noteLabel: "RBL extends to the middle third of the root or beyond",
    input: "boolean",
  },
  {
    id: "stage.tooth-loss",
    group: "severity",
    label: "Teeth lost due to periodontitis",
    noteLabel: "teeth lost due to periodontitis",
    input: "measurement",
    unit: "teeth",
    minimum: 0,
    step: 1,
  },
  {
    id: "stage.max-ppd",
    group: "complexity",
    label: "Maximum PPD",
    noteLabel: "maximum PPD",
    input: "measurement",
    unit: "mm",
    minimum: 0,
    step: 1,
  },
  {
    id: "stage.horizontal-bone-loss",
    group: "complexity",
    label: "Mostly horizontal bone loss",
    noteLabel: "mostly horizontal bone loss",
    input: "boolean",
  },
  {
    id: "stage.vertical-bone-loss",
    group: "complexity",
    label: "Vertical bone loss",
    noteLabel: "vertical bone loss",
    input: "measurement",
    unit: "mm",
    minimum: 0,
    step: 1,
  },
  {
    id: "stage.furcation-class-ii",
    group: "complexity",
    label: "Class II furcation involvement",
    noteLabel: "Class II furcation involvement",
    input: "boolean",
  },
  {
    id: "stage.furcation-class-iii",
    group: "complexity",
    label: "Class III furcation involvement",
    noteLabel: "Class III furcation involvement",
    input: "boolean",
  },
  {
    id: "stage.ridge-defect-moderate",
    group: "complexity",
    label: "Moderate ridge defects",
    noteLabel: "moderate ridge defects",
    input: "boolean",
  },
  {
    id: "stage.ridge-defect-severe",
    group: "complexity",
    label: "Severe ridge defects",
    noteLabel: "severe ridge defects",
    input: "boolean",
  },
  {
    id: "stage.masticatory-dysfunction",
    group: "complexity",
    label: "Masticatory dysfunction",
    noteLabel: "masticatory dysfunction",
    input: "boolean",
  },
  {
    id: "stage.secondary-occlusal-trauma",
    group: "complexity",
    label: "Secondary occlusal trauma",
    noteLabel: "secondary occlusal trauma",
    input: "boolean",
  },
  {
    id: "stage.mobility-degree-2",
    group: "complexity",
    label: "Tooth mobility degree ≥2",
    noteLabel: "tooth mobility degree ≥2",
    input: "boolean",
  },
  {
    id: "stage.bite-collapse",
    group: "complexity",
    label: "Bite collapse",
    noteLabel: "bite collapse",
    input: "boolean",
  },
  {
    id: "stage.pathologic-drifting",
    group: "complexity",
    label: "Pathologic drifting",
    noteLabel: "pathologic drifting",
    input: "boolean",
  },
  {
    id: "stage.pathologic-flaring",
    group: "complexity",
    label: "Pathologic flaring",
    noteLabel: "pathologic flaring",
    input: "boolean",
  },
  {
    id: "stage.remaining-teeth",
    group: "complexity",
    label: "Remaining teeth",
    noteLabel: "remaining teeth",
    input: "measurement",
    unit: "teeth",
    minimum: 0,
    step: 1,
  },
  {
    id: "stage.opposing-pairs",
    group: "complexity",
    label: "Opposing pairs",
    noteLabel: "opposing pairs",
    input: "measurement",
    unit: "opposing-pairs",
    minimum: 0,
    step: 1,
  },
] as const satisfies readonly StageCriterionDefinition[];

type GradeCriterionDefinition = {
  id: string;
  group: "direct" | "indirect" | "phenotype";
  label: string;
  noteLabel: string;
  input: "measurement" | "boolean";
  unit?: ClinicalUnit;
  minimum?: number;
  step?: number;
};

export const periodontalGradeCriterionCatalogue = [
  {
    id: "grade.progression-five-years",
    group: "direct",
    label: "RBL or CAL progression over 5 years",
    noteLabel: "RBL or CAL progression over 5 years",
    input: "measurement",
    unit: "mm",
    minimum: 0,
    step: 0.1,
  },
  {
    id: "grade.bone-loss-age-ratio",
    group: "indirect",
    label: "Bone-loss/age ratio",
    noteLabel: "bone-loss/age ratio",
    input: "measurement",
    unit: "ratio",
    minimum: 0,
    step: 0.01,
  },
  {
    id: "grade.phenotype-low",
    group: "phenotype",
    label: "Destruction low relative to biofilm",
    noteLabel: "destruction low relative to biofilm",
    input: "boolean",
  },
  {
    id: "grade.phenotype-commensurate",
    group: "phenotype",
    label: "Destruction commensurate with biofilm",
    noteLabel: "destruction commensurate with biofilm",
    input: "boolean",
  },
  {
    id: "grade.phenotype-exceeds",
    group: "phenotype",
    label: "Destruction exceeds expectations given biofilm",
    noteLabel: "destruction exceeds expectations given biofilm",
    input: "boolean",
  },
] as const satisfies readonly GradeCriterionDefinition[];

export type PeriodontalStageCriterionId =
  (typeof periodontalStageCriterionCatalogue)[number]["id"];
export type PeriodontalGradeCriterionId =
  (typeof periodontalGradeCriterionCatalogue)[number]["id"];

export interface PeriodontalCriterionEvidence<
  CriterionId extends string = string
> {
  criterionId: CriterionId;
  measurement?: ClinicalMeasurement;
}

export type SmokingModifier =
  | { status: "not-assessed" }
  | { status: "non-smoker" }
  | {
      status: "cigarettes";
      measurement?: ClinicalMeasurement & { unit: "cigarettes-per-day" };
    }
  | { status: "other-exposure"; details: string };

export type DiabetesModifier =
  | { status: "not-assessed" }
  | { status: "no-diabetes" }
  | { status: "diabetes-hba1c-unknown" }
  | {
      status: "diabetes";
      measurement?: ClinicalMeasurement & { unit: "percent" };
    };

export interface PeriodontalClassification {
  diagnosis: PeriodontalDiagnosis;
  extent: PeriodontalExtent;
  stage: PeriodontitisStage;
  grade: PeriodontitisGrade;
  status: PeriodontalStatus;
  stageConfirmed: boolean;
  gradeConfirmed: boolean;
  stageOverrideReason: string;
  gradeOverrideReason: string;
  stageBasis: PeriodontalCriterionEvidence<PeriodontalStageCriterionId>[];
  gradeBasis: PeriodontalCriterionEvidence<PeriodontalGradeCriterionId>[];
  smoking: SmokingModifier;
  diabetes: DiabetesModifier;
}

export function createEmptyPeriodontalClassification(): PeriodontalClassification {
  return {
    diagnosis: "",
    extent: "",
    stage: "",
    grade: "",
    status: "",
    stageConfirmed: false,
    gradeConfirmed: false,
    stageOverrideReason: "",
    gradeOverrideReason: "",
    stageBasis: [],
    gradeBasis: [],
    smoking: { status: "not-assessed" },
    diabetes: { status: "not-assessed" },
  };
}

const stageRank: Record<Exclude<PeriodontitisStage, "">, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
};

const gradeRank: Record<Exclude<PeriodontitisGrade, "">, number> = {
  A: 1,
  B: 2,
  C: 3,
};

export interface CandidateClassification {
  stage: PeriodontitisStage;
  grade: PeriodontitisGrade;
  stageReasonIds: PeriodontalStageCriterionId[];
  gradeReasonIds: Array<
    PeriodontalGradeCriterionId | "modifier.smoking" | "modifier.diabetes"
  >;
  gradeSource: "direct" | "indirect" | "phenotype" | "assumed" | "";
  warnings: string[];
}

function exactMeasurement(
  evidence: PeriodontalCriterionEvidence,
  unit: ClinicalUnit
): number | undefined {
  const measurement = evidence.measurement;
  if (
    !measurement ||
    measurement.operator !== "eq" ||
    measurement.unit !== unit ||
    !Number.isFinite(measurement.value)
  ) {
    return undefined;
  }
  return measurement.value;
}

function stageFromEvidence(
  evidence: PeriodontalCriterionEvidence<PeriodontalStageCriterionId>
): Exclude<PeriodontitisStage, ""> | undefined {
  const id = evidence.criterionId;
  if (id === "stage.interdental-cal") {
    const value = exactMeasurement(evidence, "mm");
    if (value === undefined || value <= 0) return undefined;
    if (value <= 2) return "I";
    if (value <= 4) return "II";
    if (value >= 5) return "III";
    return undefined;
  }
  if (id === "stage.rbl-percent") {
    const value = exactMeasurement(evidence, "percent");
    if (value === undefined || value <= 0) return undefined;
    if (value < 15) return "I";
    if (value <= 33) return "II";
    return "III";
  }
  if (id === "stage.tooth-loss") {
    const value = exactMeasurement(evidence, "teeth");
    if (value === undefined || value <= 0 || !Number.isInteger(value)) {
      return undefined;
    }
    return value >= 5 ? "IV" : "III";
  }
  if (id === "stage.max-ppd") {
    const value = exactMeasurement(evidence, "mm");
    if (value === undefined || value <= 0) return undefined;
    if (value <= 4) return "I";
    if (value <= 5) return "II";
    if (value >= 6) return "III";
    return undefined;
  }
  if (id === "stage.vertical-bone-loss") {
    const value = exactMeasurement(evidence, "mm");
    return value !== undefined && value >= 3 ? "III" : undefined;
  }
  if (id === "stage.remaining-teeth") {
    const value = exactMeasurement(evidence, "teeth");
    return value !== undefined && Number.isInteger(value) && value < 20
      ? "IV"
      : undefined;
  }
  if (id === "stage.opposing-pairs") {
    const value = exactMeasurement(evidence, "opposing-pairs");
    return value !== undefined && Number.isInteger(value) && value < 10
      ? "IV"
      : undefined;
  }
  if (
    id === "stage.rbl-middle-third-or-beyond" ||
    id === "stage.furcation-class-ii" ||
    id === "stage.furcation-class-iii" ||
    id === "stage.ridge-defect-moderate"
  ) {
    return "III";
  }
  if (id === "stage.horizontal-bone-loss") return "I";
  return "IV";
}

function gradeFromEvidence(
  evidence: PeriodontalCriterionEvidence<PeriodontalGradeCriterionId>
): Exclude<PeriodontitisGrade, ""> | undefined {
  if (evidence.criterionId === "grade.progression-five-years") {
    const value = exactMeasurement(evidence, "mm");
    if (value === undefined || value < 0) return undefined;
    if (value === 0) return "A";
    return value < 2 ? "B" : "C";
  }
  if (evidence.criterionId === "grade.bone-loss-age-ratio") {
    const value = exactMeasurement(evidence, "ratio");
    if (value === undefined || value < 0) return undefined;
    if (value < 0.25) return "A";
    return value <= 1 ? "B" : "C";
  }
  if (evidence.criterionId === "grade.phenotype-low") return "A";
  if (evidence.criterionId === "grade.phenotype-commensurate") return "B";
  return "C";
}

function smokingGrade(
  modifier: SmokingModifier
): Exclude<PeriodontitisGrade, ""> | undefined {
  if (modifier.status === "non-smoker") return "A";
  if (modifier.status !== "cigarettes") return undefined;
  const value = exactMeasurement(
    { criterionId: "modifier.smoking", measurement: modifier.measurement },
    "cigarettes-per-day"
  );
  if (value === undefined || value < 0) return undefined;
  if (value === 0) return "A";
  return value < 10 ? "B" : "C";
}

function diabetesGrade(
  modifier: DiabetesModifier
): Exclude<PeriodontitisGrade, ""> | undefined {
  if (modifier.status === "no-diabetes") return "A";
  if (modifier.status !== "diabetes") return undefined;
  const value = exactMeasurement(
    { criterionId: "modifier.diabetes", measurement: modifier.measurement },
    "percent"
  );
  if (value === undefined || value < 0) return undefined;
  return value < 7 ? "B" : "C";
}

function highest<T extends string>(
  entries: Array<{ value: T; rank: number }>
): T | "" {
  return entries.reduce<{ value: T | ""; rank: number }>(
    (highestEntry, entry) =>
      entry.rank > highestEntry.rank ? entry : highestEntry,
    { value: "", rank: 0 }
  ).value;
}

export function classifyPeriodontalCandidate(
  classification: PeriodontalClassification
): CandidateClassification {
  const warnings: string[] = [];
  if (classification.diagnosis !== "periodontitis") {
    const hasClassificationEvidence =
      classification.stageBasis.length > 0 ||
      classification.gradeBasis.length > 0 ||
      classification.smoking.status !== "not-assessed" ||
      classification.diabetes.status !== "not-assessed";
    return {
      stage: "",
      grade: "",
      stageReasonIds: [],
      gradeReasonIds: [],
      gradeSource: "",
      warnings: hasClassificationEvidence
        ? [
            "Stage and grade candidates are available only for a periodontitis diagnosis.",
          ]
        : [],
    };
  }
  const stageEvidence = classification.stageBasis
    .map((evidence) => ({ evidence, value: stageFromEvidence(evidence) }))
    .filter(
      (
        entry
      ): entry is {
        evidence: PeriodontalCriterionEvidence<PeriodontalStageCriterionId>;
        value: Exclude<PeriodontitisStage, "">;
      } => Boolean(entry.value)
    );
  const stage = highest(
    stageEvidence.map(({ value }) => ({ value, rank: stageRank[value] }))
  ) as PeriodontitisStage;
  const stageLevels = new Set(stageEvidence.map(({ value }) => value));
  if (classification.stageBasis.length && !stageEvidence.length) {
    warnings.push(
      "Entered stage evidence does not cross a supported classification threshold."
    );
  }
  if (stageLevels.size > 1) {
    warnings.push(
      "Stage evidence spans multiple levels; the candidate uses the highest applicable stage."
    );
  }
  if (!classification.stageBasis.length) {
    warnings.push("Stage cannot be suggested without patient-specific evidence.");
  }

  const gradeEntries = classification.gradeBasis
    .map((evidence) => ({ evidence, value: gradeFromEvidence(evidence) }))
    .filter(
      (
        entry
      ): entry is {
        evidence: PeriodontalCriterionEvidence<PeriodontalGradeCriterionId>;
        value: Exclude<PeriodontitisGrade, "">;
      } => Boolean(entry.value)
    );
  const groupedGradeEvidence = {
    direct: gradeEntries.filter(({ evidence }) =>
      evidence.criterionId.startsWith("grade.progression-")
    ),
    indirect: gradeEntries.filter(({ evidence }) =>
      evidence.criterionId.startsWith("grade.bone-loss-age-")
    ),
    phenotype: gradeEntries.filter(({ evidence }) =>
      evidence.criterionId.startsWith("grade.phenotype-")
    ),
  };
  const gradeSource = (["direct", "indirect", "phenotype"] as const).find(
    (source) => groupedGradeEvidence[source].length
  );
  const baseEntries = gradeSource ? groupedGradeEvidence[gradeSource] : [];
  const baseGrade =
    (highest(
      baseEntries.map(({ value }) => ({ value, rank: gradeRank[value] }))
    ) as PeriodontitisGrade) ||
    (classification.diagnosis === "periodontitis" ? "B" : "");
  const smoking = smokingGrade(classification.smoking);
  const diabetes = diabetesGrade(classification.diabetes);
  const grade = highest(
    [
      ...(baseGrade
        ? [{ value: baseGrade, rank: gradeRank[baseGrade] }]
        : []),
      ...(smoking ? [{ value: smoking, rank: gradeRank[smoking] }] : []),
      ...(diabetes ? [{ value: diabetes, rank: gradeRank[diabetes] }] : []),
    ]
  ) as PeriodontitisGrade;

  if (!gradeSource && classification.diagnosis === "periodontitis") {
    warnings.push(
      "Grade B is a working assumption because direct, indirect, and phenotype evidence are missing."
    );
  }
  if (gradeSource) {
    const sourceLevels = new Set(
      groupedGradeEvidence[gradeSource].map(({ value }) => value)
    );
    if (sourceLevels.size > 1) {
      warnings.push(
        `Conflicting ${gradeSource} grade evidence is present; the candidate uses the highest applicable grade.`
      );
    }
  }
  if (classification.smoking.status === "other-exposure") {
    warnings.push(
      "Other tobacco/nicotine exposure is documented but is not converted to a cigarette-equivalent grade."
    );
  }
  if (classification.diabetes.status === "diabetes-hba1c-unknown") {
    warnings.push(
      "Diabetes is present, but grade cannot be modified without a current HbA1c."
    );
  }

  const stageReasonIds = stage
    ? stageEvidence
        .filter(({ value }) => value === stage)
        .map(({ evidence }) => evidence.criterionId)
    : [];
  const gradeReasonIds: CandidateClassification["gradeReasonIds"] = [
    ...baseEntries
      .filter(({ value }) => value === baseGrade)
      .map(({ evidence }) => evidence.criterionId),
    ...(smoking && smoking === grade ? (["modifier.smoking"] as const) : []),
    ...(diabetes && diabetes === grade ? (["modifier.diabetes"] as const) : []),
  ];

  return {
    stage,
    grade,
    stageReasonIds,
    gradeReasonIds,
    gradeSource: gradeSource ?? (baseGrade ? "assumed" : ""),
    warnings,
  };
}

function formattedNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function unitLabel(unit: ClinicalUnit): string {
  if (unit === "percent") return "%";
  if (unit === "cigarettes-per-day") return " cigarettes/day";
  if (unit === "opposing-pairs") return " opposing pairs";
  if (unit === "teeth") return " teeth";
  if (unit === "ratio") return "";
  return ` ${unit}`;
}

function operatorLabel(
  operator: ClinicalOperator,
  notation: "clinical" | "ascii"
): string {
  return notation === "ascii"
    ? { eq: "", lt: "<", lte: "<=", gt: ">", gte: ">=" }[operator]
    : { eq: "", lt: "<", lte: "≤", gt: ">", gte: "≥" }[operator];
}

export function formatClinicalMeasurement(
  measurement: ClinicalMeasurement,
  notation: "clinical" | "ascii" = "clinical"
): string {
  return `${operatorLabel(measurement.operator, notation)}${formattedNumber(
    measurement.value
  )}${unitLabel(measurement.unit)}`;
}

export function formatPeriodontalEvidence(
  evidence: PeriodontalCriterionEvidence<
    PeriodontalStageCriterionId | PeriodontalGradeCriterionId
  >,
  notation: "clinical" | "ascii" = "clinical"
): string {
  const definition = [
    ...periodontalStageCriterionCatalogue,
    ...periodontalGradeCriterionCatalogue,
  ].find(({ id }) => id === evidence.criterionId);
  if (!definition) return "";
  const wording = evidence.measurement
    ? `${definition.noteLabel} ${formatClinicalMeasurement(
        evidence.measurement,
        notation
      )}`
    : definition.noteLabel;
  return notation === "ascii"
    ? wording.replaceAll("≤", "<=").replaceAll("≥", ">=")
    : wording;
}

export function formatSmokingModifier(
  modifier: SmokingModifier,
  notation: "clinical" | "ascii" = "clinical"
): string {
  if (modifier.status === "non-smoker") return "non-smoker";
  if (modifier.status === "cigarettes") {
    return modifier.measurement
      ? `smokes ${formatClinicalMeasurement(modifier.measurement, notation)}`
      : "";
  }
  if (modifier.status === "other-exposure") {
    const details = modifier.details.trim();
    return details
      ? `other tobacco/nicotine exposure: ${details}`
      : "other tobacco/nicotine exposure documented separately";
  }
  return "";
}

export function formatDiabetesModifier(
  modifier: DiabetesModifier,
  notation: "clinical" | "ascii" = "clinical"
): string {
  if (modifier.status === "no-diabetes") {
    return "no diagnosis of diabetes / normoglycemic";
  }
  if (modifier.status === "diabetes-hba1c-unknown") {
    return "diabetes present; current HbA1c unknown";
  }
  if (modifier.status === "diabetes") {
    return modifier.measurement
      ? `diabetes present; HbA1c ${formatClinicalMeasurement(
          modifier.measurement,
          notation
        )}`
      : "diabetes present; HbA1c not entered";
  }
  return "";
}

export function choiceLabel<T extends string>(
  choices: readonly { value: T; label: string }[],
  value: T
): string {
  return choices.find((choice) => choice.value === value)?.label ?? "";
}
