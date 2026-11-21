"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";

type Theme = "light" | "dark" | "system";

const storageKey = "hygienenote-theme";
const themeOptions: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Theme selection still applies for the current page when storage is blocked.
  }
}

function subscribeToStoredTheme(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === storageKey) onChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

function getServerTheme(): Theme {
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
    return;
  }

  root.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const storedTheme = useSyncExternalStore(
    subscribeToStoredTheme,
    readStoredTheme,
    getServerTheme,
  );
  // Keep a selection usable for this page even when localStorage is blocked.
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const theme = selectedTheme ?? storedTheme;

  useEffect(() => {
    applyTheme(theme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", onMediaChange);
    return () => media.removeEventListener("change", onMediaChange);
  }, [theme]);

  const handleChange = (nextTheme: Theme) => {
    setSelectedTheme(nextTheme);
    writeStoredTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <FixedChoiceListbox
      id="theme-selector"
      label="Theme"
      value={theme}
      options={themeOptions}
      onChange={handleChange}
      compact
      labelInTrigger
    />
  );
}
