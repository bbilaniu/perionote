import Link from "next/link";
import { standaloneInteractiveBrowserRegistry } from "@/components/templates/registry";

export default function InteractiveTemplatesPage() {
  return (
    <section className="space-y-6">
      <header>
        <Link
          href="/templates"
          className="text-sm font-medium text-chart-accent hover:underline dark:text-sky-300"
        >
          ← All template libraries
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Standalone Interactive Forms
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Open the original HygieneNote webforms that are not conversions of a
          clinic EMR template.
        </p>
      </header>

      <div className="grid gap-4">
        {standaloneInteractiveBrowserRegistry.map((template) => (
          <Link
            key={template.slug}
            href={`/templates/${template.slug}`}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Standalone · {template.lifecycle}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{template.title}</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {template.description}
            </p>
            <p className="mt-3 text-sm font-medium text-chart-accent dark:text-sky-300">
              Open template
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
