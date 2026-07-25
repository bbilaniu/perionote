import Link from "next/link";
import {
  clinicTemplateGroups,
  getClinicTemplatesByCategory,
} from "@/lib/clinic-templates/registry";

export default function ClinicTemplatesPage() {
  return (
    <section className="space-y-8">
      <header>
        <Link
          href="/templates"
          className="text-sm font-medium text-chart-accent hover:underline dark:text-sky-300"
        >
          ← All template libraries
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Clinic EMR Templates
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          The clinic&apos;s current ClearDent progress-note templates, grouped
          by clinical workflow. Open any template to review or copy its text.
        </p>
      </header>

      <aside className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
        <h2 className="font-semibold">ClearDent field legend</h2>
        <dl className="mt-3 grid gap-2">
          <div>
            <dt className="inline font-medium">[AUTO: …]</dt>
            <dd className="inline">
              {" "}
              — populated from the patient or treatment record.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">[SELECT/INSERT: …]</dt>
            <dd className="inline"> — selected or inserted by the user.</dd>
          </div>
          <div>
            <dt className="inline font-medium">
              [UNRESOLVED PLACEHOLDER: …]
            </dt>
            <dd className="inline">
              {" "}
              — present in the note but not declared in its source package.
            </dd>
          </div>
        </dl>
      </aside>

      {clinicTemplateGroups.map((group) => (
        <section key={group.title} className="space-y-5">
          <header>
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {group.description}
            </p>
          </header>

          <div className="space-y-6">
            {group.categories.map((category) => {
              const templates = getClinicTemplatesByCategory(category.slug);

              return (
                <section
                  key={category.slug}
                  id={category.slug}
                  className="scroll-mt-6"
                >
                  <div className="mb-3 flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-semibold">{category.title}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {templates.length === 0
                        ? "No template yet"
                        : `${templates.length} ${
                            templates.length === 1 ? "template" : "templates"
                          }`}
                    </span>
                  </div>

                  {templates.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {templates.map((template) => (
                        <Link
                          key={template.slug}
                          href={`/templates/clinic/${template.slug}`}
                          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                        >
                          <h4 className="font-semibold">{template.title}</h4>
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                            {template.description}
                          </p>
                          <p className="mt-3 text-sm font-medium text-chart-accent dark:text-sky-300">
                            View template
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 px-5 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
                      This category is ready for the clinic&apos;s next
                      treatment or referral addendum.
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      ))}
    </section>
  );
}
