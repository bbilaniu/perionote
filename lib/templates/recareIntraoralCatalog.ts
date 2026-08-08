import catalogue from "@/docs/requests/2026-07-28_gingival-description-and-ioe/hygienenote-gingival-ioe.catalog.json";

export type RecareIntraoralFinding = {
  optionId: string;
  structureId: string;
  locations?: string[];
  laterality?: string;
  measurement?: string;
  measurementUnit?: string;
  comment?: string;
};

export type RecareIntraoralOption = {
  id: string;
  label: string;
  noteFragment: string;
  classification: "normal" | "abnormal" | "normal_variation";
  supportsLocation: boolean;
  supportsLaterality: boolean;
  supportsMeasurement: boolean;
  measurementUnits: string[];
};

export type RecareIntraoralStructure = {
  id: string;
  label: string;
  supportsComment: boolean;
  options: RecareIntraoralOption[];
};

export type RecareIntraoralQuickPreset = {
  label: string;
  optionId: string;
  laterality?: string;
  locations?: string[];
};

const includedStructureIds = new Set([
  "ioe.buccal_mucosa",
  "ioe.tongue",
  "ioe.floor_of_mouth",
  "ioe.palate",
  "ioe.oropharynx",
  "ioe.saliva",
]);

type RawOption = {
  id: string;
  label: string;
  noteFragment: string;
  classification?: "normal" | "abnormal" | "normal_variation";
  supportsLocation?: boolean;
  supportsLaterality?: boolean;
  supportsMeasurement?: boolean;
  measurementUnit?: string;
  measurementUnits?: string[];
};

const supplementalOptionsByStructureId: Readonly<
  Record<string, RecareIntraoralOption[]>
> = {
  "ioe.floor_of_mouth": [
    {
      id: "ioe.floor_of_mouth.mandibular_tori",
      label: "Mandibular tori",
      noteFragment: "mandibular tori",
      classification: "normal_variation",
      supportsLocation: false,
      supportsLaterality: true,
      supportsMeasurement: false,
      measurementUnits: [],
    },
  ],
};

export const recareIntraoralStructures: RecareIntraoralStructure[] =
  catalogue.normalizedSections.ioe.structures
    .filter((structure) => includedStructureIds.has(structure.id))
    .map((structure) => ({
      id: structure.id,
      label: structure.label,
      supportsComment: Boolean(structure.supportsComment),
      options: [
        ...(structure.options as RawOption[]).map((option) => ({
          id: option.id,
          label: option.label,
          noteFragment: option.noteFragment,
          classification: option.classification ?? "abnormal",
          supportsLocation: Boolean(option.supportsLocation),
          supportsLaterality: Boolean(option.supportsLaterality),
          supportsMeasurement: Boolean(option.supportsMeasurement),
          measurementUnits:
            option.measurementUnits ??
            (option.measurementUnit ? [option.measurementUnit] : []),
        })),
        ...(supplementalOptionsByStructureId[structure.id] ?? []),
      ],
    }));

export const recareIntraoralOptionById = new Map(
  recareIntraoralStructures.flatMap((structure) =>
    structure.options.map(
      (option) => [option.id, { structure, option }] as const
    )
  )
);

const recareIntraoralConflictPairs = [
  ["ioe.buccal_mucosa.no_lesions", "ioe.buccal_mucosa.ulcer"],
  ["ioe.buccal_mucosa.no_lesions", "ioe.buccal_mucosa.white_patch"],
  ["ioe.buccal_mucosa.no_lesions", "ioe.buccal_mucosa.red_patch"],
  ["ioe.buccal_mucosa.no_swelling", "ioe.buccal_mucosa.swelling"],
  ["ioe.tongue.no_lesions", "ioe.tongue.lesion"],
  ["ioe.floor_of_mouth.no_swelling", "ioe.floor_of_mouth.swelling"],
  ["ioe.floor_of_mouth.no_discoloration", "ioe.floor_of_mouth.blue_discoloration"],
  ["ioe.floor_of_mouth.no_discoloration", "ioe.floor_of_mouth.black_discoloration"],
  ["ioe.palate.no_lesions", "ioe.palate.ulcer"],
  ["ioe.palate.no_lesions", "ioe.palate.red_patch"],
  ["ioe.palate.no_lesions", "ioe.palate.white_patch"],
  ["ioe.palate.no_abnormal_growths", "ioe.palate.torus_palatinus"],
  ["ioe.oropharynx.uvula_midline", "ioe.oropharynx.asymmetry"],
  ["ioe.oropharynx.no_redness", "ioe.oropharynx.redness"],
  ["ioe.oropharynx.no_swelling", "ioe.oropharynx.swelling"],
  ["ioe.oropharynx.no_exudate", "ioe.oropharynx.exudate"],
  ["ioe.saliva.normal_flow", "ioe.saliva.reduced_flow"],
] as const;

/** Options that cannot appear together in a clinically coherent observation. */
export const recareIntraoralOptionConflicts: ReadonlyMap<string, ReadonlySet<string>> =
  recareIntraoralConflictPairs.reduce((conflicts, [first, second]) => {
    conflicts.set(first, new Set([...(conflicts.get(first) ?? []), second]));
    conflicts.set(second, new Set([...(conflicts.get(second) ?? []), first]));
    return conflicts;
  }, new Map<string, Set<string>>());

export const recareNormalStructuredObservationIds = [
  "ioe.buccal_mucosa.pink",
  "ioe.buccal_mucosa.moist",
  "ioe.buccal_mucosa.no_lesions",
  "ioe.buccal_mucosa.no_swelling",
  "ioe.tongue.pink",
  "ioe.tongue.moist",
  "ioe.tongue.symmetrical",
  "ioe.tongue.no_lesions",
  "ioe.floor_of_mouth.pink",
  "ioe.floor_of_mouth.smooth",
  "ioe.floor_of_mouth.no_swelling",
  "ioe.floor_of_mouth.no_discoloration",
  "ioe.palate.pink",
  "ioe.palate.intact",
  "ioe.palate.no_lesions",
  "ioe.palate.no_abnormal_growths",
  "ioe.oropharynx.uvula_midline",
  "ioe.oropharynx.no_redness",
  "ioe.oropharynx.no_swelling",
  "ioe.oropharynx.no_exudate",
  "ioe.saliva.clear",
  "ioe.saliva.normal_flow",
] as const;

export function createRecareNormalStructuredIntraoralFindings(): RecareIntraoralFinding[] {
  return recareNormalStructuredObservationIds.flatMap((optionId) => {
    const definition = recareIntraoralOptionById.get(optionId);
    return definition
      ? [{ optionId, structureId: definition.structure.id }]
      : [];
  });
}

export const recareIntraoralLocationChoices = [
  "Anterior",
  "Posterior",
  "Right",
  "Left",
  "Maxilla",
  "Mandible",
] as const;

export const recareIntraoralQuickPresets: RecareIntraoralQuickPreset[] = [
  { label: "Coated tongue", optionId: "ioe.tongue.coated" },
  { label: "Fissured tongue", optionId: "ioe.tongue.fissured" },
  { label: "Scalloped tongue", optionId: "ioe.tongue.scalloped_edges" },
  {
    label: "Bilateral linea alba",
    optionId: "ioe.buccal_mucosa.linea_alba",
    laterality: "Bilateral",
  },
  {
    label: "Palatine torus at midline",
    optionId: "ioe.palate.torus_palatinus",
    locations: ["Midline"],
  },
  {
    label: "Bilateral mandibular tori",
    optionId: "ioe.floor_of_mouth.mandibular_tori",
    laterality: "Bilateral",
  },
];
