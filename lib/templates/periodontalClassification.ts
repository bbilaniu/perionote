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

export const periodontalPeriodontiumChoices = [
  { value: "", label: "Not assessed" },
  { value: "intact", label: "Intact periodontium" },
  {
    value: "reduced-non-periodontitis",
    label: "Reduced periodontium, non-periodontitis patient",
  },
  {
    value: "reduced-treated-periodontitis",
    label: "Reduced periodontium, treated periodontitis patient",
  },
] as const;

export const healthGingivitisContextChoices = [
  {
    value: "health-intact",
    label: "HEALTH - INTACT PERIODONTIUM",
    diagnosis: "health",
  },
  {
    value: "gingivitis-intact",
    label: "GINGIVITIS - INTACT PERIODONTIUM",
    diagnosis: "gingivitis",
  },
  {
    value: "health-reduced-non-periodontitis",
    label: "HEALTH - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT",
    diagnosis: "health",
  },
  {
    value: "gingivitis-reduced-non-periodontitis",
    label: "GINGIVITIS - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT",
    diagnosis: "gingivitis",
  },
  {
    value: "health-treated-stable-periodontitis",
    label: "HEALTH - SUCCESSFULLY TREATED, STABLE PERIODONTITIS PATIENT",
    diagnosis: "periodontitis",
  },
  {
    value: "inflammation-periodontitis-history",
    label: "GINGIVAL INFLAMMATION - PATIENT WITH HISTORY OF PERIODONTITIS",
    diagnosis: "periodontitis",
  },
] as const;

export const assessedPresenceChoices = [
  { value: "not-assessed", label: "Not assessed" },
  { value: "absent", label: "Absent" },
  { value: "present", label: "Present" },
] as const;

export const assessedBooleanChoices = [
  { value: "not-assessed", label: "Not assessed" },
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
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
export type PeriodontalPeriodontium =
  (typeof periodontalPeriodontiumChoices)[number]["value"];
export type HealthGingivitisContext =
  | ""
  | (typeof healthGingivitisContextChoices)[number]["value"];
export type AssessedPresence =
  (typeof assessedPresenceChoices)[number]["value"];
export type AssessedBoolean = (typeof assessedBooleanChoices)[number]["value"];

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
  maximum?: number;
  step?: number;
};

export const periodontalStageCriterionCatalogue = [
  {
    id: "stage.rbl-percent",
    group: "severity",
    label: "Radiographic bone loss (RBL)",
    noteLabel: "radiographic bone loss",
    input: "measurement",
    unit: "percent",
    minimum: 0,
    maximum: 100,
    step: 1,
  },
  {
    id: "stage.rbl-middle-third-or-beyond",
    group: "severity",
    label: "Radiographic bone loss (RBL) extent",
    noteLabel:
      "radiographic bone loss (RBL) extends to the middle third of the root or beyond",
    input: "boolean",
  },
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
  CriterionId extends string = string,
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

export interface GingivalHealthAssessment {
  periodontium: PeriodontalPeriodontium;
  bopPercent?: ClinicalMeasurement & { unit: "percent" };
  maximumPpd?: ClinicalMeasurement & { unit: "mm" };
  attachmentLoss: AssessedPresence;
  radiographicBoneLoss: AssessedPresence;
  ppd4OrGreaterWithBop: AssessedBoolean;
  progressiveDestruction: AssessedBoolean;
  context: HealthGingivitisContext;
  confirmed: boolean;
  overrideReason: string;
}

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
  gingivalHealth: GingivalHealthAssessment;
}

export function createEmptyGingivalHealthAssessment(): GingivalHealthAssessment {
  return {
    periodontium: "",
    attachmentLoss: "not-assessed",
    radiographicBoneLoss: "not-assessed",
    ppd4OrGreaterWithBop: "not-assessed",
    progressiveDestruction: "not-assessed",
    context: "",
    confirmed: false,
    overrideReason: "",
  };
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
    gingivalHealth: createEmptyGingivalHealthAssessment(),
  };
}

