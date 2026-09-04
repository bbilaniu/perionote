"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LocalDraftWorkspaceState } from "@/components/templates/shared/localDraftWorkspace";
import { selectInteractiveDraftForCurrentTab } from "@/components/templates/shared/useLocalInteractiveDraft";
import {
  interactiveDraftTemplates,
  isInteractiveDraftTemplateId,
} from "@/lib/templates/interactiveDraftTemplates";
import {
  listInteractiveDraftSummaries,
  type InteractiveDraftSummary,
} from "@/lib/templates/localDrafts";

function formatDraftTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    hourCycle: "h23",
  }).format(date);
}

function DraftIdentity({
  patientId,
  savedAt,
}: {
  patientId?: string;
  savedAt?: string | Date | null;
}) {
  return (
    <>
      <p className="truncate text-sm font-semibold">
        {patientId?.trim() || "Patient ID not entered"}
      </p>
      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
        {savedAt ? "Saved " + formatDraftTime(savedAt) : "Not saved yet"}
      </p>
    </>
  );
}

export function LocalDraftRail({
  templateId,
  templateName,
  currentDraftId,
  drafts,
  lastSavedAt,
  storageError,
  onRestore,
  onSaveCurrent,
}: LocalDraftWorkspaceState) {
  const router = useRouter();
  const [summaries, setSummaries] = useState<InteractiveDraftSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openError, setOpenError] = useState("");

  const refreshDrafts = useCallback(() => {
    try {
      setSummaries(listInteractiveDraftSummaries(window.localStorage));
    } catch {
      setSummaries([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshDrafts();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("hygienenote.interactive-draft.")) {
        refreshDrafts();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshDrafts();
    };
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshDrafts]);

  useEffect(() => {
    refreshDrafts();
  }, [currentDraftId, drafts, lastSavedAt, refreshDrafts]);

  const summaryById = useMemo(
    () => new Map(summaries.map((draft) => [draft.draftId, draft])),
    [summaries],
  );
  const currentDraft = summaryById.get(currentDraftId);
  const currentTemplateDrafts = drafts.map((draft) => ({
    draft,
    summary: summaryById.get(draft.draftId),
  }));
  const otherTemplateDrafts = summaries.filter(
    (draft) => draft.templateId !== templateId,
  );

  const openOtherTemplateDraft = (draft: InteractiveDraftSummary) => {
    if (!isInteractiveDraftTemplateId(draft.templateId)) return;
    if (onSaveCurrent() === "failed") {
      setOpenError(
        "The current draft could not be saved, so another draft was not opened.",
      );
      return;
    }
    try {
      selectInteractiveDraftForCurrentTab(draft.templateId, draft.draftId);
      setOpenError("");
      router.push(interactiveDraftTemplates[draft.templateId].href);
    } catch {
      setOpenError("The selected local draft could not be opened.");
    }
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-labelledby="local-draft-rail-title"
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
          Work in progress
        </p>
        <h2
          id="local-draft-rail-title"
          className="mt-1 text-lg font-semibold tracking-tight"
        >
          Local drafts
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
          Browser-only recovery copies kept for seven days. Not the clinical
          record.
        </p>
      </header>

      <section className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold">This form</h3>
        <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">
          {templateName}
        </p>

        <div className="mt-3 rounded-xl border border-sky-300 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-950/40">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DraftIdentity
                patientId={currentDraft?.patientId}
                savedAt={lastSavedAt ?? currentDraft?.savedAt}
              />
            </div>
            <span className="shrink-0 rounded-full bg-sky-700 px-2 py-1 text-[0.6875rem] font-semibold text-white dark:bg-sky-400 dark:text-sky-950">
              Open now
            </span>
          </div>
        </div>

        {currentTemplateDrafts.length ? (
          <ul className="mt-2 space-y-2" aria-label="Other drafts for this form">
            {currentTemplateDrafts.map(({ draft, summary }) => (
              <li
                key={draft.draftId}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50"
              >
                <DraftIdentity
                  patientId={summary?.patientId}
                  savedAt={draft.savedAt}
                />
                <button
                  type="button"
                  className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-sky-700 px-3 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                  aria-label={
                    "Open draft for " +
                    (summary?.patientId.trim() || "patient ID not entered")
                  }
                  onClick={() => onRestore(draft.draftId)}
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            No other local drafts for this form.
          </p>
        )}
      </section>

      <section className="ultrawide-other-drafts mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold">Other forms</h3>
          {otherTemplateDrafts.length ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {otherTemplateDrafts.length}
            </span>
          ) : null}
        </div>
        {otherTemplateDrafts.length ? (
          <ul className="mt-2 space-y-2" aria-label="Drafts for other forms">
            {otherTemplateDrafts.map((draft) => {
              const supportedTemplate = isInteractiveDraftTemplateId(
                draft.templateId,
              )
                ? interactiveDraftTemplates[draft.templateId].label
                : undefined;
              const otherTemplateName =
                supportedTemplate ?? "Unavailable interactive template";
              return (
                <li
                  key={draft.draftId}
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-400">
                    {otherTemplateName}
                  </p>
                  <div className="mt-1">
                    <DraftIdentity
                      patientId={draft.patientId}
                      savedAt={draft.savedAt}
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-sm font-semibold text-sky-800 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-sky-200 dark:disabled:text-slate-600"
                    disabled={!supportedTemplate}
                    aria-label={
                      "Open " +
                      otherTemplateName +
                      " draft for " +
                      (draft.patientId.trim() || "patient ID not entered")
                    }
                    onClick={() => openOtherTemplateDraft(draft)}
                  >
                    {supportedTemplate ? "Open draft" : "Unavailable"}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : loaded ? (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            No drafts from other forms.
          </p>
        ) : null}
      </section>

      {storageError || openError ? (
        <p
          className="mt-4 text-xs font-medium text-red-700 dark:text-red-300"
          role="alert"
        >
          {openError || storageError}
        </p>
      ) : null}

      <Link
        href="/drafts"
        className="mt-4 inline-flex text-sm font-semibold text-sky-800 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-200"
      >
        View all saved drafts
        {summaries.length ? " (" + summaries.length + ")" : ""}
      </Link>
    </section>
  );
}
