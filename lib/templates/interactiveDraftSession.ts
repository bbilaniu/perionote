import {
  createInteractiveDraftId,
  deleteInteractiveDraft,
  interactiveDraftTabStorageKey,
  listInteractiveDrafts,
  pruneInteractiveDrafts,
  readInteractiveDraft,
  writeInteractiveDraft,
  type InteractiveDraft,
} from "@/lib/templates/localDrafts";

const autosaveIntervalMs = 10_000;
const tabMarkerWindowNamePrefix = "hygienenote-interactive-draft-tab-v1:";

function tabMarkerStorageKey(templateId: string): string {
  return `hygienenote.interactive-draft.tab-marker.v1.${encodeURIComponent(
    templateId,
  )}`;
}

function currentTabMarker(): string {
  if (window.name.startsWith(tabMarkerWindowNamePrefix)) {
    return window.name.slice(tabMarkerWindowNamePrefix.length);
  }
  const marker = createInteractiveDraftId();
  window.name = `${tabMarkerWindowNamePrefix}${marker}`;
  return marker;
}

export function selectInteractiveDraftForCurrentTab(
  templateId: string,
  draftId: string,
): void {
  window.sessionStorage.setItem(
    interactiveDraftTabStorageKey(templateId),
    draftId,
  );
  window.sessionStorage.setItem(
    tabMarkerStorageKey(templateId),
    currentTabMarker(),
  );
}

export type LocalDraftSaveResult = "saved" | "removed" | "skipped" | "failed";
export type LocalDraftDiscardResult = "discarded" | "failed";

export type InteractiveDraftRuntime<T> = {
  form: T;
  startedAt: Date | null;
  isEmpty: (form: T) => boolean;
  isValidForm: (value: unknown) => value is T;
  onRestore: (draft: InteractiveDraft<T>) => void;
};

type Snapshot<T> = {
  recoverableDrafts: InteractiveDraft<T>[];
  currentDraftId: string;
  lastSavedAt: Date | null;
  restoredAt: Date | null;
  storageError: string;
  hydrated: boolean;
};

