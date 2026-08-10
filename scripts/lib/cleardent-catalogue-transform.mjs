import { createHash } from "node:crypto";

export const CLEARDENT_CATALOGUE_CROSSWALK = Object.freeze({
  dentists: "visit-team.dentist",
  rda: "visit-team.rda",
  hygienist: "visit-team.rdh",
  "medical-and-dental-history-status": "medical-history.review",
  "full-mouth-periodontal-charting-done": "periodontal.fmp-done",
  health: "periodontal.health-gingivitis",
  "ohi-aids-reviewed-recommended": "oral-hygiene.aids-reviewed",
  "hygiene-treatment": "hygiene-treatment.completed",
  "hygiene-anaesthetic": "hygiene-treatment.anesthetic",
  desensitizer: "hygiene-treatment.desensitizer",
  "next-visit": "scheduling.hygiene-next-visit",
});

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLabel(value) {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en-CA");
}

function readOptionLabel(option, fieldId, optionIndex) {
  if (!isRecord(option)) {
    throw new Error(`Invalid option ${optionIndex + 1} in ${fieldId}.`);
  }
  if (typeof option.truncated_in_screenshot !== "boolean") {
    throw new Error(
      `Missing truncated_in_screenshot for option ${optionIndex + 1} in ${fieldId}.`,
    );
  }
  const value =
    typeof option.normalized_text === "string"
      ? option.normalized_text
      : option.display_text;
  if (typeof value !== "string") {
    throw new Error(`Missing option text in ${fieldId}.`);
  }
  const label = value.trim().normalize("NFC");
  if (!label || label.length > 200) {
    throw new Error(`Invalid option label length in ${fieldId}.`);
  }
  return {
    label,
    truncated: option.truncated_in_screenshot,
  };
}

function stableItemId(catalogueKey, label) {
  const digest = createHash("sha256")
    .update(`${catalogueKey}\0${normalizeLabel(label)}`)
    .digest("hex")
    .slice(0, 24);
  return `cleardent.${digest}`;
}

export function transformClearDentCatalogue(
  extraction,
  options = {},
) {
  if (!isRecord(extraction) || !Array.isArray(extraction.fields)) {
    throw new Error("ClearDent extraction must contain a fields array.");
  }
  const exportedAt = options.exportedAt ?? new Date();
  if (!(exportedAt instanceof Date) || Number.isNaN(exportedAt.getTime())) {
    throw new Error("Invalid export timestamp.");
  }

  const fieldsById = new Map();
  for (const field of extraction.fields) {
    if (
      !isRecord(field) ||
      typeof field.field_id !== "string" ||
      !Array.isArray(field.options)
    ) {
      throw new Error("Invalid ClearDent field record.");
    }
    if (fieldsById.has(field.field_id)) {
      throw new Error(`Duplicate ClearDent field: ${field.field_id}.`);
    }
    fieldsById.set(field.field_id, field);
  }

  const userItems = [];
  const report = [];
  const labelsByCatalogue = new Map();

  for (const [fieldId, catalogueKey] of Object.entries(
    CLEARDENT_CATALOGUE_CROSSWALK,
  )) {
    const field = fieldsById.get(fieldId);
    if (!field) {
      throw new Error(`Missing required ClearDent field: ${fieldId}.`);
    }
    const seen =
      labelsByCatalogue.get(catalogueKey) ?? new Set();
    labelsByCatalogue.set(catalogueKey, seen);
    let included = 0;
    let excludedTruncated = 0;
    let excludedDuplicate = 0;

    field.options.forEach((option, optionIndex) => {
      const parsed = readOptionLabel(option, fieldId, optionIndex);
      if (parsed.truncated) {
        excludedTruncated += 1;
        return;
      }
      const normalized = normalizeLabel(parsed.label);
      if (seen.has(normalized)) {
        excludedDuplicate += 1;
        return;
      }
      seen.add(normalized);
      const timestamp = exportedAt.toISOString();
      userItems.push({
        id: stableItemId(catalogueKey, parsed.label),
        catalogueKey,
        label: parsed.label,
        hidden: false,
        favorite: false,
        sortOrder: included,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      included += 1;
    });

    report.push({
      fieldId,
      catalogueKey,
      included,
      excludedTruncated,
      excludedDuplicate,
    });
  }

  return {
    exportValue: {
      format: "hygienenote-catalogue",
      formatVersion: 1,
      exportedAt: exportedAt.toISOString(),
      catalogueState: {
        schemaVersion: 1,
        userItems,
        seedPreferences: [],
      },
    },
    report,
  };
}
