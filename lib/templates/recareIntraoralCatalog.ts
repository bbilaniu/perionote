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
  supportsLocation?: boolean;
  supportsLaterality?: boolean;
  supportsMeasurement?: boolean;
  measurementUnit?: string;
  measurementUnits?: string[];
};

export const recareIntraoralStructures: RecareIntraoralStructure[] =
  catalogue.normalizedSections.ioe.structures
    .filter((structure) => includedStructureIds.has(structure.id))
    .map((structure) => ({
      id: structure.id,
      label: structure.label,
      supportsComment: Boolean(structure.supportsComment),
      options: (structure.options as RawOption[]).map((option) => ({
        id: option.id,
        label: option.label,
        noteFragment: option.noteFragment,
        supportsLocation: Boolean(option.supportsLocation),
        supportsLaterality: Boolean(option.supportsLaterality),
        supportsMeasurement: Boolean(option.supportsMeasurement),
        measurementUnits:
          option.measurementUnits ??
          (option.measurementUnit ? [option.measurementUnit] : []),
      })),
    }));

export const recareIntraoralOptionById = new Map(
  recareIntraoralStructures.flatMap((structure) =>
    structure.options.map(
      (option) => [option.id, { structure, option }] as const
    )
  )
);

export const recareIntraoralLocationChoices = [
  "Anterior",
  "Posterior",
  "Right",
  "Left",
  "Maxilla",
  "Mandible",
] as const;
