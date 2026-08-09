import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import { patientChiefConcernSeedValues } from "@/lib/templates/patientChiefConcern";
import { cariesRiskFactorSeedValues } from "@/lib/templates/cariesRisk";
import type { TemplateLifecycleStatus } from "@/lib/templates/types";

export const CATALOGUE_STORAGE_KEY = "hygienenote.catalogues.v1";
export const CATALOGUE_EXPORT_FORMAT = "hygienenote-catalogue";
export const CATALOGUE_EXPORT_FORMAT_VERSION = 1;
export const MAX_CATALOGUE_LABEL_LENGTH = 200;
export const MAX_CATALOGUE_IMPORT_BYTES = 1024 * 1024;

export const CATALOGUE_KEYS = [
  "visit-team.dentist",
  "visit-team.rda",
  "visit-team.rdh",
  "patient.chief-concerns",
  "clinical-exam.molar-occlusion",
  "clinical-exam.skeletal-occlusion",
  "clinical-exam.additional-occlusal-findings",
  "clinical-exam.caries-risk-factors",
  "imaging.radiographs",
  "medical-history.review",
  "periodontal.fmp-done",
  "periodontal.health-gingivitis",
  "oral-hygiene.compliance",
  "oral-hygiene.aids-reviewed",
  "hygiene-treatment.completed",
  "recare-treatment.items",
  "hygiene-treatment.anesthetic",
  "hygiene-treatment.desensitizer",
  "scheduling.recall-interval",
  "scheduling.hygiene-interval",
  "scheduling.next-visit",
] as const;

export type CatalogueKey = (typeof CATALOGUE_KEYS)[number];
export type CatalogueOwner = "seed" | "user";

export const COMPLETED_CARE_CATEGORIES = [
  "exam",
  "instrumentation",
  "product-application",
  "preventive-procedure",
  "education",
  "other",
] as const;

export type CompletedCareCategory =
  (typeof COMPLETED_CARE_CATEGORIES)[number];

export const COMPLETED_CARE_CATEGORY_LABELS: Record<
  CompletedCareCategory,
  string
> = {
  exam: "Exams & diagnostics",
  instrumentation: "Instrumentation",
  "product-application": "Product applications",
  "preventive-procedure": "Preventive procedures",
  education: "Education",
  other: "Other completed care",
};

export type CompletedCareProcedure =
  | "radiographs"
  | "fmp"
  | "recare-exam"
  | "scaling"
  | "polish"
  | "ohe"
  | "product-application"
  | "preventive-procedure"
  | "other";

export type RadiographCatalogueMetadata = {
  kind: "radiograph";
  code: string;
  defaultQuantity: number;
};

export type CompletedCareCatalogueMetadata = {
  kind: "completed-care";
  category: CompletedCareCategory;
  procedure: CompletedCareProcedure;
  defaultQuantity?: number;
  defaultProduct?: string;
  defaultToothAreas?: string[];
};

export type CatalogueItemMetadata =
  | RadiographCatalogueMetadata
  | CompletedCareCatalogueMetadata;

export const CATALOGUE_SECTIONS = [
  "Visit Team",
  "Records and Chief Concern",
  "Clinical Exam",
  "Medical History",
  "Periodontal Assessment",
  "Oral Hygiene and Education",
  "Treatment",
  "Intervals and Next Visit",
] as const;

export type CatalogueSection = (typeof CATALOGUE_SECTIONS)[number];

export type CatalogueSeed = {
  id: string;
  label: string;
  metadata?: CatalogueItemMetadata;
};

export type CatalogueDefinition = {
  key: CatalogueKey;
  section: CatalogueSection;
  title: string;
  fieldLabels: string[];
  seeds: CatalogueSeed[];
  lifecycle: TemplateLifecycleStatus;
};

export type UserCatalogueItem = {
  id: string;
  catalogueKey: CatalogueKey;
  label: string;
  hidden: boolean;
  favorite: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  metadata?: CatalogueItemMetadata;
};

export type SeedPreference = {
  seedId: string;
  hidden: boolean;
  favorite: boolean;
  sortOrder: number;
};

export type StoredCatalogueStateV1 = {
  schemaVersion: 1;
  userItems: UserCatalogueItem[];
  seedPreferences: SeedPreference[];
};

export type CatalogueExportV1 = {
  format: typeof CATALOGUE_EXPORT_FORMAT;
  formatVersion: typeof CATALOGUE_EXPORT_FORMAT_VERSION;
  exportedAt: string;
  catalogueState: StoredCatalogueStateV1;
};

export type CatalogueItem = {
  id: string;
  catalogueKey: CatalogueKey;
  label: string;
  owner: CatalogueOwner;
  hidden: boolean;
  favorite: boolean;
  sortOrder: number;
  metadata?: CatalogueItemMetadata;
};

export type CatalogueImportPreview = {
  importedUserItems: number;
  importedSeedPreferences: number;
  additions: number;
  equivalentItems: number;
  idConflicts: number;
  itemsByCatalogue: Record<CatalogueKey, number>;
};

const occlusionSeeds = (prefix: "molar" | "skeletal"): CatalogueSeed[] => [
  { id: `seed.${prefix}.cl-i`, label: "Cl I" },
  { id: `seed.${prefix}.cl-ii`, label: "Cl II" },
  { id: `seed.${prefix}.cl-iii`, label: "Cl III" },
];

const additionalOcclusalFindingSeeds: CatalogueSeed[] = [
  { id: "seed.additional-occlusion.crowding", label: "Crowding" },
  { id: "seed.additional-occlusion.spacing", label: "Spacing" },
  { id: "seed.additional-occlusion.rotations", label: "Rotations" },
  { id: "seed.additional-occlusion.open-bite", label: "Open bite" },
  { id: "seed.additional-occlusion.crossbite", label: "Crossbite" },
  {
    id: "seed.additional-occlusion.increased-overjet",
    label: "Increased overjet",
  },
  {
    id: "seed.additional-occlusion.increased-overbite",
    label: "Increased overbite",
  },
];

