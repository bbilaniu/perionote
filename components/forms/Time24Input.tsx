import { isCompleteTime24 } from "@/lib/templates/date";
import type { RefObject } from "react";

function normalizeDraft(value: string): string | null {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (!digits) return "";
  if (Number(digits[0]) > 2) return null;
  if (digits.length >= 2 && Number(digits.slice(0, 2)) > 23) return null;
  if (digits.length >= 3 && Number(digits[2]) > 5) return null;
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

export function Time24Input({
  id,
  value,
  onChange,
  className,
  inputRef,
  ariaInvalid,
  ariaDescribedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  return (
    <input
      ref={inputRef}
      id={id}
      className={className}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={5}
      pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]"
      placeholder="HH:mm"
      title="Enter time as HH:mm using a 24-hour clock"
      value={value}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      onChange={(event) => {
        const next = normalizeDraft(event.target.value);
        if (next != null) onChange(next);
      }}
      onBlur={() => {
        if (value && !isCompleteTime24(value)) onChange("");
      }}
    />
  );
}
