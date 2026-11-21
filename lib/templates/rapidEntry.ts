import type { AdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import {
  buildOheTreatmentRecap,
  syncDerivedOheTreatmentDetails,
} from "@/lib/templates/adultHygieneTreatment";
import { createTemplateSectionNavigation } from "@/lib/templates/sectionNavigation";

export const rapidEntrySections = createTemplateSectionNavigation([
  "Visit",
  "Oral Hygiene",
  "Hygiene Findings",
  "Gingiva and Periodontal Assessment",
  "Examination and Records",
  "Education and Treatment",
  "Recommendations",
]).map((section, index) => ({
  ...section,
  label: ["Visit", "Oral Hygiene", "Hygiene Findings", "Gingiva / Perio", "Exam / Records", "OHE / Treatment", "Next Visit"][index],
}));
export const rapidEntryPreferenceKey =
  "hygienenote.adult-hygiene-2026.entry-mode.v1";
export type EntryMode = "rapid" | "detailed";
export type RapidFindingKind = "plaque" | "calculus" | "stain" | "bleeding";
export type RapidFindingFacets = {
  amount: string;
  distribution: string;
  locations: string[];
};

export function findingAmounts(kind: RapidFindingKind) {
  return kind === "stain"
    ? ["slight", "moderate", "heavy"]
    : kind === "bleeding"
    ? ["mild", "moderate", "severe"]
    : ["mild", "moderate", "heavy"];
}

// The Detailed form stores these dimensions in one established choice string.
// Reject unfamiliar wording rather than partially parsing and losing qualifiers.
export function parseRapidFinding(
  kind: RapidFindingKind,
  choice: string
): RapidFindingFacets | null {
  const tokens = choice
    .toLowerCase()
    .trim()
    .split(/[\s/]+/)
    .filter(Boolean);
  if (tokens.length === 1 && tokens[0] === "none")
    return { amount: "None", distribution: "", locations: [] };
  const amounts = findingAmounts(kind);
  const distributions = ["localized", "generalized"];
  const locations =
    kind === "plaque" || kind === "calculus"
      ? ["marginal", "interproximal"]
      : [];
  if (
    tokens.some(
      (token) => ![...amounts, ...distributions, ...locations].includes(token)
    ) ||
    tokens.filter((token) => amounts.includes(token)).length > 1 ||
    tokens.filter((token) => distributions.includes(token)).length > 1
  )
    return null;
  const distribution =
    tokens.find((token) => distributions.includes(token)) ?? "";
  return {
    amount: tokens.find((token) => amounts.includes(token)) ?? "",
    distribution: distribution
      ? distribution[0].toUpperCase() + distribution.slice(1)
      : "",
    locations: locations.filter((location) => tokens.includes(location)),
  };
}

export function formatRapidFinding(facets: RapidFindingFacets): string {
  if (facets.amount === "None") return "None";
  return [facets.distribution, facets.amount, facets.locations.join("/")]
    .filter(Boolean)
    .join(" ");
}

export function updateRapidField<K extends keyof AdultHygiene2026Form>(
  form: AdultHygiene2026Form,
  key: K,
  value: AdultHygiene2026Form[K]
): AdultHygiene2026Form {
  const next = { ...form, [key]: value };
  if (
    ![
      "homeCareInstructionReviewed",
      "standardOheStatementApplies",
      "oheTopicsReviewed",
      "oheNotes",
    ].includes(key)
  )
    return next;
  // Same derived OHE treatment contract as the Detailed education control.
  return {
    ...next,
    treatmentCompleted: syncDerivedOheTreatmentDetails(
      next.treatmentCompleted,
      buildOheTreatmentRecap(next)
    ),
  };
}
