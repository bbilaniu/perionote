"use client";

import { useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useNoteStartedAt() {
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [startedAt, setStartedAt] = useState(() => new Date());
  // Keep static HTML and hydration identical; resets and restored drafts can
  // replace the initial browser timestamp through the same setter.
  return [hydrated ? startedAt : null, setStartedAt] as const;
}