function catalogueSeeds(
  prefix: string,
  values: ReadonlyArray<readonly [id: string, label: string]>,
): CatalogueSeed[] {
  return values.map(([id, label]) => ({
    id: `seed.${prefix}.${id}`,
    label,
  }));
}

const medicalHistoryReviewSeeds = catalogueSeeds("medical-history.review", [
  ["no-changes", "YES- NO CHANGES"],
  ["no-problems-cleared", "YES- NP- CLEARED, NO CONTRAINDICATIONS TO TX"],
  [
    "updated-no-contraindications",
    "YES- UPDATED, BUT NO CONTRAINDICATIONS TO TX",
  ],
  ["updated-meds", "YES- UPDATED MEDS"],
]);

const radiographSeeds: CatalogueSeed[] = [
  {
    id: "seed.imaging.radiographs.bitewings",
    label: "Bitewings",
    metadata: { kind: "radiograph", code: "BW", defaultQuantity: 4 },
  },
  {
    id: "seed.imaging.radiographs.periapicals",
    label: "Periapicals",
    metadata: { kind: "radiograph", code: "PA", defaultQuantity: 3 },
  },
  {
    id: "seed.imaging.radiographs.panoramic",
    label: "Panoramic",
    metadata: { kind: "radiograph", code: "PAN", defaultQuantity: 1 },
  },
];

const patientChiefConcernSeeds = catalogueSeeds(
  "patient.chief-concerns",
  patientChiefConcernSeedValues,
);

const cariesRiskFactorSeeds = catalogueSeeds(
  "clinical-exam.caries-risk-factors",
  cariesRiskFactorSeedValues,
);

const fmpDoneSeeds = catalogueSeeds("periodontal.fmp-done", [
  ["all-findings-discussed", "YES, ALL FINDINGS DISCUSSED WITH PATIENT"],
  ["completed-within-year", "NO, COMPLETED WITHIN A YEAR"],
  ["in-ortho", "NO, IN ORTHO"],
  ["not-applicable", "NO, NOT APPLICABLE"],
  ["ran-out-of-time", "NO, RAN OUT OF TIME - WILL EVALUATE AT NEXT VISIT"],
]);

const healthGingivitisSeeds = catalogueSeeds("periodontal.health-gingivitis", [
  ["health-intact-support", "HEALTH INTACT PERIODONTAL SUPPORT"],
  ["gingivitis-intact-support", "GINGIVITIS INTACT PERIODONTAL SUPPORT"],
  ["health-reduced-support", "HEALTH- REDUCED PERIODONTAL SUPPORT"],
  ["gingivitis-reduced-support", "GINGIVITIS- REDUCED PERIODONTAL SUPPORT"],
]);

const ohiAidsReviewedSeeds = catalogueSeeds("oral-hygiene.aids-reviewed", [
  ["bass-brushing-technique", "BASS-BRUSHING TECHNIQUE"],
  ["sulcabrush", "SULCABRUSH"],
  ["superfloss", "SUPERFLOSS"],
  ["floss-threaders", "FLOSS THREADERS"],
  ["c-shape-flossing", "C-SHAPE FLOSSING"],
  ["proper-tb-technique", "PROPER TOOTHBRUSHING TECHNIQUE"],
  ["interproximal-brush", "INTERPROXIMAL BRUSH"],
  ["soft-picks", "SOFT PICKS"],
  ["proper-use-etb", "PROPER USE OF ELECTRIC TOOTHBRUSH"],
]);

const oralHygieneComplianceSeeds = catalogueSeeds("oral-hygiene.compliance", [
  ["poor", "Poor"],
  ["fair", "Fair"],
  ["good", "Good"],
  ["excellent", "Excellent"],
  ["poor-fair", "Poor–fair"],
  ["fair-good", "Fair–good"],
]);

function completedCareSeed(
  id: string,
  label: string,
  metadata: Omit<CompletedCareCatalogueMetadata, "kind">,
): CatalogueSeed {
  return {
    id: `seed.hygiene-treatment.completed.${id}`,
    label,
    metadata: { kind: "completed-care", ...metadata },
  };
}

const treatmentCompletedSeeds: CatalogueSeed[] = [
  completedCareSeed("radiographs", "Radiographs", {
    category: "exam",
    procedure: "radiographs",
  }),
  completedCareSeed("fmp", "FMP", {
    category: "exam",
    procedure: "fmp",
    defaultToothAreas: ["full mouth"],
  }),
  completedCareSeed("dentist-recare-exam", "Dentist Recare Exam", {
    category: "exam",
    procedure: "recare-exam",
  }),
  completedCareSeed("scaling", "Scaling", {
    category: "instrumentation",
    procedure: "scaling",
    defaultQuantity: 3,
    defaultToothAreas: ["full mouth"],
  }),
  completedCareSeed("selective-polish", "Selective polish", {
    category: "instrumentation",
    procedure: "polish",
    defaultQuantity: 1,
    defaultProduct: "EnamelPro Strawberry with Fluoride",
  }),
  completedCareSeed("dyclonine-rinse", "Dyclonine 1% rinse 5 ml", {
    category: "product-application",
    procedure: "product-application",
    defaultToothAreas: ["full mouth"],
  }),
  completedCareSeed(
    "fluorimax-varnish",
    "FluoriMax 2.5% NaF Varnish application",
    {
      category: "product-application",
      procedure: "product-application",
      defaultToothAreas: ["full mouth"],
    },
  ),
  completedCareSeed(
    "advantage-arrest-sdf",
    "Advantage Arrest® Silver Diamine Fluoride 38% application",
    {
      category: "product-application",
      procedure: "product-application",
    },
  ),
  completedCareSeed("crystal-x-pur", "Crystal X-PUR", {
    category: "product-application",
    procedure: "product-application",
  }),
  completedCareSeed(
    "resin-sealant",
    "Sealant application, resin-based material",
    {
      category: "preventive-procedure",
      procedure: "preventive-procedure",
    },
  ),
  completedCareSeed("ohe", "OHE", {
    category: "education",
    procedure: "ohe",
  }),
];