export function createInteractiveDraftSession<T>(templateId: string) {
  const serverSnapshot: Snapshot<T> = {
    recoverableDrafts: [],
    currentDraftId: "",
    lastSavedAt: null,
    restoredAt: null,
    storageError: "",
    hydrated: false,
  };
  let snapshot = serverSnapshot;
  // The hook supplies committed inputs in a layout effect before subscribing.
  let runtime: InteractiveDraftRuntime<T> | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  function update(patch: Partial<Snapshot<T>>) {
    const changed = (Object.keys(patch) as (keyof Snapshot<T>)[]).some(
      (key) => !Object.is(snapshot[key], patch[key]),
    );
    if (!changed) return;
    snapshot = { ...snapshot, ...patch };
  }

  function applyRestoredDraft(draft: InteractiveDraft<T>) {
    // A navigation/Strict Mode cleanup can checkpoint before React commits
    // the restored form. Keep that checkpoint attached to the selected draft.
    runtime = {
      ...runtime!,
      form: draft.form,
      startedAt: new Date(draft.startedAt),
    };
    runtime.onRestore(draft);
  }

  function refreshRecoverableDrafts() {
    try {
      const drafts = listInteractiveDrafts(
        window.localStorage,
        templateId,
        runtime!.isValidForm,
      ).filter((draft) => draft.draftId !== snapshot.currentDraftId);
      update({ recoverableDrafts: drafts });
    } catch {
      update({
        storageError: "Local draft storage is unavailable in this browser. Copy the note before leaving this page.",
      });
    }
  }

  function saveNow(): LocalDraftSaveResult {
    if (!snapshot.hydrated || !snapshot.currentDraftId || !runtime!.startedAt) {
      return "skipped";
    }
    try {
      pruneInteractiveDrafts(window.localStorage);
      if (runtime!.isEmpty(runtime!.form)) {
        deleteInteractiveDraft(
          window.localStorage,
          templateId,
          snapshot.currentDraftId,
        );
        update({ lastSavedAt: null });
        return "removed";
      }
      const draft = writeInteractiveDraft(window.localStorage, {
        templateId,
        draftId: snapshot.currentDraftId,
        form: runtime!.form,
        startedAt: runtime!.startedAt,
      });
      update({ lastSavedAt: new Date(draft.savedAt) });
      update({ storageError: "" });
      return "saved";
    } catch {
      update({
        storageError: "This draft could not be saved locally. Copy the note before leaving this page.",
      });
      return "failed";
    }
  }

  function beginNewDraft(): LocalDraftSaveResult {
    const saveResult = saveNow();
    if (saveResult === "failed") return saveResult;

    const draftId = createInteractiveDraftId();
    update({ currentDraftId: draftId });
    try {
      selectInteractiveDraftForCurrentTab(templateId, draftId);
    } catch {
      update({
        storageError: "The new form is ready, but its local draft could not be initialized.",
      });
    }
    update({ lastSavedAt: null });
    update({ restoredAt: null });
    refreshRecoverableDrafts();
    return saveResult;
  }

  function discardAndBeginNewDraft(): LocalDraftDiscardResult {
    try {
      if (snapshot.currentDraftId) {
        deleteInteractiveDraft(
          window.localStorage,
          templateId,
          snapshot.currentDraftId,
        );
      }
      const draftId = createInteractiveDraftId();
      update({ currentDraftId: draftId });
      selectInteractiveDraftForCurrentTab(templateId, draftId);
      update({ lastSavedAt: null });
      update({ restoredAt: null });
      update({ storageError: "" });
      refreshRecoverableDrafts();
      return "discarded";
    } catch {
      update({
        storageError: "The current draft could not be discarded from local storage.",
      });
      return "failed";
    }
  }

  function restoreDraft(draftId: string) {
    const saveResult = saveNow();
    if (
      saveResult === "failed" ||
      (saveResult === "skipped" && !runtime!.isEmpty(runtime!.form))
    ) {
      update({
        storageError: "The current draft could not be saved, so the selected draft was not restored. Copy this note before trying again.",
      });
      return;
    }
    try {
      const draft = readInteractiveDraft(
        window.localStorage,
        templateId,
        draftId,
        runtime!.isValidForm,
      );
      if (!draft) {
        refreshRecoverableDrafts();
        return;
      }
      update({ currentDraftId: draft.draftId });
      selectInteractiveDraftForCurrentTab(templateId, draft.draftId);
      applyRestoredDraft(draft);
      update({ lastSavedAt: new Date(draft.savedAt) });
      update({ restoredAt: new Date(draft.savedAt) });
      update({ storageError: "" });
      refreshRecoverableDrafts();
    } catch {
      update({ storageError: "The selected local draft could not be restored." });
    }
  }

  function initialize() {
    try {
      pruneInteractiveDrafts(window.localStorage);
      const tabKey = interactiveDraftTabStorageKey(templateId);
      const markerKey = tabMarkerStorageKey(templateId);
      const marker = currentTabMarker();
      const priorDraftId =
        window.sessionStorage.getItem(markerKey) === marker
          ? window.sessionStorage.getItem(tabKey)
          : null;
      const draftId = priorDraftId || createInteractiveDraftId();
      update({ currentDraftId: draftId });
      window.sessionStorage.setItem(tabKey, draftId);
      window.sessionStorage.setItem(markerKey, marker);
      if (priorDraftId) {
        const draft = readInteractiveDraft(
          window.localStorage,
          templateId,
          priorDraftId,
          runtime!.isValidForm,
        );
        if (draft) {
          applyRestoredDraft(draft);
          update({ lastSavedAt: new Date(draft.savedAt) });
          update({ restoredAt: new Date(draft.savedAt) });
        }
      }
      update({ hydrated: true });
      refreshRecoverableDrafts();
    } catch {
      update({ hydrated: true });
      update({
        storageError: "Local draft storage is unavailable in this browser. Copy the note before leaving this page.",
      });
    }
  }

  function handleStorage(event: StorageEvent) {
    if (!event.key || event.key.startsWith("hygienenote.interactive-draft.")) {
      refreshRecoverableDrafts();
      notify();
    }
  }

  let initialized = false;
  let interval: number | undefined;
  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
      if (!initialized) {
        initialize();
        initialized = true;
      }
      interval = window.setInterval(actions.saveNow, autosaveIntervalMs);
      window.addEventListener("pagehide", actions.saveNow);
      window.addEventListener("storage", handleStorage);
      notify();
    }
    return () => {
      listeners.delete(listener);
      if (!listeners.size) {
        actions.saveNow();
        window.clearInterval(interval);
        window.removeEventListener("pagehide", actions.saveNow);
        window.removeEventListener("storage", handleStorage);
      }
    };
  }

  function publishAction<A extends unknown[], R>(action: (...args: A) => R) {
    return (...args: A): R => {
      try {
        return action(...args);
      } finally {
        notify();
      }
    };
  }
  const actions = {
    saveNow: publishAction(saveNow),
    beginNewDraft: publishAction(beginNewDraft),
    discardAndBeginNewDraft: publishAction(discardAndBeginNewDraft),
    restoreDraft: publishAction(restoreDraft),
  };
  return {
    ...actions,
    subscribe,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    updateRuntime: (next: InteractiveDraftRuntime<T>) => {
      runtime = next;
    },
  };
}