export interface GingivalHealthCandidate {
  context: HealthGingivitisContext;
  warnings: string[];
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
  unit: ClinicalUnit,
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

function exactMeasurementValue(
  measurement: ClinicalMeasurement | undefined,
  unit: ClinicalUnit,
): number | undefined {
  return exactMeasurement({ criterionId: "measurement", measurement }, unit);
}

export function periodontalStageEvidence(
  classification: PeriodontalClassification,
): PeriodontalCriterionEvidence<PeriodontalStageCriterionId>[] {
  const evidenceById = new Map(
    classification.stageBasis
      .filter((evidence) => evidence.criterionId !== "stage.max-ppd")
      .map((evidence) => [evidence.criterionId, evidence]),
  );
  if (classification.gingivalHealth.maximumPpd) {
    evidenceById.set("stage.max-ppd", {
      criterionId: "stage.max-ppd",
      measurement: classification.gingivalHealth.maximumPpd,
    });
  }
  return periodontalStageCriterionCatalogue.flatMap(({ id }) => {
    const evidence = evidenceById.get(id);
    return evidence ? [evidence] : [];
  });
}

export function classifyGingivalHealthCandidate(
  classification: PeriodontalClassification,
): GingivalHealthCandidate {
  const assessment = classification.gingivalHealth;
  if (
    classification.diagnosis !== "health" &&
    classification.diagnosis !== "gingivitis" &&
    classification.diagnosis !== "periodontitis"
  ) {
    return { context: "", warnings: [] };
  }

  const bop = exactMeasurementValue(assessment.bopPercent, "percent");
  const maximumPpd = exactMeasurementValue(assessment.maximumPpd, "mm");
  const missing = [
    ...(!assessment.periodontium ? ["periodontium"] : []),
    ...(bop === undefined ? ["BOP percentage"] : []),
    ...(maximumPpd === undefined ? ["maximum PPD"] : []),
    ...(assessment.attachmentLoss === "not-assessed"
      ? ["attachment loss"]
      : []),
    ...(assessment.radiographicBoneLoss === "not-assessed"
      ? ["radiographic bone loss"]
      : []),
  ];
  if (classification.diagnosis === "periodontitis") {
    if (assessment.ppd4OrGreaterWithBop === "not-assessed") {
      missing.push("sites with PPD >=4 mm and BOP");
    }
    if (assessment.progressiveDestruction === "not-assessed") {
      missing.push("progressive destruction");
    }
  }
  if (missing.length) {
    return {
      context: "",
      warnings: [`Complete ${missing.join(", ")} to calculate a candidate.`],
    };
  }
  if (
    bop === undefined ||
    maximumPpd === undefined ||
    bop < 0 ||
    bop > 100 ||
    maximumPpd <= 0
  ) {
    return {
      context: "",
      warnings: [
        "Entered Health/Gingivitis measurements are outside supported ranges.",
      ],
    };
  }

  if (classification.diagnosis === "periodontitis") {
    if (assessment.periodontium !== "reduced-treated-periodontitis") {
      return {
        context: "",
        warnings: [
          "A periodontitis diagnosis requires the treated-periodontitis context for this calculation.",
        ],
      };
    }
    if (
      assessment.attachmentLoss !== "present" ||
      assessment.radiographicBoneLoss !== "present"
    ) {
      return {
        context: "",
        warnings: [
          "Treated periodontitis context requires confirmed reduced attachment and bone levels.",
        ],
      };
    }
    if (
      assessment.ppd4OrGreaterWithBop === "yes" ||
      assessment.progressiveDestruction === "yes"
    ) {
      return {
        context: "",
        warnings: [
          "Findings may indicate unstable or recurrent periodontitis; no Health/Gingivitis candidate is suggested.",
        ],
      };
    }
    if (bop < 10 && maximumPpd <= 4) {
      return {
        context: "health-treated-stable-periodontitis",
        warnings: [],
      };
    }
    if (bop >= 10 && assessment.ppd4OrGreaterWithBop === "no") {
      return {
        context: "inflammation-periodontitis-history",
        warnings: [],
      };
    }
    return {
      context: "",
      warnings: [
        "Entered findings do not match a supported treated-periodontitis Health/Gingivitis context.",
      ],
    };
  }

  const expectedPeriodontium =
    assessment.periodontium === "intact"
      ? {
          attachmentLoss: "absent",
          radiographicBoneLoss: "absent",
          health: "health-intact",
          gingivitis: "gingivitis-intact",
        }
      : assessment.periodontium === "reduced-non-periodontitis"
      ? {
          attachmentLoss: "present",
          radiographicBoneLoss: assessment.radiographicBoneLoss,
          health: "health-reduced-non-periodontitis",
          gingivitis: "gingivitis-reduced-non-periodontitis",
        }
      : undefined;
  if (
    !expectedPeriodontium ||
    assessment.attachmentLoss !== expectedPeriodontium.attachmentLoss ||
    assessment.radiographicBoneLoss !==
      expectedPeriodontium.radiographicBoneLoss
  ) {
    return {
      context: "",
      warnings: [
        "Attachment and bone-loss findings do not match the selected periodontium.",
      ],
    };
  }
  if (maximumPpd > 3) {
    return {
      context: "",
      warnings: [
        "Maximum PPD exceeds the supported health/gingivitis threshold for this periodontium.",
      ],
    };
  }

  if (classification.diagnosis === "health" && bop < 10) {
    return {
      context: expectedPeriodontium.health as HealthGingivitisContext,
      warnings: [],
    };
  }
  if (classification.diagnosis === "gingivitis" && bop >= 10) {
    return {
      context: expectedPeriodontium.gingivitis as HealthGingivitisContext,
      warnings: [],
    };
  }
  return {
    context: "",
    warnings: [
      `BOP ${bop}% does not support the selected ${classification.diagnosis} category.`,
    ],
  };
}

function stageFromEvidence(
  evidence: PeriodontalCriterionEvidence<PeriodontalStageCriterionId>,
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
  evidence: PeriodontalCriterionEvidence<PeriodontalGradeCriterionId>,
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
  modifier: SmokingModifier,
): Exclude<PeriodontitisGrade, ""> | undefined {
  if (modifier.status === "non-smoker") return "A";
  if (modifier.status !== "cigarettes") return undefined;
  const value = exactMeasurement(
    { criterionId: "modifier.smoking", measurement: modifier.measurement },
    "cigarettes-per-day",
  );
  if (value === undefined || value < 0) return undefined;
  if (value === 0) return "A";
  return value < 10 ? "B" : "C";
}

function diabetesGrade(
  modifier: DiabetesModifier,
): Exclude<PeriodontitisGrade, ""> | undefined {
  if (modifier.status === "no-diabetes") return "A";
  if (modifier.status !== "diabetes") return undefined;
  const value = exactMeasurement(
    { criterionId: "modifier.diabetes", measurement: modifier.measurement },
    "percent",
  );
  if (value === undefined || value < 0) return undefined;
  return value < 7 ? "B" : "C";
}

function highest<T extends string>(
  entries: Array<{ value: T; rank: number }>,
): T | "" {
  return entries.reduce<{ value: T | ""; rank: number }>(
    (highestEntry, entry) =>
      entry.rank > highestEntry.rank ? entry : highestEntry,
    { value: "", rank: 0 },
  ).value;
}

export function classifyPeriodontalCandidate(
  classification: PeriodontalClassification,
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
  const allStageEvidence = periodontalStageEvidence(classification);
  const stageEvidence = allStageEvidence
    .map((evidence) => ({ evidence, value: stageFromEvidence(evidence) }))
    .filter(
      (
        entry,
      ): entry is {
        evidence: PeriodontalCriterionEvidence<PeriodontalStageCriterionId>;
        value: Exclude<PeriodontitisStage, "">;
      } => Boolean(entry.value),
    );
  const stage = highest(
    stageEvidence.map(({ value }) => ({ value, rank: stageRank[value] })),
  ) as PeriodontitisStage;
  const stageLevels = new Set(stageEvidence.map(({ value }) => value));
  if (allStageEvidence.length && !stageEvidence.length) {
    warnings.push(
      "Entered stage evidence does not cross a supported classification threshold.",
    );
  }
  if (stageLevels.size > 1) {
    warnings.push(
      "Stage evidence spans multiple levels; the candidate uses the highest applicable stage.",
    );
  }
  if (!allStageEvidence.length) {
    warnings.push(
      "Stage cannot be suggested without patient-specific evidence.",
    );
  }

  const gradeEntries = classification.gradeBasis
    .map((evidence) => ({ evidence, value: gradeFromEvidence(evidence) }))
    .filter(
      (
        entry,
      ): entry is {
        evidence: PeriodontalCriterionEvidence<PeriodontalGradeCriterionId>;
        value: Exclude<PeriodontitisGrade, "">;
      } => Boolean(entry.value),
    );
  const groupedGradeEvidence = {
    direct: gradeEntries.filter(({ evidence }) =>
      evidence.criterionId.startsWith("grade.progression-"),
    ),
    indirect: gradeEntries.filter(({ evidence }) =>
      evidence.criterionId.startsWith("grade.bone-loss-age-"),
    ),
    phenotype: gradeEntries.filter(({ evidence }) =>
      evidence.criterionId.startsWith("grade.phenotype-"),
    ),
  };
  const gradeSource = (["direct", "indirect", "phenotype"] as const).find(
    (source) => groupedGradeEvidence[source].length,
  );
  const baseEntries = gradeSource ? groupedGradeEvidence[gradeSource] : [];
  const baseGrade =
    (highest(
      baseEntries.map(({ value }) => ({ value, rank: gradeRank[value] })),
    ) as PeriodontitisGrade) ||
    (classification.diagnosis === "periodontitis" ? "B" : "");
  const smoking = smokingGrade(classification.smoking);
  const diabetes = diabetesGrade(classification.diabetes);
  const grade = highest([
    ...(baseGrade ? [{ value: baseGrade, rank: gradeRank[baseGrade] }] : []),
    ...(smoking ? [{ value: smoking, rank: gradeRank[smoking] }] : []),
    ...(diabetes ? [{ value: diabetes, rank: gradeRank[diabetes] }] : []),
  ]) as PeriodontitisGrade;

  if (!gradeSource && classification.diagnosis === "periodontitis") {
    warnings.push(
      "Grade B is a working assumption because direct, indirect, and phenotype evidence are missing.",
    );
  }
  if (gradeSource) {
    const sourceLevels = new Set(
      groupedGradeEvidence[gradeSource].map(({ value }) => value),
    );
    if (sourceLevels.size > 1) {
      warnings.push(
        `Conflicting ${gradeSource} grade evidence is present; the candidate uses the highest applicable grade.`,
      );
    }
  }
  if (classification.smoking.status === "other-exposure") {
    warnings.push(
      "Other tobacco/nicotine exposure is documented but is not converted to a cigarette-equivalent grade.",
    );
  }
  if (classification.diabetes.status === "diabetes-hba1c-unknown") {
    warnings.push(
      "Diabetes is present, but grade cannot be modified without a current HbA1c.",
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
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)));
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
  notation: "clinical" | "ascii",
): string {
  return notation === "ascii"
    ? { eq: "", lt: "<", lte: "<=", gt: ">", gte: ">=" }[operator]
    : { eq: "", lt: "<", lte: "≤", gt: ">", gte: "≥" }[operator];
}

