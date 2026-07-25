import type { TemplateLifecycleStatus } from "@/lib/templates/types";

export function isTemplateAvailableForBuild(
  lifecycle: TemplateLifecycleStatus,
  environment: string | undefined,
  includePilotTemplates = false,
): boolean {
  if (lifecycle === "ready") return true;
  if (environment !== "production") return true;
  return lifecycle === "pilot" && includePilotTemplates;
}
