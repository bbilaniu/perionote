import {
  INTERACTIVE_DRAFT_RETENTION_MS,
  type InteractiveDraftProfessionalRole,
  type InteractiveDraftSummary,
} from "@/lib/templates/localDrafts";
import {
  interactiveDraftTemplates,
  isInteractiveDraftTemplateId,
} from "@/lib/templates/interactiveDraftTemplates";

export const UNKNOWN_INTERACTIVE_TEMPLATE_LABEL =
  "Unavailable interactive template";

export type DraftSortKey =
  | "template"
  | "patientId"
  | "lastSavedAt"
  | "dentist"
  | "rdh"
  | "rda";

export type SortDirection = "ascending" | "descending";
export type DraftProfessionalKey = "dentist" | "rdh" | "rda";

export type DraftListMetadata = {
  draftId: string;
  templateId: string;
  templateName: string;
  patientId?: string;
  professionals: Record<DraftProfessionalKey, string[]>;
  professionalRoleAvailability: Record<DraftProfessionalKey, boolean>;
  startedAt?: string;
  lastSavedAt: string;
  expiresAt?: string;
};

const roleKeys: Record<InteractiveDraftProfessionalRole, DraftProfessionalKey> = {
  Dentist: "dentist",
  RDH: "rdh",
  RDA: "rda",
};

const textCollator = new Intl.Collator("en-CA", {
  sensitivity: "base",
});
const deterministicTextCollator = new Intl.Collator("en-CA", {
  sensitivity: "variant",
});
const patientIdCollator = new Intl.Collator("en-CA", {
  numeric: true,
  sensitivity: "base",
});

export function normalizeDraftListText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizedComparisonText(value: string): string {
  return normalizeDraftListText(value).toLocaleLowerCase("en-CA");
}

export function normalizeDraftListMetadata(
  draft: InteractiveDraftSummary,
): DraftListMetadata {
  const professionals: DraftListMetadata["professionals"] = {
    dentist: [],
    rdh: [],
    rda: [],
  };
  for (const professional of draft.professionals) {
    const name = normalizeDraftListText(professional.name);
    if (name) professionals[roleKeys[professional.role]].push(name);
  }

  const availableRoles = new Set(draft.availableProfessionalRoles);
  const savedTimestamp = Date.parse(draft.savedAt);

  return {
    draftId: draft.draftId,
    templateId: draft.templateId,
    templateName: isInteractiveDraftTemplateId(draft.templateId)
      ? interactiveDraftTemplates[draft.templateId].label
      : UNKNOWN_INTERACTIVE_TEMPLATE_LABEL,
    ...(draft.patientId.trim() ? { patientId: draft.patientId } : {}),
    professionals,
    professionalRoleAvailability: {
      dentist: availableRoles.has("Dentist"),
      rdh: availableRoles.has("RDH"),
      rda: availableRoles.has("RDA"),
    },
    startedAt: draft.startedAt,
    lastSavedAt: draft.savedAt,
    ...(Number.isFinite(savedTimestamp)
      ? {
          expiresAt: new Date(
            savedTimestamp + INTERACTIVE_DRAFT_RETENTION_MS,
          ).toISOString(),
        }
      : {}),
  };
}

function searchableValues(draft: DraftListMetadata): string[] {
  return [
    draft.templateName,
    draft.patientId ?? "",
    ...draft.professionals.dentist,
    ...draft.professionals.rdh,
    ...draft.professionals.rda,
  ].map(normalizedComparisonText);
}

export function filterDraftListMetadata(
  drafts: readonly DraftListMetadata[],
  query: string,
): DraftListMetadata[] {
  const tokens = normalizedComparisonText(query).split(" ").filter(Boolean);
  if (!tokens.length) return [...drafts];

  return drafts.filter((draft) => {
    const fields = searchableValues(draft);
    return tokens.every((token) =>
      fields.some((field) => field.includes(token)),
    );
  });
}

function textValue(draft: DraftListMetadata, key: DraftSortKey): string {
  switch (key) {
    case "template":
      return draft.templateName;
    case "patientId":
      return draft.patientId ?? "";
    case "dentist":
    case "rdh":
    case "rda":
      return draft.professionals[key].join(", ");
    case "lastSavedAt":
      return draft.lastSavedAt;
  }
}

function comparePresentValues(
  first: DraftListMetadata,
  second: DraftListMetadata,
  key: DraftSortKey,
): number {
  if (key === "lastSavedAt") {
    return Date.parse(first.lastSavedAt) - Date.parse(second.lastSavedAt);
  }

  const firstValue = normalizedComparisonText(textValue(first, key));
  const secondValue = normalizedComparisonText(textValue(second, key));
  if (key === "patientId") {
    return (
      patientIdCollator.compare(firstValue, secondValue) ||
      deterministicTextCollator.compare(firstValue, secondValue)
    );
  }
  return textCollator.compare(firstValue, secondValue);
}

function isMissingSortValue(
  draft: DraftListMetadata,
  key: DraftSortKey,
): boolean {
  if (key === "lastSavedAt") {
    return !Number.isFinite(Date.parse(draft.lastSavedAt));
  }
  return !normalizeDraftListText(textValue(draft, key));
}

function comparePrimary(
  first: DraftListMetadata,
  second: DraftListMetadata,
  key: DraftSortKey,
  direction: SortDirection,
): number {
  const firstMissing = isMissingSortValue(first, key);
  const secondMissing = isMissingSortValue(second, key);
  if (firstMissing !== secondMissing) return firstMissing ? 1 : -1;
  if (firstMissing) return 0;
  const result = comparePresentValues(first, second, key);
  return direction === "ascending" ? result : -result;
}

function compareLastSavedNewestFirst(
  first: DraftListMetadata,
  second: DraftListMetadata,
): number {
  const firstTime = Date.parse(first.lastSavedAt);
  const secondTime = Date.parse(second.lastSavedAt);
  const firstMissing = !Number.isFinite(firstTime);
  const secondMissing = !Number.isFinite(secondTime);
  if (firstMissing !== secondMissing) return firstMissing ? 1 : -1;
  if (firstMissing) return 0;
  return secondTime - firstTime;
}

export function sortDraftListMetadata(
  drafts: readonly DraftListMetadata[],
  key: DraftSortKey,
  direction: SortDirection,
): DraftListMetadata[] {
  return drafts
    .map((draft, index) => ({ draft, index }))
    .sort((first, second) => {
      const primary = comparePrimary(first.draft, second.draft, key, direction);
      if (primary) return primary;

      if (key !== "lastSavedAt") {
        const savedAt = compareLastSavedNewestFirst(first.draft, second.draft);
        if (savedAt) return savedAt;
      }

      const template = textCollator.compare(
        normalizedComparisonText(first.draft.templateName),
        normalizedComparisonText(second.draft.templateName),
      );
      if (template) return template;

      const draftId = deterministicTextCollator.compare(
        first.draft.draftId,
        second.draft.draftId,
      );
      return draftId || first.index - second.index;
    })
    .map(({ draft }) => draft);
}

export function initialDraftSortDirection(key: DraftSortKey): SortDirection {
  return key === "lastSavedAt" ? "descending" : "ascending";
}