export function formatClinicalMeasurement(
  measurement: ClinicalMeasurement,
  notation: "clinical" | "ascii" = "clinical",
): string {
  return `${operatorLabel(measurement.operator, notation)}${formattedNumber(
    measurement.value,
  )}${unitLabel(measurement.unit)}`;
}

export function formatPeriodontalEvidence(
  evidence: PeriodontalCriterionEvidence<
    PeriodontalStageCriterionId | PeriodontalGradeCriterionId
  >,
  notation: "clinical" | "ascii" = "clinical",
): string {
  const definition = [
    ...periodontalStageCriterionCatalogue,
    ...periodontalGradeCriterionCatalogue,
  ].find(({ id }) => id === evidence.criterionId);
  if (!definition) return "";
  const wording = evidence.measurement
    ? `${definition.noteLabel} ${formatClinicalMeasurement(
        evidence.measurement,
        notation,
      )}`
    : definition.noteLabel;
  return notation === "ascii"
    ? wording.replaceAll("≤", "<=").replaceAll("≥", ">=")
    : wording;
}

const healthGingivitisCanonicalLines: Record<
  Exclude<HealthGingivitisContext, "">,
  readonly string[]
> = {
  "health-intact": [
    "NO PROBING ATTACHMENT LOSS",
    "PPD <=3 MM",
    "BOP <10%",
    "NO RADIOGRAPHIC BONE LOSS",
  ],
  "gingivitis-intact": [
    "NO PROBING ATTACHMENT LOSS",
    "PPD <=3 MM",
    "BOP >=10%",
    "NO RADIOGRAPHIC BONE LOSS",
  ],
  "health-reduced-non-periodontitis": [
    "PROBING ATTACHMENT LOSS PRESENT",
    "PPD <=3 MM",
    "BOP <10%",
    "RADIOGRAPHIC BONE LOSS MAY BE PRESENT",
  ],
  "gingivitis-reduced-non-periodontitis": [
    "PROBING ATTACHMENT LOSS PRESENT",
    "PPD <=3 MM",
    "BOP >=10%",
    "RADIOGRAPHIC BONE LOSS MAY BE PRESENT",
  ],
  "health-treated-stable-periodontitis": [
    "HISTORY OF PERIODONTITIS WITH REDUCED ATTACHMENT/BONE LEVELS",
    "PPD <=4 MM",
    "NO SITE WITH PPD >=4 MM AND BOP",
    "BOP <10%",
    "NO EVIDENCE OF PROGRESSIVE PERIODONTAL DESTRUCTION",
  ],
  "inflammation-periodontitis-history": [
    "PROBING ATTACHMENT LOSS AND RADIOGRAPHIC BONE LOSS PRESENT",
    "BLEEDING SITES USED FOR THIS CATEGORY HAVE PPD <=3 MM",
    "BOP >=10%",
    "ASSESS SITES WITH PPD >=4 MM AND BOP FOR RECURRENT OR UNSTABLE PERIODONTITIS",
  ],
};

