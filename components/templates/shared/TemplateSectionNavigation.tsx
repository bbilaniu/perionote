"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type { TemplateSectionNavigationItem } from "@/lib/templates/sectionNavigation";

function SectionLinks({
  sections,
  activeId,
  onNavigate,
  horizontal = false,
}: {
  sections: readonly TemplateSectionNavigationItem[];
  activeId: string;
  horizontal?: boolean;
  onNavigate: (
    event: MouseEvent<HTMLAnchorElement>,
    section: TemplateSectionNavigationItem,
  ) => void;
}) {
  return (
    <ol className={horizontal ? "flex items-center gap-1" : "space-y-1"}>
      {sections.map((section) => {
        const isActive = section.id === activeId;

        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={isActive ? "location" : undefined}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${horizontal ? "min-h-11 whitespace-nowrap" : ""} ${
                isActive
                  ? "bg-sky-100 text-sky-950 dark:bg-sky-900/70 dark:text-sky-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
              onClick={(event) => onNavigate(event, section)}
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
  );
}

export function TemplateSectionNavigation({
  sections,
  onNavigate,
  onReviewNote,
  noteExpanded = false,
  noteDrawerId,
  compact = false,
}: {
  sections: readonly TemplateSectionNavigationItem[];
  onNavigate?: (sectionId: string) => void;
  onReviewNote?: () => void;
  noteExpanded?: boolean;
  noteDrawerId?: string;
  compact?: boolean;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopSectionListRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef(sections[0]?.id ?? "");
  const lastScrollRef = useRef({ position: 0, time: 0 });
  const cueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = useMemo(
    () => Math.max(0, sections.findIndex((section) => section.id === activeId)),
    [activeId, sections],
  );
  const activeSection = sections[activeIndex];

  useEffect(() => {
    const availableSections = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!availableSections.length) return;

    let animationFrame = 0;
    const updateActiveSection = () => {
      animationFrame = 0;
      const now = performance.now();
      const currentPosition = window.scrollY;
      const previous = lastScrollRef.current;
      const elapsed = now - previous.time;
      const scrollVelocity =
        previous.time && elapsed > 0
          ? Math.abs(currentPosition - previous.position) / elapsed
          : 0;
      lastScrollRef.current = { position: currentPosition, time: now };

      const activationLine = Math.min(160, window.innerHeight * 0.25);
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      const sectionList = desktopSectionListRef.current;
      if (sectionList) {
        const firstSectionTop =
          availableSections[0].getBoundingClientRect().top + currentPosition;
        const lastSectionBottom =
          availableSections[availableSections.length - 1]
            .getBoundingClientRect()
            .bottom + currentPosition;
        const templateScrollStart = Math.max(
          0,
          firstSectionTop - activationLine,
        );
        const templateScrollEnd = Math.max(
          templateScrollStart,
          lastSectionBottom - window.innerHeight,
        );
        const templateProgress =
          templateScrollEnd === templateScrollStart
            ? Number(atPageEnd)
            : Math.min(
                1,
                Math.max(
                  0,
                  (currentPosition - templateScrollStart) /
                    (templateScrollEnd - templateScrollStart),
                ),
              );
        const maximumListScroll =
          sectionList.scrollHeight - sectionList.clientHeight;
        sectionList.scrollTop =
          maximumListScroll <= 1 ? 0 : templateProgress * maximumListScroll;
      }
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

      if (activeIdRef.current !== nextActive.id) {
        if (scrollVelocity >= 1) {
          setShowScrollCue(true);
          if (cueTimeoutRef.current) clearTimeout(cueTimeoutRef.current);
          cueTimeoutRef.current = setTimeout(
            () => setShowScrollCue(false),
            1000,
          );
        }
        activeIdRef.current = nextActive.id;
        setActiveId(nextActive.id);
      }
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
      if (cueTimeoutRef.current) clearTimeout(cueTimeoutRef.current);
    };
  }, [sections]);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog) return;

    if (mobileOpen && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => {
        dialog
          .querySelector<HTMLElement>("[aria-current='location']")
          ?.scrollIntoView({ block: "center" });
      });
    } else if (!mobileOpen && dialog.open) {
      dialog.close();
    }
  }, [mobileOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeMobileNavigation = () => {
      if (desktopQuery.matches) setMobileOpen(false);
    };
    desktopQuery.addEventListener("change", closeMobileNavigation);
    return () =>
      desktopQuery.removeEventListener("change", closeMobileNavigation);
  }, []);

  function navigateToSection(
    event: MouseEvent<HTMLAnchorElement>,
    section: TemplateSectionNavigationItem,
    fromMobile = false,
  ) {
    event.preventDefault();
    onNavigate?.(section.id);
    activeIdRef.current = section.id;
    setActiveId(section.id);
    if (fromMobile) setMobileOpen(false);

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
        `${window.location.pathname}${window.location.search}#${section.id}`,
      );
    });
  }

  return (
    <>
      <nav
        aria-label="Form sections"
        className={compact
          ? "sticky top-2 z-20 hidden min-w-0 max-w-full self-start overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur lg:block dark:border-slate-800 dark:bg-slate-900/95"
          : "sticky top-6 order-2 hidden max-h-[calc(100vh-3rem)] self-start overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900/95"}
      >
        {onReviewNote ? (
          <button
            type="button"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-sky-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 xl:hidden dark:hover:bg-sky-600 dark:focus-visible:ring-offset-slate-950"
            aria-controls={noteDrawerId}
            aria-expanded={noteExpanded}
            data-review-note-trigger
            onClick={onReviewNote}
          >
            Review note
          </button>
        ) : null}
        <div
          className={
            onReviewNote
              ? "mt-3 flex min-h-0 flex-1 flex-col border-t border-slate-200 pt-3 xl:mt-0 xl:border-t-0 xl:pt-0 dark:border-slate-800"
              : "flex min-h-0 flex-1 flex-col"
          }
        >
          <p className="shrink-0 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            On this form
          </p>
          <div
            ref={desktopSectionListRef}
            className={compact ? "workspace-scrollbar min-h-0 overflow-x-auto" : "workspace-scrollbar mt-2 min-h-0 overflow-y-auto"}
            data-section-list
          >
            <SectionLinks
              sections={sections}
              activeId={activeId}
              onNavigate={navigateToSection}
              horizontal={compact}
            />
          </div>
        </div>
      </nav>

      <nav
        aria-label="Current form section"
        className="sticky top-2 z-30 min-w-0 max-w-full lg:hidden"
      >
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
          <button
            ref={mobileTriggerRef}
            type="button"
            className={`flex min-h-12 min-w-0 max-w-full items-center gap-2 rounded-xl border bg-white/95 px-3 py-2 text-left shadow-lg backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-900/95 ${
              showScrollCue
                ? "border-sky-500 ring-2 ring-sky-200 dark:border-sky-400 dark:ring-sky-900"
                : "border-slate-200 dark:border-slate-800"
            }`}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            aria-controls="mobile-form-sections"
            aria-label={`Open form sections. Current section: ${activeSection?.label ?? "Unknown"}`}
            onClick={() => setMobileOpen(true)}
          >
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {activeIndex + 1} of {sections.length}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
              {activeSection?.label}
            </span>
            <span className="hidden text-sm font-semibold text-sky-800 sm:inline dark:text-sky-200">
              Sections
            </span>
          </button>
          {onReviewNote ? (
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sky-700 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:hover:bg-sky-600 dark:focus-visible:ring-offset-slate-950"
              aria-controls={noteDrawerId}
              aria-expanded={noteExpanded}
              data-review-note-trigger
              onClick={onReviewNote}
            >
              Review note
            </button>
          ) : null}
        </div>
      </nav>

      <dialog
        ref={mobileDialogRef}
        id="mobile-form-sections"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(21rem,calc(100vw-2rem))] max-w-none overflow-y-auto border-0 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 dark:text-slate-100 lg:hidden"
        aria-labelledby="mobile-form-sections-title"
        onCancel={() => setMobileOpen(false)}
        onClose={() => {
          setMobileOpen(false);
          mobileTriggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMobileOpen(false);
        }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <h2 id="mobile-form-sections-title" className="font-semibold">
            On this form
          </h2>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Close
          </button>
        </div>
        <nav aria-label="Choose a form section" className="p-3">
          <SectionLinks
            sections={sections}
            activeId={activeId}
            onNavigate={(event, section) =>
              navigateToSection(event, section, true)
            }
          />
        </nav>
      </dialog>
    </>
  );
}