const recareTreatmentSeeds = catalogueSeeds("recare-treatment.items", [
  ["hygiene-maintenance", "Hygiene maintenance"],
]);

const desensitizerSeeds = catalogueSeeds("hygiene-treatment.desensitizer", [
  ["none", "NONE"],
  ["prevident-fl", "PREVIDENT FL"],
  ["voco-fl", "VOCO FL"],
  ["crystal-x-pur", "crystal x-pur"],
]);

const recallIntervalSeeds = catalogueSeeds("scheduling.recall-interval", [
  ["12-month", "12-month recall"],
  ["6-month", "6-month recall"],
  ["9-month", "9-month recall"],
]);

const hygieneIntervalSeeds = catalogueSeeds("scheduling.hygiene-interval", [
  ["3-month", "3-month scale"],
  ["4-month", "4-month scale"],
  ["6-month", "6-month scale"],
  ["not-applicable", "N/A"],
]);

const nextVisitSeeds = catalogueSeeds("scheduling.next-visit", [
  ["6-mos-scale", "6 MONTH SCALE"],
  ["12-mrc", "12 MONTH RECALL"],
  ["3-mos-scale", "3 MONTH SCALE"],
  ["4-mos-scale", "4 MONTH SCALE"],
  ["6-mrc", "6 MONTH RECALL"],
  ["9-mrc", "9 MONTH RECALL"],
  ["follow-up-hygiene", "FOLLOW-UP HYGIENE"],
]);

export const CATALOGUE_DEFINITIONS: CatalogueDefinition[] = [
  {
    key: "visit-team.dentist",
    section: "Visit Team",
    title: "Dentist",
    fieldLabels: ["Dentist"],
    seeds: [],
    lifecycle: "pilot",
  },
  {
    key: "visit-team.rda",
    section: "Visit Team",
    title: "RDA",
    fieldLabels: ["RDA"],
    seeds: [],
    lifecycle: "pilot",
  },
  {
    key: "visit-team.rdh",
    section: "Visit Team",
    title: "RDH",
    fieldLabels: ["RDH"],
    seeds: [],
    lifecycle: "pilot",
  },
  {
    key: "patient.chief-concerns",
    section: "Records and Chief Concern",
    title: "Patient chief concerns",
    fieldLabels: ["Patient chief concern", "Patient's chief concern"],
    seeds: patientChiefConcernSeeds,
    lifecycle: "pilot",
  },
  {
    key: "clinical-exam.molar-occlusion",
    section: "Clinical Exam",
    title: "Molar occlusion",
    fieldLabels: ["Left molar occlusion", "Right molar occlusion"],
    seeds: occlusionSeeds("molar"),
    lifecycle: "pilot",
  },
  {
    key: "clinical-exam.skeletal-occlusion",
    section: "Clinical Exam",
    title: "Skeletal occlusion",
    fieldLabels: ["Skeletal occlusion"],
    seeds: occlusionSeeds("skeletal"),
    lifecycle: "pilot",
  },
  {
    key: "clinical-exam.additional-occlusal-findings",
    section: "Clinical Exam",
    title: "Additional occlusal findings",
    fieldLabels: ["Additional occlusal findings"],
    seeds: additionalOcclusalFindingSeeds,
    lifecycle: "pilot",
  },
  {
    key: "clinical-exam.caries-risk-factors",
    section: "Clinical Exam",
    title: "Caries risk factors",
    fieldLabels: ["Caries risk factors"],
    seeds: cariesRiskFactorSeeds,
    lifecycle: "pilot",
  },
  {
    key: "imaging.radiographs",
    section: "Records and Chief Concern",
    title: "Radiograph types",
    fieldLabels: ["Radiographs taken today"],
    seeds: radiographSeeds,
    lifecycle: "pilot",
  },
  {
    key: "medical-history.review",
    section: "Medical History",
    title: "Medical history reviewed",
    fieldLabels: ["Medical history reviewed"],
    seeds: medicalHistoryReviewSeeds,
    lifecycle: "pilot",
  },
  {
    key: "periodontal.fmp-done",
    section: "Periodontal Assessment",
    title: "FMP done",
    fieldLabels: ["FMP done"],
    seeds: fmpDoneSeeds,
    lifecycle: "pilot",
  },
  {
    key: "periodontal.health-gingivitis",
    section: "Periodontal Assessment",
    title: "Health/Gingivitis",
    fieldLabels: ["Health/Gingivitis"],
    seeds: healthGingivitisSeeds,
    lifecycle: "pilot",
  },
  {
    key: "oral-hygiene.compliance",
    section: "Oral Hygiene and Education",
    title: "Oral hygiene compliance",
    fieldLabels: ["Oral hygiene compliance"],
    seeds: oralHygieneComplianceSeeds,
    lifecycle: "pilot",
  },
  {
    key: "oral-hygiene.aids-reviewed",
    section: "Oral Hygiene and Education",
    title: "OH aids reviewed/recommended",
    fieldLabels: ["OH aids reviewed/recommended"],
    seeds: ohiAidsReviewedSeeds,
    lifecycle: "pilot",
  },
  {
    key: "recare-treatment.items",
    section: "Treatment",
    title: "Recare treatment options and plan",
    fieldLabels: ["Treatment Options", "Treatment Plan"],
    seeds: recareTreatmentSeeds,
    lifecycle: "pilot",
  },
  {
    key: "hygiene-treatment.completed",
    section: "Treatment",
    title: "Completed care",
    fieldLabels: ["Treatment completed today"],
    seeds: treatmentCompletedSeeds,
    lifecycle: "pilot",
  },
  {
    key: "hygiene-treatment.anesthetic",
    section: "Treatment",
    title: "Anesthetic",
    fieldLabels: ["Anesthetic"],
    seeds: [],
    lifecycle: "pilot",
  },
  {
    key: "hygiene-treatment.desensitizer",
    section: "Treatment",
    title: "Desensitizer",
    fieldLabels: ["Desensitizer"],
    seeds: desensitizerSeeds,
    lifecycle: "pilot",
  },
  {
    key: "scheduling.recall-interval",
    section: "Intervals and Next Visit",
    title: "Recommended recall interval",
    fieldLabels: ["Recommended recall interval"],
    seeds: recallIntervalSeeds,
    lifecycle: "pilot",
  },
  {
    key: "scheduling.hygiene-interval",
    section: "Intervals and Next Visit",
    title: "Recommended hygiene interval",
    fieldLabels: ["Recommended hygiene interval"],
    seeds: hygieneIntervalSeeds,
    lifecycle: "pilot",
  },
  {
    key: "scheduling.next-visit",
    section: "Intervals and Next Visit",
    title: "Next visit",
    fieldLabels: ["Next visit"],
    seeds: nextVisitSeeds,
    lifecycle: "pilot",
  },
];

