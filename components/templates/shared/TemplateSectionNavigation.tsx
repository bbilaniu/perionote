"use client";

import React, { useEffect, useRef, useState, type MouseEvent } from "react";
import type { TemplateSectionNavigationItem } from "@/lib/templates/sectionNavigation";

export function TemplateSectionNavigation({
  sections,
  onNavigate,
}: {
  sections: readonly TemplateSectionNavigationItem[];
  onNavigate?: (sectionId: string) => void;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const availableSections = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!availableSections.length) return;

    let animationFrame = 0;
    const updateActiveSection = () => {
      animationFrame = 0;
      const activationLine = Math.min(160, window.innerHeight * 0.25);
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      let nextActive = availableSections[0];

      if (atPageEnd) {
        nextActive = availableSections[availableSections.length - 1];
      } else {
        for (const section of availableSections) {
          if (section.getBoundingClientRect().top <= activationLine) {
            nextActive = section;
          } else {
            break;
          }
        }
      }

      setActiveId((current) =>
        current === nextActive.id ? current : nextActive.id
      );
    };
    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [sections]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const activeLink = Array.from(list.querySelectorAll("a")).find(
      (link) => link.hash === `#${activeId}`
    );
    if (!activeLink) return;

    const listBounds = list.getBoundingClientRect();
    const linkBounds = activeLink.getBoundingClientRect();
    let horizontalOffset = 0;

    if (linkBounds.left < listBounds.left) {
      horizontalOffset = linkBounds.left - listBounds.left;
    } else if (linkBounds.right > listBounds.right) {
      horizontalOffset = linkBounds.right - listBounds.right;
    }

    if (horizontalOffset) {
      const reduceMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
      list.scrollBy({
        left: horizontalOffset,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [activeId]);

  function navigateToSection(
    event: MouseEvent<HTMLAnchorElement>,
    section: TemplateSectionNavigationItem
  ) {
    event.preventDefault();
    onNavigate?.(section.id);
    setActiveId(section.id);

    window.requestAnimationFrame(() => {
      const target = document.getElementById(section.id);
      if (!target) return;

      const reduceMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#${section.id}`
      );
    });
  }

  return (
    <nav
      aria-label="Form sections"
      className="sticky top-2 z-20 min-w-0 max-w-full self-start rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg ring-1 ring-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:ring-white/10 2xl:top-6 2xl:max-h-[calc(100vh-3rem)] 2xl:overflow-y-auto 2xl:shadow-sm 2xl:ring-0"
    >
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        On this form
      </p>
      <ol
        ref={listRef}
        className="mt-2 flex gap-1 overflow-x-auto pb-1 2xl:block 2xl:space-y-1 2xl:overflow-visible 2xl:pb-0"
      >
        {sections.map((section) => {
          const isActive = section.id === activeId;

          return (
            <li key={section.id} className="shrink-0 2xl:shrink">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isActive
                    ? "bg-sky-100 text-sky-950 dark:bg-sky-900/70 dark:text-sky-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
                onClick={(event) => navigateToSection(event, section)}
              >
                {section.status ? (
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      section.status === "complete"
                        ? "bg-emerald-600 dark:bg-emerald-400"
                        : "border border-slate-400 dark:border-slate-500"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <span>{section.label}</span>
                {section.status ? (
                  <span className="sr-only">
                    {section.status === "complete" ? "Complete" : "Incomplete"}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
