export const cariesRiskFactorSeedValues = [
  ["high-sugar-frequency", "High frequency of sugar intake"],
  ["inadequate-oral-hygiene", "Inadequate oral hygiene"],
  ["insufficient-fluoride", "Insufficient exposure to fluoride"],
  ["heavily-restored-dentition", "Heavily restored dentition"],
  ["hyposalivation", "Hyposalivation"],
  ["caries-history-36-months", "History of caries in the last 36 months"],
  ["symptom-driven-visits", "Symptomatically driven dental visits"],
] as const;

export type CariesRiskSuggestionLevel = "Moderate" | "High" | "";

export interface CariesRiskSuggestion {
  level: CariesRiskSuggestionLevel;
  reasons: string[];
  warnings: string[];
}

function normalized(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-CA");
}

const factorByLabel = new Map(
  cariesRiskFactorSeedValues.map(([id, label]) => [normalized(label), id]),
);

/**
 * Provides conservative adult caries-risk decision support from the factors
 * this form currently records. It intentionally does not infer Low risk from
 * an empty list and never changes the clinician-selected risk level.
 *
 * Rules are aligned with the ADA Caries Risk Assessment Form for patients
 * over age 6. The form's broader "history in 36 months" value does not include
 * lesion count, so it can support Moderate but cannot distinguish the ADA's
 * Moderate (1–2) and High (3+) history thresholds by itself.
 */
export function suggestAdultCariesRisk(
  selectedFactors: readonly string[],
): CariesRiskSuggestion {
  const factorIds = selectedFactors
    .map((factor) => factorByLabel.get(normalized(factor)))
    .filter((id): id is NonNullable<typeof id> => Boolean(id));
  const recognized = new Set(factorIds);
  const unrecognizedCount = selectedFactors.filter(
    (factor) => factor.trim() && !factorByLabel.has(normalized(factor)),
  ).length;
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (!selectedFactors.some((factor) => factor.trim())) {
    return {
      level: "",
      reasons: [],
      warnings: [
        "No risk level is suggested until at least one assessed risk factor is documented; an empty list does not establish Low risk.",
      ],
    };
  }

  if (recognized.has("high-sugar-frequency")) {
    reasons.push(
      "Frequent sugar exposure is an adult high-risk condition in the ADA assessment.",
    );
  }
  if (recognized.has("hyposalivation")) {
    reasons.push(
      "Hyposalivation is documented; confirm severity because severe dry mouth is an adult high-risk condition in the ADA assessment.",
    );
  }

  const level: CariesRiskSuggestionLevel = reasons.length
    ? "High"
    : recognized.size
      ? "Moderate"
      : "";

  if (recognized.has("caries-history-36-months")) {
    reasons.push(
      "Caries in the last 36 months supports at least Moderate risk; lesion or restoration count is needed to distinguish 1–2 from 3 or more.",
    );
  }
  if (level === "Moderate") {
    const otherRecognizedCount = recognized.size - Number(
      recognized.has("caries-history-36-months"),
    );
    if (otherRecognizedCount > 0) {
      reasons.push(
        `${otherRecognizedCount} additional documented contributing ${
          otherRecognizedCount === 1 ? "condition supports" : "conditions support"
        } a Moderate working suggestion.`,
      );
    }
  }
  if (unrecognizedCount) {
    warnings.push(
      `${unrecognizedCount} custom ${
        unrecognizedCount === 1 ? "factor is" : "factors are"
      } not mapped to a risk level and still require clinical review.`,
    );
  }
  warnings.push(
    "This suggestion uses only the documented factors in this form and does not replace a complete caries-risk assessment or clinical judgment.",
  );

  return { level, reasons, warnings };
}
