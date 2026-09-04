"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function useLocalInteractiveDraft<T>({
  templateId,
  form,
  startedAt,
  isEmpty,
  isValidForm,
  onRestore,
}: {
  templateId: string;
  form: T;
  startedAt: Date | null;
  isEmpty: (form: T) => boolean;
  isValidForm: (value: unknown) => value is T;
  onRestore: (draft: InteractiveDraft<T>) => void;
}) {
  const draftIdRef = useRef("");
  const hydratedRef = useRef(false);
  const formRef = useRef(form);
  const startedAtRef = useRef(startedAt);
  const isEmptyRef = useRef(isEmpty);
  const isValidFormRef = useRef(isValidForm);
  const onRestoreRef = useRef(onRestore);
  const [recoverableDrafts, setRecoverableDrafts] = useState<
    InteractiveDraft<T>[]
  >([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [restoredAt, setRestoredAt] = useState<Date | null>(null);
  const [storageError, setStorageError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState("");

  formRef.current = form;
  startedAtRef.current = startedAt;
  isEmptyRef.current = isEmpty;
  isValidFormRef.current = isValidForm;
  onRestoreRef.current = onRestore;

  const refreshRecoverableDrafts = useCallback(() => {
    try {
      const drafts = listInteractiveDrafts(
        window.localStorage,
        templateId,
        isValidFormRef.current,
      ).filter((draft) => draft.draftId !== draftIdRef.current);
      setRecoverableDrafts(drafts);
    } catch {
      setStorageError(
        "Local draft storage is unavailable in this browser. Copy the note before leaving this page.",
      );
    }
  }, [templateId]);

  const saveNow = useCallback((): LocalDraftSaveResult => {
    if (!hydratedRef.current || !draftIdRef.current || !startedAtRef.current) {
      return "skipped";
    }
    try {
      pruneInteractiveDrafts(window.localStorage);
      if (isEmptyRef.current(formRef.current)) {
        deleteInteractiveDraft(
          window.localStorage,
          templateId,
          draftIdRef.current,
        );
        setLastSavedAt(null);
        return "removed";
      }
      const draft = writeInteractiveDraft(window.localStorage, {
        templateId,
        draftId: draftIdRef.current,
        form: formRef.current,
        startedAt: startedAtRef.current,
      });
      setLastSavedAt(new Date(draft.savedAt));
      setStorageError("");
      return "saved";
    } catch {
      setStorageError(
        "This draft could not be saved locally. Copy the note before leaving this page.",
      );
      return "failed";
    }
  }, [templateId]);

  const beginNewDraft = useCallback(() => {
    saveNow();
    const draftId = createInteractiveDraftId();
    draftIdRef.current = draftId;
    setCurrentDraftId(draftId);
    try {
      selectInteractiveDraftForCurrentTab(templateId, draftId);
    } catch {
      setStorageError(
        "The new form is ready, but its local draft could not be initialized.",
      );
    }
    setLastSavedAt(null);
    setRestoredAt(null);
    refreshRecoverableDrafts();
  }, [refreshRecoverableDrafts, saveNow, templateId]);

  const discardAndBeginNewDraft = useCallback(() => {
    try {
      if (draftIdRef.current) {
        deleteInteractiveDraft(
          window.localStorage,
          templateId,
          draftIdRef.current,
        );
      }
      const draftId = createInteractiveDraftId();
      draftIdRef.current = draftId;
      setCurrentDraftId(draftId);
      selectInteractiveDraftForCurrentTab(templateId, draftId);
      setLastSavedAt(null);
      setRestoredAt(null);
      setStorageError("");
      refreshRecoverableDrafts();
    } catch {
      setStorageError(
        "The current draft could not be discarded from local storage.",
      );
    }
  }, [refreshRecoverableDrafts, templateId]);

  const restoreDraft = useCallback(
    (draftId: string) => {
      const saveResult = saveNow();
      if (
        saveResult === "failed" ||
        (saveResult === "skipped" && !isEmptyRef.current(formRef.current))
      ) {
        setStorageError(
          "The current draft could not be saved, so the selected draft was not restored. Copy this note before trying again.",
        );
        return;
      }
      try {
        const draft = readInteractiveDraft(
          window.localStorage,
          templateId,
          draftId,
          isValidFormRef.current,
        );
        if (!draft) {
          refreshRecoverableDrafts();
          return;
        }
        draftIdRef.current = draft.draftId;
        setCurrentDraftId(draft.draftId);
        selectInteractiveDraftForCurrentTab(templateId, draft.draftId);
        onRestoreRef.current(draft);
        setLastSavedAt(new Date(draft.savedAt));
        setRestoredAt(new Date(draft.savedAt));
        setStorageError("");
        refreshRecoverableDrafts();
      } catch {
        setStorageError("The selected local draft could not be restored.");
      }
    },
    [refreshRecoverableDrafts, saveNow, templateId],
  );

  useEffect(() => {
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
      draftIdRef.current = draftId;
      setCurrentDraftId(draftId);
      window.sessionStorage.setItem(tabKey, draftId);
      window.sessionStorage.setItem(markerKey, marker);
      if (priorDraftId) {
        const draft = readInteractiveDraft(
          window.localStorage,
          templateId,
          priorDraftId,
          isValidFormRef.current,
        );
        if (draft) {
          onRestoreRef.current(draft);
          setLastSavedAt(new Date(draft.savedAt));
          setRestoredAt(new Date(draft.savedAt));
        }
      }
      hydratedRef.current = true;
      setHydrated(true);
      refreshRecoverableDrafts();
    } catch {
      hydratedRef.current = true;
      setHydrated(true);
      setStorageError(
        "Local draft storage is unavailable in this browser. Copy the note before leaving this page.",
      );
    }

    const interval = window.setInterval(saveNow, autosaveIntervalMs);
    const handlePageHide = () => saveNow();
    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key.startsWith("hygienenote.interactive-draft.")
      ) {
        refreshRecoverableDrafts();
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("storage", handleStorage);
    return () => {
      saveNow();
      window.clearInterval(interval);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshRecoverableDrafts, saveNow, templateId]);

  return {
    recoverableDrafts,
    currentDraftId,
    lastSavedAt,
    restoredAt,
    hydrated,
    storageError,
    saveNow,
    beginNewDraft,
    discardAndBeginNewDraft,
    restoreDraft,
  };
}
