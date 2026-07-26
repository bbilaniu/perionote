"use client";

import {
  DropdownChevron,
  formControlClass,
} from "@/components/forms/controlStyles";

export function SelectField<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: TValue;
  options: ReadonlyArray<{ value: TValue; label: string }>;
  onChange: (value: TValue) => void;
  disabled?: boolean;
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-1">
        <select
          id={id}
          data-list-control="fixed-select"
          className={`${formControlClass({
            opensList: true,
            invalid: Boolean(error),
          })} appearance-none`}
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value as TValue)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <DropdownChevron />
        </span>
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
