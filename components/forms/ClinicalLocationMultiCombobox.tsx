"use client";

import {
  FixedChoiceMultiCombobox,
  type FixedChoiceMultiComboboxGroup,
} from "@/components/forms/FixedChoiceMultiCombobox";
import { treatmentToothAreaChoices } from "@/lib/templates/adultHygiene2021";
import { localAnesthesiaLocationChoices } from "@/lib/templates/localAnesthesia";

export type ClinicalLocationPreset =
  | "finding"
  | "gingival"
  | "treatment"
  | "local-anesthesia-injection"
  | "local-anesthesia-topical"
  | "local-anesthesia-rinse";

export const localizedFindingAreaChoices = [
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
] as const;

export const gingivalLocationChoices = [
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
  "facial/buccal",
  "lingual/palatal",
  "interproximal",
  "marginal",
  "attached gingiva",
] as const;

const treatmentChoiceGroups = [
  {
    choices: ["full mouth", "maxilla", "mandible"],
    columns: 1,
  },
  {
    label: "Quadrants",
    choices: ["Q1", "Q2", "Q4", "Q3"],
    columns: 2,
  },
  {
    label: "Sextants",
    choices: ["S1", "S2", "S3", "S6", "S5", "S4"],
    columns: 3,
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const localAnesthesiaInjectionChoiceGroups = [
  {
    label: "Quadrants",
    choices: ["Q1", "Q2", "Q4", "Q3"],
    columns: 2,
  },
  {
    label: "Sextants",
    choices: ["S1", "S2", "S3", "S6", "S5", "S4"],
    columns: 3,
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const localAnesthesiaRinseChoiceGroups = [
  {
    choices: ["full mouth"],
    columns: 1,
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const gingivalChoiceGroups = [
  {
    label: "Arches",
    choices: ["maxilla", "mandible"],
    columns: 2,
  },
  {
    label: "Quadrants",
    choices: ["Q1", "Q2", "Q4", "Q3"],
    columns: 2,
  },
  {
    label: "Sextants",
    choices: ["S1", "S2", "S3", "S6", "S5", "S4"],
    columns: 3,
  },
  {
    label: "Surfaces / regions",
    choices: [
      "facial/buccal",
      "lingual/palatal",
      "interproximal",
      "marginal",
      "attached gingiva",
    ],
    columns: 2,
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const localizedFindingChoiceGroups = [
  {
    label: "Arches",
    choices: ["maxilla", "mandible"],
    columns: 2,
  },
  {
    label: "Quadrants",
    choices: ["Q1", "Q2", "Q4", "Q3"],
    columns: 2,
  },
  {
    label: "Sextants",
    choices: ["S1", "S2", "S3", "S6", "S5", "S4"],
    columns: 3,
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

export function ClinicalLocationMultiCombobox({
  id,
  label,
  preset,
  values,
  onChange,
}: {
  id: string;
  label: string;
  preset: ClinicalLocationPreset;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const choicesByPreset = {
    treatment: treatmentToothAreaChoices,
    finding: localizedFindingAreaChoices,
    gingival: gingivalLocationChoices,
    "local-anesthesia-injection": localAnesthesiaLocationChoices.injection,
    "local-anesthesia-topical": localAnesthesiaLocationChoices.topical,
    "local-anesthesia-rinse": localAnesthesiaLocationChoices.rinse,
  } as const satisfies Record<ClinicalLocationPreset, readonly string[]>;
  const choiceGroupsByPreset = {
    treatment: treatmentChoiceGroups,
    finding: localizedFindingChoiceGroups,
    gingival: gingivalChoiceGroups,
    "local-anesthesia-injection": localAnesthesiaInjectionChoiceGroups,
    "local-anesthesia-topical": treatmentChoiceGroups,
    "local-anesthesia-rinse": localAnesthesiaRinseChoiceGroups,
  } as const satisfies Record<
    ClinicalLocationPreset,
    readonly FixedChoiceMultiComboboxGroup[]
  >;
  const choices = choicesByPreset[preset];
  const choiceGroups = choiceGroupsByPreset[preset];
  const usesToothAreaLanguage =
    preset === "treatment" || preset.startsWith("local-anesthesia-");

  return (
    <FixedChoiceMultiCombobox
      id={id}
      label={label}
      choices={choices}
      choiceGroups={choiceGroups}
      values={values}
      onChange={onChange}
      customPlaceholder={
        usesToothAreaLanguage
          ? "Search or add a Tooth/area"
          : preset === "finding"
            ? "Search or add an area"
            : "Search or add a location"
      }
      showSelectedChips={false}
      emptyLabel={label === "Tooth/area" ? "None selected" : undefined}
      truncateTrigger={label === "Tooth/area"}
    />
  );
}
