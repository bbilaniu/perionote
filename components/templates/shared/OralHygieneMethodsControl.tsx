"use client";

import type { ReactNode } from "react";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import {
  flossingTypeChoices,
  toothbrushTypeChoices,
  type OralHygieneMethods,
} from "@/lib/templates/oralHygieneMethods";

function MethodChoices({
  label,
  values,
  choices,
  onChange,
}: {
  label: string;
  values: string[];
  choices: readonly string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set([...choices, ...values])).map((choice) => (
          <NativeChoiceControl
            key={choice}
            type="checkbox"
            className="min-h-11 px-3"
            checked={values.includes(choice)}
            onChange={(checked) =>
              onChange(
                checked
                  ? [...values, choice]
                  : values.filter((value) => value !== choice),
              )
            }
          >
            {choice}
          </NativeChoiceControl>
        ))}
      </div>
    </fieldset>
  );
}

export function OralHygieneMethodsControl({
  value,
  onChange,
  brushingFrequencyControl,
  flossingFrequencyControl,
}: {
  value: OralHygieneMethods;
  onChange: <K extends keyof OralHygieneMethods>(
    key: K,
    value: OralHygieneMethods[K],
  ) => void;
  brushingFrequencyControl?: ReactNode;
  flossingFrequencyControl?: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <MethodChoices
          label="Type of toothbrush used"
          values={value.toothbrushTypes ?? []}
          choices={toothbrushTypeChoices}
          onChange={(values) => onChange("toothbrushTypes", values)}
        />
        {brushingFrequencyControl}
      </div>
      <div className="space-y-3">
        <MethodChoices
          label="Type of flossing used"
          values={value.flossingTypes ?? []}
          choices={flossingTypeChoices}
          onChange={(values) => onChange("flossingTypes", values)}
        />
        {flossingFrequencyControl}
      </div>
    </div>
  );
}
