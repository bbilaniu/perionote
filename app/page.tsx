import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Clinical documentation | HygieneNote",
  description:
    "Create hygiene notes, continue saved work, and manage reusable clinical content.",
};

const launchCards = [
  {
    href: "/templates/clinic",
    eyebrow: "Primary workflow",
    title: "Clinical forms",
    description:
      "Start from the clinic’s current ClearDent source notes and interactive conversions.",
    action: "Browse clinical forms",
    featured: true,
  },
  {
    href: "/templates/interactive",
    eyebrow: "Original webforms",
    title: "Standalone forms",
    description:
      "Open HygieneNote forms that are not conversions of a clinic EMR template.",
    action: "Browse standalone forms",
    featured: false,
  },
] as const;

const managementCards = [
  {
    href: "/drafts",
    eyebrow: "Local workspace",
    title: "Saved drafts",
    description:
      "Continue recent clinical notes saved securely in this browser.",
    action: "Continue saved drafts",
  },
  {
    href: "/settings",
    eyebrow: "Reusable content",
    title: "Catalogues",
    description:
      "Manage providers, treatments, products, intervals, and other reusable choices.",
    action: "Manage catalogues",
  },
] as const;

const cardClass =
  "group block h-full rounded-xl border p-5 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
          Clinical documentation
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Create and manage hygiene notes
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Start an interactive clinical note, continue saved work, or manage
          reusable clinical content.
        </p>
      </header>

      <section aria-labelledby="start-a-note-title">
        <div className="mb-3">
          <h2 id="start-a-note-title" className="text-lg font-semibold">
            Start a note
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Choose the library that matches your workflow.
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {launchCards.map((card) => (
            <li key={card.href}>
              <Link
                href={card.href}
                className={`${cardClass} ${
                  card.featured
                    ? "border-sky-300 bg-sky-50/70 hover:border-sky-500 hover:shadow-md dark:border-sky-800 dark:bg-sky-950/30 dark:hover:border-sky-600"
                    : "border-slate-200 bg-white hover:border-sky-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {card.eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-semibold group-hover:text-chart-accent dark:group-hover:text-sky-300">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {card.description}
                </p>
                <p className="mt-4 text-sm font-semibold text-chart-accent dark:text-sky-300">
                  {card.action} <span aria-hidden="true">→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="manage-work-title">
        <div className="mb-3">
          <h2 id="manage-work-title" className="text-lg font-semibold">
            Manage your work
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Return to saved notes or maintain reusable form choices.
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {managementCards.map((card) => (
            <li key={card.href}>
              <Link
                href={card.href}
                className={`${cardClass} border-slate-200 bg-white hover:border-sky-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {card.eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-semibold group-hover:text-chart-accent dark:group-hover:text-sky-300">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {card.description}
                </p>
                <p className="mt-4 text-sm font-semibold text-chart-accent dark:text-sky-300">
                  {card.action} <span aria-hidden="true">→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
