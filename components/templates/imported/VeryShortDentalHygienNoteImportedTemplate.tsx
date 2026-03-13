import { GingivalDescriptionWebformImportedTemplate } from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import type { GingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";

export function VeryShortDentalHygienNoteImportedTemplate({
  fixture,
  summary,
}: {
  fixture: GingivalDescriptionWebformFixture;
  summary: string;
}) {
  return (
    <GingivalDescriptionWebformImportedTemplate
      fixture={fixture}
      summary={summary}
      variant="very-short"
      title="Very short template"
      description="Minimal hygiene-note workflow with a sticky summary panel and collapsible sections."
    />
  );
}