export function getCatalogueDefinitionsForBuild(
  environment: string | undefined,
): CatalogueDefinition[] {
  return CATALOGUE_DEFINITIONS.filter((definition) =>
    isTemplateAvailableForBuild(definition.lifecycle, environment),
  );
}

const catalogueDefinitionsByKey = new Map(
  CATALOGUE_DEFINITIONS.map((definition) => [definition.key, definition]),
);

const seedsById = new Map(
  CATALOGUE_DEFINITIONS.flatMap((definition) =>
    definition.seeds.map((seed) => [
      seed.id,
      { ...seed, catalogueKey: definition.key },
    ]),
  ),
);

const legacyRadiographSeedAliases = new Map<string, string>([
  ["seed.imaging.radiographs.pan", "seed.imaging.radiographs.panoramic"],
  ["seed.imaging.radiographs.1-bw", "seed.imaging.radiographs.bitewings"],
  ["seed.imaging.radiographs.2-bw", "seed.imaging.radiographs.bitewings"],
  ["seed.imaging.radiographs.3-bw", "seed.imaging.radiographs.bitewings"],
  ["seed.imaging.radiographs.4-bw", "seed.imaging.radiographs.bitewings"],
  ["seed.imaging.radiographs.5-bw", "seed.imaging.radiographs.bitewings"],
  ["seed.imaging.radiographs.6-bw", "seed.imaging.radiographs.bitewings"],
  ["seed.imaging.radiographs.1-pa", "seed.imaging.radiographs.periapicals"],
  ["seed.imaging.radiographs.2-pa", "seed.imaging.radiographs.periapicals"],
]);

export class CatalogueValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogueValidationError";
  }
}

export function createEmptyCatalogueState(): StoredCatalogueStateV1 {
  return {
    schemaVersion: 1,
    userItems: [],
    seedPreferences: [],
  };
}

export function isCatalogueKey(value: unknown): value is CatalogueKey {
  return (
    typeof value === "string" &&
    (CATALOGUE_KEYS as readonly string[]).includes(value)
  );
}

export function getCatalogueDefinition(
  catalogueKey: CatalogueKey,
): CatalogueDefinition {
  const definition = catalogueDefinitionsByKey.get(catalogueKey);
  if (!definition) {
    throw new CatalogueValidationError(
      `Unknown catalogue key: ${catalogueKey}`,
    );
  }
  return definition;
}

export function normalizeCatalogueLabel(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en-CA");
}

export function validateCatalogueLabel(value: string): string {
  const label = value.trim().normalize("NFC");
  if (!label) {
    throw new CatalogueValidationError("Catalogue values cannot be empty.");
  }
  if (label.length > MAX_CATALOGUE_LABEL_LENGTH) {
    throw new CatalogueValidationError(
      `Catalogue values must be ${MAX_CATALOGUE_LABEL_LENGTH} characters or fewer.`,
    );
  }
  return label;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new CatalogueValidationError(`Invalid ${key} value.`);
  }
  return value;
}

function readString(
  record: Record<string, unknown>,
  key: string,
  maximumLength = 250,
): string {
  const value = record[key];
  if (typeof value !== "string" || !value || value.length > maximumLength) {
    throw new CatalogueValidationError(`Invalid ${key} value.`);
  }
  return value;
}

function readIdentifier(record: Record<string, unknown>, key: string): string {
  const value = readString(record, key, 200);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value)) {
    throw new CatalogueValidationError(`Invalid ${key} value.`);
  }
  return value;
}

function readSortOrder(record: Record<string, unknown>): number {
  const value = record.sortOrder;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new CatalogueValidationError("Invalid sortOrder value.");
  }
  return value;
}

function readTimestamp(record: Record<string, unknown>, key: string): string {
  const value = readString(record, key, 50);
  if (Number.isNaN(Date.parse(value))) {
    throw new CatalogueValidationError(`Invalid ${key} timestamp.`);
  }
  return value;
}

function readOptionalPositiveNumber(
  record: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new CatalogueValidationError(`Invalid ${key} value.`);
  }
  return value;
}

function readOptionalStringArray(
  record: Record<string, unknown>,
  key: string,
): string[] | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.length > 20 ||
    value.some(
      (item) =>
        typeof item !== "string" || !item.trim() || item.length > 200,
    )
  ) {
    throw new CatalogueValidationError(`Invalid ${key} value.`);
  }
  return value.map((item) => item.trim());
}

