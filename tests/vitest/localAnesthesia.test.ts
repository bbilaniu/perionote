import { describe, expect, it } from "vitest";

import {
  createEmptyLocalAnesthesiaValue,
  formatLocalAnesthesiaSummary,
  localAnesthesiaLocationChoices,
} from "@/lib/templates/localAnesthesia";

describe("local anesthesia", () => {
  it("starts without asserting that contraindications were reviewed", () => {
    const value = createEmptyLocalAnesthesiaValue();

    expect(value.localAnesthesiaNoContraindication).toBe(false);
    expect(formatLocalAnesthesiaSummary(value)).toBe("");
  });

  it("defines route-specific preset locations", () => {
    expect(localAnesthesiaLocationChoices.injection).toEqual([
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "S1",
      "S2",
      "S3",
      "S4",
      "S5",
      "S6",
    ]);
    expect(localAnesthesiaLocationChoices.topical).toEqual([
      "full mouth",
      "maxilla",
      "mandible",
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "S1",
      "S2",
      "S3",
      "S4",
      "S5",
      "S6",
    ]);
    expect(localAnesthesiaLocationChoices.rinse).toEqual(["full mouth"]);
  });

  it("formats a Dyclonine rinse with timing, duration, total, and assessment", () => {
    expect(
      formatLocalAnesthesiaSummary({
        localAnesthesiaNoContraindication: true,
        localAnesthesiaEntries: [
          {
            id: "rinse",
            route: "rinse",
            administrationType: "",
            toothAreas: ["full mouth"],
            product: "Dyclonine 1% rinse",
            amountMl: "5",
            durationSeconds: "60",
            timeAdministered: "09:24",
          },
        ],
        localAnesthesiaNoAdverseReactions: true,
        localAnesthesiaAdequateAchieved: true,
        localAnesthesiaNotes: "Patient tolerated rinse well.",
      }),
    ).toBe(`Local anesthetic administered: No C/I to LA
  Rinse — full mouth: Dyclonine 1% rinse 5 ml; duration: 60 seconds (at 9:24 AM)
  Total: Dyclonine 1% rinse 5.0 ml
  No adverse reactions noted
  Adequate anesthesia achieved
  Patient tolerated rinse well.`);
  });
});
