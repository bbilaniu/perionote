import {
  isCompletedCareCatalogueMetadata,
  type CatalogueItem,
  type CompletedCareCategory,
} from "@/lib/catalogues/catalogue";

export type HygieneProcedureKind =
  | "scaling"
  | "polish"
  | "radiograph"
  | "recare-exam"
  | "ohe";

export type HygieneInstrumentationMethod = "hand" | "power";
export type HygieneProcedureSource =
  | "radiographs"
  | "recare-exam"
  | "standard-treatment"
  | "ohe";
export type RadiographType = "BW" | "PA" | "PAN";

export const defaultPolishingProduct = {
  label: "Enamel Pro® Prophy Paste with Fluoride (Strawberry)",
  productName: "Enamel Pro® Prophy Paste",
  flavour: "Strawberry",
  containsFluoride: true,
} as const;

export type AdultHygieneTreatmentCompletedEntry = {
  id: string;
  treatmentType: string;
  toothAreas: string[];
  applicationTime?: string;
  procedureKind?: HygieneProcedureKind;
  procedureSource?: HygieneProcedureSource;
  quantity?: string;
  instrumentation?: HygieneInstrumentationMethod[];
  powerDevice?: string;
  product?: string;
  productName?: string;
  productFlavour?: string;
  productContainsFluoride?: boolean;
  details?: string;
  detailsCustomized?: boolean;
  radiographType?: RadiographType;
  careCategory?: CompletedCareCategory;
  catalogueItemId?: string;
};

export type AdultHygieneTreatmentPresetEntry = Omit<
  AdultHygieneTreatmentCompletedEntry,
  "id"
>;

export const standardTreatmentCompletedPreset: readonly AdultHygieneTreatmentPresetEntry[] = [
  {
    treatmentType: "Dyclonine 1% rinse 5 ml",
    toothAreas: ["full mouth"],
    procedureSource: "standard-treatment",
    careCategory: "product-application",
  },
  {
    treatmentType: "FMP",
    toothAreas: ["full mouth"],
    procedureSource: "standard-treatment",
    careCategory: "exam",
  },
  {
    treatmentType: "Scaling",
    toothAreas: ["full mouth"],
    procedureKind: "scaling",
    procedureSource: "standard-treatment",
    quantity: "3",
    instrumentation: ["hand", "power"],
    powerDevice: "Cavitron",
    careCategory: "instrumentation",
  },
  {
    treatmentType: "Selective polish",
    toothAreas: [],
    procedureKind: "polish",
    procedureSource: "standard-treatment",
    quantity: "1",
    product: defaultPolishingProduct.label,
    productName: defaultPolishingProduct.productName,
    productFlavour: defaultPolishingProduct.flavour,
    productContainsFluoride: defaultPolishingProduct.containsFluoride,
    careCategory: "instrumentation",
  },
  {
    treatmentType: "OHE",
    toothAreas: [],
    procedureKind: "ohe",
    procedureSource: "ohe",
    details: "",
    detailsCustomized: false,
    careCategory: "education",
  },
  {
    treatmentType: "FluoriMax 2.5% NaF Varnish application",
    toothAreas: ["full mouth"],
    procedureSource: "standard-treatment",
    careCategory: "product-application",
  },
] as const;

export const recareExamTreatmentPreset = {
  treatmentType: "Dentist Recare Exam",
  toothAreas: [],
  procedureKind: "recare-exam",
  procedureSource: "recare-exam",
  careCategory: "exam",
} as const satisfies AdultHygieneTreatmentPresetEntry;

export function createTreatmentEntryFromCatalogueItem(
  item: CatalogueItem,
  id: string,
  oheRecap = "",
): AdultHygieneTreatmentCompletedEntry | null {
  const metadata = isCompletedCareCatalogueMetadata(item.metadata)
    ? item.metadata
    : undefined;
  if (metadata?.procedure === "radiographs") return null;

  const base: AdultHygieneTreatmentCompletedEntry = {
    id,
    treatmentType: item.label,
    toothAreas: [...(metadata?.defaultToothAreas ?? [])],
    careCategory: metadata?.category ?? "other",
    catalogueItemId: item.id,
  };

  switch (metadata?.procedure) {
    case "scaling":
      return {
        ...base,
        procedureKind: "scaling",
        quantity: String(metadata.defaultQuantity ?? 3),
        instrumentation: ["hand", "power"],
        powerDevice: "Cavitron",
      };
    case "polish":
      return {
        ...base,
        procedureKind: "polish",
        quantity: String(metadata.defaultQuantity ?? 1),
        product: metadata.defaultProduct ?? defaultPolishingProduct.label,
        productName: defaultPolishingProduct.productName,
        productFlavour: defaultPolishingProduct.flavour,
        productContainsFluoride: defaultPolishingProduct.containsFluoride,
      };
    case "recare-exam":
      return { ...base, procedureKind: "recare-exam" };
    case "ohe":
      return {
        ...base,
        procedureKind: "ohe",
        procedureSource: "ohe",
        details: oheRecap,
        detailsCustomized: false,
      };
    default:
      return base;
  }
}

