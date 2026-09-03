import type { ReactNode } from "react";
import { formControlClass } from "@/components/forms/controlStyles";

const buttonClass =
  "rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

export function GeneratedNotePanel({
  textareaId,
  accessibleLabel,
  value,
  copyLabel = "Copy note",
  copyDisabled,
  statusMessage,
  description = "The visible preview is copied unchanged.",
  placeholder = "Complete fields to build the note.",
  controls,
}: {
  textareaId: string;
  accessibleLabel: string;
  value: string;
  copyLabel?: string;
  copyDisabled: boolean;
  statusMessage: string;
  description?: string;
  placeholder?: string;
  controls?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Generated Note</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
      {controls}
      <label className="sr-only" htmlFor={textareaId}>
        {accessibleLabel}
      </label>
      <textarea
        id={textareaId}
        className={`mt-4 min-h-[34rem] resize-y py-2 font-mono leading-6 ${formControlClass()}`}
        readOnly
        value={value}
        placeholder={placeholder}
      />
      <div className="mt-4">
        <button
          type="submit"
          className={`${buttonClass} bg-slate-900 text-white hover:bg-slate-700 dark:bg-sky-700 dark:hover:bg-sky-600`}
          disabled={copyDisabled}
        >
          {copyLabel}
        </button>
      </div>
      <p
        className="mt-3 min-h-5 text-sm text-slate-700 dark:text-slate-300"
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </section>
  );
}
