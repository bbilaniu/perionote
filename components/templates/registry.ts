import { GingivalDescriptionTemplate } from "@/components/templates/native/GingivalDescriptionTemplate";
import { HygieneNoteImportedTemplate } from "@/components/templates/imported/HygieneNoteImportedTemplate";
import { gingivalDescriptionFixture } from "@/lib/templates/fixtures/gingivalDescription.fixture";
import { hygieneNoteFixture } from "@/lib/templates/fixtures/hygieneNote.fixture";
import { buildGingivalDescriptionSummary } from "@/lib/templates/summary/buildGingivalDescriptionSummary";
import { buildHygieneNoteSummary } from "@/lib/templates/summary/buildHygieneNoteSummary";
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
  })
] as const;

export type RegisteredTemplate = (typeof templateRegistry)[number];

export function getTemplateBySlug(slug: string): RegisteredTemplate | undefined {
  return templateRegistry.find((template) => template.slug === slug);
}
