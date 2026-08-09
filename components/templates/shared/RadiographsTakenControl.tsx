"use client";

import { useState } from "react";
import { formControlClass } from "@/components/forms/controlStyles";
import {
  formatRadiographSelection,
  parseRadiographSelection,
  type RadiographType,
} from "@/lib/templates/adultHygieneTreatment";

const radiographTypes = [
  { type: "BW", label: "Bitewings", defaultQuantity: "4" },
  { type: "PA", label: "Periapicals", defaultQuantity: "3" },
  { type: "PAN", label: "Panoramic", defaultQuantity: "1" },
] as const;
const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass = `${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`;

export function RadiographsTakenControl({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [otherDraft, setOtherDraft] = useState("");
  const parsedValues = values.map((value, index) => ({
    index,
    value,
    parsed: parseRadiographSelection(value),
  }));
  const otherValues = parsedValues.filter((entry) => !entry.parsed);

  function typeEntries(type: RadiographType) {
    return parsedValues.filter((entry) => entry.parsed?.type === type);
  }

  function displayedQuantity(type: RadiographType): string {
    const quantities = typeEntries(type).map((entry) =>
      Number(entry.parsed?.quantity ?? 0),
    );
    return quantities.length
      ? String(quantities.reduce((total, quantity) => total + quantity, 0))
      : "";
  }

  function replaceType(type: RadiographType, quantity: string) {
    const cleanQuantity = Number(quantity);
    const formatted =
      Number.isFinite(cleanQuantity) && cleanQuantity > 0
        ? formatRadiographSelection(type, String(Math.round(cleanQuantity)))
        : "";
    const remaining = values.filter(
      (value) => parseRadiographSelection(value)?.type !== type,
    );
    if (!formatted) {
      onChange(remaining);
      return;
    }
    const typeOrder: RadiographType[] = ["BW", "PA", "PAN"];
    const desiredRank = typeOrder.indexOf(type);
    const orderedInsertAt = remaining.findIndex((value) => {
      const parsed = parseRadiographSelection(value);
      return !parsed || typeOrder.indexOf(parsed.type) > desiredRank;
    });
    const adjustedIndex =
      orderedInsertAt >= 0 ? orderedInsertAt : remaining.length;
    onChange([
      ...remaining.slice(0, adjustedIndex),
      formatted,
      ...remaining.slice(adjustedIndex),
    ]);
  }

  function adjust(type: RadiographType, direction: -1 | 1) {
    const current = Number(displayedQuantity(type));
    replaceType(type, String(Math.max(1, current + direction)));
  }

  function addOther() {
    const clean = otherDraft.trim();
    if (!clean) return;
    const parsed = parseRadiographSelection(clean);
    if (parsed) {
      replaceType(parsed.type, parsed.quantity);
    } else {
      onChange([...values, clean]);
    }
    setOtherDraft("");
  }

  return (
    <fieldset
      id="adult-hygiene-radiographs"
      className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-label="Radiographs taken today"
    >
      <legend className="px-1 font-semibold">Radiographs taken today</legend>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Selected radiographs are linked automatically to Treatment completed
        today. Counts remain editable here.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {radiographTypes.map(({ type, label, defaultQuantity }) => {
          const quantity = displayedQuantity(type);
          const active = Boolean(quantity);
          const multipleLegacyValues = typeEntries(type).length > 1;
          return (
            <div
              key={type}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <button
                type="button"
                aria-pressed={active}
                className={`${buttonClass} w-full ${
                  active
                    ? "bg-sky-700 text-white hover:bg-sky-800"
                    : "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
                onClick={() =>
                  replaceType(type, active ? "" : defaultQuantity)
                }
              >
                {active ? <span aria-hidden="true">✓ </span> : null}
                {label} ({type})
              </button>
              {active ? (
                <div>
                  <label
                    className="text-sm font-medium"
                    htmlFor={`adult-hygiene-radiographs-${type.toLowerCase()}-quantity`}
                  >
                    Number of images
                  </label>
                  <div className="mt-1 grid grid-cols-[auto_minmax(4rem,1fr)_auto] gap-2">
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      aria-label={`Decrease ${type} images`}
                      onClick={() => adjust(type, -1)}
                    >
                      −
                    </button>
                    <input
                      id={`adult-hygiene-radiographs-${type.toLowerCase()}-quantity`}
                      type="number"
                      min={1}
                      step={1}
                      className={formControlClass()}
                      value={quantity}
                      onChange={(event) => {
                        if (event.target.value) {
                          replaceType(type, event.target.value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      aria-label={`Increase ${type} images`}
                      onClick={() => adjust(type, 1)}
                    >
                      +
                    </button>
                  </div>
                  {multipleLegacyValues ? (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                      Multiple legacy {type} entries are shown as their combined
                      count. Editing the count replaces them with one value.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <label className="text-sm font-medium" htmlFor="adult-hygiene-radiographs-other">
          Other radiographs
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="adult-hygiene-radiographs-other"
            className={formControlClass()}
            value={otherDraft}
            placeholder="Enter another radiograph type"
            onChange={(event) => setOtherDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addOther();
              }
            }}
          />
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={!otherDraft.trim()}
            onClick={addOther}
          >
            Add other radiograph
          </button>
        </div>
        {otherValues.length ? (
          <ul className="space-y-2" aria-label="Other radiographs taken">
            {otherValues.map((entry) => (
              <li
                key={`${entry.value}-${entry.index}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
              >
                <span>{entry.value}</span>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  aria-label={`Remove ${entry.value}`}
                  onClick={() =>
                    onChange(values.filter((_, index) => index !== entry.index))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </fieldset>
  );
}
