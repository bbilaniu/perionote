import type { ComponentType } from "react";

export type TemplateKind = "native" | "imported";

export interface TemplateDefinition<TFixture = unknown> {
  slug: string;
  title: string;
  description: string;
  kind: TemplateKind;
  fixture: TFixture;
  summary: string;
  buildSummary: (fixture: TFixture) => string;
  component: ComponentType<{ fixture: TFixture; summary: string }>;
}
