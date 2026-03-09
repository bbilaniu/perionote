import type { HygieneNoteFixture } from "@/lib/templates/fixtures/hygieneNote.fixture";
import { TemplateShell } from "@/components/templates/shared/TemplateShell";

export function HygieneNoteImportedTemplate({
  fixture,
  summary
}: {
  fixture: HygieneNoteFixture;
  summary: string;
}) {
  return (
    <TemplateShell
      title="Hygiene Note (Imported)"
      kind="imported"
      description="Imported JSX-style hygiene template wrapped for TSX preview and summary extraction."
      summary={summary}
    >
      <div className="space-y-4 text-sm text-slate-800">
        <div>
          <h3 className="font-semibold">Visit Date</h3>
          <p>{fixture.visitDate}</p>
        </div>
        <div>
          <h3 className="font-semibold">Clinical Findings</h3>
          <p>Plaque: {fixture.plaqueLevel}</p>
          <p>Calculus: {fixture.calculusLevel}</p>
        </div>
        <div>
          <h3 className="font-semibold">Home Care Routine</h3>
          <p>{fixture.homeCare}</p>
        </div>
        <div>
          <h3 className="font-semibold">Recommendations</h3>
          <ul className="list-disc pl-5">
            {fixture.recommendations.map((recommendation) => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </TemplateShell>
  );
}
