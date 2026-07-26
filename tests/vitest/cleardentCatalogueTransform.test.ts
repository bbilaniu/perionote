import { describe, expect, it } from "vitest";
import { parseCatalogueExport } from "@/lib/catalogues/catalogue";
import {
  CLEARDENT_CATALOGUE_CROSSWALK,
  transformClearDentCatalogue,
} from "@/scripts/lib/cleardent-catalogue-transform.mjs";

function syntheticField(
  fieldId: string,
  values: Array<{ label: string; truncated?: boolean }>,
) {
  return {
    field_id: fieldId,
    options: values.map(({ label, truncated = false }) => ({
      display_text: label,
      normalized_text: label,
      truncated_in_screenshot: truncated,
    })),
  };
}

describe("ClearDent catalogue transformer", () => {
  it("creates a valid private catalogue import without unresolved or unrelated values", () => {
    const fields = Object.keys(CLEARDENT_CATALOGUE_CROSSWALK).map(
      (fieldId) =>
        syntheticField(fieldId, [
          { label: `Synthetic ${fieldId} value` },
        ]),
    );
    const health = fields.find((field) => field.field_id === "health");
    health?.options.push({
      display_text: "Unknown truncated value...",
      normalized_text: "Unknown truncated value...",
      truncated_in_screenshot: true,
    });
    fields.push(
      syntheticField("unrelated-patient-field", [
        { label: "Must not be imported" },
      ]),
    );

    const { exportValue, report } = transformClearDentCatalogue(
      { fields },
      { exportedAt: new Date("2026-07-25T22:00:00.000Z") },
    );
    const parsed = parseCatalogueExport(JSON.stringify(exportValue));
    const labels = parsed.catalogueState.userItems.map((item) => item.label);

    expect(parsed.catalogueState.userItems).toHaveLength(
      Object.keys(CLEARDENT_CATALOGUE_CROSSWALK).length,
    );
    expect(labels).not.toContain("Unknown truncated value...");
    expect(labels).not.toContain("Must not be imported");
    expect(exportValue).not.toHaveProperty("patientId");
    expect(exportValue).not.toHaveProperty("form");
    expect(
      report.find((item) => item.fieldId === "health")?.excludedTruncated,
    ).toBe(1);
    expect(
      parsed.catalogueState.userItems.every(
        (item) =>
          item.id.startsWith("cleardent.") &&
          !item.id.toLocaleLowerCase("en-CA").includes("synthetic"),
      ),
    ).toBe(true);
  });

  it("rejects missing mapped fields and duplicate field records", () => {
    expect(() => transformClearDentCatalogue({ fields: [] })).toThrow(
      "Missing required ClearDent field",
    );
    const fieldId = Object.keys(CLEARDENT_CATALOGUE_CROSSWALK)[0];
    const duplicate = syntheticField(fieldId, [{ label: "Synthetic value" }]);
    expect(() =>
      transformClearDentCatalogue({ fields: [duplicate, duplicate] }),
    ).toThrow("Duplicate ClearDent field");
  });
});
