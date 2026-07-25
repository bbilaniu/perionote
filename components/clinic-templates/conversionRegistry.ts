import { RecareExamTemplate } from "@/components/templates/native/RecareExamTemplate";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import { buildRecareExamSummary } from "@/lib/templates/summary/buildRecareExamSummary";
import type {
  TemplateDefinition,
  TemplateProvenance,
} from "@/lib/templates/types";

type ClinicConversionDefinition<TFixture> = TemplateDefinition<TFixture> & {
  provenance: TemplateProvenance;
};

function defineClinicConversion<TFixture>(
  conversion: ClinicConversionDefinition<TFixture>,
): ClinicConversionDefinition<TFixture> {
  return conversion;
}

const allClinicConversions = [
  defineClinicConversion({
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

export const clinicConversionRegistry = allClinicConversions.filter(
  (conversion) =>
    isTemplateAvailableForBuild(
      conversion.lifecycle,
      process.env.NODE_ENV,
      includePilotTemplates,
    ),
);

export type RegisteredClinicConversion =
  (typeof clinicConversionRegistry)[number];

export function getClinicConversionBySourceSlug(
  sourceClinicTemplateSlug: string,
): RegisteredClinicConversion | undefined {
  return clinicConversionRegistry.find(
    (conversion) =>
      conversion.provenance.sourceClinicTemplateSlug ===
      sourceClinicTemplateSlug,
  );
}
