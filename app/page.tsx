import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">PerioNote Bootstrap</h1>
      <p className="max-w-3xl text-slate-700 dark:text-slate-300">
        PerioNote is a template library for periodontal and hygiene notes.
        This bootstrap includes template routing, summary builders, fixtures, and starter tests.
      </p>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Start here</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Click the button below to open the template browser.
        </p>
        <Link
          className="mt-4 inline-flex items-center rounded-md bg-chart-accent px-4 py-2 text-sm font-medium text-white hover:bg-sky-900 dark:hover:bg-sky-700"
          href="/templates"
        >
          Open Template Browser
        </Link>
      </div>
    </section>
  );
}
