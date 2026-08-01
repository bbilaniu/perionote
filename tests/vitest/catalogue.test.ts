import { describe, expect, it } from "vitest";
import {
  CATALOGUE_DEFINITIONS,
  CATALOGUE_EXPORT_FORMAT,
  CATALOGUE_STORAGE_KEY,
  type CatalogueKey,
  CatalogueValidationError,
  createEmptyCatalogueState,
  deleteUserCatalogueItem,
  favoriteAndUnhideCatalogueItem,
  findEquivalentCatalogueItem,
  getCatalogueDefinitionsForBuild,
  listCatalogueItems,
  mergeCatalogueStates,
  moveCatalogueItem,
  parseCatalogueExport,
  parseCatalogueState,
  previewCatalogueImport,
  readCatalogueState,
  rememberCatalogueValue,
  serializeCatalogueExport,
  setCatalogueItemFavorite,
  setCatalogueItemHidden,
  updateUserCatalogueItem,
  writeCatalogueState,
} from "@/lib/catalogues/catalogue";

function remember(
  state: ReturnType<typeof createEmptyCatalogueState>,
  catalogueKey: CatalogueKey,
  label: string,
  id: string,
) {
  return rememberCatalogueValue(state, catalogueKey, label, {
    id,
    now: new Date("2026-07-25T18:00:00.000Z"),
  });
}

