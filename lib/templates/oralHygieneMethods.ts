export const toothbrushTypeChoices = ["Electric", "Manual"] as const;
export const flossingTypeChoices = [
  "String floss",
  "Water flosser",
  "Interdental picks",
] as const;

export interface OralHygieneMethods {
  toothbrushTypes: string[];
  flossingTypes: string[];
}

export function createEmptyOralHygieneMethods(): OralHygieneMethods {
  return { toothbrushTypes: [], flossingTypes: [] };
}

export const oralHygieneMethodsDraftArrayItemShapes = {
  toothbrushTypes: "",
  flossingTypes: "",
} as const;

// Missing fields in older encounters mean not documented, never no use.
export function formatOralHygieneMethods(
  value: Partial<OralHygieneMethods>,
): string[] {
  return [
    ["Toothbrush type used", value.toothbrushTypes],
    ["Flossing type used", value.flossingTypes],
  ].flatMap(([label, selections]) => {
    const choices = Array.isArray(selections)
      ? [...new Set(selections.map((choice) => choice.trim()).filter(Boolean))]
      : [];
    return choices.length ? [`${label}: ${choices.join("; ")}.`] : [];
  });
}
