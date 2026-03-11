import { GingivalDescriptionWebformImportedTemplate } from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";
import { buildGingivalDescriptionWebformSummary } from "@/lib/templates/summary/buildGingivalDescriptionWebformSummary";
import type { TemplateDefinition } from "@/lib/templates/types";

function defineTemplate<TFixture>(template: TemplateDefinition<TFixture>): TemplateDefinition<TFixture> {
  return template;
}

export const templateRegistry = [
  defineTemplate({
    slug: "dental-hygiene-note-webform",
    title: "Dental Hygiene Note Webform Template",
    description: "Imported wrapper for a legacy dental hygiene webform template.",
    kind: "imported",
    fixture: gingivalDescriptionWebformFixture,
    summary: buildGingivalDescriptionWebformSummary(gingivalDescriptionWebformFixture),
    buildSummary: buildGingivalDescriptionWebformSummary,
    component: GingivalDescriptionWebformImportedTemplate
  })
] as const;

export type RegisteredTemplate = (typeof templateRegistry)[number];

export function getTemplateBySlug(slug: string): RegisteredTemplate | undefined {
  return templateRegistry.find((template) => template.slug === slug);
}
