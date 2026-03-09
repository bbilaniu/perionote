export function TemplateShell({
  title,
  kind,
  description,
  children,
  summary
}: {
  title: string;
  kind: "native" | "imported";
  description: string;
  children: React.ReactNode;
  summary: string;
}) {
  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">{kind} template</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-700">{description}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{children}</article>
        <article className="rounded-xl border border-slate-200 bg-chart-paper p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Summary Preview</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-chart-ink">{summary}</pre>
        </article>
      </div>
    </section>
  );
}
