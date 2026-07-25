import type { TemplateLifecycleStatus } from "@/lib/templates/types";

export function isTemplateAvailableForBuild(
  lifecycle: TemplateLifecycleStatus,
  environment: string | undefined,
): boolean {
  if (environment !== "production") return true;
  return lifecycle !== "draft";
}
