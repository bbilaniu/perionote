export const INTERACTIVE_DRAFT_STORAGE_PREFIX =
  "hygienenote.interactive-draft.v1.";
export const INTERACTIVE_DRAFT_SCHEMA_VERSION = 1;
export const INTERACTIVE_DRAFT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export type InteractiveDraft<T> = {
  kind: "hygienenote.interactive-draft";
  schemaVersion: typeof INTERACTIVE_DRAFT_SCHEMA_VERSION;
  templateId: string;
  draftId: string;
  savedAt: string;
  startedAt: string;
  form: T;
};

export type InteractiveDraftProfessional = {
  role: "Dentist" | "RDA" | "RDH";
  name: string;
};

export type InteractiveDraftSummary = Omit<
  InteractiveDraft<unknown>,
  "form" | "kind" | "schemaVersion"
> & {
  patientId: string;
  professionals: InteractiveDraftProfessional[];
};

const interactiveDraftProfessionalFields = [
  { role: "Dentist", field: "dentist" },
  { role: "RDA", field: "rda" },
  { role: "RDH", field: "rdh" },
] as const;

type StorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function hasUnsupportedDraftSchema(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const value: unknown = JSON.parse(raw);
    return (
      isRecord(value) &&
      value.kind === "hygienenote.interactive-draft" &&
      typeof value.schemaVersion === "number" &&
      value.schemaVersion > INTERACTIVE_DRAFT_SCHEMA_VERSION
    );
  } catch {
    return false;
  }
}

export function matchesDraftShape(value: unknown, exemplar: unknown): boolean {
  if (Array.isArray(exemplar)) {
    if (!Array.isArray(value)) return false;
    if (!exemplar.length) return true;
    return value.every((entry) => matchesDraftShape(entry, exemplar[0]));
  }
  if (isRecord(exemplar)) {
    if (!isRecord(value)) return false;
    return Object.entries(exemplar).every(([key, entry]) =>
      matchesDraftShape(value[key], entry),
    );
  }
  return typeof value === typeof exemplar;
}

export function interactiveDraftStorageKey(
  templateId: string,
  draftId: string,
): string {
  return `${INTERACTIVE_DRAFT_STORAGE_PREFIX}${encodeURIComponent(
    templateId,
  )}.${encodeURIComponent(draftId)}`;
}

export function interactiveDraftTabStorageKey(templateId: string): string {
  return `hygienenote.interactive-draft.tab.v1.${encodeURIComponent(
    templateId,
  )}`;
}

export function createInteractiveDraftId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseDraft<T>(
  raw: string | null,
  templateId: string,
  isValidForm: (value: unknown) => value is T,
): InteractiveDraft<T> | undefined {
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      value.kind !== "hygienenote.interactive-draft" ||
      value.schemaVersion !== INTERACTIVE_DRAFT_SCHEMA_VERSION ||
      value.templateId !== templateId ||
      typeof value.draftId !== "string" ||
      !value.draftId ||
      !isValidDate(value.savedAt) ||
      !isValidDate(value.startedAt) ||
      !isValidForm(value.form)
    ) {
      return undefined;
    }
    return value as InteractiveDraft<T>;
  } catch {
    return undefined;
  }
}

function parseDraftSummary(
  raw: string | null,
): InteractiveDraftSummary | undefined {
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      value.kind !== "hygienenote.interactive-draft" ||
      value.schemaVersion !== INTERACTIVE_DRAFT_SCHEMA_VERSION ||
      typeof value.templateId !== "string" ||
      !value.templateId ||
      typeof value.draftId !== "string" ||
      !value.draftId ||
      !isValidDate(value.savedAt) ||
      !isValidDate(value.startedAt) ||
      !isRecord(value.form)
    ) {
      return undefined;
    }
    const form = value.form;
    const patientId =
      typeof form.patientId === "string" ? form.patientId.trim() : "";
    const professionals: InteractiveDraftProfessional[] =
      interactiveDraftProfessionalFields.flatMap(({ role, field }) => {
        const name = form[field];
        return typeof name === "string" && name.trim()
          ? [{ role, name: name.trim() }]
          : [];
      });
    return {
      templateId: value.templateId,
      draftId: value.draftId,
      savedAt: value.savedAt,
      startedAt: value.startedAt,
      patientId,
      professionals,
    };
  } catch {
    return undefined;
  }
}