function parseCatalogueItemMetadata(
  value: unknown,
): CatalogueItemMetadata | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new CatalogueValidationError("Invalid catalogue metadata.");
  }
  if (value.kind === "radiograph") {
    const code = readString(value, "code", 20).trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9+./-]*$/.test(code)) {
      throw new CatalogueValidationError("Invalid radiograph code.");
    }
    const defaultQuantity = readOptionalPositiveNumber(
      value,
      "defaultQuantity",
    );
    if (!defaultQuantity || !Number.isSafeInteger(defaultQuantity)) {
      throw new CatalogueValidationError(
        "Radiograph defaultQuantity must be a positive whole number.",
      );
    }
    return { kind: "radiograph", code, defaultQuantity };
  }
  if (value.kind === "completed-care") {
    const category = value.category;
    const procedure = value.procedure;
    if (
      typeof category !== "string" ||
      !(COMPLETED_CARE_CATEGORIES as readonly string[]).includes(category)
    ) {
      throw new CatalogueValidationError("Invalid completed-care category.");
    }
    const procedures: CompletedCareProcedure[] = [
      "radiographs",
      "fmp",
      "recare-exam",
      "scaling",
      "polish",
      "ohe",
      "product-application",
      "preventive-procedure",
      "other",
    ];
    if (typeof procedure !== "string" || !procedures.includes(procedure as CompletedCareProcedure)) {
      throw new CatalogueValidationError("Invalid completed-care procedure.");
    }
    const defaultQuantity = readOptionalPositiveNumber(
      value,
      "defaultQuantity",
    );
    const defaultProduct =
      value.defaultProduct === undefined
        ? undefined
        : readString(value, "defaultProduct", 200).trim();
    const defaultToothAreas = readOptionalStringArray(
      value,
      "defaultToothAreas",
    );
    return {
      kind: "completed-care",
      category: category as CompletedCareCategory,
      procedure: procedure as CompletedCareProcedure,
      ...(defaultQuantity === undefined ? {} : { defaultQuantity }),
      ...(defaultProduct === undefined ? {} : { defaultProduct }),
      ...(defaultToothAreas === undefined ? {} : { defaultToothAreas }),
    };
  }
  throw new CatalogueValidationError("Invalid catalogue metadata kind.");
}

export function isRadiographCatalogueMetadata(
  metadata: CatalogueItemMetadata | undefined,
): metadata is RadiographCatalogueMetadata {
  return metadata?.kind === "radiograph";
}

export function isCompletedCareCatalogueMetadata(
  metadata: CatalogueItemMetadata | undefined,
): metadata is CompletedCareCatalogueMetadata {
  return metadata?.kind === "completed-care";
}

function parseUserItem(value: unknown): UserCatalogueItem {
  if (!isRecord(value)) {
    throw new CatalogueValidationError("Invalid user catalogue item.");
  }
  const catalogueKey = value.catalogueKey;
  if (!isCatalogueKey(catalogueKey)) {
    throw new CatalogueValidationError("Invalid catalogueKey value.");
  }
  return {
    id: readIdentifier(value, "id"),
    catalogueKey,
    label: validateCatalogueLabel(readString(value, "label", 500)),
    hidden: readBoolean(value, "hidden"),
    favorite: readBoolean(value, "favorite"),
    sortOrder: readSortOrder(value),
    createdAt: readTimestamp(value, "createdAt"),
    updatedAt: readTimestamp(value, "updatedAt"),
    ...(value.metadata === undefined
      ? {}
      : { metadata: parseCatalogueItemMetadata(value.metadata) }),
  };
}

function parseSeedPreference(value: unknown): SeedPreference {
  if (!isRecord(value)) {
    throw new CatalogueValidationError("Invalid seed preference.");
  }
  const storedSeedId = readIdentifier(value, "seedId");
  const seedId = legacyRadiographSeedAliases.get(storedSeedId) ?? storedSeedId;
  if (!seedsById.has(seedId)) {
    throw new CatalogueValidationError(`Unknown seed: ${seedId}`);
  }
  return {
    seedId,
    hidden: readBoolean(value, "hidden"),
    favorite: readBoolean(value, "favorite"),
    sortOrder: readSortOrder(value),
  };
}

function assertNoDuplicateStateRecords(
  userItems: UserCatalogueItem[],
  seedPreferences: SeedPreference[],
  options: { allowSeedDuplicates?: boolean } = {},
): void {
  const itemIds = new Set<string>();
  const labels = new Set<string>();
  const radiographCodes = new Map(
    getCatalogueDefinition("imaging.radiographs").seeds.flatMap((seed) =>
      isRadiographCatalogueMetadata(seed.metadata)
        ? [[seed.metadata.code, seed.label] as const]
        : [],
    ),
  );
  for (const item of userItems) {
    if (itemIds.has(item.id) || seedsById.has(item.id)) {
      throw new CatalogueValidationError(
        `Duplicate catalogue item id: ${item.id}`,
      );
    }
    itemIds.add(item.id);
    const labelKey = `${item.catalogueKey}:${normalizeCatalogueLabel(
      item.label,
    )}`;
    if (labels.has(labelKey)) {
      throw new CatalogueValidationError(
        `Duplicate value in ${item.catalogueKey}.`,
      );
    }
    const matchingSeed = getCatalogueDefinition(item.catalogueKey).seeds.some(
      (seed) =>
        normalizeCatalogueLabel(seed.label) ===
        normalizeCatalogueLabel(item.label),
    );
    if (matchingSeed && !options.allowSeedDuplicates) {
      throw new CatalogueValidationError(
        `Duplicate starter value in ${item.catalogueKey}.`,
      );
    }
    if (
      item.catalogueKey === "imaging.radiographs" &&
      isRadiographCatalogueMetadata(item.metadata)
    ) {
      const existingLabel = radiographCodes.get(item.metadata.code);
      if (existingLabel && !(matchingSeed && options.allowSeedDuplicates)) {
        throw new CatalogueValidationError(
          `Radiograph code ${item.metadata.code} is already used by ${existingLabel}.`,
        );
      }
      if (!existingLabel) radiographCodes.set(item.metadata.code, item.label);
    }
    labels.add(labelKey);
  }

  const preferenceIds = new Set<string>();
  for (const preference of seedPreferences) {
    if (preferenceIds.has(preference.seedId)) {
      throw new CatalogueValidationError(
        `Duplicate seed preference: ${preference.seedId}`,
      );
    }
    preferenceIds.add(preference.seedId);
  }
}

