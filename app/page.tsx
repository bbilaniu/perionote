import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">PerioNote Bootstrap</h1>
      <p className="max-w-3xl text-slate-700">
        PerioNote is a template library and preview app for periodontal and hygiene notes.
        This bootstrap includes template routing, summary builders, fixtures, and starter tests.
      </p>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Start here</h2>
        <p className="mt-2 text-sm text-slate-700">
          Open the template browser to preview native and imported templates side by side.
        </p>
        <Link
          className="mt-4 inline-flex items-center rounded-md bg-chart-accent px-4 py-2 text-sm font-medium text-white hover:bg-sky-900"
          href="/templates"
        >
          Open Template Browser
        </Link>
      </div>
    </section>
  );
}