export function readInteractiveDraft<T>(
  storage: StorageLike,
  templateId: string,
  draftId: string,
  isValidForm: (value: unknown) => value is T,
): InteractiveDraft<T> | undefined {
  return parseDraft(
    storage.getItem(interactiveDraftStorageKey(templateId, draftId)),
    templateId,
    isValidForm,
  );
}

export function listInteractiveDrafts<T>(
  storage: StorageLike,
  templateId: string,
  isValidForm: (value: unknown) => value is T,
  now = Date.now(),
): InteractiveDraft<T>[] {
  pruneInteractiveDrafts(storage, now);
  const prefix = `${INTERACTIVE_DRAFT_STORAGE_PREFIX}${encodeURIComponent(
    templateId,
  )}.`;
  const drafts: InteractiveDraft<T>[] = [];
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(prefix)) keys.push(key);
  }
  for (const key of keys) {
    const draft = parseDraft(storage.getItem(key), templateId, isValidForm);
    if (draft) drafts.push(draft);
    else if (!hasUnsupportedDraftSchema(storage.getItem(key))) {
      storage.removeItem(key);
    }
  }
  return drafts.sort(
    (first, second) => Date.parse(second.savedAt) - Date.parse(first.savedAt),
  );
}

export function listInteractiveDraftSummaries(
  storage: StorageLike,
  now = Date.now(),
): InteractiveDraftSummary[] {
  pruneInteractiveDrafts(storage, now);
  const summaries: InteractiveDraftSummary[] = [];
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(INTERACTIVE_DRAFT_STORAGE_PREFIX)) keys.push(key);
  }
  for (const key of keys) {
    const raw = storage.getItem(key);
    const summary = parseDraftSummary(raw);
    if (
      summary &&
      key === interactiveDraftStorageKey(summary.templateId, summary.draftId)
    ) {
      summaries.push(summary);
    } else if (!hasUnsupportedDraftSchema(raw)) {
      storage.removeItem(key);
    }
  }
  return summaries.sort(
    (first, second) => Date.parse(second.savedAt) - Date.parse(first.savedAt),
  );
}

export function writeInteractiveDraft<T>(
  storage: StorageLike,
  input: {
    templateId: string;
    draftId: string;
    form: T;
    startedAt: Date;
    now?: Date;
  },
): InteractiveDraft<T> {
  const savedAt = (input.now ?? new Date()).toISOString();
  const draft: InteractiveDraft<T> = {
    kind: "hygienenote.interactive-draft",
    schemaVersion: INTERACTIVE_DRAFT_SCHEMA_VERSION,
    templateId: input.templateId,
    draftId: input.draftId,
    savedAt,
    startedAt: input.startedAt.toISOString(),
    form: input.form,
  };
  storage.setItem(
    interactiveDraftStorageKey(input.templateId, input.draftId),
    JSON.stringify(draft),
  );
  return draft;
}

export function deleteInteractiveDraft(
  storage: StorageLike,
  templateId: string,
  draftId: string,
): void {
  storage.removeItem(interactiveDraftStorageKey(templateId, draftId));
}

export function deleteAllInteractiveDrafts(storage: StorageLike): number {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(INTERACTIVE_DRAFT_STORAGE_PREFIX)) keys.push(key);
  }
  for (const key of keys) storage.removeItem(key);
  return keys.length;
}

export function pruneInteractiveDrafts(
  storage: StorageLike,
  now = Date.now(),
): void {
  const cutoff = now - INTERACTIVE_DRAFT_RETENTION_MS;
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(INTERACTIVE_DRAFT_STORAGE_PREFIX)) keys.push(key);
  }
  for (const key of keys) {
    const raw = storage.getItem(key);
    try {
      const value: unknown = raw ? JSON.parse(raw) : undefined;
      if (
        !isRecord(value) ||
        value.kind !== "hygienenote.interactive-draft" ||
        !isValidDate(value.savedAt) ||
        Date.parse(value.savedAt) < cutoff
      ) {
        storage.removeItem(key);
      }
    } catch {
      storage.removeItem(key);
    }
  }
}
