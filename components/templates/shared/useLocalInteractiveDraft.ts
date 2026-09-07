"use client";

import { useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import {
  createInteractiveDraftSession,
  type InteractiveDraftRuntime,
} from "@/lib/templates/interactiveDraftSession";

export {
  selectInteractiveDraftForCurrentTab,
  type LocalDraftSaveResult,
  type LocalDraftDiscardResult,
} from "@/lib/templates/interactiveDraftSession";

export function useLocalInteractiveDraft<T>({
  templateId,
  form,
  startedAt,
  isEmpty,
  isValidForm,
  onRestore,
}: InteractiveDraftRuntime<T> & { templateId: string }) {
  const session = useMemo(
    () => createInteractiveDraftSession<T>(templateId),
    [templateId],
  );
  // Autosave and navigation cleanup see only the latest committed form.
  useLayoutEffect(() => {
    session.updateRuntime({ form, startedAt, isEmpty, isValidForm, onRestore });
  }, [session, form, startedAt, isEmpty, isValidForm, onRestore]);
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getServerSnapshot,
  );
  return {
    ...snapshot,
    saveNow: session.saveNow,
    beginNewDraft: session.beginNewDraft,
    discardAndBeginNewDraft: session.discardAndBeginNewDraft,
    restoreDraft: session.restoreDraft,
  };
}
