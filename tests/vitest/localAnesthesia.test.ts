import { describe, expect, it } from "vitest";

import {
  createEmptyLocalAnesthesiaValue,
  formatLocalAnesthesiaSummary,
} from "@/lib/templates/localAnesthesia";

describe("local anesthesia", () => {
  it("starts without asserting that contraindications were reviewed", () => {
    const value = createEmptyLocalAnesthesiaValue();

    expect(value.localAnesthesiaNoContraindication).toBe(false);
    expect(formatLocalAnesthesiaSummary(value)).toBe("");
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
            area: "full mouth",
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
