"use client";

import Link from "next/link";
import type { InteractiveDraft } from "@/lib/templates/localDrafts";

function formatDraftTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    hourCycle: "h23",
  }).format(date);
}

export function LocalDraftRecovery({
  drafts,
  lastSavedAt,
  restoredAt,
  storageError,
  onRestore,
}: {
  drafts: readonly InteractiveDraft<unknown>[];
  lastSavedAt: Date | null;
  restoredAt: Date | null;
  storageError: string;
  onRestore: (draftId: string) => void;
}) {
  return (
    <section
      className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-slate-300"
      aria-label="Local draft recovery"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p>
          <span className="font-semibold text-sky-950 dark:text-sky-100">
            Local recovery only
          </span>{" "}
          <span aria-hidden="true">·</span> Autosaves every 10 seconds and
          keeps drafts for seven days <span aria-hidden="true">·</span> Not the
          clinical record
        </p>
        {lastSavedAt ? (
          <p className="font-medium" role="status">
            Saved {formatDraftTime(lastSavedAt)}
          </p>
        ) : null}
        <Link
          className="font-semibold text-sky-800 hover:underline min-[2304px]:hidden dark:text-sky-200"
          href="/drafts"
        >
          View all saved drafts
        </Link>
      </div>
      {restoredAt ? (
        <p
          className="mt-2 border-t border-sky-200 pt-2 font-medium text-sky-900 dark:border-sky-900 dark:text-sky-200"
          role="status"
        >
          Restored the draft saved {formatDraftTime(restoredAt)}.
        </p>
      ) : null}
      {storageError ? (
        <p
          className="mt-2 font-medium text-red-800 dark:text-red-200"
          role="alert"
        >
          {storageError}
        </p>
      ) : null}
      {drafts.length ? (
        <details className="mt-2 border-t border-sky-200 pt-2 min-[2304px]:hidden dark:border-sky-900">
          <summary className="cursor-pointer font-semibold text-sky-900 marker:text-sky-700 hover:underline dark:text-sky-100 dark:marker:text-sky-300">
            {drafts.length} other local {drafts.length === 1 ? "draft" : "drafts"}{" "}
            for this template
          </summary>
          <p className="mt-2 text-xs">
            The draft open in this tab is not included. Listed drafts may be
            from another tab, an earlier session, or a checkpoint created
            before clearing or restoring the form.
          </p>
          <ul className="mt-2 space-y-2">
            {drafts.map((draft) => (
              <li
                key={draft.draftId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 p-3 dark:bg-slate-950/50"
              >
                <span>
                  Started {formatDraftTime(draft.startedAt)} · saved{" "}
                  {formatDraftTime(draft.savedAt)}
                </span>
                <button
                  type="button"
                  className="rounded-lg bg-sky-700 px-3 py-1.5 font-semibold text-white hover:bg-sky-800"
                  onClick={() => onRestore(draft.draftId)}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
