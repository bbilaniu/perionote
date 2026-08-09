import { describe, expect, it } from "vitest";
import {
  buildOheTreatmentRecap,
  createTreatmentEntryFromCatalogueItem,
  formatAdultHygieneTreatmentCompletedEntries,
  standardTreatmentCompletedPreset,
  syncDerivedOheTreatmentDetails,
  syncRadiographTreatmentEntries,
  type AdultHygieneTreatmentCompletedEntry,
} from "@/lib/templates/adultHygieneTreatment";
import {
  createEmptyCatalogueState,
  listCatalogueItems,
} from "@/lib/catalogues/catalogue";
import {
  isDyclonineRinseTreatment,
  orderTreatmentToothAreas,
} from "@/lib/templates/adultHygiene2021";

function format(entries: AdultHygieneTreatmentCompletedEntry[]) {
  return formatAdultHygieneTreatmentCompletedEntries(
    entries,
    orderTreatmentToothAreas,
    isDyclonineRinseTreatment,
  );
}

describe("structured adult hygiene treatment", () => {
  it("creates categorized structured entries from catalogue defaults", () => {
    const catalogue = listCatalogueItems(
      createEmptyCatalogueState(),
      "hygiene-treatment.completed",
    );
    const scaling = createTreatmentEntryFromCatalogueItem(
      catalogue.find((item) => item.label === "Scaling")!,
      "scaling",
    );
    expect(scaling).toMatchObject({
      procedureKind: "scaling",
      careCategory: "instrumentation",
      quantity: "3",
      toothAreas: ["full mouth"],
      instrumentation: ["hand", "power"],
      powerDevice: "Cavitron",
    });

    const fluoride = createTreatmentEntryFromCatalogueItem(
      catalogue.find((item) => item.label.startsWith("FluoriMax"))!,
      "fluoride",
    );
    expect(fluoride).toMatchObject({
      careCategory: "product-application",
      toothAreas: ["full mouth"],
    });
    expect(
      createTreatmentEntryFromCatalogueItem(
        catalogue.find((item) => item.label === "Radiographs")!,
        "radiographs",
      ),
    ).toBeNull();
  });

  it("keeps legacy free-text treatment rows unchanged", () => {
    expect(
      format([
        {
          id: "legacy-scale",
          treatmentType: "2U scale (cavitron and hand instrumentation)",
          toothAreas: ["Q2", "Q3"],
        },
      ]),
    ).toBe(
      "Treatment completed today: 2U scale (cavitron and hand instrumentation) — Q2, Q3",
    );
  });

  it("formats structured quantities, instrumentation, product and OHE details", () => {
    const entries = standardTreatmentCompletedPreset.map((entry, index) => ({
      ...entry,
      id: `standard-${index}`,
      toothAreas: [...entry.toothAreas],
      instrumentation: entry.instrumentation
        ? [...entry.instrumentation]
        : undefined,
      ...(entry.procedureKind === "ohe"
        ? {
            details:
              "Bass brushing at least twice daily; C-shape flossing at least daily; benefits of fluoride",
          }
        : {}),
    }));

    expect(format(entries)).toBe(
      "Treatment completed today: Dyclonine 1% rinse 5 ml — full mouth; FMP — full mouth; Full mouth scaling with hand and Cavitron instrumentation (3U Scale); Selective polish with EnamelPro Strawberry with Fluoride (1U Polish); OHE on proper home care (Bass brushing at least twice daily; C-shape flossing at least daily; benefits of fluoride); FluoriMax 2.5% NaF Varnish application — full mouth",
    );
  });

  it("synchronizes radiographs without changing manual treatment rows", () => {
    const manual: AdultHygieneTreatmentCompletedEntry = {
      id: "manual",
      treatmentType: "Synthetic manual treatment",
      toothAreas: [],
    };
    const first = syncRadiographTreatmentEntries(
      [manual],
      ["4 BW", "3 PA", "PAN", "Synthetic occlusal view"],
    );
    expect(format(first)).toBe(
      "Treatment completed today: 4 BW; 3 PA; PAN; Synthetic occlusal view; Synthetic manual treatment",
    );

    const second = syncRadiographTreatmentEntries(first, ["2 BW"]);
    expect(format(second)).toBe(
      "Treatment completed today: 2 BW; Synthetic manual treatment",
    );
    expect(
      second.filter((entry) => entry.procedureSource === "radiographs"),
    ).toHaveLength(1);
  });

  it("updates derived OHE details while preserving a customized recap", () => {
    const recap = buildOheTreatmentRecap({
      homeCareInstructionReviewed: true,
      standardOheStatementApplies: true,
      oheTopicsReviewed: [
        "Bass brushing",
        "Sulcabrush and interdental brush technique",
      ],
      oheNotes: "Demonstrated modifications",
    });
    expect(recap).toBe(
      "Bass brushing at least twice daily; C-shape flossing at least daily; benefits of fluoride; Sulcabrush and interdental brush technique; Demonstrated modifications",
    );

    const entries: AdultHygieneTreatmentCompletedEntry[] = [
      {
        id: "derived",
        treatmentType: "OHE",
        toothAreas: [],
        procedureKind: "ohe",
        details: "Old derived recap",
        detailsCustomized: false,
      },
      {
        id: "custom",
        treatmentType: "OHE",
        toothAreas: [],
        procedureKind: "ohe",
        details: "Clinician wording",
        detailsCustomized: true,
      },
    ];
    expect(syncDerivedOheTreatmentDetails(entries, recap)).toMatchObject([
      { details: recap },
      { details: "Clinician wording" },
    ]);
  });
});
