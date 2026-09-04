"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import { ActionDialog } from "@/components/ActionDialog";
import type { TemplateSectionNavigationItem } from "@/lib/templates/sectionNavigation";
import type { TemplatePresentation } from "@/lib/templates/types";
import { InteractiveTemplateHeader } from "@/components/templates/shared/InteractiveTemplateHeader";
import { LocalDraftRail } from "@/components/templates/shared/LocalDraftRail";
import { LocalDraftRecovery } from "@/components/templates/shared/LocalDraftRecovery";
import { TemplateSectionNavigation } from "@/components/templates/shared/TemplateSectionNavigation";
import type { LocalDraftWorkspaceState } from "@/components/templates/shared/localDraftWorkspace";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950";
const tertiaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900/70 dark:hover:text-white dark:focus-visible:ring-offset-slate-950";
const destructiveButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800 dark:bg-slate-900 dark:text-red-200 dark:hover:bg-red-950 dark:focus-visible:ring-offset-slate-950";

export type InteractiveTemplateResetMode = "new" | "clear";
export const interactiveTemplateUnloadWarning =
  "Your local draft may not have finished saving.";

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
  draftRecovery: LocalDraftWorkspaceState;
  generatedNote: (headerAction: ReactNode) => ReactNode;
  children: ReactNode;
  formRevision: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onLoadDemo: () => void;
  onReset: (mode: InteractiveTemplateResetMode) => boolean;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [wideLayout, setWideLayout] = useState(false);
  const [baselineRequest, setBaselineRequest] = useState(0);
  const [actionDialog, setActionDialog] = useState<
    "form" | "demo" | null
  >(null);
  const [resetError, setResetError] = useState("");
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
  const restoreDialogFocusRef = useRef(true);

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

  const applyDemo = () => {
    setActionDialog(null);
    pendingBaselineRef.current = { kind: "demo" };
    onLoadDemo();
    setBaselineRequest((request) => request + 1);
  };

  const loadDemo = () => {
    const formWasModified = formRevision !== baselineRevisionRef.current;
    if (formWasModified) {
      setActionDialog("demo");
      return;
    }
    applyDemo();
  };

  const resetForm = (mode: InteractiveTemplateResetMode) => {
    const resetSucceeded = onReset(mode);
    if (!resetSucceeded) {
      setResetError(
        "The current form could not be saved, so it was not cleared. Copy the note before trying again.",
      );
      return;
    }

    restoreDialogFocusRef.current = false;
    setResetError("");
    setActionDialog(null);
    pendingBaselineRef.current = { kind: "reset" };
    setBaselineRequest((request) => request + 1);
  };

  const dismissActionDialog = () => {
    restoreDialogFocusRef.current = true;
    setResetError("");
    setActionDialog(null);
  };

  const openFormActionDialog = () => {
    restoreDialogFocusRef.current = true;
    setResetError("");
    setActionDialog("form");
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
      className="grid min-w-0 items-start gap-6 data-[drag-scrolling=true]:cursor-grabbing data-[drag-scrolling=true]:select-none xl:grid-cols-[minmax(0,1fr)_24rem] 2xl:grid-cols-[minmax(0,1fr)_minmax(30rem,0.8fr)] min-[2304px]:relative min-[2304px]:left-1/2 min-[2304px]:w-[calc(100vw-3rem)] min-[2304px]:max-w-[133rem] min-[2304px]:-translate-x-1/2 min-[2304px]:grid-cols-[minmax(0,1fr)_minmax(30rem,0.8fr)_22rem]"
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
                className={tertiaryButtonClass}
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
                className={secondaryButtonClass}
                onClick={openFormActionDialog}
              >
                New / clear form
              </button>
            </div>
          }
        />

        <LocalDraftRecovery
          drafts={draftRecovery.drafts}
          lastSavedAt={draftRecovery.lastSavedAt}
          restoredAt={draftRecovery.restoredAt}
          storageError={draftRecovery.storageError}
          onRestore={draftRecovery.onRestore}
        />

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
      <aside className="hidden min-[2304px]:sticky min-[2304px]:top-6 min-[2304px]:col-start-3 min-[2304px]:row-start-1 min-[2304px]:block min-[2304px]:h-[calc(100dvh-11rem)] min-[2304px]:min-h-0 min-[2304px]:self-start">
        <LocalDraftRail {...draftRecovery} />
      </aside>

      <ActionDialog
        open={actionDialog === "form"}
        title="New or clear form?"
        description={
          <>
            Keep this work as a local draft before opening a blank form, or
            discard it and clear the current form. Local drafts stay in this
            browser for seven days and are not clinical records.
          </>
        }
        onDismiss={dismissActionDialog}
        restoreFocusOnClose={restoreDialogFocusRef.current}
      >
        {resetError ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          >
            {resetError}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            className={secondaryButtonClass}
            data-dialog-initial-focus
            onClick={dismissActionDialog}
          >
            Cancel
          </button>
          <button
            type="button"
            className={destructiveButtonClass}
            onClick={() => resetForm("clear")}
          >
            Clear current form
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            onClick={() => resetForm("new")}
          >
            Save draft &amp; start new
          </button>
        </div>
      </ActionDialog>

      <ActionDialog
        open={actionDialog === "demo"}
        title="Replace current form with synthetic demo?"
        description="This replaces the entries in the current form. Deliberately remembered catalogue values are unchanged."
        onDismiss={() => setActionDialog(null)}
      >
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={secondaryButtonClass}
            data-dialog-initial-focus
            onClick={() => setActionDialog(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={destructiveButtonClass}
            onClick={applyDemo}
          >
            Replace form
          </button>
        </div>
      </ActionDialog>
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