function normalized(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-CA");
}

function cleanQuantity(value: string | undefined): string {
  const clean = value?.trim() ?? "";
  if (!clean) return "";
  const numeric = Number(clean);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";
  return String(numeric);
}

export function inferredHygieneProcedureKind(
  entry: Pick<AdultHygieneTreatmentCompletedEntry, "procedureKind" | "treatmentType">,
): HygieneProcedureKind | undefined {
  if (entry.procedureKind) return entry.procedureKind;
  const treatment = normalized(entry.treatmentType);
  if (/(?:\bscale\b|\bscaling\b)/.test(treatment)) return "scaling";
  if (/\bpolish/.test(treatment)) return "polish";
  if (/\b(rec|recall|recare).*exam|dentist.*exam|dds.*exam/.test(treatment)) {
    return "recare-exam";
  }
  if (treatment === "ohe") return "ohe";
  return undefined;
}

export function treatmentCompletedEntryIdentity(
  entry: Pick<
    AdultHygieneTreatmentCompletedEntry,
    "procedureKind" | "procedureSource" | "treatmentType" | "toothAreas"
  >,
): string {
  const kind = inferredHygieneProcedureKind(entry);
  if (kind) return `procedure:${kind}`;
  return `legacy:${normalized(entry.treatmentType)}|${entry.toothAreas
    .map(normalized)
    .join("|")}`;
}

function formatAreas(value: string[]): string[] {
  return value.map((area) => area.trim()).filter(Boolean);
}

function formatStructuredScaling(
  entry: AdultHygieneTreatmentCompletedEntry,
): string {
  const areas = formatAreas(entry.toothAreas);
  const fullMouthOnly =
    areas.length === 1 && normalized(areas[0]) === "full mouth";
  const methods = new Set(entry.instrumentation ?? []);
  const hand = methods.has("hand");
  const power = methods.has("power");
  const powerDevice = entry.powerDevice?.trim() || "power";
  const instrumentation =
    hand && power
      ? ` with hand and ${powerDevice} instrumentation`
      : hand
        ? " with hand instrumentation"
        : power
          ? ` with ${powerDevice} instrumentation`
          : "";
  const quantity = cleanQuantity(entry.quantity);
  const units = quantity ? ` (${quantity}U Scale)` : "";
  const treatment = `${fullMouthOnly ? "Full mouth scaling" : "Scaling"}${instrumentation}${units}`;
  return !fullMouthOnly && areas.length
    ? `${treatment} — ${areas.join(", ")}`
    : treatment;
}

function formatStructuredPolish(
  entry: AdultHygieneTreatmentCompletedEntry,
): string {
  const product = entry.product?.trim();
  const quantity = cleanQuantity(entry.quantity);
  const areas = formatAreas(entry.toothAreas);
  const treatment = `Selective polish${product ? ` with ${product}` : ""}${
    quantity ? ` (${quantity}U Polish)` : ""
  }`;
  return areas.length ? `${treatment} — ${areas.join(", ")}` : treatment;
}

export function parseRadiographSelection(value: string): {
  type: RadiographType;
  quantity: string;
} | null {
  const clean = value.trim();
  if (/^pan$/i.test(clean)) return { type: "PAN", quantity: "1" };
  const match = clean.match(/^(\d+(?:\.\d+)?)\s*(BW|PA|PAN)$/i);
  if (!match) return null;
  return {
    type: match[2].toUpperCase() as RadiographType,
    quantity: cleanQuantity(match[1]),
  };
}

export function formatRadiographSelection(
  type: RadiographType,
  quantity: string,
): string {
  const clean = cleanQuantity(quantity);
  if (!clean) return "";
  return type === "PAN" && clean === "1" ? "PAN" : `${clean} ${type}`;
}

function formatStructuredRadiograph(
  entry: AdultHygieneTreatmentCompletedEntry,
): string {
  if (entry.radiographType) {
    return formatRadiographSelection(
      entry.radiographType,
      entry.quantity || "1",
    );
  }
  return entry.details?.trim() || entry.treatmentType.trim();
}

