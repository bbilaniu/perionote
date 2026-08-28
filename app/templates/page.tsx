import Link from "next/link";

export default function TemplatesIndexPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Template Libraries
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Browse clinical source templates and their conversions, or open
          HygieneNote&apos;s standalone interactive forms.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/templates/clinic"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Clinical library
          </p>
          <h2 className="mt-1 text-lg font-semibold group-hover:text-chart-accent dark:group-hover:text-sky-300">
            Clinical Templates
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Review the clinic&apos;s ClearDent source notes and open their
            interactive conversions when available.
          </p>
          <p className="mt-4 text-sm font-medium text-chart-accent dark:text-sky-300">
            Browse clinical templates
          </p>
        </Link>

        <Link
          href="/templates/interactive"
          className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Original webforms
          </p>
          <h2 className="mt-1 text-lg font-semibold group-hover:text-chart-accent dark:group-hover:text-sky-300">
            Standalone Interactive Forms
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Open HygieneNote forms that are not conversions of a clinic EMR
            template.
          </p>
          <p className="mt-4 text-sm font-medium text-chart-accent dark:text-sky-300">
            Browse standalone forms
          </p>
        </Link>
      </div>
    </section>
  );
}
