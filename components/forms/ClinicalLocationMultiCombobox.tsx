"use client";

import {
  FixedChoiceMultiCombobox,
  type FixedChoiceMultiComboboxGroup,
} from "@/components/forms/FixedChoiceMultiCombobox";
import { treatmentToothAreaChoices } from "@/lib/templates/adultHygiene2021";

export type ClinicalLocationPreset = "finding" | "gingival" | "treatment";

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
  const choices =
    preset === "treatment"
      ? treatmentToothAreaChoices
      : preset === "finding"
        ? localizedFindingAreaChoices
        : gingivalLocationChoices;
  const choiceGroups =
    preset === "treatment"
      ? treatmentChoiceGroups
      : preset === "finding"
        ? localizedFindingChoiceGroups
        : gingivalChoiceGroups;

  return (
    <FixedChoiceMultiCombobox
      id={id}
      label={label}
      choices={choices}
      choiceGroups={choiceGroups}
      values={values}
      onChange={onChange}
      customPlaceholder={
        preset === "treatment"
          ? "Search or add a Tooth/area"
          : preset === "finding"
            ? "Search or add an area"
            : "Search or add a location"
      }
      showSelectedChips={false}
    />
  );
}
