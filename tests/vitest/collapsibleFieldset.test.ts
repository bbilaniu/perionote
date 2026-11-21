import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CollapsibleFieldset } from "@/components/templates/shared/CollapsibleFieldset";

describe("CollapsibleFieldset", () => {
  it("renders an accessible collapsed summary without mounting its content", () => {
    const markup = renderToStaticMarkup(
      createElement(
        CollapsibleFieldset,
        {
          id: "synthetic-disclosure",
          label: "Synthetic observations",
          summary: "Not assessed",
          open: false,
          onToggle: () => undefined,
        },
        "Hidden clinical controls",
      ),
    );

    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain(
      'aria-controls="synthetic-disclosure-content"',
    );
    expect(markup).toContain("Not assessed");
    expect(markup).not.toContain("Hidden clinical controls");
  });

  it("mounts content with the controlled id when expanded", () => {
    const markup = renderToStaticMarkup(
      createElement(
        CollapsibleFieldset,
        {
          id: "synthetic-disclosure",
          label: "Synthetic observations",
          summary: "2 documented",
          open: true,
          onToggle: () => undefined,
          appearance: "nested",
        },
        "Visible clinical controls",
      ),
    );

    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('id="synthetic-disclosure-content"');
    expect(markup).toContain("Visible clinical controls");
  });
});