describe("local catalogues", () => {
  it("publishes Adult Hygiene pilot catalogue definitions", () => {
    const adultHygieneKey = "hygiene-treatment.completed";
    expect(
      getCatalogueDefinitionsForBuild("development").some(
        (definition) => definition.key === adultHygieneKey,
      ),
    ).toBe(true);
    expect(
      getCatalogueDefinitionsForBuild("production").some(
        (definition) => definition.key === adultHygieneKey,
      ),
    ).toBe(true);
    expect(
      getCatalogueDefinitionsForBuild("production").some(
        (definition) => definition.key === "visit-team.rdh",
      ),
    ).toBe(true);
    expect(
      getCatalogueDefinitionsForBuild("production").some(
        (definition) => definition.key === "medical-history.review",
      ),
    ).toBe(true);
    expect(
      getCatalogueDefinitionsForBuild("production").some(
        (definition) => definition.key === "imaging.radiographs",
      ),
    ).toBe(true);
    expect(
      getCatalogueDefinitionsForBuild("production").some(
        (definition) => definition.key === "patient.chief-concerns",
      ),
    ).toBe(true);
    expect(
      getCatalogueDefinitionsForBuild("production").some(
        (definition) => definition.key === "recare-treatment.items",
      ),
    ).toBe(true);
    expect(
      getCatalogueDefinitionsForBuild("production").some(
        (definition) =>
          definition.key === "clinical-exam.caries-risk-factors",
      ),
    ).toBe(true);
  });

  it("defines the approved public seeds without seeding provider catalogues", () => {
    const emptyState = createEmptyCatalogueState();
    expect(
      listCatalogueItems(emptyState, "visit-team.dentist"),
    ).toEqual([]);
    expect(listCatalogueItems(emptyState, "visit-team.rda")).toEqual([]);
    expect(listCatalogueItems(emptyState, "visit-team.rdh")).toEqual([]);
    expect(
      listCatalogueItems(emptyState, "patient.chief-concerns").map(
        (item) => item.label,
      ),
    ).toEqual([
      "Nothing",
      "Sore gums upon brushing/flossing",
      "Dissatisfaction with the appearance of teeth due to yellowing/stain",
      "Food catches between teeth",
      "Sensitivity to hot and cold",
    ]);

    expect(
      listCatalogueItems(
        emptyState,
        "clinical-exam.molar-occlusion",
      ).map((item) => item.label),
    ).toEqual(["Cl I", "Cl II", "Cl III"]);
    expect(
      listCatalogueItems(
        emptyState,
        "clinical-exam.skeletal-occlusion",
      ).map((item) => item.label),
    ).toEqual(["Cl I", "Cl II", "Cl III"]);
    expect(
      listCatalogueItems(
        emptyState,
        "clinical-exam.additional-occlusal-findings",
    ).map((item) => item.label),
    ).toEqual([
      "Crowding",
      "Spacing",
      "Rotations",
      "Open bite",
      "Crossbite",
      "Increased overjet",
      "Increased overbite",
    ]);
    expect(
      listCatalogueItems(emptyState, "imaging.radiographs").map(
        (item) => item.label,
      ),
    ).toEqual([
      "PAN",
      "1 BW",
      "2 BW",
      "3 BW",
      "4 BW",
      "5 BW",
      "6 BW",
      "1 PA",
      "2 PA",
    ]);
    expect(
      listCatalogueItems(
        emptyState,
        "clinical-exam.caries-risk-factors",
      ).map((item) => item.label),
    ).toEqual([
      "High frequency of sugar intake",
      "Inadequate oral hygiene",
      "Insufficient exposure to fluoride",
      "Heavily restored dentition",
      "Hyposalivation",
      "History of caries in the last 36 months",
      "Symptomatically driven dental visits",
    ]);
    expect(
      listCatalogueItems(emptyState, "medical-history.review").map(
        (item) => item.label,
      ),
    ).toEqual([
      "YES- NO CHANGES",
      "YES- NP- CLEARED, NO CONTRAINDICATIONS TO TX",
      "YES- UPDATED, BUT NO CONTRAINDICATIONS TO TX",
      "YES- UPDATED MEDS",
    ]);
    expect(
      listCatalogueItems(emptyState, "periodontal.fmp-done").map(
        (item) => item.label,
      ),
    ).toEqual([
      "YES, ALL FINDINGS DISCUSSED WITH PATIENT",
      "NO, COMPLETED WITHIN A YEAR",
      "NO, IN ORTHO",
      "NO, NOT APPLICABLE",
      "NO, RAN OUT OF TIME - WILL EVALUATE AT NEXT VISIT",
    ]);
    expect(
      listCatalogueItems(
        emptyState,
        "periodontal.health-gingivitis",
      ).map((item) => item.label),
    ).toEqual([
      "HEALTH INTACT PERIODONTAL SUPPORT",
      "GINGIVITIS INTACT PERIODONTAL SUPPORT",
      "HEALTH- REDUCED PERIODONTAL SUPPORT",
      "GINGIVITIS- REDUCED PERIODONTAL SUPPORT",
    ]);
    expect(
      listCatalogueItems(emptyState, "oral-hygiene.compliance").map(
        (item) => item.label,
      ),
    ).toEqual([
      "Poor",
      "Fair",
      "Good",
      "Excellent",
      "Poor–fair",
      "Fair–good",
    ]);
    expect(
      listCatalogueItems(emptyState, "oral-hygiene.aids-reviewed").map(
        (item) => item.label,
      ),
    ).toEqual([
      "SULCABRUSH",
      "SUPERFLOSS",
      "FLOSS THREADERS",
      "C-SHAPE FLOSSING",
      "PROPER TOOTHBRUSHING TECHNIQUE",
      "INTERPROXIMAL BRUSH",
      "SOFT PICKS",
      "PROPER USE OF ELECTRIC TOOTHBRUSH",
    ]);
    expect(
      listCatalogueItems(emptyState, "hygiene-treatment.completed").map(
        (item) => item.label,
      ),
    ).toEqual([
      "1U scale (cavitron and hand scaling)",
      "2U scale (cavitron and hand scaling)",
      "3U scale (cavitron and hand scaling)",
      "4U scale (cavitron and hand scaling)",
      "FMP",
      "1U polish",
      "Fluoride varnish",
      "Crystal X-PUR",
    ]);
    expect(
      listCatalogueItems(emptyState, "recare-treatment.items").map(
        (item) => item.label,
      ),
    ).toEqual(["Hygiene maintenance"]);
    expect(
      listCatalogueItems(emptyState, "hygiene-treatment.anesthetic"),
    ).toEqual([]);
    expect(
      listCatalogueItems(emptyState, "hygiene-treatment.desensitizer").map(
        (item) => item.label,
      ),
    ).toEqual(["NONE", "PREVIDENT FL", "VOCO FL", "crystal x-pur"]);
    expect(
      listCatalogueItems(emptyState, "scheduling.recall-interval").map(
        (item) => item.label,
      ),
    ).toEqual(["12-month recall", "6-month recall", "9-month recall"]);
    expect(
      listCatalogueItems(emptyState, "scheduling.hygiene-interval").map(
        (item) => item.label,
      ),
    ).toEqual([
      "3-month scale",
      "4-month scale",
      "6-month scale",
      "N/A",
    ]);
    expect(
      listCatalogueItems(emptyState, "scheduling.next-visit").map(
        (item) => item.label,
      ),
    ).toEqual([
      "6 MONTH SCALE",
      "12 MONTH RECALL",
      "3 MONTH SCALE",
      "4 MONTH SCALE",
      "6 MONTH RECALL",
      "9 MONTH RECALL",
      "FOLLOW-UP HYGIENE",
    ]);

    const molarDefinition = CATALOGUE_DEFINITIONS.find(
      (definition) =>
        definition.key === "clinical-exam.molar-occlusion",
    );
    expect(molarDefinition?.fieldLabels).toEqual([
      "Left molar occlusion",
      "Right molar occlusion",
    ]);
    expect(
      listCatalogueItems(
        emptyState,
        "clinical-exam.molar-occlusion",
      )[0].id,
    ).not.toBe(
      listCatalogueItems(
        emptyState,
        "clinical-exam.skeletal-occlusion",
      )[0].id,
    );
  });

  it("migrates locally imported values that later become public seeds", () => {
    const migrated = parseCatalogueState({
      schemaVersion: 1,
      userItems: [
        {
          id: "legacy-medical-history",
          catalogueKey: "medical-history.review",
          label: "yes- no changes",
          hidden: true,
          favorite: true,
          sortOrder: 2,
          createdAt: "2026-07-25T18:00:00.000Z",
          updatedAt: "2026-07-25T18:00:00.000Z",
        },
        {
          id: "legacy-treatment-completed",
          catalogueKey: "hygiene-treatment.completed",
          label: "Fluoride varnish",
          hidden: false,
          favorite: false,
          sortOrder: 6,
          createdAt: "2026-07-25T18:00:00.000Z",
          updatedAt: "2026-07-25T18:00:00.000Z",
        },
      ],
      seedPreferences: [],
    });

    expect(migrated.userItems).toEqual([]);
    expect(migrated.seedPreferences).toEqual([
      {
        seedId: "seed.medical-history.review.no-changes",
        hidden: true,
        favorite: true,
        sortOrder: 2,
      },
      {
        seedId: "seed.hygiene-treatment.completed.fluoride-varnish",
        hidden: false,
        favorite: false,
        sortOrder: 6,
      },
    ]);
  });

  it("remembers only explicit values and deduplicates normalized labels", () => {
    const emptyState = createEmptyCatalogueState();
    const added = remember(
      emptyState,
      "visit-team.dentist",
      "  Example Dentist  ",
      "dentist-1",
    );

    expect(added.status).toBe("added");
    expect(added.item.label).toBe("Example Dentist");
    expect(emptyState.userItems).toEqual([]);
    expect(added.state.userItems).toHaveLength(1);

    const duplicate = remember(
      added.state,
      "visit-team.dentist",
      "example dentist",
      "dentist-2",
    );
    expect(duplicate.status).toBe("existing");
    expect(duplicate.state.userItems).toHaveLength(1);
  });

  it("reactivates hidden user and seed values rather than creating duplicates", () => {
    const added = remember(
      createEmptyCatalogueState(),
      "visit-team.rdh",
      "Example RDH",
      "rdh-1",
    );
    const hiddenUserState = setCatalogueItemHidden(
      added.state,
      "rdh-1",
      "user",
      true,
    );
    const reactivatedUser = remember(
      hiddenUserState,
      "visit-team.rdh",
      "example rdh",
      "rdh-2",
    );
    expect(reactivatedUser.status).toBe("reactivated");
    expect(reactivatedUser.state.userItems).toHaveLength(1);
    expect(reactivatedUser.state.userItems[0].hidden).toBe(false);

    const seed = listCatalogueItems(
      createEmptyCatalogueState(),
      "clinical-exam.molar-occlusion",
    )[0];
    const hiddenSeedState = setCatalogueItemHidden(
      createEmptyCatalogueState(),
      seed.id,
      "seed",
      true,
    );
    const reactivatedSeed = remember(
      hiddenSeedState,
      "clinical-exam.molar-occlusion",
      "cl i",
      "unused",
    );
    expect(reactivatedSeed.status).toBe("reactivated");
    expect(reactivatedSeed.state.userItems).toEqual([]);
    expect(
      findEquivalentCatalogueItem(
        reactivatedSeed.state,
        "clinical-exam.molar-occlusion",
        "Cl I",
      )?.hidden,
    ).toBe(false);
  });

  it("favorites and reorders suggestions without changing their labels", () => {
    const state = createEmptyCatalogueState();
    const seeds = listCatalogueItems(
      state,
      "clinical-exam.molar-occlusion",
    );
    const favorited = setCatalogueItemFavorite(
      state,
      seeds[2].id,
      "seed",
      true,
    );
    expect(
      listCatalogueItems(
        favorited,
        "clinical-exam.molar-occlusion",
      )[0].label,
    ).toBe("Cl III");

    const reordered = moveCatalogueItem(
      state,
      "clinical-exam.molar-occlusion",
      seeds[2].id,
      "up",
    );
    expect(
      listCatalogueItems(
        reordered,
        "clinical-exam.molar-occlusion",
      ).map((item) => item.label),
    ).toEqual(["Cl I", "Cl III", "Cl II"]);
  });

  it("moves hidden values by list position and unhides them when favorited", () => {
    const state = createEmptyCatalogueState();
    const seeds = listCatalogueItems(
      state,
      "clinical-exam.molar-occlusion",
    );
    const hidden = setCatalogueItemHidden(
      state,
      seeds[1].id,
      "seed",
      true,
    );
    const moved = moveCatalogueItem(
      hidden,
      "clinical-exam.molar-occlusion",
      seeds[1].id,
      "up",
    );
    expect(
      listCatalogueItems(moved, "clinical-exam.molar-occlusion", {
        includeHidden: true,
      }).map((item) => item.label),
    ).toEqual(["Cl II", "Cl I", "Cl III"]);

    const favorited = favoriteAndUnhideCatalogueItem(
      hidden,
      seeds[1].id,
      "seed",
    );
    const item = findEquivalentCatalogueItem(
      favorited,
      "clinical-exam.molar-occlusion",
      "Cl II",
    );
    expect(item?.favorite).toBe(true);
    expect(item?.hidden).toBe(false);
  });

  it("edits and deletes future suggestions without changing a selected text snapshot", () => {
    const added = remember(
      createEmptyCatalogueState(),
      "visit-team.rda",
      "Example RDA",
      "rda-1",
    );
    const selectedFormText = added.item.label;
    const renamedState = updateUserCatalogueItem(
      added.state,
      "rda-1",
      "Updated RDA",
      new Date("2026-07-25T19:00:00.000Z"),
    );
    const deletedState = deleteUserCatalogueItem(renamedState, "rda-1");

    expect(selectedFormText).toBe("Example RDA");
    expect(renamedState.userItems[0].label).toBe("Updated RDA");
    expect(deletedState.userItems).toEqual([]);
  });

  it("stores only a validated versioned catalogue state under the catalogue key", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const state = remember(
      createEmptyCatalogueState(),
      "visit-team.dentist",
      "Example Dentist",
      "dentist-1",
    ).state;

    writeCatalogueState(storage, state);

    expect([...values.keys()]).toEqual([CATALOGUE_STORAGE_KEY]);
    expect(readCatalogueState(storage)).toEqual(state);
  });

  it("exports and imports only the catalogue envelope", () => {
    let state = remember(
      createEmptyCatalogueState(),
      "visit-team.dentist",
      "Example Dentist",
      "dentist-1",
    ).state;
    const seed = listCatalogueItems(
      state,
      "clinical-exam.skeletal-occlusion",
    )[0];
    state = setCatalogueItemFavorite(state, seed.id, "seed", true);

    const raw = serializeCatalogueExport(
      state,
      new Date("2026-07-25T20:00:00.000Z"),
    );
    const parsedJson = JSON.parse(raw);
    const parsed = parseCatalogueExport(raw);

    expect(parsedJson.format).toBe(CATALOGUE_EXPORT_FORMAT);
    expect(parsedJson).not.toHaveProperty("patientId");
    expect(parsedJson).not.toHaveProperty("form");
    expect(parsedJson).not.toHaveProperty("theme");
    expect(parsed.catalogueState).toEqual(state);
  });

  it("rejects malformed, duplicate, future, and oversized imports", () => {
    expect(() => parseCatalogueExport("{")).toThrow(
      "not valid JSON",
    );
    expect(() =>
      parseCatalogueExport(
        JSON.stringify({
          format: CATALOGUE_EXPORT_FORMAT,
          formatVersion: 2,
          exportedAt: "2026-07-25T20:00:00.000Z",
          catalogueState: createEmptyCatalogueState(),
        }),
      ),
    ).toThrow("not supported");
    expect(() => parseCatalogueExport(" ".repeat(1024 * 1024 + 1))).toThrow(
      "1 MiB",
    );

    const item = remember(
      createEmptyCatalogueState(),
      "visit-team.dentist",
      "Example Dentist",
      "dentist-1",
    ).state.userItems[0];
    expect(() =>
      parseCatalogueState({
        schemaVersion: 1,
        userItems: [item, { ...item, id: "dentist-2" }],
        seedPreferences: [],
      }),
    ).toThrow("Duplicate value");
    expect(() =>
      parseCatalogueState({
        schemaVersion: 1,
        userItems: [{ ...item, id: "<invalid id>" }],
        seedPreferences: [],
      }),
    ).toThrow("Invalid id");
  });

  it("previews and merges imports without overwriting local conflicts", () => {
    const local = remember(
      createEmptyCatalogueState(),
      "visit-team.dentist",
      "Local Dentist",
      "shared-id",
    ).state;
    let imported = remember(
      createEmptyCatalogueState(),
      "visit-team.dentist",
      "Imported Dentist",
      "shared-id",
    ).state;
    imported = remember(
      imported,
      "visit-team.rdh",
      "Imported RDH",
      "imported-rdh",
    ).state;

    const preview = previewCatalogueImport(local, imported);
    expect(preview.idConflicts).toBe(1);
    expect(preview.additions).toBe(1);
    expect(preview.itemsByCatalogue["visit-team.rdh"]).toBe(1);

    const merged = mergeCatalogueStates(local, imported);
    expect(
      listCatalogueItems(merged, "visit-team.dentist").map(
        (item) => item.label,
      ),
    ).toEqual(["Local Dentist"]);
    expect(
      listCatalogueItems(merged, "visit-team.rdh").map(
        (item) => item.label,
      ),
    ).toEqual(["Imported RDH"]);
  });

  it("rejects invalid local values without changing the prior state", () => {
    const state = createEmptyCatalogueState();
    expect(() =>
      remember(
        state,
        "visit-team.dentist",
        "   ",
        "dentist-1",
      ),
    ).toThrow(CatalogueValidationError);
    expect(state).toEqual(createEmptyCatalogueState());
  });
});
