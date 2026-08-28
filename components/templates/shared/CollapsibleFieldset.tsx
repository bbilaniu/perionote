"use client";

import React, { type ReactNode } from "react";
import { DropdownChevron } from "@/components/forms/controlStyles";

export function CollapsibleFieldset({
  id,
  label,
  summary,
  open,
  onToggle,
  children,
  appearance = "card",
}: {
  id: string;
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
  appearance?: "card" | "nested";
}) {
  const contentId = `${id}-content`;
  const fieldsetClass =
    appearance === "card"
      ? "rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      : "border-t border-slate-200 pt-3 dark:border-slate-700";
  const contentClass = appearance === "card" ? "space-y-4 pt-2" : "space-y-4 pt-3";

  return (
    <fieldset className={fieldsetClass} aria-label={label}>
      <button
        id={id}
        type="button"
        className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span className="min-w-0">{label}</span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
            {summary}
          </span>
          <DropdownChevron open={open} />
        </span>
        <span className="col-span-2 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
          {summary}
        </span>
      </button>
      {open ? (
        <div id={contentId} className={contentClass}>
          {children}
        </div>
      ) : null}
    </fieldset>
  );
}
