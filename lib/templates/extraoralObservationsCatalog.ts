export const extraoralSideOptions = ["Left", "Right"] as const;

export function extraoralLateralityToSides(laterality: string): string[] {
  if (laterality === "Bilateral") return [...extraoralSideOptions];
  return extraoralSideOptions.includes(
    laterality as (typeof extraoralSideOptions)[number],
  )
    ? [laterality]
    : [];
}

export function extraoralSidesToLaterality(sides: string[]): string {
  const selected = new Set(sides);
  if (selected.has("Left") && selected.has("Right")) return "Bilateral";
  if (selected.has("Left")) return "Left";
  if (selected.has("Right")) return "Right";
  return "";
}

export const extraoralTmjClickingStatusOptions = [
  "Symptomatic",
  "Asymptomatic",
] as const;

export const extraoralTmjClickingPhaseOptions = [
  "On open",
  "On close",
] as const;

export const extraoralLymphNodeLocationOptions = [
  "Submandibular",
  "Sublingual",
] as const;

export const extraoralLymphNodeSwellingOptions = [
  "Slightly enlarged",
  "Very swollen",
] as const;

export type RecareExtraoralFinding = {
  optionId: string;
  laterality?: string;
  statuses?: string[];
  phases?: string[];
  locations?: string[];
  swelling?: string[];
};

export type RecareExtraoralOption = {
  id: string;
  label: string;
  noteFragment: string;
  statusOptions: readonly string[];
  phaseOptions: readonly string[];
  locationOptions: readonly string[];
  swellingOptions: readonly string[];
  defaultStatuses: string[];
  defaultPhases: string[];
};

/** EOE choices shared by the Very short template and Recare Exam. */
export const recareExtraoralOptions: RecareExtraoralOption[] = [
  {
    id: "eoe.tmj_clicking",
    label: "TMJ clicking",
    noteFragment: "TMJ clicking",
    statusOptions: extraoralTmjClickingStatusOptions,
    phaseOptions: extraoralTmjClickingPhaseOptions,
    locationOptions: [],
    swellingOptions: [],
    defaultStatuses: ["Asymptomatic"],
    defaultPhases: ["On open"],
  },
  {
    id: "eoe.palpable_lymph_nodes",
    label: "Palpable",
    noteFragment: "palpable lymph nodes",
    statusOptions: [],
    phaseOptions: [],
    locationOptions: extraoralLymphNodeLocationOptions,
    swellingOptions: extraoralLymphNodeSwellingOptions,
    defaultStatuses: [],
    defaultPhases: [],
  },
];

export const recareExtraoralOptionById = new Map(
  recareExtraoralOptions.map((option) => [option.id, option] as const),
);

export function createRecareExtraoralFinding(
  optionId: string,
): RecareExtraoralFinding {
  const option = recareExtraoralOptionById.get(optionId);
  return {
    optionId,
    laterality: "",
    statuses: [...(option?.defaultStatuses ?? [])],
    phases: [...(option?.defaultPhases ?? [])],
    locations: [],
    swelling: [],
  };
}
