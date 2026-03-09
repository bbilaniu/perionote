import Link from "next/link";
import { templateRegistry } from "@/components/templates/registry";

export default function TemplatesIndexPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Template Browser</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Browse native and imported templates. Each page renders fixture data and a generated clinical summary.
        </p>
      </header>

      <div className="grid gap-4">
        {templateRegistry.map((template) => (
          <Link
            key={template.slug}
            href={`/templates/${template.slug}`}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{template.kind}</p>
            <h2 className="mt-1 text-lg font-semibold">{template.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{template.description}</p>
            <p className="mt-3 text-sm font-medium text-chart-accent">Open template</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
