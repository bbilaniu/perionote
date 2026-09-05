import { describe, expect, it } from "vitest";
import {
  createEmptyAdultHygiene2026Form,
  plaqueChoices,
  calculusChoices,
  stainChoices,
  bleedingChoices,
} from "@/lib/templates/adultHygiene2026";
import {
  formatRapidFinding,
  parseRapidFinding,
  updateRapidField,
  type RapidFindingKind,
} from "@/lib/templates/rapidEntry";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";
import { adultHygiene2026Fixture } from "@/lib/templates/fixtures/adultHygiene2026.fixture";
import { isAdultHygieneDraftForm } from "@/components/templates/native/AdultHygiene2026Template";

describe("Rapid Entry shared encounter mappings", () => {
  it.each<[RapidFindingKind, readonly string[]]>([
    ["plaque", plaqueChoices],
    ["calculus", calculusChoices],
    ["stain", stainChoices],
    ["bleeding", bleedingChoices],
  ])(
    "round-trips established %s choices without changing wording",
    (kind, choices) => {
      for (const choice of choices) {
        const facets = parseRapidFinding(kind, choice);
        expect(facets).not.toBeNull();
        expect(formatRapidFinding(facets!)).toBe(choice);
      }
    }
  );

  it("retains unfamiliar or contradictory wording for explicit editing", () => {
    expect(
      parseRapidFinding("plaque", "Localized heavy around implant")
    ).toBeNull();
    expect(parseRapidFinding("bleeding", "None generalized")).toBeNull();
    expect(parseRapidFinding("stain", "slight heavy")).toBeNull();
    expect(
      parseRapidFinding("calculus", "localized generalized mild")
    ).toBeNull();
  });

  it("None has no distribution and empty facets make no clinical assertion", () => {
    expect(
      formatRapidFinding({
        amount: "None",
        distribution: "Generalized",
        locations: ["marginal"],
      })
    ).toBe("None");
    expect(
      formatRapidFinding({ amount: "", distribution: "", locations: [] })
    ).toBe("");
    const form = createEmptyAdultHygiene2026Form();
    const note = buildAdultHygiene2026Summary(
      updateRapidField(form, "plaqueChoice", "")
    );
    expect(note).not.toMatch(/Plaque:|WNL|Healthy|None/);
  });

  it("uses the existing schema and each existing output's inclusion rules", () => {
    let form = createEmptyAdultHygiene2026Form();
    form = updateRapidField(form, "brushingFrequency", "Brushing 2x/day");
    form = updateRapidField(
      form,
      "plaqueChoice",
      formatRapidFinding({
        amount: "moderate",
        distribution: "Generalized",
        locations: ["interproximal"],
      })
    );
    form = updateRapidField(form, "extraoralStatus", "wnl");
    form = updateRapidField(form, "ohiAidsReviewed", [
      "SUPERFLOSS",
      "INTERPROXIMAL BRUSH",
    ]);
    expect(isAdultHygieneDraftForm(JSON.parse(JSON.stringify(form)))).toBe(
      true
    );
    const complete = buildAdultHygiene2026Summary(form, { output: "complete" });
    expect(complete).toContain("Plaque: Generalized moderate interproximal");
    expect(complete).toContain("Patient is currently: Brushing 2x/day.");
    expect(complete).toContain(
      "OH Aids Reviewed/Recommended: SUPERFLOSS; INTERPROXIMAL BRUSH"
    );
    expect(complete).toContain("EOE: WNL.");
    const hygiene = buildAdultHygiene2026Summary(form, { output: "hygiene" });
    expect(hygiene).toContain("Plaque: Generalized moderate interproximal");
    expect(hygiene).not.toContain("EOE:");
    const recare = buildAdultHygiene2026Summary(form, { output: "recare" });
    expect(recare).toContain("EOE: WNL.");
    expect(recare).not.toContain("Plaque:");
    expect(
      buildAdultHygiene2026Summary(updateRapidField(form, "plaqueChoice", ""))
    ).not.toContain("Plaque:");
  });

  it("retains detailed-only observations and patient-specific qualifiers", () => {
    const form = structuredClone(adultHygiene2026Fixture);
    const next = updateRapidField(form, "brushingFrequency", "Brushing 1x/day");
    expect(next.periodontalClassification).toEqual(
      form.periodontalClassification
    );
    expect(next.gingivalDescription).toEqual(form.gingivalDescription);
    expect(next.structuredIntraoralFindings).toEqual(
      form.structuredIntraoralFindings
    );
    expect(next.toothFindings).toEqual(form.toothFindings);
    expect(next.localAnesthesiaEntries).toEqual(form.localAnesthesiaEntries);
    expect(form).toEqual(adultHygiene2026Fixture);
  });

  it("updates derived OHE treatment details but preserves customized details", () => {
    const form = createEmptyAdultHygiene2026Form();
    form.treatmentCompleted = [
      {
        id: "derived",
        treatmentType: "OHE",
        toothAreas: [],
        details: "",
        procedureKind: "ohe",
        detailsCustomized: false,
      },
      {
        id: "custom",
        treatmentType: "OHE",
        toothAreas: [],
        details: "Synthetic custom recap",
        procedureKind: "ohe",
        detailsCustomized: true,
      },
    ];
    const next = updateRapidField(form, "oheTopicsReviewed", ["Bass brushing"]);
    expect(next.treatmentCompleted[0].details).toContain("Bass brushing");
    expect(next.treatmentCompleted[1].details).toBe("Synthetic custom recap");
  });
});
