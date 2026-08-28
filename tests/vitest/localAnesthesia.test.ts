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

  it("omits post-anesthetic findings when no anesthetic entry exists", () => {
    const summary = formatLocalAnesthesiaSummary({
      ...createEmptyLocalAnesthesiaValue(),
      localAnesthesiaNoContraindication: true,
      localAnesthesiaNoAdverseReactions: true,
      localAnesthesiaAdequateAchieved: true,
      localAnesthesiaNotes: "Stale assessment text",
    });

    expect(summary).toBe("Local anesthetic administered: No C/I to LA");
    expect(summary).not.toContain("No adverse reactions noted");
    expect(summary).not.toContain("Adequate anesthesia achieved");
    expect(summary).not.toContain("Stale assessment text");
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
  Rinse — full mouth: Dyclonine 1% rinse 5 ml; duration: 60 seconds (at 09:24)
  Total: Dyclonine 1% rinse 5.0 ml
  No adverse reactions noted
  Adequate anesthesia achieved
  Patient tolerated rinse well.`);
  });

  it("separates topical and injection locations with an em dash", () => {
    expect(
      formatLocalAnesthesiaSummary({
        localAnesthesiaNoContraindication: false,
        localAnesthesiaEntries: [
          {
            id: "topical",
            route: "topical",
            administrationType: "Sulcular application",
            toothAreas: ["maxilla"],
            product:
              "ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5%",
            amountMl: "1.7",
            durationSeconds: "",
            timeAdministered: "20:33",
          },
          {
            id: "injection",
            route: "injection",
            administrationType: "I/O",
            toothAreas: ["S2"],
            product: "Articaine 4% with 1:200K epinephrine",
            amountMl: "1.8",
            durationSeconds: "",
            timeAdministered: "20:32",
          },
        ],
        localAnesthesiaNoAdverseReactions: false,
        localAnesthesiaAdequateAchieved: false,
        localAnesthesiaNotes: "",
      }),
    ).toContain(`  Sulcular application — maxilla: ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5% 1.7 ml (at 20:33)
  I/O — S2: Articaine 4% with 1:200K epinephrine 1.8 ml (at 20:32)`);
  });
});
