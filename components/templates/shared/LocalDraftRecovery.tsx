"use client";

import Link from "next/link";
import type { InteractiveDraft } from "@/lib/templates/localDrafts";

function formatDraftTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function LocalDraftRecovery<T>({
  drafts,
  lastSavedAt,
  restoredAt,
  storageError,
  onRestore,
  onDelete,
}: {
  drafts: InteractiveDraft<T>[];
  lastSavedAt: Date | null;
  restoredAt: Date | null;
  storageError: string;
  onRestore: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}) {
  return (
    <section
      className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-slate-300"
      aria-label="Local draft recovery"
    >
      <p>
        This note is saved only in this browser every 10 seconds, when copied,
        and when the page is left. Local drafts are deleted seven days after
        their most recent save and are not the clinical record.
      </p>
      <Link
        className="mt-2 inline-flex font-medium text-sky-800 hover:underline dark:text-sky-200"
        href="/drafts"
      >
        View all saved drafts
      </Link>
      {lastSavedAt ? (
        <p className="mt-2" role="status">
          Local draft saved {formatDraftTime(lastSavedAt)}.
        </p>
      ) : null}
      {restoredAt ? (
        <p
          className="mt-2 font-medium text-sky-900 dark:text-sky-200"
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
        <div className="mt-3 border-t border-sky-200 pt-3 dark:border-sky-900">
          <h2 className="font-semibold">Other recoverable drafts</h2>
          <p className="mt-1 text-xs">
            These may be from other tabs or a previous browser session.
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
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-sky-700 px-3 py-1.5 font-semibold text-white hover:bg-sky-800"
                    onClick={() => onRestore(draft.draftId)}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-300 px-3 py-1.5 font-semibold text-red-800 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950"
                    onClick={() => onDelete(draft.draftId)}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
