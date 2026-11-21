"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { rapidEntryPreferenceKey, type EntryMode } from "@/lib/templates/rapidEntry";

function readMode(preferenceKey: string): EntryMode {
  try {
    return window.localStorage.getItem(preferenceKey) === "rapid"
      ? "rapid"
      : "detailed";
  } catch {
    return "detailed";
  }
}

const getServerMode = (): EntryMode => "detailed";
export function useRapidEntryMode(preferenceKey = rapidEntryPreferenceKey) {
  const subscribe = useCallback((onChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === preferenceKey) onChange();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [preferenceKey]);
  const getSnapshot = useCallback(() => readMode(preferenceKey), [preferenceKey]);
  const storedMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerMode,
  );
  const [selection, setSelection] = useState<{
    key: string;
    mode: EntryMode;
  } | null>(null);
  function changeEntryMode(mode: EntryMode) {
    setSelection({ key: preferenceKey, mode });
    try {
      window.localStorage.setItem(preferenceKey, mode);
    } catch {
      // The selection remains usable for this page when storage is blocked.
    }
  }
  return [selection?.key === preferenceKey ? selection.mode : storedMode, changeEntryMode] as const;
}
