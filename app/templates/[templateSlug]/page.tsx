import { notFound } from "next/navigation";
import {
  getStandaloneInteractiveBySlug,
  standaloneInteractiveRegistry,
} from "@/components/templates/registry";
import type { ComponentType } from "react";

export function generateStaticParams() {
  return standaloneInteractiveRegistry.map((template) => ({
    templateSlug: template.slug,
  }));
}

export default async function TemplatePreviewPage({
  params
}: {
  params: Promise<{ templateSlug: string }>;
}) {
  const { templateSlug } = await params;
  const template = getStandaloneInteractiveBySlug(templateSlug);

  if (!template) {
    notFound();
  }

  const TemplateComponent = template.component as ComponentType<{
    fixture: unknown;
    summary: string;
  }>;
  return <TemplateComponent fixture={template.fixture} summary={template.summary} />;
}
