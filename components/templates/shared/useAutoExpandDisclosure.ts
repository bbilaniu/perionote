"use client";

import { useState } from "react";

/** Open on a new truthy trigger, while allowing the user to close the section. */
export function useAutoExpandDisclosure(trigger: boolean | number) {
  const [previousTrigger, setPreviousTrigger] = useState(trigger);
  const [open, setOpen] = useState(Boolean(trigger));

  // Adjust this component's state before its children commit. A stable trigger
  // preserves manual toggles; a false trigger does not automatically close it.
  if (trigger !== previousTrigger) {
    setPreviousTrigger(trigger);
    if (trigger) setOpen(true);
  }

  return [open, setOpen] as const;
}
