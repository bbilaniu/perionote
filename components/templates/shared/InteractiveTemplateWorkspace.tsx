"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { TemplateSectionNavigationItem } from "@/lib/templates/sectionNavigation";
import type { TemplatePresentation } from "@/lib/templates/types";
import { InteractiveTemplateHeader } from "@/components/templates/shared/InteractiveTemplateHeader";
import { TemplateSectionNavigation } from "@/components/templates/shared/TemplateSectionNavigation";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950";
const destructiveButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800 dark:bg-slate-900 dark:text-red-200 dark:hover:bg-red-950 dark:focus-visible:ring-offset-slate-950";

export const interactiveTemplateClearFormWarning =
  "Clear this form and start a new note?\n\nThe previous local draft remains available for seven days.";

const dragScrollExcludedSelector = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "summary",
  "img",
  "svg",
  "p",
  "span",
  "legend",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "dt",
  "dd",
  "pre",
  "code",
  "td",
  "th",
  "[contenteditable='true']",
  "[data-drag-scroll-disabled]",
  "[role='button']",
  "[role='checkbox']",
  "[role='link']",
  "[role='option']",
  "[role='radio']",
].join(",");

const dragScrollThreshold = 6;

export function InteractiveTemplateWorkspace({
  presentation,
  sections,
  draftRecovery,
  generatedNote,
  children,
  formRevision,
  onSubmit,
  onLoadDemo,
  onReset,
}: {
  presentation: TemplatePresentation;
  sections: readonly TemplateSectionNavigationItem[];
  draftRecovery: ReactNode;
  generatedNote: (headerAction: ReactNode) => ReactNode;
  children: ReactNode;
  formRevision: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onLoadDemo: () => void;
  onReset: () => boolean;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [wideLayout, setWideLayout] = useState(false);
  const [baselineRequest, setBaselineRequest] = useState(0);
  const workspaceRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const noteDrawerRef = useRef<HTMLElement>(null);
  const dragScrollRef = useRef<{
    pointerId: number;
    startY: number;
    startScrollY: number;
    dragging: boolean;
  } | null>(null);
  const baselineRevisionRef = useRef(formRevision);
  const pendingBaselineRef = useRef<{ kind: "demo" | "reset" } | null>(null);

  useEffect(() => {
    const wideLayoutQuery = window.matchMedia("(min-width: 1280px)");
    const syncWideLayout = () => {
      setWideLayout(wideLayoutQuery.matches);
      if (wideLayoutQuery.matches) setNoteOpen(false);
    };

    syncWideLayout();
    wideLayoutQuery.addEventListener("change", syncWideLayout);
    return () => wideLayoutQuery.removeEventListener("change", syncWideLayout);
  }, []);

  useEffect(() => {
    const pendingBaseline = pendingBaselineRef.current;
    if (!pendingBaseline) return;

    baselineRevisionRef.current = formRevision;
    pendingBaselineRef.current = null;
  }, [baselineRequest, formRevision]);

  useEffect(() => {
    if (!noteOpen || wideLayout) return;

    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setNoteOpen(false);
        window.requestAnimationFrame(() =>
          focusVisibleReviewNoteTrigger(workspaceRef.current),
        );
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [noteOpen, wideLayout]);

  const loadDemo = () => {
    const formWasModified = formRevision !== baselineRevisionRef.current;
    if (
      formWasModified &&
      !window.confirm(
        "Load synthetic demo data and replace the current form? Changes made since this page was opened or last reset will be overwritten.",
      )
    ) {
      return;
    }

    pendingBaselineRef.current = { kind: "demo" };
    onLoadDemo();
    setBaselineRequest((request) => request + 1);
  };

  const resetForm = () => {
    if (!onReset()) return;
    pendingBaselineRef.current = { kind: "reset" };
    setBaselineRequest((request) => request + 1);
  };

  const closeNote = () => {
    setNoteOpen(false);
    window.requestAnimationFrame(() =>
      focusVisibleReviewNoteTrigger(workspaceRef.current),
    );
  };

  const reviewNote = () => {
    if (wideLayout) {
      noteDrawerRef.current
        ?.querySelector<HTMLTextAreaElement>("textarea")
        ?.focus({ preventScroll: true });
      return;
    }
    setNoteOpen(true);
  };

  const submitForm: FormEventHandler<HTMLFormElement> = (event) => {
    onSubmit(event);
    window.requestAnimationFrame(() => {
      const drawer = noteDrawerRef.current;
      if (
        window.matchMedia("(max-width: 1279px)").matches &&
        drawer &&
        document.activeElement instanceof HTMLElement &&
        !drawer.contains(document.activeElement)
      ) {
        setNoteOpen(false);
      }
    });
  };

  const startDragScroll: PointerEventHandler<HTMLFormElement> = (event) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      !(event.target instanceof Element) ||
      event.target.closest(dragScrollExcludedSelector)
    ) {
      return;
    }

    dragScrollRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollY: window.scrollY,
      dragging: false,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The pointer may no longer be active by the time capture is requested.
    }
  };

  const continueDragScroll: PointerEventHandler<HTMLFormElement> = (event) => {
    const dragScroll = dragScrollRef.current;
    if (!dragScroll || dragScroll.pointerId !== event.pointerId) return;

    const deltaY = event.clientY - dragScroll.startY;
    if (!dragScroll.dragging && Math.abs(deltaY) < dragScrollThreshold) return;

    dragScroll.dragging = true;
    event.currentTarget.dataset.dragScrolling = "true";
    event.preventDefault();
    window.scrollTo(0, dragScroll.startScrollY - deltaY);
  };

  const finishDragScroll: PointerEventHandler<HTMLFormElement> = (event) => {
    const dragScroll = dragScrollRef.current;
    if (!dragScroll || dragScroll.pointerId !== event.pointerId) return;

    dragScrollRef.current = null;
    delete event.currentTarget.dataset.dragScrolling;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const cancelDragScroll: PointerEventHandler<HTMLFormElement> = (event) => {
    const dragScroll = dragScrollRef.current;
    if (!dragScroll || dragScroll.pointerId !== event.pointerId) return;

    dragScrollRef.current = null;
    delete event.currentTarget.dataset.dragScrolling;
  };

  return (
    <form
      ref={workspaceRef}
      className="grid min-w-0 items-start gap-6 data-[drag-scrolling=true]:cursor-grabbing data-[drag-scrolling=true]:select-none xl:grid-cols-[minmax(0,1fr)_24rem] 2xl:grid-cols-[minmax(0,1fr)_minmax(30rem,0.8fr)]"
      autoComplete="off"
      onSubmit={submitForm}
      onLostPointerCapture={cancelDragScroll}
      onPointerCancel={cancelDragScroll}
      onPointerDown={startDragScroll}
      onPointerMove={continueDragScroll}
      onPointerUp={finishDragScroll}
    >
      <div className="min-w-0 space-y-4">
        <InteractiveTemplateHeader
          {...presentation}
          actions={
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button
                type="button"
                className={secondaryButtonClass}
                aria-label="Load synthetic demo"
                onClick={loadDemo}
              >
                <span className="sm:hidden" aria-hidden="true">
                  Load demo
                </span>
                <span className="hidden sm:inline" aria-hidden="true">
                  Load synthetic demo
                </span>
              </button>
              <button
                type="button"
                className={destructiveButtonClass}
                onClick={resetForm}
              >
                Clear form
              </button>
            </div>
          }
        />

        {draftRecovery}

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <TemplateSectionNavigation
            sections={sections}
            onReviewNote={reviewNote}
            noteExpanded={noteOpen || wideLayout}
            noteDrawerId="generated-note-drawer"
          />

          <div className="min-w-0 max-w-full space-y-6">{children}</div>
        </div>
      </div>

      <button
        type="button"
        className={`fixed inset-0 z-40 cursor-default bg-slate-950/35 xl:hidden ${
          noteOpen ? "block" : "hidden"
        }`}
        aria-label="Close generated note"
        onClick={closeNote}
      />
      <aside
        ref={noteDrawerRef}
        id="generated-note-drawer"
        aria-label="Generated note preview"
        aria-hidden={!noteOpen && !wideLayout}
        inert={!noteOpen && !wideLayout}
        className={
          noteOpen
            ? "fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-slate-100 p-4 shadow-2xl sm:w-[min(32rem,calc(100vw-2rem))] dark:bg-slate-950 xl:sticky xl:top-6 xl:bottom-auto xl:left-auto xl:right-auto xl:z-10 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100vh-3rem)] xl:w-auto xl:self-start xl:bg-transparent xl:p-0 xl:shadow-none"
            : "pointer-events-none fixed inset-y-0 right-0 z-50 w-full translate-x-full overflow-y-auto bg-slate-100 p-4 opacity-0 shadow-2xl sm:w-[min(32rem,calc(100vw-2rem))] dark:bg-slate-950 xl:pointer-events-auto xl:sticky xl:top-6 xl:bottom-auto xl:left-auto xl:right-auto xl:z-10 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100vh-3rem)] xl:w-auto xl:translate-x-0 xl:self-start xl:bg-transparent xl:p-0 xl:opacity-100 xl:shadow-none"
        }
      >
        {generatedNote(
          <button
            ref={closeButtonRef}
            type="button"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 xl:hidden"
            onClick={closeNote}
          >
            Close
          </button>,
        )}
      </aside>
    </form>
  );
}

function focusVisibleReviewNoteTrigger(container: HTMLElement | null) {
  const triggers = container?.querySelectorAll<HTMLButtonElement>(
    "[data-review-note-trigger]",
  );
  Array.from(triggers ?? [])
    .find((trigger) => trigger.getClientRects().length > 0)
    ?.focus();
}
