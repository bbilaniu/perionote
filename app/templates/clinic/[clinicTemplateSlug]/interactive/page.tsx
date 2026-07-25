import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { FullPageLink } from "@/components/FullPageLink";
import {
  clinicConversionSourceSlugs,
  getClinicConversionBySourceSlug,
} from "@/components/clinic-templates/conversionRegistry";
import { getClinicTemplateBySlug } from "@/lib/clinic-templates/registry";

export function generateStaticParams() {
  return clinicConversionSourceSlugs.map((clinicTemplateSlug) => ({
    clinicTemplateSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clinicTemplateSlug: string }>;
}): Promise<Metadata> {
  const { clinicTemplateSlug } = await params;
  const conversion = getClinicConversionBySourceSlug(clinicTemplateSlug);

  return {
    title: conversion
      ? `${conversion.title} Interactive | HygieneNote`
      : "Clinical Template Conversion",
    description: conversion?.description,
  };
}

export default async function ClinicConversionPage({
  params,
}: {
  params: Promise<{ clinicTemplateSlug: string }>;
}) {
  const { clinicTemplateSlug } = await params;
  const sourceTemplate = getClinicTemplateBySlug(clinicTemplateSlug);
  const conversion = getClinicConversionBySourceSlug(clinicTemplateSlug);

  if (!sourceTemplate || !conversion) {
    notFound();
  }

  const ConversionComponent = conversion.component as ComponentType<{
    fixture: unknown;
    summary: string;
  }>;

  return (
    <section className="space-y-5">
      <FullPageLink
        href={`/templates/clinic/${sourceTemplate.slug}/`}
        className="text-sm font-medium text-chart-accent hover:underline dark:text-sky-300"
      >
        ← Original {sourceTemplate.title} template
      </FullPageLink>
      <ConversionComponent
        fixture={conversion.fixture}
        summary={conversion.summary}
      />
    </section>
  );
}
