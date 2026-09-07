"use client";

import { useState, useSyncExternalStore } from "react";
import { rapidEntryPreferenceKey, type EntryMode } from "@/lib/templates/rapidEntry";

function readMode(): EntryMode {
  try {
    return window.localStorage.getItem(rapidEntryPreferenceKey) === "rapid"
      ? "rapid"
      : "detailed";
  } catch {
    return "detailed";
  }
}

const getServerMode = (): EntryMode => "detailed";
const subscribeDisabled = () => () => {};

function subscribe(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === rapidEntryPreferenceKey) onChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function useRapidEntryMode(enabled: boolean) {
  const storedMode = useSyncExternalStore(
    enabled ? subscribe : subscribeDisabled,
    enabled ? readMode : getServerMode,
    getServerMode,
  );
  const [selection, setSelection] = useState<EntryMode | null>(null);
  function changeEntryMode(mode: EntryMode) {
    setSelection(mode);
    try {
      window.localStorage.setItem(rapidEntryPreferenceKey, mode);
    } catch {
      // The selection remains usable for this page when storage is blocked.
    }
  }
  return [selection ?? storedMode, changeEntryMode] as const;
}
