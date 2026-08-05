"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { selectInteractiveDraftForCurrentTab } from "@/components/templates/shared/useLocalInteractiveDraft";
import {
  interactiveDraftTemplates,
  isInteractiveDraftTemplateId,
} from "@/lib/templates/interactiveDraftTemplates";
import {
  deleteInteractiveDraft,
  INTERACTIVE_DRAFT_RETENTION_MS,
  listInteractiveDraftSummaries,
  type InteractiveDraftSummary,
} from "@/lib/templates/localDrafts";

function formatDraftTime(value: string | number): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LocalDraftManager() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<InteractiveDraftSummary[]>([]);
  const [storageError, setStorageError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const refreshDrafts = useCallback(() => {
    try {
      setDrafts(listInteractiveDraftSummaries(window.localStorage));
      setStorageError("");
    } catch {
      setStorageError(
        "Local draft storage is unavailable in this browser. Existing drafts cannot be listed here.",
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshDrafts();
    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key.startsWith("hygienenote.interactive-draft.")
      ) {
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

  const openDraft = (draft: InteractiveDraftSummary) => {
    if (!isInteractiveDraftTemplateId(draft.templateId)) return;
    try {
      selectInteractiveDraftForCurrentTab(draft.templateId, draft.draftId);
      router.push(interactiveDraftTemplates[draft.templateId].href);
    } catch {
      setStorageError("The selected local draft could not be opened.");
    }
  };

  const deleteDraft = (draft: InteractiveDraftSummary) => {
    const templateLabel = isInteractiveDraftTemplateId(draft.templateId)
      ? interactiveDraftTemplates[draft.templateId].label
      : "unavailable template";
    if (!window.confirm(`Delete the ${templateLabel} local draft?`)) return;
    try {
      deleteInteractiveDraft(
        window.localStorage,
        draft.templateId,
        draft.draftId,
      );
      refreshDrafts();
    } catch {
      setStorageError(
        "The local draft could not be deleted. Clear this site's browser data to remove it.",
      );
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Saved local drafts
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          These recovery drafts are stored only in this browser profile. They
          are deleted seven days after their most recent save and are not the
          clinical record.
        </p>
      </header>

      {storageError ? (
        <p
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {storageError}
        </p>
      ) : null}

      {loaded && !drafts.length && !storageError ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">No saved drafts</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Drafts appear here after an interactive note is saved automatically
            or copied.
          </p>
        </div>
      ) : null}

      {drafts.length ? (
        <ul className="grid gap-4" aria-label="Saved local drafts">
          {drafts.map((draft) => {
            const template = isInteractiveDraftTemplateId(draft.templateId)
              ? interactiveDraftTemplates[draft.templateId]
              : undefined;
            const expiresAt =
              Date.parse(draft.savedAt) + INTERACTIVE_DRAFT_RETENTION_MS;
            return (
              <li
                key={`${draft.templateId}:${draft.draftId}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Local recovery draft
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {template?.label ?? "Unavailable interactive template"}
                    </h2>
                    <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-slate-700 sm:grid-cols-2 dark:text-slate-300">
                      <div>
                        <dt className="inline font-medium">Started: </dt>
                        <dd className="inline">
                          <time dateTime={draft.startedAt}>
                            {formatDraftTime(draft.startedAt)}
                          </time>
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Last saved: </dt>
                        <dd className="inline">
                          <time dateTime={draft.savedAt}>
                            {formatDraftTime(draft.savedAt)}
                          </time>
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Deletes after: </dt>
                        <dd className="inline">
                          <time dateTime={new Date(expiresAt).toISOString()}>
                            {formatDraftTime(expiresAt)}
                          </time>
                        </dd>
                      </div>
                    </dl>
                    {!template ? (
                      <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">
                        This app version cannot open the template that created
                        this draft.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {template ? (
                      <button
                        type="button"
                        className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                        onClick={() => openDraft(draft)}
                      >
                        Open draft
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950"
                      onClick={() => deleteDraft(draft)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
