import { GingivalDescriptionWebformImportedTemplate } from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { ShortDentalHygienNoteImportedTemplate } from "@/components/templates/imported/ShortDentalHygienNoteImportedTemplate";
import { VeryShortDentalHygienNoteImportedTemplate } from "@/components/templates/imported/VeryShortDentalHygienNoteImportedTemplate";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";
import { buildGingivalDescriptionWebformSummary } from "@/lib/templates/summary/buildGingivalDescriptionWebformSummary";
import type { TemplateDefinition } from "@/lib/templates/types";

function defineTemplate<TFixture>(
  template: TemplateDefinition<TFixture>,
): TemplateDefinition<TFixture> {
  return template;
}

export const standaloneInteractiveRegistry = [
  defineTemplate({
    slug: "gingival-description",
    title: "Gingival Description",
    description:
      "Hidden legacy alias that reuses the imported dental hygiene webform template.",
    kind: "native",
    lifecycle: "ready",
    hidden: true,
    fixture: gingivalDescriptionWebformFixture,
    summary: buildGingivalDescriptionWebformSummary(
      gingivalDescriptionWebformFixture,
    ),
    buildSummary: buildGingivalDescriptionWebformSummary,
    component: GingivalDescriptionWebformImportedTemplate,
  }),
  defineTemplate({
    slug: "dental-hygiene-note-webform",
    title: "Dental Hygiene Note Webform Template",
    description:
      "Imported wrapper for a legacy dental hygiene webform template.",
    kind: "imported",
    lifecycle: "ready",
    fixture: gingivalDescriptionWebformFixture,
    summary: buildGingivalDescriptionWebformSummary(
      gingivalDescriptionWebformFixture,
    ),
    buildSummary: buildGingivalDescriptionWebformSummary,
    component: GingivalDescriptionWebformImportedTemplate,
  }),
  defineTemplate({
    slug: "short-dental-hygien-note",
    title: "Short Dental Hygien Note",
    description:
      "Copied from the dental hygiene note webform template for a shorter hygiene-note workflow.",
    kind: "imported",
    lifecycle: "ready",
    fixture: gingivalDescriptionWebformFixture,
    summary: buildGingivalDescriptionWebformSummary(
      gingivalDescriptionWebformFixture,
    ),
    buildSummary: buildGingivalDescriptionWebformSummary,
    component: ShortDentalHygienNoteImportedTemplate,
  }),
  defineTemplate({
    slug: "very-short-template",
    title: "Very short template",
    description:
      "Minimal hygiene-note workflow with a sticky summary panel and collapsible sections.",
    kind: "imported",
    lifecycle: "ready",
    fixture: gingivalDescriptionWebformFixture,
    summary: buildGingivalDescriptionWebformSummary(
      gingivalDescriptionWebformFixture,
    ),
    buildSummary: buildGingivalDescriptionWebformSummary,
    component: VeryShortDentalHygienNoteImportedTemplate,
  }),
] as const;

export type RegisteredStandaloneInteractive =
  (typeof standaloneInteractiveRegistry)[number];

export const standaloneInteractiveBrowserRegistry =
  standaloneInteractiveRegistry.filter(
    (template) => !template.hidden,
  );

export function getStandaloneInteractiveBySlug(
  slug: string,
): RegisteredStandaloneInteractive | undefined {
  return standaloneInteractiveRegistry.find(
    (template) => template.slug === slug,
  );
}
