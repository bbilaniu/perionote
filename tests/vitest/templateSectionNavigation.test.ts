import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TemplateSectionNavigation } from "@/components/templates/shared/TemplateSectionNavigation";
import {
  createTemplateSectionNavigation,
  getTemplateSectionId,
} from "@/lib/templates/sectionNavigation";

describe("TemplateSectionNavigation", () => {
  it("creates stable section anchors from clinical headings", () => {
    expect(getTemplateSectionId("Occlusion & Habits")).toBe(
      "template-section-occlusion-habits"
    );
    expect(getTemplateSectionId("EOE / IOE")).toBe("template-section-eoe-ioe");
  });

  it("renders accessible links and optional completeness indicators", () => {
    const sections = createTemplateSectionNavigation([
      "Patient and Visit Context",
      "Treatment and Next Visit",
    ]);
    sections[0].status = "complete";

    const markup = renderToStaticMarkup(
      createElement(TemplateSectionNavigation, { sections })
    );

    expect(markup).toContain('aria-label="Form sections"');
    expect(markup).toContain(
      'href="#template-section-patient-and-visit-context"'
    );
    expect(markup).toContain('aria-current="location"');
    expect(markup).toContain("Complete");
    expect(markup).toContain("Treatment and Next Visit");
  });
});
