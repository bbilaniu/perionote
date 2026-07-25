import { GingivalDescriptionWebformImportedTemplate } from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { ShortDentalHygienNoteImportedTemplate } from "@/components/templates/imported/ShortDentalHygienNoteImportedTemplate";
import { VeryShortDentalHygienNoteImportedTemplate } from "@/components/templates/imported/VeryShortDentalHygienNoteImportedTemplate";
import { RecareExamTemplate } from "@/components/templates/native/RecareExamTemplate";
import { gingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import { buildGingivalDescriptionWebformSummary } from "@/lib/templates/summary/buildGingivalDescriptionWebformSummary";
import { buildRecareExamSummary } from "@/lib/templates/summary/buildRecareExamSummary";
import type { TemplateDefinition } from "@/lib/templates/types";

function defineTemplate<TFixture>(
  template: TemplateDefinition<TFixture>,
): TemplateDefinition<TFixture> {
  return template;
}

const allTemplates = [
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
  defineTemplate({
    slug: "recare-exam",
    title: "Recare Exam",
    description:
      "Interactive conversion of the clinic Recare Exam note for local implementation review.",
    kind: "native",
    lifecycle: "draft",
    provenance: {
      sourceClinicTemplateSlug: "recare-exam",
      sourceRevision: "7d3d21c",
      clinicalReviewDate: "2026-07-25",
    },
    fixture: recareExamFixture,
    summary: buildRecareExamSummary(recareExamFixture),
    buildSummary: buildRecareExamSummary,
    component: RecareExamTemplate,
  }),
] as const;

const includePilotTemplates =
  process.env.NEXT_PUBLIC_INCLUDE_PILOT_TEMPLATES === "true";

export const templateRegistry = allTemplates.filter((template) =>
  isTemplateAvailableForBuild(
    template.lifecycle,
    process.env.NODE_ENV,
    includePilotTemplates,
  ),
);

export type RegisteredTemplate = (typeof templateRegistry)[number];

export const templateBrowserRegistry = templateRegistry.filter(
  (template) => !template.hidden,
);

export function getTemplateBySlug(
  slug: string,
): RegisteredTemplate | undefined {
  return templateRegistry.find((template) => template.slug === slug);
}
