import {
  type CatalogueItem,
  type CatalogueKey,
  type StoredCatalogueStateV1,
  listCatalogueItems,
} from "@/lib/catalogues/catalogue";

export const PROVIDER_DEFAULTS_STORAGE_KEY =
  "hygienenote.provider-defaults.v1";

export const PROVIDER_CATALOGUE_KEYS = [
  "visit-team.dentist",
  "visit-team.rda",
  "visit-team.rdh",
] as const satisfies readonly CatalogueKey[];

export type ProviderCatalogueKey = (typeof PROVIDER_CATALOGUE_KEYS)[number];

export type StoredProviderDefaultsV1 = {
  format: "hygienenote-provider-defaults";
  schemaVersion: 1;
  defaults: Partial<Record<ProviderCatalogueKey, string>>;
};

export class ProviderDefaultsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderDefaultsValidationError";
  }
}

export function createEmptyProviderDefaults(): StoredProviderDefaultsV1 {
  return {
    format: "hygienenote-provider-defaults",
    schemaVersion: 1,
    defaults: {},
  };
}

export function isProviderCatalogueKey(
  value: CatalogueKey,
): value is ProviderCatalogueKey {
  return (PROVIDER_CATALOGUE_KEYS as readonly CatalogueKey[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProviderDefaults(
  value: unknown,
): StoredProviderDefaultsV1 {
  if (
    !isRecord(value) ||
    value.format !== "hygienenote-provider-defaults" ||
    value.schemaVersion !== 1 ||
    !isRecord(value.defaults)
  ) {
    throw new ProviderDefaultsValidationError(
      "Unsupported provider-defaults storage version.",
    );
  }

  const defaults: StoredProviderDefaultsV1["defaults"] = {};
  for (const [catalogueKey, itemId] of Object.entries(value.defaults)) {
    if (
      !PROVIDER_CATALOGUE_KEYS.includes(
        catalogueKey as ProviderCatalogueKey,
      ) ||
      typeof itemId !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(itemId)
    ) {
      throw new ProviderDefaultsValidationError(
        "Invalid provider default.",
      );
    }
    defaults[catalogueKey as ProviderCatalogueKey] = itemId;
  }

  return {
    format: "hygienenote-provider-defaults",
    schemaVersion: 1,
    defaults,
  };
}

export function parseStoredProviderDefaultsJson(
  raw: string,
): StoredProviderDefaultsV1 {
  try {
    return parseProviderDefaults(JSON.parse(raw) as unknown);
  } catch (error) {
    if (error instanceof ProviderDefaultsValidationError) throw error;
    throw new ProviderDefaultsValidationError(
      "Provider-defaults storage is not valid JSON.",
    );
  }
}

export function readProviderDefaults(
  storage: Pick<Storage, "getItem">,
): StoredProviderDefaultsV1 {
  const raw = storage.getItem(PROVIDER_DEFAULTS_STORAGE_KEY);
  return raw
    ? parseStoredProviderDefaultsJson(raw)
    : createEmptyProviderDefaults();
}

export function writeProviderDefaults(
  storage: Pick<Storage, "setItem">,
  state: StoredProviderDefaultsV1,
): void {
  storage.setItem(
    PROVIDER_DEFAULTS_STORAGE_KEY,
    JSON.stringify(parseProviderDefaults(state)),
  );
}

export function setProviderDefault(
  defaults: StoredProviderDefaultsV1,
  catalogueState: StoredCatalogueStateV1,
  catalogueKey: ProviderCatalogueKey,
  itemId: string,
): StoredProviderDefaultsV1 {
  const item = listCatalogueItems(catalogueState, catalogueKey).find(
    (candidate) => candidate.id === itemId,
  );
  if (!item) {
    throw new ProviderDefaultsValidationError(
      "Choose a visible saved provider before setting a default.",
    );
  }
  return {
    ...defaults,
    defaults: { ...defaults.defaults, [catalogueKey]: item.id },
  };
}

export function clearProviderDefault(
  defaults: StoredProviderDefaultsV1,
  catalogueKey: ProviderCatalogueKey,
): StoredProviderDefaultsV1 {
  const nextDefaults = { ...defaults.defaults };
  delete nextDefaults[catalogueKey];
  return { ...defaults, defaults: nextDefaults };
}

export function getProviderDefaultItem(
  defaults: StoredProviderDefaultsV1,
  catalogueState: StoredCatalogueStateV1,
  catalogueKey: ProviderCatalogueKey,
): CatalogueItem | undefined {
  const itemId = defaults.defaults[catalogueKey];
  if (!itemId) return undefined;
  return listCatalogueItems(catalogueState, catalogueKey).find(
    (item) => item.id === itemId,
  );
}

export function reconcileProviderDefaults(
  defaults: StoredProviderDefaultsV1,
  catalogueState: StoredCatalogueStateV1,
): StoredProviderDefaultsV1 {
  return PROVIDER_CATALOGUE_KEYS.reduce(
    (next, catalogueKey) =>
      getProviderDefaultItem(next, catalogueState, catalogueKey)
        ? next
        : clearProviderDefault(next, catalogueKey),
    defaults,
  );
}
