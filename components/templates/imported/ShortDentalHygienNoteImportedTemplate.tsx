import { GingivalDescriptionWebformImportedTemplate } from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import type { GingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";

export function ShortDentalHygienNoteImportedTemplate({
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
      variant="short"
      title="Short Dental Hygien Note"
      description="Copied from the dental hygiene note webform template for a shorter hygiene-note workflow."
    />
  );
}
