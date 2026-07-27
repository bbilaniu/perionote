"use client";

import { useId, type ReactNode } from "react";

export function TooltipActionButton({
  children,
  tooltip,
  className,
  disabled,
  ariaLabel,
  onClick,
}: {
  children: ReactNode;
  tooltip: string;
  className: string;
  disabled?: boolean;
  ariaLabel?: string;
  onClick: () => void;
}) {
  const tooltipId = useId();

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className={className}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        onClick={onClick}
      >
        {children}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-max max-w-64 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-within:block dark:bg-slate-100 dark:text-slate-950"
      >
        {tooltip}
      </span>
    </span>
  );
}
