import catalogue from "@/lib/templates/catalogues/gingival-ioe.catalog.json";

export type RecareToothOption = {
  id: string;
  label: string;
  noteFragment: string;
  supportsTooth: boolean;
  requiresToothOrArea: boolean;
  supportsSurface: boolean;
  supportsActivity: boolean;
  supportsGrade: boolean;
  fixedGrade?: "M0";
  allowMultipleInstances: boolean;
  conflictsWithOptionIds: string[];
};

type RawOption = Omit<
  RecareToothOption,
  | "supportsTooth"
  | "requiresToothOrArea"
  | "supportsSurface"
  | "supportsActivity"
  | "supportsGrade"
  | "allowMultipleInstances"
  | "conflictsWithOptionIds"
> &
  Partial<RecareToothOption>;

const teeth = catalogue.normalizedSections.ioe.structures.find(
  (structure) => structure.id === "ioe.teeth"
);

export const recareToothOptions: RecareToothOption[] = (
  (teeth?.options ?? []) as RawOption[]
).map((option) => ({
  ...option,
  supportsTooth: Boolean(option.supportsTooth),
  requiresToothOrArea: Boolean(option.requiresToothOrArea),
  supportsSurface: Boolean(option.supportsSurface),
  supportsActivity: Boolean(option.supportsActivity),
  supportsGrade: Boolean(option.supportsGrade),
  allowMultipleInstances: Boolean(option.allowMultipleInstances),
  conflictsWithOptionIds: option.conflictsWithOptionIds ?? [],
}));

export const recareToothOptionById = new Map(
  recareToothOptions.map((option) => [option.id, option])
);
export const recareToothWnlOptionIds = [
  "ioe.teeth.intact",
  "ioe.teeth.no_caries",
  "ioe.teeth.no_mobility",
];
