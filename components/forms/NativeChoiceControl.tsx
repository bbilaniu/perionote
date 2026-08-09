import React, { type ReactNode } from "react";

export function NativeChoiceControl({
  type,
  name,
  checked,
  onChange,
  children,
  ariaLabel,
  className = "",
}: {
  type: "checkbox" | "radio";
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950 ${
        checked
          ? "border-sky-700 bg-sky-50 text-sky-950 shadow-sm dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-100"
          : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      } ${className}`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        aria-label={ariaLabel}
        className="h-4 w-4 shrink-0 accent-sky-700"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}
