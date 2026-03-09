import { TemplateShell } from "@/components/templates/shared/TemplateShell";
import type { GingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";

export function GingivalDescriptionWebformImportedTemplate({
  fixture,
  summary
}: {
  fixture: GingivalDescriptionWebformFixture;
  summary: string;
}) {
  return (
    <TemplateShell
      title="Gingival Description Webform (Imported)"
      kind="imported"
      description="Legacy ChatGPT webform template adapted to Tailwind-only preview with extracted summary logic."
      summary={summary}
    >
      <div className="space-y-5 text-sm text-slate-800">
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p>
            <span className="font-semibold">Date:</span> {fixture.date || "—"}
          </p>
          <p>
            <span className="font-semibold">Diagnosis:</span> {fixture.dentalHygieneDiagnosis || "—"}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold">Selected Findings</h3>
          {fixture.findings.map((item, index) => (
            <article
              key={`${item.section}-${item.finding}-${index}`}
              className="space-y-2 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">
                  {item.section}: {item.finding}
                </p>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                  {item.extent === "generalized" ? "GEN" : "LOC"}
                </span>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-700">Teeth</dt>
                  <dd>{item.toothNumbers || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Location</dt>
                  <dd>{item.locations.length ? item.locations.join(", ") : "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Distribution</dt>
                  <dd>{item.distributions.length ? item.distributions.join(", ") : "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Notes</dt>
                  <dd>{item.notes || "—"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </TemplateShell>
  );
}
