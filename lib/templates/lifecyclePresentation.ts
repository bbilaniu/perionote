import type { TemplateLifecycleStatus } from "@/lib/templates/types";

type LifecyclePresentation = {
  label: string;
  headerClassName: string;
  labelClassName: string;
  badgeClassName: string;
};

export const lifecyclePresentation = {
  draft: {
    label: "Draft interactive conversion",
    headerClassName:
      "rounded-2xl border border-violet-300 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-950/30",
    labelClassName:
      "text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-300",
    badgeClassName:
      "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  },
  pilot: {
    label: "Pilot interactive conversion",
    headerClassName:
      "rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30",
    labelClassName:
      "text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300",
    badgeClassName:
      "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  ready: {
    label: "Ready interactive conversion",
    headerClassName:
      "rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30",
    labelClassName:
      "text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300",
    badgeClassName:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
} satisfies Record<TemplateLifecycleStatus, LifecyclePresentation>;
