export type Cambra123AgeBand = "0-6" | "6-adult";
export type Cambra123CompletionStatus =
  | "not-started"
  | "in-progress"
  | "complete";
export type Cambra123ZeroToSixRiskLevel =
  | ""
  | "Low"
  | "Moderate"
  | "High"
  | "Very High";
export type Cambra123SixAdultRiskLevel =
  | ""
  | "Low"
  | "Moderate"
  | "High"
  | "Extreme";

export type Cambra123Column = 1 | 2 | 3;
export type Cambra123ItemKind =
  | "protective"
  | "risk"
  | "disease-indicator";
export type Cambra123AssessmentPhase = "question" | "clinical-exam";

export interface Cambra123SixAdultItem {
  id: string;
  label: string;
  column: Cambra123Column;
  score: -1 | 2 | 3;
  kind: Cambra123ItemKind;
  phase: Cambra123AssessmentPhase;
}

export interface Cambra123ZeroToSixItem {
  id: string;
  label: string;
  column: Cambra123Column;
  score: -1 | 2 | 3;
  kind: Cambra123ItemKind;
  phase: Cambra123AssessmentPhase;
}

/**
 * CAMBRA123 (January 2021), ages 0–6. Item wording and order follow Table 1
 * (Part 1) in the UCSF-hosted practical guidelines.
 */
export const cambra123ZeroToSixItems = [
  {
    id: "protective.fluoridated-water-area",
    label: "Child lives in a fluoridated drinking-water area",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.drinks-fluoridated-water",
    label: "Child drinks fluoridated water",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.f-toothpaste-twice-daily",
    label:
      "Fluoride toothpaste at least twice daily (smear for ages 0–2; pea-sized amount for ages 3–6; 1,000 ppm fluoride)",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.f-varnish-six-months",
    label: "Fluoride varnish within the last 6 months",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "risk.frequent-snacking",
    label: "Frequent snacking (more than 3 times daily)",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.bottle-nonspill-cup",
    label: "Bottle or non-spill cup contains anything other than water",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.household-recent-decay",
    label:
      "Parent, primary caregiver, or sibling has current decay or a recent history of decay",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.low-socioeconomic-health-literacy",
    label: "Family has low socioeconomic and/or low health-literacy status",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.hyposalivatory-medications",
    label: "Medications that induce hyposalivation",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.heavy-plaque",
    label: "Heavy plaque on the teeth",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "clinical-exam",
  },
  {
    id: "disease.evident-decay-white-spots",
    label: "Evident tooth decay or white spot lesions",
    column: 3,
    score: 3,
    kind: "disease-indicator",
    phase: "clinical-exam",
  },
  {
    id: "disease.recent-restorations",
    label:
      "Restorations in the last 2 years (new patient) or the last year (patient of record)",
    column: 3,
    score: 3,
    kind: "disease-indicator",
    phase: "clinical-exam",
  },
] as const satisfies readonly Cambra123ZeroToSixItem[];

export type Cambra123ZeroToSixItemId =
  (typeof cambra123ZeroToSixItems)[number]["id"];
export type Cambra123ZeroToSixItemDefinition =
  (typeof cambra123ZeroToSixItems)[number];

export interface Cambra123ZeroToSixAssessment {
  instrument: "cambra-2021";
  ageBand: "0-6";
  completionStatus: Cambra123CompletionStatus;
  yesItemIds: Cambra123ZeroToSixItemId[];
  severeOrExtensiveRecentDecay: boolean;
  finalRiskLevel: Cambra123ZeroToSixRiskLevel;
  notes: string;
}

export interface Cambra123ZeroToSixResult {
  protectiveYesCount: number;
  riskYesCount: number;
  diseaseIndicatorYesCount: number;
  column1Score: number;
  column2Score: number;
  column3Score: number;
  totalScore: number;
  scoreLevel: Exclude<Cambra123ZeroToSixRiskLevel, "">;
  suggestedLevel: Cambra123ZeroToSixRiskLevel;
  reasons: string[];
  warnings: string[];
}

const zeroToSixItemById: ReadonlyMap<string, Cambra123ZeroToSixItem> = new Map(
  cambra123ZeroToSixItems.map((item) => [item.id, item]),
);

export function createEmptyCambra123ZeroToSixAssessment(): Cambra123ZeroToSixAssessment {
  return {
    instrument: "cambra-2021",
    ageBand: "0-6",
    completionStatus: "not-started",
    yesItemIds: [],
    severeOrExtensiveRecentDecay: false,
    finalRiskLevel: "",
    notes: "",
  };
}

