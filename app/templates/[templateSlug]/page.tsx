import { notFound } from "next/navigation";
import { getTemplateBySlug, templateRegistry } from "@/components/templates/registry";
import type { ComponentType } from "react";

export function generateStaticParams() {
  return templateRegistry.map((template) => ({ templateSlug: template.slug }));
}

export default async function TemplatePreviewPage({
  params
}: {
  params: Promise<{ templateSlug: string }>;
}) {
  const { templateSlug } = await params;
  const template = getTemplateBySlug(templateSlug);

  if (!template) {
    notFound();
  }

  const TemplateComponent = template.component as ComponentType<{
    fixture: unknown;
    summary: string;
  }>;
  return <TemplateComponent fixture={template.fixture} summary={template.summary} />;
}
