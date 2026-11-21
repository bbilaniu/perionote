export type TemplateSectionNavigationItem = {
  id: string;
  label: string;
  status?: "complete" | "incomplete";
};

export function getTemplateSectionId(label: string): string {
  const slug = label
    .normalize("NFKD")
    .toLocaleLowerCase("en-CA")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `template-section-${slug}`;
}

export function createTemplateSectionNavigation(
  labels: readonly string[]
): TemplateSectionNavigationItem[] {
  return labels.map((label) => ({
    id: getTemplateSectionId(label),
    label,
  }));
}