export function copyCambra123ZeroToSixAssessment(
  assessment: Cambra123ZeroToSixAssessment,
): Cambra123ZeroToSixAssessment {
  return { ...assessment, yesItemIds: [...assessment.yesItemIds] };
}

export function hasCambra123ZeroToSixContent(
  assessment: Cambra123ZeroToSixAssessment,
): boolean {
  return (
    assessment.completionStatus !== "not-started" ||
    assessment.yesItemIds.length > 0 ||
    assessment.severeOrExtensiveRecentDecay ||
    Boolean(assessment.finalRiskLevel) ||
    Boolean(assessment.notes.trim())
  );
}

function zeroToSixScoreLevel(
  totalScore: number,
): Exclude<Cambra123ZeroToSixRiskLevel, ""> {
  if (totalScore >= 14) return "Very High";
  if (totalScore >= 4) return "High";
  if (totalScore >= 0) return "Moderate";
  return "Low";
}

export function assessCambra123ZeroToSix(
  assessment: Cambra123ZeroToSixAssessment,
): Cambra123ZeroToSixResult {
  const recognizedIds = new Set<Cambra123ZeroToSixItemId>();
  let unrecognizedCount = 0;
  for (const id of assessment.yesItemIds) {
    if (zeroToSixItemById.has(id)) recognizedIds.add(id);
    else unrecognizedCount += 1;
  }

  const selectedItems = [...recognizedIds]
    .map((id) => zeroToSixItemById.get(id))
    .filter((item): item is Cambra123ZeroToSixItem => Boolean(item));
  const protectiveYesCount = selectedItems.filter(
    (item) => item.kind === "protective",
  ).length;
  const riskYesCount = selectedItems.filter(
    (item) => item.kind === "risk",
  ).length;
  const diseaseIndicatorYesCount = selectedItems.filter(
    (item) => item.kind === "disease-indicator",
  ).length;
  const column1Score = -protectiveYesCount;
  const column2Score = riskYesCount * 2;
  const column3Score = diseaseIndicatorYesCount * 3;
  const totalScore = column1Score + column2Score + column3Score;
  const quantitativeLevel = zeroToSixScoreLevel(totalScore);
  const reasons: string[] = [
    `CAMBRA123 score ${totalScore}: ${column1Score} protective + ${column2Score} risk + ${column3Score} disease-indicator points.`,
  ];
  const warnings: string[] = [];

  let suggestedLevel: Cambra123ZeroToSixRiskLevel = quantitativeLevel;
  const hasHighGuidanceFactor =
    diseaseIndicatorYesCount > 0 ||
    recognizedIds.has("risk.household-recent-decay");
  if (
    hasHighGuidanceFactor &&
    (suggestedLevel === "Low" || suggestedLevel === "Moderate")
  ) {
    suggestedLevel = "High";
    reasons.push(
      diseaseIndicatorYesCount > 0
        ? "One or more disease indicators most likely signals at least High risk under the CAMBRA guidelines."
        : "Current or recent decay in a parent, primary caregiver, or sibling most likely signals at least High risk under the CAMBRA guidelines.",
    );
  }
  if (
    assessment.severeOrExtensiveRecentDecay &&
    suggestedLevel === "High"
  ) {
    suggestedLevel = "Very High";
    reasons.push(
      "High risk with extensive or severe recent/existing decay most likely signals Very High risk.",
    );
  }

  if (unrecognizedCount) {
    warnings.push(
      `${unrecognizedCount} stored ${
        unrecognizedCount === 1 ? "item is" : "items are"
      } not recognized by the CAMBRA123 2021 ages 0–6 instrument.`,
    );
  }
  if (
    assessment.severeOrExtensiveRecentDecay &&
    suggestedLevel !== "Very High"
  ) {
    warnings.push(
      "The extensive/severe decay modifier supports Very High guidance only when the assessment otherwise indicates High risk.",
    );
  }
  warnings.push(
    "The score is a decision aid. The final caries-risk category remains the clinician's determination.",
  );

  return {
    protectiveYesCount,
    riskYesCount,
    diseaseIndicatorYesCount,
    column1Score,
    column2Score,
    column3Score,
    totalScore,
    scoreLevel: quantitativeLevel,
    suggestedLevel,
    reasons,
    warnings,
  };
}

