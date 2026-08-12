import { AdultHygiene2021Template } from "@/components/templates/native/AdultHygiene2021Template";
import { AdultHygiene2026Template } from "@/components/templates/native/AdultHygiene2026Template";
import { AdolescentHygiene2026Template } from "@/components/templates/native/AdolescentHygiene2026Template";
import { AdolescentHygieneTemplate } from "@/components/templates/native/AdolescentHygieneTemplate";
import { ChildRecareHygieneTemplate } from "@/components/templates/native/ChildRecareHygieneTemplate";
import { RecareExamTemplate } from "@/components/templates/native/RecareExamTemplate";
import { adolescentHygieneFixture } from "@/lib/templates/fixtures/adolescentHygiene.fixture";
import { adultHygiene2021Fixture } from "@/lib/templates/fixtures/adultHygiene2021.fixture";
import { adultHygiene2026Fixture } from "@/lib/templates/fixtures/adultHygiene2026.fixture";
import { adolescentHygiene2026Fixture } from "@/lib/templates/fixtures/adolescentHygiene2026.fixture";
import { childRecareHygieneFixture } from "@/lib/templates/fixtures/childRecareHygiene.fixture";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";
import { buildAdolescentHygiene2026Summary } from "@/lib/templates/adolescentHygiene2026";
import { buildAdolescentHygieneSummary } from "@/lib/templates/summary/buildAdolescentHygieneSummary";
import { buildChildRecareHygieneSummary } from "@/lib/templates/summary/buildChildRecareHygieneSummary";
import { buildRecareExamSummary } from "@/lib/templates/summary/buildRecareExamSummary";
import type { ComponentType } from "react";
import type {
  InteractiveTemplateProps,
  TemplateDefinition,
  TemplateProvenance,
} from "@/lib/templates/types";

type ClinicConversionDefinition<TFixture> = Omit<
  TemplateDefinition<TFixture>,
  "component"
> & {
  provenance: TemplateProvenance;
  headerDescription: string;
  component: ComponentType<InteractiveTemplateProps<TFixture>>;
};

function defineClinicConversion<TFixture>(
  conversion: ClinicConversionDefinition<TFixture>,
): ClinicConversionDefinition<TFixture> {
  return conversion;
}

const allClinicConversions = [
  defineClinicConversion({
    slug: "child-recare-exam-hygiene-notes",
    title: "Child Recare Exam & Hygiene Notes",
    description:
      "Interactive draft of the combined pediatric recall exam and hygiene note.",
    headerDescription:
      "Complete one pediatric encounter and copy a Combined, Dentist, or Hygienist note. This is an early draft for workflow and clinical-content review; entered values are kept in a temporary local recovery draft.",
    kind: "native",
    lifecycle: "draft",
    provenance: {
      sourceClinicTemplateSlug: "child-recare-exam-hygiene-notes",
      sourceRevision: "a094b24",
      clinicalReviewDate: "2026-08-12",
    },
    fixture: childRecareHygieneFixture,
    summary: buildChildRecareHygieneSummary(childRecareHygieneFixture),
    buildSummary: buildChildRecareHygieneSummary,
    component: ChildRecareHygieneTemplate,
  }),
  defineClinicConversion({
    slug: "adolescent-hygiene",
    title: "12–17 Years Old Hygiene Template",
    description: "Interactive conversion of the clinic adolescent hygiene note.",
    headerDescription:
      "Complete the form and copy a structured adolescent hygiene note. The conversion preserves the ClearDent workflow and includes optional Dentist and treatment-completed fields from the August 6 request.",
    kind: "native",
    lifecycle: "pilot",
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
    slug: "adolescent-hygiene-2026",
    title: "2026 Adolescent Hygiene",
    description:
      "Unified adolescent encounter with Combined, Dentist, and Hygienist outputs.",
    headerDescription:
      "Complete one adolescent encounter and copy a Combined, Dentist, or Hygienist note. The original adolescent template remains available separately. Encounter values are kept in a temporary local recovery draft.",
    kind: "native",
    lifecycle: "pilot",
    provenance: {
      sourceClinicTemplateSlug: "adolescent-hygiene-2026",
      sourceRevision: "70b65c4",
      clinicalReviewDate: "2026-08-11",
    },
    fixture: adolescentHygiene2026Fixture,
    summary: buildAdolescentHygiene2026Summary(
      adolescentHygiene2026Fixture,
    ),
    buildSummary: buildAdolescentHygiene2026Summary,
    component: AdolescentHygiene2026Template,
  }),
  defineClinicConversion({
    slug: "adult-hygiene-2021",
    title: "2021 Adult Hygiene",
    description:
      "Interactive conversion of the clinic 2021 Adult Hygiene note.",
    headerDescription:
      "Complete the form and copy a structured Adult Hygiene note. Encounter values are kept in a temporary local recovery draft. Deliberately remembered catalogue suggestions also stay only in this browser profile.",
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
      "Unified adult encounter with Complete, Hygiene, and Recare outputs.",
    headerDescription:
      "Complete one encounter and copy a Complete, Hygiene, or Recare note. Encounter values are kept in a temporary local recovery draft. Deliberately remembered catalogue suggestions also stay only in this browser profile.",
    kind: "native",
    lifecycle: "pilot",
    provenance: {
      sourceClinicTemplateSlug: "adult-hygiene-2026",
      sourceRevision: "0f5a80a",
      clinicalReviewDate: "2026-08-08",
    },
    fixture: adultHygiene2026Fixture,
    summary: buildAdultHygiene2026Summary(adultHygiene2026Fixture),
    buildSummary: buildAdultHygiene2026Summary,
    component: AdultHygiene2026Template,
  }),
  defineClinicConversion({
    slug: "recare-exam",
    title: "Recare Exam",
    description: "Interactive conversion of the clinic Recare Exam note.",
    headerDescription:
      "Complete the form and copy a structured Recare Exam note. Entered values are kept in a temporary local recovery draft.",
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
