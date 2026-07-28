import { formControlClass } from "@/components/forms/controlStyles";
import type { RefObject } from "react";

export function IsoDateInput({
  id,
  value,
  onChange,
  inputRef,
  disabled,
  readOnly,
  ariaInvalid,
  ariaDescribedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  readOnly?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  return (
    <div className="relative mt-1">
      <input
        ref={inputRef}
        id={id}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        type="date"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete="off"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        data-iso-date-display
        className={`${formControlClass()} pointer-events-none h-10 peer-focus:border-sky-600 peer-focus:ring-2 peer-focus:ring-sky-200 dark:peer-focus:border-sky-400 dark:peer-focus:ring-sky-900`}
        type="text"
        value={value}
        placeholder="YYYY-MM-DD"
        disabled={disabled}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
