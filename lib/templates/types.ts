import type { ComponentType } from "react";

export type TemplateKind = "native" | "imported";
export type TemplateLifecycleStatus = "draft" | "pilot" | "ready";

export interface TemplateProvenance {
  sourceClinicTemplateSlug: string;
  sourceRevision: string;
  clinicalReviewDate: string;
}

export interface TemplatePresentation {
  title: string;
  description: string;
  lifecycle: TemplateLifecycleStatus;
}

export interface InteractiveTemplateProps<TFixture> {
  fixture: TFixture;
  summary: string;
  presentation: TemplatePresentation;
}

export interface TemplateDefinition<TFixture = unknown> {
  slug: string;
  title: string;
  description: string;
  kind: TemplateKind;
  lifecycle: TemplateLifecycleStatus;
  provenance?: TemplateProvenance;
  hidden?: boolean;
  fixture: TFixture;
  summary: string;
  buildSummary: (fixture: TFixture) => string;
  component: ComponentType<{ fixture: TFixture; summary: string }>;
}