function migrateUserItemsMatchingSeeds(
  userItems: UserCatalogueItem[],
  seedPreferences: SeedPreference[],
): {
  userItems: UserCatalogueItem[];
  seedPreferences: SeedPreference[];
} {
  const retainedUserItems: UserCatalogueItem[] = [];
  const preferencesBySeedId = new Map(
    seedPreferences.map((preference) => [preference.seedId, preference]),
  );

  for (const item of userItems) {
    const matchingSeed = getCatalogueDefinition(item.catalogueKey).seeds.find(
      (seed) =>
        normalizeCatalogueLabel(seed.label) ===
        normalizeCatalogueLabel(item.label),
    );
    if (!matchingSeed) {
      retainedUserItems.push(item);
      continue;
    }
    if (!preferencesBySeedId.has(matchingSeed.id)) {
      preferencesBySeedId.set(matchingSeed.id, {
        seedId: matchingSeed.id,
        hidden: item.hidden,
        favorite: item.favorite,
        sortOrder: item.sortOrder,
      });
    }
  }

  return {
    userItems: retainedUserItems,
    seedPreferences: [...preferencesBySeedId.values()],
  };
}

export function parseCatalogueState(value: unknown): StoredCatalogueStateV1 {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    throw new CatalogueValidationError(
      "Unsupported catalogue storage version.",
    );
  }
  if (!Array.isArray(value.userItems)) {
    throw new CatalogueValidationError("Invalid userItems collection.");
  }
  if (!Array.isArray(value.seedPreferences)) {
    throw new CatalogueValidationError("Invalid seedPreferences collection.");
  }

  const userItems = value.userItems.map(parseUserItem);
  const seedPreferences = [
    ...new Map(
      value.seedPreferences
        .map(parseSeedPreference)
        .map((preference) => [preference.seedId, preference]),
    ).values(),
  ];
  assertNoDuplicateStateRecords(userItems, seedPreferences, {
    allowSeedDuplicates: true,
  });
  const migrated = migrateUserItemsMatchingSeeds(userItems, seedPreferences);
  assertNoDuplicateStateRecords(migrated.userItems, migrated.seedPreferences);

  return {
    schemaVersion: 1,
    userItems: migrated.userItems,
    seedPreferences: migrated.seedPreferences,
  };
}

export function parseStoredCatalogueJson(raw: string): StoredCatalogueStateV1 {
  try {
    return parseCatalogueState(JSON.parse(raw) as unknown);
  } catch (error) {
    if (error instanceof CatalogueValidationError) {
      throw error;
    }
    throw new CatalogueValidationError("Catalogue storage is not valid JSON.");
  }
}

export function serializeCatalogueState(state: StoredCatalogueStateV1): string {
  return JSON.stringify(parseCatalogueState(state));
}

export function readCatalogueState(
  storage: Pick<Storage, "getItem">,
): StoredCatalogueStateV1 {
  const raw = storage.getItem(CATALOGUE_STORAGE_KEY);
  return raw ? parseStoredCatalogueJson(raw) : createEmptyCatalogueState();
}

export function writeCatalogueState(
  storage: Pick<Storage, "setItem">,
  state: StoredCatalogueStateV1,
): void {
  storage.setItem(CATALOGUE_STORAGE_KEY, serializeCatalogueState(state));
}

function getSeedPreference(
  state: StoredCatalogueStateV1,
  seedId: string,
): SeedPreference | undefined {
  return state.seedPreferences.find(
    (preference) => preference.seedId === seedId,
  );
}

export function listCatalogueItems(
  state: StoredCatalogueStateV1,
  catalogueKey: CatalogueKey,
  options: { includeHidden?: boolean } = {},
): CatalogueItem[] {
  const definition = getCatalogueDefinition(catalogueKey);
  const seedItems = definition.seeds.map((seed, index): CatalogueItem => {
    const preference = getSeedPreference(state, seed.id);
    return {
      id: seed.id,
      catalogueKey,
      label: seed.label,
      owner: "seed",
      hidden: preference?.hidden ?? false,
      favorite: preference?.favorite ?? false,
      sortOrder: preference?.sortOrder ?? index,
      metadata: seed.metadata,
    };
  });
  const userItems = state.userItems
    .filter((item) => item.catalogueKey === catalogueKey)
    .map(
      (item): CatalogueItem => ({
        id: item.id,
        catalogueKey,
        label: item.label,
        owner: "user",
        hidden: item.hidden,
        favorite: item.favorite,
        sortOrder: item.sortOrder,
        metadata: item.metadata,
      }),
    );

  return [...seedItems, ...userItems]
    .filter((item) => options.includeHidden || !item.hidden)
    .sort(
      (left, right) =>
        Number(right.favorite) - Number(left.favorite) ||
        left.sortOrder - right.sortOrder ||
        left.label.localeCompare(right.label, "en-CA"),
    );
}

export function findEquivalentCatalogueItem(
  state: StoredCatalogueStateV1,
  catalogueKey: CatalogueKey,
  label: string,
): CatalogueItem | undefined {
  const normalized = normalizeCatalogueLabel(label);
  if (!normalized) {
    return undefined;
  }
  return listCatalogueItems(state, catalogueKey, {
    includeHidden: true,
  }).find((item) => normalizeCatalogueLabel(item.label) === normalized);
}

function assertCatalogueMetadataUnique(
  state: StoredCatalogueStateV1,
  catalogueKey: CatalogueKey,
  metadata: CatalogueItemMetadata | undefined,
  excludedItemId?: string,
): void {
  if (
    catalogueKey !== "imaging.radiographs" ||
    !isRadiographCatalogueMetadata(metadata)
  ) {
    return;
  }
  const duplicateCode = listCatalogueItems(state, catalogueKey, {
    includeHidden: true,
  }).find(
    (item) =>
      item.id !== excludedItemId &&
      isRadiographCatalogueMetadata(item.metadata) &&
      item.metadata.code === metadata.code,
  );
  if (duplicateCode) {
    throw new CatalogueValidationError(
      `Radiograph code ${metadata.code} is already used by ${duplicateCode.label}.`,
    );
  }
}