export function formatHealthGingivitisBlock(
  classification: PeriodontalClassification,
): string {
  const assessment = classification.gingivalHealth;
  if (!assessment.confirmed || !assessment.context) return "";
  const contextLabel = choiceLabel(
    healthGingivitisContextChoices,
    assessment.context,
  );
  const candidate = classifyGingivalHealthCandidate(classification);
  if (candidate.context === assessment.context) {
    return [
      `Health/Gingivitis: ${contextLabel}`,
      ...healthGingivitisCanonicalLines[assessment.context].map(
        (line) => `- ${line}`,
      ),
    ].join("\n");
  }

  const evidenceLines = [
    assessment.attachmentLoss === "absent"
      ? "NO PROBING ATTACHMENT LOSS"
      : assessment.attachmentLoss === "present"
      ? "PROBING ATTACHMENT LOSS PRESENT"
      : "",
    assessment.maximumPpd
      ? `MAXIMUM PPD: ${formatClinicalMeasurement(
          assessment.maximumPpd,
          "ascii",
        ).toUpperCase()}`
      : "",
    assessment.bopPercent
      ? `BOP: ${formatClinicalMeasurement(
          assessment.bopPercent,
          "ascii",
        ).toUpperCase()}`
      : "",
    assessment.radiographicBoneLoss === "absent"
      ? "NO RADIOGRAPHIC BONE LOSS"
      : assessment.radiographicBoneLoss === "present"
      ? "RADIOGRAPHIC BONE LOSS PRESENT"
      : "",
    assessment.ppd4OrGreaterWithBop === "no"
      ? "NO SITE WITH PPD >=4 MM AND BOP"
      : assessment.ppd4OrGreaterWithBop === "yes"
      ? "SITE WITH PPD >=4 MM AND BOP PRESENT"
      : "",
    assessment.progressiveDestruction === "no"
      ? "NO EVIDENCE OF PROGRESSIVE PERIODONTAL DESTRUCTION"
      : assessment.progressiveDestruction === "yes"
      ? "EVIDENCE OF PROGRESSIVE PERIODONTAL DESTRUCTION PRESENT"
      : "",
    assessment.overrideReason.trim()
      ? `CLINICIAN OVERRIDE: ${assessment.overrideReason.trim()}`
      : "",
  ].filter(Boolean);
  return [
    `Health/Gingivitis: ${contextLabel}`,
    ...evidenceLines.map((line) => `- ${line}`),
  ].join("\n");
}

export function formatSmokingModifier(
  modifier: SmokingModifier,
  notation: "clinical" | "ascii" = "clinical",
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
  notation: "clinical" | "ascii" = "clinical",
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
          notation,
        )}`
      : "diabetes present; HbA1c not entered";
  }
  return "";
}

export function choiceLabel<T extends string>(
  choices: readonly { value: T; label: string }[],
  value: T,
): string {
  return choices.find((choice) => choice.value === value)?.label ?? "";
}
