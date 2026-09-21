"use client";

import { useId, useState } from "react";
import type { VitalsReading } from "@/lib/templates/vitalsReadings";

function LocationChoice({
  label,
  checked,
  onSelect,
  describedBy,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-describedby={describedBy}
      onClick={onSelect}
      className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-sky-500 ${checked
        ? "border-sky-700 bg-sky-50 text-sky-950 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-100"
        : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"}`}
    >
      {label}
    </button>
  );
}

function SiteChoice({
  label,
  artery,
  checked,
  onSelect,
}: {
  label: string;
  artery: string;
  checked: boolean;
  onSelect: () => void;
}) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch" &&
          !event.currentTarget.contains(document.activeElement)) setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <LocationChoice
        label={label}
        checked={checked}
        onSelect={onSelect}
        describedBy={tooltipId}
      />
      <button
        type="button"
        aria-label={`${label} artery information`}
        aria-describedby={tooltipId}
        className="inline-flex min-h-10 min-w-8 items-center justify-center rounded-xl text-slate-600 focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-300"
        onClick={(event) => {
          event.currentTarget.focus();
          setOpen(true);
        }}
      >
        <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold">i</span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        hidden={!open}
        className="pointer-events-none absolute bottom-full left-0 z-30 w-max max-w-48 rounded-lg bg-slate-950 px-3 py-2 text-xs text-white shadow-lg dark:bg-slate-100 dark:text-slate-950"
      >
        {artery}
      </span>
    </span>
  );
}

export function BloodPressureLocationControl({
  reading,
  onChange,
}: {
  reading: VitalsReading;
  onChange: (patch: Partial<VitalsReading>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <div role="group" aria-label="Arm" className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Arm</span>
        <LocationChoice
          label="Right (R)"
          checked={reading.arm === "right"}
          onSelect={() => onChange({ arm: reading.arm === "right" ? "" : "right" })}
        />
        <LocationChoice
          label="Left (L)"
          checked={reading.arm === "left"}
          onSelect={() => onChange({ arm: reading.arm === "left" ? "" : "left" })}
        />
      </div>
      <div role="group" aria-label="BP site" className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">BP site</span>
        <SiteChoice
          label="Upper arm"
          artery="Brachial artery"
          checked={reading.site === "upper-arm"}
          onSelect={() => onChange({ site: reading.site === "upper-arm" ? "" : "upper-arm" })}
        />
        <SiteChoice
          label="Wrist"
          artery="Radial artery"
          checked={reading.site === "wrist"}
          onSelect={() => onChange({ site: reading.site === "wrist" ? "" : "wrist" })}
        />
      </div>
    </div>
  );
}
