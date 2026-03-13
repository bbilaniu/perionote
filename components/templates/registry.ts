import { GingivalDescriptionWebformImportedTemplate } from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { ShortDentalHygienNoteImportedTemplate } from "@/components/templates/imported/ShortDentalHygienNoteImportedTemplate";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";
import { buildGingivalDescriptionWebformSummary } from "@/lib/templates/summary/buildGingivalDescriptionWebformSummary";
import type { TemplateDefinition } from "@/lib/templates/types";

function defineTemplate<TFixture>(
  template: TemplateDefinition<TFixture>,
): TemplateDefinition<TFixture> {
  return template;
}

export const templateRegistry = [
  defineTemplate({
    slug: "gingival-description",
    title: "Gingival Description",
    description:
      "Hidden legacy alias that reuses the imported dental hygiene webform template.",
    kind: "native",
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
    fixture: gingivalDescriptionWebformFixture,
    summary: buildGingivalDescriptionWebformSummary(
      gingivalDescriptionWebformFixture,
    ),
    buildSummary: buildGingivalDescriptionWebformSummary,
    component: ShortDentalHygienNoteImportedTemplate,
  }),
] as const;

export type RegisteredTemplate = (typeof templateRegistry)[number];

export const templateBrowserRegistry = templateRegistry.filter(
  (template) => !template.hidden,
);

export function getTemplateBySlug(
  slug: string,
): RegisteredTemplate | undefined {
  return templateRegistry.find((template) => template.slug === slug);
}