export function cambra123ZeroToSixItemsByKind(
  assessment: Pick<Cambra123ZeroToSixAssessment, "yesItemIds">,
  kind: Cambra123ItemKind,
): Cambra123ZeroToSixItem[] {
  const selected = new Set(assessment.yesItemIds);
  return cambra123ZeroToSixItems.filter(
    (item) => item.kind === kind && selected.has(item.id),
  );
}

/**
 * CAMBRA123 (January 2021), ages 6 through adult. Item wording and order
 * follow Table 2 (Part 1) in the UCSF-hosted practical guidelines.
 */
export const cambra123SixAdultItems = [
  {
    id: "protective.fluoridated-water",
    label: "Fluoridated water",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.f-toothpaste-daily",
    label: "Fluoride toothpaste at least once a day",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.f-toothpaste-twice-daily",
    label: "Fluoride toothpaste twice daily or more",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.5000-ppm-f-toothpaste",
    label: "5,000 ppm fluoride toothpaste",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.f-varnish-six-months",
    label: "Fluoride varnish within the last 6 months",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.naf-mouthrinse-daily",
    label: "0.05% sodium fluoride mouthrinse daily",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.chlorhexidine-monthly",
    label:
      "0.12% chlorhexidine gluconate mouthrinse daily for 7 days monthly",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "protective.normal-salivary-function",
    label: "Normal salivary function",
    column: 1,
    score: -1,
    kind: "protective",
    phase: "question",
  },
  {
    id: "risk.frequent-snacking",
    label: "Frequent snacking (more than 3 times daily)",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.hyposalivatory-medications",
    label: "Hyposalivatory medications",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.recreational-drug-use",
    label: "Recreational drug use",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "question",
  },
  {
    id: "risk.heavy-plaque",
    label: "Heavy plaque on the teeth",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "clinical-exam",
  },
  {
    id: "risk.reduced-salivary-function",
    label: "Reduced salivary function (measured low flow rate)",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "clinical-exam",
  },
  {
    id: "risk.deep-pits-fissures",
    label: "Deep pits and fissures",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "clinical-exam",
  },
  {
    id: "risk.exposed-roots",
    label: "Exposed tooth roots",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "clinical-exam",
  },
  {
    id: "risk.orthodontic-appliances",
    label: "Orthodontic appliances",
    column: 2,
    score: 2,
    kind: "risk",
    phase: "clinical-exam",
  },
  {
    id: "disease.new-dentin-cavities",
    label: "New cavities or lesions into dentin (radiographically)",
    column: 3,
    score: 3,
    kind: "disease-indicator",
    phase: "clinical-exam",
  },
  {
    id: "disease.new-white-spots",
    label: "New white spot lesions on smooth surfaces",
    column: 3,
    score: 3,
    kind: "disease-indicator",
    phase: "clinical-exam",
  },
  {
    id: "disease.new-enamel-lesions",
    label: "New non-cavitated lesions in enamel (radiographically)",
    column: 3,
    score: 3,
    kind: "disease-indicator",
    phase: "clinical-exam",
  },
  {
    id: "disease.recent-restorations",
    label:
      "Existing restorations in the last 3 years (new patient) or the last year (patient of record)",
    column: 3,
    score: 3,
    kind: "disease-indicator",
    phase: "clinical-exam",
  },
] as const satisfies readonly Cambra123SixAdultItem[];

export type Cambra123SixAdultItemId =
  (typeof cambra123SixAdultItems)[number]["id"];
export type Cambra123SixAdultItemDefinition =
  (typeof cambra123SixAdultItems)[number];

export interface Cambra123SixAdultAssessment {
  instrument: "cambra-2021";
  ageBand: "6-adult";
  completionStatus: Cambra123CompletionStatus;
  yesItemIds: Cambra123SixAdultItemId[];
  finalRiskLevel: Cambra123SixAdultRiskLevel;
  notes: string;
}

export interface Cambra123SixAdultResult {
  protectiveYesCount: number;
  riskYesCount: number;
  diseaseIndicatorYesCount: number;
  column1Score: number;
  column2Score: number;
  column3Score: number;
  totalScore: number;
  scoreLevel: Exclude<Cambra123SixAdultRiskLevel, "">;
  suggestedLevel: Cambra123SixAdultRiskLevel;
  reasons: string[];
  warnings: string[];
}

