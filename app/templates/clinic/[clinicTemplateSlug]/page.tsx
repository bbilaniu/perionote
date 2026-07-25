import type { Metadata } from "next";
import Link from "next/link";
import { FullPageLink } from "@/components/FullPageLink";
import { notFound } from "next/navigation";
import CopyTemplateButton from "@/components/clinic-templates/CopyTemplateButton";
import { getClinicConversionBySourceSlug } from "@/components/clinic-templates/conversionRegistry";
import {
  clinicTemplateRegistry,
  getClinicCategoryTitle,
  getClinicTemplateBySlug,
} from "@/lib/clinic-templates/registry";

export function generateStaticParams() {
  return clinicTemplateRegistry.map((template) => ({
    clinicTemplateSlug: template.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clinicTemplateSlug: string }>;
}): Promise<Metadata> {
  const { clinicTemplateSlug } = await params;
  const template = getClinicTemplateBySlug(clinicTemplateSlug);

  return {
    title: template ? `${template.title} | HygieneNote` : "Clinic Template",
    description: template?.description,
  };
}

export default async function ClinicTemplatePage({
  params,
}: {
  params: Promise<{ clinicTemplateSlug: string }>;
}) {
  const { clinicTemplateSlug } = await params;
  const template = getClinicTemplateBySlug(clinicTemplateSlug);
  const conversion = getClinicConversionBySourceSlug(clinicTemplateSlug);

  if (!template) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header>
        <Link
          href="/templates/clinic"
          className="text-sm font-medium text-chart-accent hover:underline dark:text-sky-300"
        >
          ← Clinical Templates
        </Link>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {getClinicCategoryTitle(template.category)}
        </p>
        <div className="mt-1 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {template.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
              {template.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {conversion ? (
              <FullPageLink
                href={`/templates/clinic/${template.slug}/interactive/`}
                className="inline-flex items-center justify-center rounded-md border border-chart-accent px-4 py-2 text-sm font-medium text-chart-accent transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
              >
                Open interactive version · {conversion.lifecycle}
              </FullPageLink>
            ) : null}
            <CopyTemplateButton content={template.content} />
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          ClearDent source name: {template.sourceTitle}
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words p-5 font-sans text-sm leading-6 text-slate-800 dark:text-slate-200">
          {template.content}
        </pre>
      </div>
    </article>
  );
}
