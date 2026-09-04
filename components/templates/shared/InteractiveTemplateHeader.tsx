import { lifecyclePresentation } from "@/lib/templates/lifecyclePresentation";
import type { TemplatePresentation } from "@/lib/templates/types";
import type { ReactNode } from "react";

export function InteractiveTemplateHeader({
  title,
  description,
  lifecycle,
  actions,
}: TemplatePresentation & { actions?: ReactNode }) {
  const presentation = lifecyclePresentation[lifecycle];

  return (
    <header
      className={presentation.headerClassName}
      data-template-lifecycle={lifecycle}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={presentation.labelClassName}>{presentation.label}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="w-full sm:w-auto sm:shrink-0">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
