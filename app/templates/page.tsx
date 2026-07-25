import Link from "next/link";

export default function TemplatesIndexPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Template Libraries
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Choose between the clinic&apos;s existing ClearDent notes and
          HygieneNote&apos;s interactive webforms.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/templates/clinic"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Reference library
          </p>
          <h2 className="mt-1 text-lg font-semibold">Clinic EMR Templates</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Review and copy the clinic&apos;s current ClearDent progress-note
            templates, organized by clinical workflow.
          </p>
          <p className="mt-4 text-sm font-medium text-chart-accent dark:text-sky-300">
            Browse clinic templates
          </p>
        </Link>

        <Link
          href="/templates/interactive"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Working forms
          </p>
          <h2 className="mt-1 text-lg font-semibold">Interactive Templates</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Open the current HygieneNote webforms and generate structured
            clinical summaries.
          </p>
          <p className="mt-4 text-sm font-medium text-chart-accent dark:text-sky-300">
            Browse interactive templates
          </p>
        </Link>
      </div>
    </section>
  );
}
