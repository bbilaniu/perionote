export const patientChiefConcernSeedValues = [
  ["nothing", "Nothing"],
  [
    "periodic-examination-recare",
    "Patient presents for periodic examination/recare",
  ],
  ["sore-gums-brushing-flossing", "Sore gums upon brushing/flossing"],
  [
    "appearance-yellowing-stain",
    "Dissatisfaction with the appearance of teeth due to yellowing/stain",
  ],
  ["food-catches-between-teeth", "Food catches between teeth"],
  ["sensitivity-hot-cold", "Sensitivity to hot and cold"],
] as const;

export const patientChiefConcernChoices = patientChiefConcernSeedValues.map(
  ([, label]) => label,
);

export const noPatientChiefConcern = patientChiefConcernChoices[0];

function isNoPatientChiefConcern(value: string) {
  return (
    value.normalize("NFKC").trim().toLocaleLowerCase("en-CA") ===
    noPatientChiefConcern.toLocaleLowerCase("en-CA")
  );
}

export function applyPatientChiefConcernSelectionRules(
  previousValues: string[],
  nextValues: string[],
) {
  const previouslySelectedNothing = previousValues.some(
    isNoPatientChiefConcern,
  );
  const nextIncludesNothing = nextValues.some(isNoPatientChiefConcern);

  if (nextIncludesNothing && !previouslySelectedNothing) {
    return [noPatientChiefConcern];
  }

  if (previouslySelectedNothing && nextValues.length > 1) {
    return nextValues.filter((value) => !isNoPatientChiefConcern(value));
  }

  return nextValues;
}

export function formatPatientChiefConcerns(
  label: string,
  values: string[],
  asList: boolean,
) {
  const cleanValues = values.map((value) => value.trim()).filter(Boolean);
  if (cleanValues.length === 0) return "";

  if (asList) {
    return `${label}:\n${cleanValues
      .map((value) => `  - ${value}`)
      .join("\n")}`;
  }

  const inlineValue = cleanValues.join("; ");
  return `${label}: ${/[.!?]$/.test(inlineValue) ? inlineValue : `${inlineValue}.`}`;
}
