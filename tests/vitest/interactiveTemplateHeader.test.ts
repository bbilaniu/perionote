import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InteractiveTemplateHeader } from "@/components/templates/shared/InteractiveTemplateHeader";
import { lifecyclePresentation } from "@/lib/templates/lifecyclePresentation";
import type { TemplateLifecycleStatus } from "@/lib/templates/types";

const lifecycleCases: Array<
  [TemplateLifecycleStatus, string, string, string, string]
> = [
  [
    "draft",
    "Draft interactive conversion",
    "border-violet-300",
    "bg-violet-50",
    "bg-violet-100",
  ],
  [
    "pilot",
    "Pilot interactive conversion",
    "border-amber-300",
    "bg-amber-50",
    "bg-amber-100",
  ],
  [
    "ready",
    "Ready interactive conversion",
    "border-emerald-300",
    "bg-emerald-50",
    "bg-emerald-100",
  ],
];

describe("interactive template lifecycle presentation", () => {
  it.each(lifecycleCases)(
    "derives the %s label and colors from lifecycle metadata",
    (lifecycle, label, borderClass, backgroundClass, badgeClass) => {
      const presentation = lifecyclePresentation[lifecycle];

      expect(presentation.label).toBe(label);
      expect(presentation.headerClassName).toContain(borderClass);
      expect(presentation.headerClassName).toContain(backgroundClass);
      expect(presentation.badgeClassName).toContain(badgeClass);
    },
  );

  it("places the description below the title and action row", () => {
    const markup = renderToStaticMarkup(
      createElement(InteractiveTemplateHeader, {
        title: "Example template",
        description: "Full-width description",
        lifecycle: "ready",
        actions: createElement("button", null, "Example action"),
      }),
    );

    expect(markup.indexOf("Example action")).toBeLessThan(
      markup.indexOf("Full-width description"),
    );
    expect(markup).toContain(
      'class="mt-4 w-full text-sm text-slate-700 dark:text-slate-300"',
    );
  });
});
