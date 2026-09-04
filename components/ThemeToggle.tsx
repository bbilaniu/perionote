"use client";

import { useEffect, useState } from "react";
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
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const initialTheme = readStoredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      if (readStoredTheme() === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", onMediaChange);
    return () => media.removeEventListener("change", onMediaChange);
  }, []);

  const handleChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
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
