"use client";

import { useId, useState, type ReactNode } from "react";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { formControlClass } from "@/components/forms/controlStyles";

export const rapidActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:hover:bg-slate-800";

export function RapidChoice<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  error,
}: {
  id?: string;
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  disabled?: boolean;
  error?: string;
}) {
  const name = useId();
  return (
    <fieldset id={id} disabled={disabled} className="min-w-0">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <NativeChoiceControl
            key={option.value}
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="min-h-11 px-3"
          >
            {option.label}
          </NativeChoiceControl>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function RapidMultiChoice({
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
            checked={values.includes(choice)}
            onChange={(checked) =>
              onChange(
                checked
                  ? [...values, choice]
                  : values.filter((value) => value !== choice)
              )
            }
            className="min-h-11 px-3"
          >
            {choice}
          </NativeChoiceControl>
        ))}
      </div>
    </fieldset>
  );
}

export function RapidDisclosure({
  label,
  children,
  documented = false,
}: {
  label: string;
  children: ReactNode;
  documented?: boolean;
}) {
  return (
    <details className="min-w-0 rounded-lg" open={documented || undefined}>
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-sky-800 focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-200">
        {label}
        {documented ? " · documented" : ""}
      </summary>
      <div className="space-y-4 pb-2 pt-1">{children}</div>
    </details>
  );
}

export function RapidText({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <RapidDisclosure
      label={`Add ${label.toLocaleLowerCase("en-CA")}`}
      documented={Boolean(value)}
    >
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        className={formControlClass()}
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </RapidDisclosure>
  );
}

export function RapidStringChoice({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: string;
  choices: readonly string[];
  onChange: (value: string) => void;
}) {
  const [otherOpen, setOtherOpen] = useState(false);
  const custom = Boolean(value && !choices.includes(value));
  const id = useId();
  return (
    <div className="space-y-2">
      <RapidChoice
        label={label}
        value={value}
        options={[
          ...choices.map((choice) => ({ value: choice, label: choice })),
          ...(custom ? [{ value, label: value }] : []),
          { value: "", label: "Not documented" },
        ]}
        onChange={onChange}
      />
      <button
        type="button"
        className={rapidActionClass}
        aria-expanded={otherOpen || custom}
        aria-controls={id}
        onClick={() => setOtherOpen(!otherOpen)}
      >
        Other {label.toLocaleLowerCase("en-CA")}…
      </button>
      {otherOpen || custom ? (
        <label className="block text-sm" htmlFor={id}>
          Custom {label.toLocaleLowerCase("en-CA")}
          <input
            id={id}
            className={`mt-1 ${formControlClass()}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      ) : null}
    </div>
  );
}
