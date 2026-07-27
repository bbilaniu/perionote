export const patientChiefConcernSeedValues = [
  ["nothing", "Nothing"],
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
