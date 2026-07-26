"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const storageKey = "hygienenote-theme";

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
    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
      Theme
      <select
        aria-label="Theme"
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        onChange={(event) => handleChange(event.target.value as Theme)}
        value={theme}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
