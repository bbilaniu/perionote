"use client";

import { useState, useSyncExternalStore } from "react";
import {
  INTERACTIVE_DRAFT_CHANGE_EVENT,
  INTERACTIVE_DRAFT_STORAGE_PREFIX,
  listInteractiveDraftSummaries,
} from "@/lib/templates/localDrafts";
import {
  createDraftSummarySnapshotReader,
  getServerDraftSummarySnapshot,
} from "@/lib/templates/localDraftSummaryStore";

function subscribe(onChange: () => void) {
  const refresh = () => {
    try {
      // Cleanup belongs to subscription/event handling, never a render read.
      listInteractiveDraftSummaries(window.localStorage);
    } catch {
      // The snapshot reader reports unavailable storage to the UI.
    }
    onChange();
  };
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key.startsWith(INTERACTIVE_DRAFT_STORAGE_PREFIX)
    ) {
      refresh();
    }
  };
  const handleLocalChange = (event: Event) => {
    try {
      if ((event as CustomEvent).detail !== window.localStorage) return;
    } catch {
      // Let the snapshot report access failures.
    }
    refresh();
  };
  const handleVisibility = () => {
    if (document.visibilityState === "visible") refresh();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(INTERACTIVE_DRAFT_CHANGE_EVENT, handleLocalChange);
  document.addEventListener("visibilitychange", handleVisibility);
  refresh();
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(INTERACTIVE_DRAFT_CHANGE_EVENT, handleLocalChange);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}

export function useLocalDraftSummaries() {
  const [getSnapshot] = useState(() =>
    createDraftSummarySnapshotReader(() => window.localStorage),
  );
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerDraftSummarySnapshot,
  );
}
