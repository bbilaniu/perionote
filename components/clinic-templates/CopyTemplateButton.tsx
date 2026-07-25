"use client";

import { useState } from "react";

export default function CopyTemplateButton({
  content,
}: {
  content: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "copied"
      ? "Copied"
      : status === "error"
        ? "Copy failed"
        : "Copy template";

  return (
    <button
      type="button"
      onClick={copyTemplate}
      className="inline-flex min-w-32 items-center justify-center rounded-md bg-chart-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:hover:bg-sky-700 dark:focus:ring-offset-slate-950"
    >
      {label}
    </button>
  );
}
