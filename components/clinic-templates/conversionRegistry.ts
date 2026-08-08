import { AdultHygiene2021Template } from "@/components/templates/native/AdultHygiene2021Template";
import { AdultHygiene2026Template } from "@/components/templates/native/AdultHygiene2026Template";
import { AdolescentHygieneTemplate } from "@/components/templates/native/AdolescentHygieneTemplate";
import { RecareExamTemplate } from "@/components/templates/native/RecareExamTemplate";
import { adolescentHygieneFixture } from "@/lib/templates/fixtures/adolescentHygiene.fixture";
import { adultHygiene2021Fixture } from "@/lib/templates/fixtures/adultHygiene2021.fixture";
import { adultHygiene2026Fixture } from "@/lib/templates/fixtures/adultHygiene2026.fixture";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";
import { buildAdolescentHygieneSummary } from "@/lib/templates/summary/buildAdolescentHygieneSummary";
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
    slug: "adolescent-hygiene",
    title: "12–17 Years Old Hygiene Template",
    description:
      "Draft interactive conversion of the clinic adolescent hygiene note.",
    kind: "native",
    lifecycle: "draft",
    provenance: {
      sourceClinicTemplateSlug: "adolescent-hygiene",
      sourceRevision: "7d3d21c",
      clinicalReviewDate: "2026-08-06",
    },
    fixture: adolescentHygieneFixture,
    summary: buildAdolescentHygieneSummary(adolescentHygieneFixture),
    buildSummary: buildAdolescentHygieneSummary,
    component: AdolescentHygieneTemplate,
  }),
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
    slug: "adult-hygiene-2026",
    title: "2026 Adult Hygiene",
    description:
      "Comprehensive adult hygiene note for independent 2026 updates.",
    kind: "native",
    lifecycle: "pilot",
    provenance: {
      sourceClinicTemplateSlug: "adult-hygiene-2026",
      sourceRevision: "9427c9b",
      clinicalReviewDate: "2026-08-07",
    },
    fixture: adultHygiene2026Fixture,
    summary: buildAdultHygiene2026Summary(adultHygiene2026Fixture),
    buildSummary: buildAdultHygiene2026Summary,
    component: AdultHygiene2026Template,
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
