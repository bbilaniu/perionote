import Link from "next/link";
import {
  ClinicTemplateCatalogue,
  type ClinicTemplateCatalogueGroup,
} from "@/components/clinic-templates/ClinicTemplateCatalogue";
import { getClinicConversionBySourceSlug } from "@/components/clinic-templates/conversionRegistry";
import {
  clinicTemplateGroups,
  getClinicTemplatesByCategory,
} from "@/lib/clinic-templates/registry";

export default function ClinicTemplatesPage() {
  const groups: ClinicTemplateCatalogueGroup[] = clinicTemplateGroups.map(
    (group) => ({
      title: group.title,
      description: group.description,
      categories: group.categories.map((category) => ({
        slug: category.slug,
        title: category.title,
        templates: getClinicTemplatesByCategory(category.slug).map(
          (template) => {
            const conversion = getClinicConversionBySourceSlug(template.slug);

            return {
              slug: template.slug,
              title: template.title,
              description: template.description,
              ...(template.versionStatus
                ? { versionStatus: template.versionStatus }
                : {}),
              ...(conversion
                ? { interactiveLifecycle: conversion.lifecycle }
                : {}),
            };
          },
        ),
      })),
    }),
  );

  return (
    <section className="space-y-8">
      <header>
        <Link
          href="/templates"
          className="text-sm font-medium text-chart-accent hover:underline dark:text-sky-300"
        >
          ← All template libraries
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Clinical Forms
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Browse the clinic&apos;s current ClearDent source notes and open
          interactive conversions when available.
        </p>
      </header>

      <ClinicTemplateCatalogue groups={groups} />
    </section>
  );
}
