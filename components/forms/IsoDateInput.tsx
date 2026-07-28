"use client";

import { formControlClass } from "@/components/forms/controlStyles";
import { useRef, type RefObject } from "react";

const isoDatePattern =
  "[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])";

function formatIsoDateInput(value: string): string {
  const digits = value.replaceAll(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function IsoDateInput({
  id,
  label,
  value,
  onChange,
  inputRef,
  disabled,
  readOnly,
  ariaInvalid,
  ariaDescribedBy,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  readOnly?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const pickerValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";

  function openPicker() {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }

    try {
      picker.showPicker();
    } catch {
      picker.click();
    }
  }

  return (
    <div className="relative mt-1">
      <input
        ref={pickerRef}
        data-native-date-picker
        className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
        type="date"
        value={pickerValue}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        ref={inputRef}
        id={id}
        data-iso-date-display
        className={`${formControlClass({ invalid: ariaInvalid })} h-10 pr-11`}
        type="text"
        value={value}
        placeholder="YYYY-MM-DD"
        inputMode="numeric"
        pattern={isoDatePattern}
        maxLength={10}
        title="Use YYYY-MM-DD format."
        disabled={disabled}
        readOnly={readOnly}
        autoComplete="off"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onChange={(event) => onChange(formatIsoDateInput(event.target.value))}
      />
      <button
        data-date-picker-trigger
        className="absolute inset-y-1 right-1 inline-flex w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:focus:ring-sky-900"
        type="button"
        aria-label={`Choose ${label}`}
        disabled={disabled || readOnly}
        onClick={openPicker}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
        >
          <rect
            x="3"
            y="4.5"
            width="14"
            height="12.5"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6.5 2.75v3.5M13.5 2.75v3.5M3 8.25h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
