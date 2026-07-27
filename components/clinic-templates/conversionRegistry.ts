import { AdultHygiene2021Template } from "@/components/templates/native/AdultHygiene2021Template";
import { RecareExamTemplate } from "@/components/templates/native/RecareExamTemplate";
import { adultHygiene2021Fixture } from "@/lib/templates/fixtures/adultHygiene2021.fixture";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
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
    slug: "adult-hygiene-2021",
    title: "2021 Adult Hygiene",
    description:
      "Pilot interactive conversion of the clinic 2021 Adult Hygiene note.",
    kind: "native",
    lifecycle: "pilot",
    provenance: {
      sourceClinicTemplateSlug: "adult-hygiene-2021",
      sourceRevision: "7d3d21c",
      clinicalReviewDate: "2026-07-25",
    },
    fixture: adultHygiene2021Fixture,
    summary: buildAdultHygiene2021Summary(adultHygiene2021Fixture),
    buildSummary: buildAdultHygiene2021Summary,
    component: AdultHygiene2021Template,
  }),
  defineClinicConversion({
    slug: "recare-exam",
    title: "Recare Exam",
    description:
      "Pilot interactive conversion of the clinic Recare Exam note.",
    kind: "native",
    lifecycle: "pilot",
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

export const clinicConversionRegistry = allClinicConversions.filter(
  (conversion) =>
    isTemplateAvailableForBuild(
      conversion.lifecycle,
      process.env.NODE_ENV,
    ),
);

export const clinicConversionSourceSlugs = clinicConversionRegistry.map(
  (conversion) => conversion.provenance.sourceClinicTemplateSlug,
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
