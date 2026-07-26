import type { ReactNode } from "react";

const controlBaseClass =
  "block min-h-10 w-full rounded-xl border bg-white text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-sky-400 dark:focus:ring-sky-900 dark:disabled:bg-slate-900 dark:disabled:text-slate-500";

export function formControlClass({
  opensList = false,
  invalid = false,
}: {
  opensList?: boolean;
  invalid?: boolean;
} = {}): string {
  const borderClass = invalid
    ? "border-red-600 dark:border-red-500"
    : "border-slate-300 dark:border-slate-700";
  const paddingClass = opensList ? "pl-3 pr-10" : "px-3";
  return `${controlBaseClass} ${borderClass} ${paddingClass}`;
}

export function DropdownChevron({
  open = false,
}: {
  open?: boolean;
}) {
  return (
    <svg
      data-dropdown-affordance
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={`h-4 w-4 text-slate-500 transition-transform dark:text-slate-400 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SelectedIndicator({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300">
      <svg
        data-selected-indicator
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
      >
        <path
          d="m4.5 10.5 3.25 3.25 7.75-7.75"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}
