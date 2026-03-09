import type { GingivalDescriptionFixture } from "@/lib/templates/fixtures/gingivalDescription.fixture";
import { TemplateShell } from "@/components/templates/shared/TemplateShell";

export function GingivalDescriptionTemplate({
  fixture,
  summary
}: {
  fixture: GingivalDescriptionFixture;
  summary: string;
}) {
  return (
    <TemplateShell
      title="Gingival Description"
      kind="native"
      description="Native TSX template for documenting gingival color, distribution, and follow-up planning."
      summary={summary}
    >
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-slate-900">Visit Date</dt>
          <dd className="text-slate-700">{fixture.visitDate}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Patient Concerns</dt>
          <dd className="text-slate-700">{fixture.patientConcerns}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Gingival Findings</dt>
          <dd className="text-slate-700">
            {fixture.color}, {fixture.distribution}, {fixture.severity}, {fixture.location}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Teeth</dt>
          <dd className="text-slate-700">{fixture.teeth.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Next Planned Care</dt>
          <dd className="text-slate-700">
            {fixture.plannedCare}; recall in {fixture.recallFrequency}
          </dd>
        </div>
      </dl>
    </TemplateShell>
  );
}