export function formatAdultHygieneTreatmentEntry(
  entry: AdultHygieneTreatmentCompletedEntry,
  orderAreas: (areas: string[]) => string[],
  isDyclonine: (value: string) => boolean,
): string {
  if (entry.procedureKind === "scaling") {
    return formatStructuredScaling({
      ...entry,
      toothAreas: orderAreas(entry.toothAreas),
    });
  }
  if (entry.procedureKind === "polish") {
    return formatStructuredPolish({
      ...entry,
      toothAreas: orderAreas(entry.toothAreas),
    });
  }
  if (entry.procedureKind === "radiograph") {
    return formatStructuredRadiograph(entry);
  }
  if (entry.procedureKind === "recare-exam") {
    return entry.treatmentType.trim() || "Dentist Recare Exam";
  }
  if (entry.procedureKind === "ohe") {
    const details = entry.details?.trim();
    return details ? `OHE on proper home care (${details})` : "OHE";
  }

  const treatmentType = entry.treatmentType.trim();
  if (!treatmentType) return "";
  const toothAreas = orderAreas(entry.toothAreas);
  const treatmentWithAreas = toothAreas.length
    ? `${treatmentType} — ${toothAreas.join(", ")}`
    : treatmentType;
  const applicationTime = entry.applicationTime?.trim() ?? "";
  return isDyclonine(treatmentType) && applicationTime
    ? `${treatmentWithAreas}${
        toothAreas.length ? ";" : " —"
      } time of application/use: ${applicationTime}`
    : treatmentWithAreas;
}

export function formatAdultHygieneTreatmentCompletedEntries(
  entries: AdultHygieneTreatmentCompletedEntry[],
  orderAreas: (areas: string[]) => string[],
  isDyclonine: (value: string) => boolean,
): string {
  const completed = entries
    .map((entry) =>
      formatAdultHygieneTreatmentEntry(entry, orderAreas, isDyclonine),
    )
    .filter(Boolean);
  return completed.length
    ? `Treatment completed today: ${completed.join("; ")}`
    : "";
}

export function syncRadiographTreatmentEntries(
  entries: AdultHygieneTreatmentCompletedEntry[],
  radiographs: string[],
): AdultHygieneTreatmentCompletedEntry[] {
  const linked = radiographs
    .map((radiograph) => radiograph.trim())
    .filter(Boolean)
    .map((radiograph, index) => {
      const parsed = parseRadiographSelection(radiograph);
      return {
        id: `linked-radiograph-${parsed?.type ?? "other"}-${index}`,
        treatmentType: radiograph,
        toothAreas: [],
        procedureKind: "radiograph" as const,
        procedureSource: "radiographs" as const,
        careCategory: "exam" as const,
        ...(parsed
          ? { radiographType: parsed.type, quantity: parsed.quantity }
          : { details: radiograph }),
      };
    });
  return [
    ...linked,
    ...entries.filter((entry) => entry.procedureSource !== "radiographs"),
  ];
}

export interface OheTreatmentRecapSource {
  homeCareInstructionReviewed: boolean;
  standardOheStatementApplies: boolean;
  oheTopicsReviewed: string[];
  oheNotes: string;
}

export function buildOheTreatmentRecap(
  value: OheTreatmentRecapSource,
): string {
  const topics = new Set(value.oheTopicsReviewed);
  const standard = value.standardOheStatementApplies;
  const parts: string[] = [];
  const selectedBass = topics.delete("Bass brushing");
  const selectedCShape = topics.delete("C-shape flossing technique");
  const selectedFluoride = topics.delete(
    "Review benefits of Prevident or Opti-Rinse",
  );
  const hasBass = standard || selectedBass;
  const hasCShape = standard || selectedCShape;
  const hasFluoride = standard || selectedFluoride;

  if (hasBass) {
    parts.push(
      value.homeCareInstructionReviewed
        ? "Bass brushing at least twice daily"
        : "Bass brushing",
    );
  } else if (value.homeCareInstructionReviewed) {
    parts.push("brushing at least twice daily");
  }
  if (hasCShape) {
    parts.push(
      value.homeCareInstructionReviewed
        ? "C-shape flossing at least daily"
        : "C-shape flossing technique",
    );
  } else if (value.homeCareInstructionReviewed) {
    parts.push("flossing at least daily");
  }
  if (hasFluoride) parts.push("benefits of fluoride");
  parts.push(...topics);
  if (value.oheNotes.trim()) parts.push(value.oheNotes.trim());
  return parts.join("; ");
}

export function syncDerivedOheTreatmentDetails(
  entries: AdultHygieneTreatmentCompletedEntry[],
  recap: string,
): AdultHygieneTreatmentCompletedEntry[] {
  return entries.map((entry) =>
    entry.procedureKind === "ohe" && !entry.detailsCustomized
      ? { ...entry, details: recap }
      : entry,
  );
}
