"use client";

import Link from "next/link";
import { type MouseEvent, type ReactNode, useState } from "react";
import { FullPageLink } from "@/components/FullPageLink";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { lifecyclePresentation } from "@/lib/templates/lifecyclePresentation";
import type { TemplateLifecycleStatus } from "@/lib/templates/types";

export type ClinicTemplateCatalogueItem = {
  slug: string;
  title: string;
  description: string;
  interactiveLifecycle?: TemplateLifecycleStatus;
};

export type ClinicTemplateCatalogueCategory = {
  slug: string;
  title: string;
  templates: ClinicTemplateCatalogueItem[];
};

export type ClinicTemplateCatalogueGroup = {
  title: string;
  description: string;
  categories: ClinicTemplateCatalogueCategory[];
};

type DefaultCardDestination = "interactive" | "original";
type TemplateVisibility = "all" | "interactive";

const titleLinkClass =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950";

export function ClinicTemplateCatalogue({
  groups,
}: {
  groups: ClinicTemplateCatalogueGroup[];
}) {
  const [defaultDestination, setDefaultDestination] =
    useState<DefaultCardDestination>("interactive");
  const [templateVisibility, setTemplateVisibility] =
    useState<TemplateVisibility>("all");
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      categories: group.categories
        .map((category) => ({
          ...category,
          templates:
            templateVisibility === "interactive"
              ? category.templates.filter(
                  (template) => template.interactiveLifecycle,
                )
              : category.templates,
        }))
        .filter(
          (category) =>
            templateVisibility === "all" || category.templates.length > 0,
        ),
    }))
    .filter(
      (group) => templateVisibility === "all" || group.categories.length > 0,
    );

  return (
    <>
      <section
        className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between dark:border-slate-800 dark:bg-slate-900"
        aria-labelledby="clinic-template-preferences-heading"
      >
        <div>
          <h2
            id="clinic-template-preferences-heading"
            className="font-semibold"
          >
            Template preferences
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Choose what opens from a card and which templates appear below.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Show templates
            </p>
            <div
              role="radiogroup"
              aria-label="Show templates"
              className="grid grid-cols-2 rounded-lg border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950"
            >
              {(["all", "interactive"] as const).map((visibility) => {
                const selected = templateVisibility === visibility;
                const label = visibility === "all" ? "All" : "Interactive only";

                return (
                  <SegmentButton
                    key={visibility}
                    name="clinic-template-visibility"
                    selected={selected}
                    onClick={() => setTemplateVisibility(visibility)}
                  >
                    {label}
                  </SegmentButton>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Card opens
            </p>
            <div
              role="radiogroup"
              aria-label="Card opens"
              className="grid grid-cols-2 rounded-lg border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950"
            >
              {(["interactive", "original"] as const).map((destination) => {
                const selected = defaultDestination === destination;
                const label =
                  destination === "interactive" ? "Interactive" : "Original";

                return (
                  <SegmentButton
                    key={destination}
                    name="clinic-template-destination"
                    selected={selected}
                    onClick={() => setDefaultDestination(destination)}
                  >
                    {label}
                  </SegmentButton>
                );
              })}
            </div>
          </div>
        </div>
      </section>

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
            <dt className="inline font-medium">[UNRESOLVED PLACEHOLDER: …]</dt>
            <dd className="inline">
              {" "}
              — present in the note but not declared in its source package.
            </dd>
          </div>
        </dl>
      </aside>

      {visibleGroups.map((group) => (
        <section key={group.title} className="space-y-5">
          <header>
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {group.description}
            </p>
          </header>

          <div className="space-y-6">
            {group.categories.map((category) => (
              <section
                key={category.slug}
                id={category.slug}
                className="scroll-mt-6"
              >
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-semibold">{category.title}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {category.templates.length === 0
                      ? "No template yet"
                      : `${category.templates.length} ${
                          category.templates.length === 1
                            ? "template"
                            : "templates"
                        }`}
                  </span>
                </div>

                {category.templates.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {category.templates.map((template) => (
                      <ClinicTemplateCard
                        key={template.slug}
                        template={template}
                        defaultDestination={defaultDestination}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 px-5 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
                    This category is ready for the clinic&apos;s next treatment
                    or referral addendum.
                  </div>
                )}
              </section>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function SegmentButton({
  name,
  selected,
  onClick,
  children,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <NativeChoiceControl
      type="radio"
      name={name}
      checked={selected}
      className="rounded-md px-4 py-2"
      onChange={onClick}
    >
      {children}
    </NativeChoiceControl>
  );
}

function ClinicTemplateCard({
  template,
  defaultDestination,
}: {
  template: ClinicTemplateCatalogueItem;
  defaultDestination: DefaultCardDestination;
}) {
  const originalHref = `/templates/clinic/${template.slug}/`;
  const interactiveHref = `${originalHref}interactive/`;
  const opensInteractive =
    Boolean(template.interactiveLifecycle) &&
    defaultDestination === "interactive";
  const defaultHref = opensInteractive ? interactiveHref : originalHref;

  function openDefaultFromCard(event: MouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (event.target as HTMLElement).closest("a, button")
    ) {
      return;
    }

    window.location.assign(defaultHref);
  }

  return (
    <article
      className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
      onClick={openDefaultFromCard}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 className="font-semibold group-hover:text-chart-accent dark:group-hover:text-sky-300">
          {opensInteractive ? (
            <FullPageLink
              href={interactiveHref}
              aria-label={`Open interactive ${template.title}`}
              className={titleLinkClass}
            >
              {template.title}
            </FullPageLink>
          ) : (
            <Link
              href={originalHref}
              aria-label={`Open original ${template.title}`}
              className={titleLinkClass}
            >
              {template.title}
            </Link>
          )}
        </h4>
        {template.interactiveLifecycle ? (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${lifecyclePresentation[template.interactiveLifecycle].badgeClassName}`}
            data-template-lifecycle-badge={template.interactiveLifecycle}
          >
            Interactive · {template.interactiveLifecycle}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        {template.description}
      </p>
      <div className="relative z-10 mt-4 flex flex-wrap gap-4 text-sm font-medium">
        {template.interactiveLifecycle ? (
          opensInteractive ? (
            <Link
              href={originalHref}
              className="text-chart-accent hover:underline dark:text-sky-300"
            >
              View original template
            </Link>
          ) : (
            <FullPageLink
              href={interactiveHref}
              className="text-chart-accent hover:underline dark:text-sky-300"
            >
              Open interactive version
            </FullPageLink>
          )
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            Open original template
          </span>
        )}
      </div>
    </article>
  );
}