const sixAdultItemById: ReadonlyMap<string, Cambra123SixAdultItem> = new Map(
  cambra123SixAdultItems.map((item) => [item.id, item]),
);

export function createEmptyCambra123SixAdultAssessment(): Cambra123SixAdultAssessment {
  return {
    instrument: "cambra-2021",
    ageBand: "6-adult",
    completionStatus: "not-started",
    yesItemIds: [],
    finalRiskLevel: "",
    notes: "",
  };
}

export function copyCambra123SixAdultAssessment(
  assessment: Cambra123SixAdultAssessment,
): Cambra123SixAdultAssessment {
  return { ...assessment, yesItemIds: [...assessment.yesItemIds] };
}

export function hasCambra123SixAdultContent(
  assessment: Cambra123SixAdultAssessment,
): boolean {
  return (
    assessment.completionStatus !== "not-started" ||
    assessment.yesItemIds.length > 0 ||
    Boolean(assessment.finalRiskLevel) ||
    Boolean(assessment.notes.trim())
  );
}

function scoreLevel(totalScore: number): Exclude<Cambra123SixAdultRiskLevel, ""> {
  if (totalScore >= 18) return "Extreme";
  if (totalScore >= 3) return "High";
  if (totalScore >= -1) return "Moderate";
  return "Low";
}

export function assessCambra123SixAdult(
  assessment: Cambra123SixAdultAssessment,
): Cambra123SixAdultResult {
  const recognizedIds = new Set<Cambra123SixAdultItemId>();
  let unrecognizedCount = 0;
  for (const id of assessment.yesItemIds) {
    if (sixAdultItemById.has(id)) recognizedIds.add(id);
    else unrecognizedCount += 1;
  }

  const selectedItems = [...recognizedIds]
    .map((id) => sixAdultItemById.get(id))
    .filter((item): item is Cambra123SixAdultItem => Boolean(item));
  const protectiveYesCount = selectedItems.filter(
    (item) => item.kind === "protective",
  ).length;
  const riskYesCount = selectedItems.filter(
    (item) => item.kind === "risk",
  ).length;
  const diseaseIndicatorYesCount = selectedItems.filter(
    (item) => item.kind === "disease-indicator",
  ).length;
  const column1Score = -protectiveYesCount;
  const column2Score = riskYesCount * 2;
  const column3Score = diseaseIndicatorYesCount * 3;
  const totalScore = column1Score + column2Score + column3Score;
  const quantitativeLevel = scoreLevel(totalScore);
  const reasons: string[] = [
    `CAMBRA123 score ${totalScore}: ${column1Score} protective + ${column2Score} risk + ${column3Score} disease-indicator points.`,
  ];
  const warnings: string[] = [];

  let suggestedLevel: Cambra123SixAdultRiskLevel = quantitativeLevel;
  if (
    diseaseIndicatorYesCount > 0 &&
    (suggestedLevel === "Low" || suggestedLevel === "Moderate")
  ) {
    suggestedLevel = "High";
    reasons.push(
      "One or more disease indicators most likely signals at least High risk under the CAMBRA guidelines.",
    );
  }
  if (
    suggestedLevel === "High" &&
    recognizedIds.has("risk.reduced-salivary-function")
  ) {
    suggestedLevel = "Extreme";
    reasons.push(
      "High risk with measured reduced salivary function most likely signals Extreme risk.",
    );
  }

  if (unrecognizedCount) {
    warnings.push(
      `${unrecognizedCount} stored ${
        unrecognizedCount === 1 ? "item is" : "items are"
      } not recognized by the CAMBRA123 2021 ages 6–adult instrument.`,
    );
  }
  warnings.push(
    "The score is a decision aid. The final caries-risk category remains the clinician's determination.",
  );

  return {
    protectiveYesCount,
    riskYesCount,
    diseaseIndicatorYesCount,
    column1Score,
    column2Score,
    column3Score,
    totalScore,
    scoreLevel: quantitativeLevel,
    suggestedLevel,
    reasons,
    warnings,
  };
}

export function cambra123SixAdultItemsByKind(
  assessment: Pick<Cambra123SixAdultAssessment, "yesItemIds">,
  kind: Cambra123ItemKind,
): Cambra123SixAdultItem[] {
  const selected = new Set(assessment.yesItemIds);
  return cambra123SixAdultItems.filter(
    (item) => item.kind === kind && selected.has(item.id),
  );
}
