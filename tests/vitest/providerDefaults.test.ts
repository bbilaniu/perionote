import { describe, expect, it } from "vitest";
import {
  createEmptyCatalogueState,
  rememberCatalogueValue,
  setCatalogueItemHidden,
} from "@/lib/catalogues/catalogue";
import {
  PROVIDER_DEFAULTS_STORAGE_KEY,
  ProviderDefaultsValidationError,
  clearProviderDefault,
  createEmptyProviderDefaults,
  getProviderDefaultItem,
  parseProviderDefaults,
  readProviderDefaults,
  reconcileProviderDefaults,
  setProviderDefault,
  writeProviderDefaults,
} from "@/lib/catalogues/providerDefaults";

function providerCatalogue() {
  return rememberCatalogueValue(
    createEmptyCatalogueState(),
    "visit-team.dentist",
    "Synthetic Dentist",
    {
      id: "synthetic-dentist",
      now: new Date("2026-08-05T12:00:00.000Z"),
    },
  ).state;
}

describe("provider defaults", () => {
  it("round-trips versioned local preferences", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const defaults = setProviderDefault(
      createEmptyProviderDefaults(),
      providerCatalogue(),
      "visit-team.dentist",
      "synthetic-dentist",
    );

    writeProviderDefaults(storage, defaults);

    expect([...values.keys()]).toEqual([PROVIDER_DEFAULTS_STORAGE_KEY]);
    expect(readProviderDefaults(storage)).toEqual(defaults);
  });

  it("rejects malformed, unknown, and unavailable defaults", () => {
    expect(() =>
      parseProviderDefaults({
        format: "hygienenote-provider-defaults",
        schemaVersion: 1,
        defaults: { "clinical-exam.molar-occlusion": "seed.molar.cl-i" },
      }),
    ).toThrow(ProviderDefaultsValidationError);
    expect(() =>
      setProviderDefault(
        createEmptyProviderDefaults(),
        createEmptyCatalogueState(),
        "visit-team.rdh",
        "missing-rdh",
      ),
    ).toThrow("Choose a visible saved provider");
  });

  it("resolves labels by stable item id and drops hidden or deleted defaults", () => {
    const catalogue = providerCatalogue();
    const defaults = setProviderDefault(
      createEmptyProviderDefaults(),
      catalogue,
      "visit-team.dentist",
      "synthetic-dentist",
    );
    expect(
      getProviderDefaultItem(
        defaults,
        catalogue,
        "visit-team.dentist",
      )?.label,
    ).toBe("Synthetic Dentist");

    const hiddenCatalogue = setCatalogueItemHidden(
      catalogue,
      "synthetic-dentist",
      "user",
      true,
    );
    expect(
      reconcileProviderDefaults(defaults, hiddenCatalogue).defaults,
    ).toEqual({});
    expect(
      clearProviderDefault(defaults, "visit-team.dentist").defaults,
    ).toEqual({});
  });
});