function updateSeedPreference(
  state: StoredCatalogueStateV1,
  seedId: string,
  changes: Partial<Omit<SeedPreference, "seedId">>,
): StoredCatalogueStateV1 {
  const seed = seedsById.get(seedId);
  if (!seed) {
    throw new CatalogueValidationError(`Unknown seed: ${seedId}`);
  }
  const existing = getSeedPreference(state, seedId);
  const definition = getCatalogueDefinition(seed.catalogueKey);
  const defaultOrder = definition.seeds.findIndex(
    (candidate) => candidate.id === seedId,
  );
  const next: SeedPreference = {
    seedId,
    hidden: existing?.hidden ?? false,
    favorite: existing?.favorite ?? false,
    sortOrder: existing?.sortOrder ?? defaultOrder,
    ...changes,
  };
  return {
    ...state,
    seedPreferences: [
      ...state.seedPreferences.filter(
        (preference) => preference.seedId !== seedId,
      ),
      next,
    ],
  };
}

export type RememberCatalogueValueResult = {
  state: StoredCatalogueStateV1;
  status: "added" | "existing" | "reactivated";
  item: CatalogueItem;
};

export function rememberCatalogueValue(
  state: StoredCatalogueStateV1,
  catalogueKey: CatalogueKey,
  value: string,
  options: {
    id?: string;
    now?: Date;
    metadata?: CatalogueItemMetadata;
  } = {},
): RememberCatalogueValueResult {
  getCatalogueDefinition(catalogueKey);
  const label = validateCatalogueLabel(value);
  const metadata = parseCatalogueItemMetadata(options.metadata);
  const existing = findEquivalentCatalogueItem(state, catalogueKey, label);
  assertCatalogueMetadataUnique(
    state,
    catalogueKey,
    metadata,
    existing?.id,
  );
  if (existing) {
    let nextState = state;
    let nextItem = existing;
    if (metadata && existing.owner === "user") {
      const updatedAt = (options.now ?? new Date()).toISOString();
      nextState = {
        ...nextState,
        userItems: nextState.userItems.map((item) =>
          item.id === existing.id ? { ...item, metadata, updatedAt } : item,
        ),
      };
      nextItem = { ...nextItem, metadata };
    }
    if (!existing.hidden) {
      return { state: nextState, status: "existing", item: nextItem };
    }
    nextState = setCatalogueItemHidden(
      nextState,
      existing.id,
      existing.owner,
      false,
    );
    return {
      state: nextState,
      status: "reactivated",
      item: { ...nextItem, hidden: false },
    };
  }

  const now = (options.now ?? new Date()).toISOString();
  const id =
    options.id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `catalogue-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const item: UserCatalogueItem = {
    id,
    catalogueKey,
    label,
    hidden: false,
    favorite: false,
    sortOrder: listCatalogueItems(state, catalogueKey, {
      includeHidden: true,
    }).length,
    createdAt: now,
    updatedAt: now,
    ...(metadata ? { metadata } : {}),
  };
  return {
    state: { ...state, userItems: [...state.userItems, item] },
    status: "added",
    item: { ...item, owner: "user" },
  };
}

export function updateUserCatalogueItem(
  state: StoredCatalogueStateV1,
  itemId: string,
  labelValue: string,
  now = new Date(),
  metadata?: CatalogueItemMetadata,
): StoredCatalogueStateV1 {
  const item = state.userItems.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new CatalogueValidationError("The catalogue item no longer exists.");
  }
  const label = validateCatalogueLabel(labelValue);
  const validatedMetadata =
    metadata === undefined ? undefined : parseCatalogueItemMetadata(metadata);
  assertCatalogueMetadataUnique(
    state,
    item.catalogueKey,
    validatedMetadata,
    itemId,
  );
  const duplicate = listCatalogueItems(state, item.catalogueKey, {
    includeHidden: true,
  }).find(
    (candidate) =>
      candidate.id !== itemId &&
      normalizeCatalogueLabel(candidate.label) ===
        normalizeCatalogueLabel(label),
  );
  if (duplicate) {
    throw new CatalogueValidationError(
      "That value already exists in this catalogue.",
    );
  }
  return {
    ...state,
    userItems: state.userItems.map((candidate) =>
      candidate.id === itemId
        ? {
            ...candidate,
            label,
            updatedAt: now.toISOString(),
            ...(validatedMetadata === undefined
              ? {}
              : { metadata: validatedMetadata }),
          }
        : candidate,
    ),
  };
}

export function setCatalogueItemHidden(
  state: StoredCatalogueStateV1,
  itemId: string,
  owner: CatalogueOwner,
  hidden: boolean,
): StoredCatalogueStateV1 {
  if (owner === "seed") {
    return updateSeedPreference(state, itemId, { hidden });
  }
  if (!state.userItems.some((item) => item.id === itemId)) {
    throw new CatalogueValidationError("The catalogue item no longer exists.");
  }
  return {
    ...state,
    userItems: state.userItems.map((item) =>
      item.id === itemId ? { ...item, hidden } : item,
    ),
  };
}

export function setCatalogueItemFavorite(
  state: StoredCatalogueStateV1,
  itemId: string,
  owner: CatalogueOwner,
  favorite: boolean,
): StoredCatalogueStateV1 {
  if (owner === "seed") {
    return updateSeedPreference(state, itemId, { favorite });
  }
  if (!state.userItems.some((item) => item.id === itemId)) {
    throw new CatalogueValidationError("The catalogue item no longer exists.");
  }
  return {
    ...state,
    userItems: state.userItems.map((item) =>
      item.id === itemId ? { ...item, favorite } : item,
    ),
  };
}

export function favoriteAndUnhideCatalogueItem(
  state: StoredCatalogueStateV1,
  itemId: string,
  owner: CatalogueOwner,
): StoredCatalogueStateV1 {
  return setCatalogueItemHidden(
    setCatalogueItemFavorite(state, itemId, owner, true),
    itemId,
    owner,
    false,
  );
}

export function deleteUserCatalogueItem(
  state: StoredCatalogueStateV1,
  itemId: string,
): StoredCatalogueStateV1 {
  if (!state.userItems.some((item) => item.id === itemId)) {
    throw new CatalogueValidationError("The catalogue item no longer exists.");
  }
  return {
    ...state,
    userItems: state.userItems.filter((item) => item.id !== itemId),
  };
}

function setItemSortOrder(
  state: StoredCatalogueStateV1,
  item: CatalogueItem,
  sortOrder: number,
): StoredCatalogueStateV1 {
  if (item.owner === "seed") {
    return updateSeedPreference(state, item.id, { sortOrder });
  }
  return {
    ...state,
    userItems: state.userItems.map((candidate) =>
      candidate.id === item.id ? { ...candidate, sortOrder } : candidate,
    ),
  };
}

export function moveCatalogueItem(
  state: StoredCatalogueStateV1,
  catalogueKey: CatalogueKey,
  itemId: string,
  direction: "up" | "down",
): StoredCatalogueStateV1 {
  const items = listCatalogueItems(state, catalogueKey, {
    includeHidden: true,
  });
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) {
    throw new CatalogueValidationError("The catalogue item no longer exists.");
  }
  const current = items[index];
  const sameGroup = items.filter((item) => item.favorite === current.favorite);
  const groupIndex = sameGroup.findIndex((item) => item.id === itemId);
  const targetIndex = direction === "up" ? groupIndex - 1 : groupIndex + 1;
  if (targetIndex < 0 || targetIndex >= sameGroup.length) {
    return state;
  }
  const reordered = [...sameGroup];
  [reordered[groupIndex], reordered[targetIndex]] = [
    reordered[targetIndex],
    reordered[groupIndex],
  ];
  return reordered.reduce(
    (nextState, item, sortOrder) =>
      setItemSortOrder(nextState, item, sortOrder),
    state,
  );
}

export function createCatalogueExport(
  state: StoredCatalogueStateV1,
  exportedAt = new Date(),
): CatalogueExportV1 {
  return {
    format: CATALOGUE_EXPORT_FORMAT,
    formatVersion: CATALOGUE_EXPORT_FORMAT_VERSION,
    exportedAt: exportedAt.toISOString(),
    catalogueState: parseCatalogueState(state),
  };
}

export function serializeCatalogueExport(
  state: StoredCatalogueStateV1,
  exportedAt = new Date(),
): string {
  return `${JSON.stringify(
    createCatalogueExport(state, exportedAt),
    null,
    2,
  )}\n`;
}

export function parseCatalogueExport(raw: string): CatalogueExportV1 {
  if (new TextEncoder().encode(raw).byteLength > MAX_CATALOGUE_IMPORT_BYTES) {
    throw new CatalogueValidationError(
      "Catalogue files must be 1 MiB or smaller.",
    );
  }
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    throw new CatalogueValidationError("The selected file is not valid JSON.");
  }
  if (!isRecord(value)) {
    throw new CatalogueValidationError("Invalid catalogue export.");
  }
  if (value.format !== CATALOGUE_EXPORT_FORMAT) {
    throw new CatalogueValidationError("This is not a HygieneNote catalogue.");
  }
  if (value.formatVersion !== CATALOGUE_EXPORT_FORMAT_VERSION) {
    throw new CatalogueValidationError(
      "This catalogue export version is not supported.",
    );
  }
  const exportedAt = value.exportedAt;
  if (typeof exportedAt !== "string" || Number.isNaN(Date.parse(exportedAt))) {
    throw new CatalogueValidationError("Invalid export timestamp.");
  }
  return {
    format: CATALOGUE_EXPORT_FORMAT,
    formatVersion: CATALOGUE_EXPORT_FORMAT_VERSION,
    exportedAt,
    catalogueState: parseCatalogueState(value.catalogueState),
  };
}

export function previewCatalogueImport(
  localState: StoredCatalogueStateV1,
  importedState: StoredCatalogueStateV1,
): CatalogueImportPreview {
  const itemsByCatalogue = Object.fromEntries(
    CATALOGUE_KEYS.map((key) => [key, 0]),
  ) as Record<CatalogueKey, number>;
  let additions = 0;
  let equivalentItems = 0;
  let idConflicts = 0;

  for (const imported of importedState.userItems) {
    itemsByCatalogue[imported.catalogueKey] += 1;
    const equivalent = findEquivalentCatalogueItem(
      localState,
      imported.catalogueKey,
      imported.label,
    );
    if (equivalent) {
      equivalentItems += 1;
    } else if (localState.userItems.some((local) => local.id === imported.id)) {
      idConflicts += 1;
    } else {
      additions += 1;
    }
  }

  return {
    importedUserItems: importedState.userItems.length,
    importedSeedPreferences: importedState.seedPreferences.length,
    additions,
    equivalentItems,
    idConflicts,
    itemsByCatalogue,
  };
}

export function mergeCatalogueStates(
  localState: StoredCatalogueStateV1,
  importedState: StoredCatalogueStateV1,
): StoredCatalogueStateV1 {
  let nextState = parseCatalogueState(localState);

  for (const imported of importedState.userItems) {
    const equivalent = findEquivalentCatalogueItem(
      nextState,
      imported.catalogueKey,
      imported.label,
    );
    if (equivalent) {
      if (imported.favorite && !equivalent.favorite) {
        nextState = setCatalogueItemFavorite(
          nextState,
          equivalent.id,
          equivalent.owner,
          true,
        );
      }
      continue;
    }
    if (nextState.userItems.some((local) => local.id === imported.id)) {
      continue;
    }
    nextState = {
      ...nextState,
      userItems: [...nextState.userItems, imported],
    };
  }

  for (const imported of importedState.seedPreferences) {
    const local = getSeedPreference(nextState, imported.seedId);
    if (!local) {
      nextState = {
        ...nextState,
        seedPreferences: [...nextState.seedPreferences, imported],
      };
    } else if (imported.favorite && !local.favorite) {
      nextState = updateSeedPreference(nextState, imported.seedId, {
        favorite: true,
      });
    }
  }

  return parseCatalogueState(nextState);
}

export function formatCatalogueExportFilename(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `hygienenote-catalogue-${year}-${month}-${day}.json`;
}
