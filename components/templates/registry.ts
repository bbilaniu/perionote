import { GingivalDescriptionTemplate } from "@/components/templates/native/GingivalDescriptionTemplate";
import { HygieneNoteImportedTemplate } from "@/components/templates/imported/HygieneNoteImportedTemplate";
import { GingivalDescriptionWebformImportedTemplate } from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { gingivalDescriptionFixture } from "@/lib/templates/fixtures/gingivalDescription.fixture";
import { hygieneNoteFixture } from "@/lib/templates/fixtures/hygieneNote.fixture";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";
import { buildGingivalDescriptionSummary } from "@/lib/templates/summary/buildGingivalDescriptionSummary";
import { buildHygieneNoteSummary } from "@/lib/templates/summary/buildHygieneNoteSummary";
import { buildGingivalDescriptionWebformSummary } from "@/lib/templates/summary/buildGingivalDescriptionWebformSummary";
import type { TemplateDefinition } from "@/lib/templates/types";

function defineTemplate<TFixture>(template: TemplateDefinition<TFixture>): TemplateDefinition<TFixture> {
  return template;
}

export const templateRegistry = [
  defineTemplate({
    slug: "gingival-description",
    title: "Gingival Description",
    description: "Native template for documenting gingival findings and follow-up planning.",
    kind: "native",
    fixture: gingivalDescriptionFixture,
    summary: buildGingivalDescriptionSummary(gingivalDescriptionFixture),
    buildSummary: buildGingivalDescriptionSummary,
    component: GingivalDescriptionTemplate
  }),
  defineTemplate({
    slug: "hygiene-note",
    title: "Hygiene Note",
    description: "Imported template wrapper from legacy JSX with extracted summary builder.",
    kind: "imported",
    fixture: hygieneNoteFixture,
    summary: buildHygieneNoteSummary(hygieneNoteFixture),
    buildSummary: buildHygieneNoteSummary,
    component: HygieneNoteImportedTemplate
  }),
  defineTemplate({
    slug: "gingival-description-webform",
    title: "Gingival Description Webform",
    description: "Imported wrapper for legacy webform-style gingival charting template.",
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
