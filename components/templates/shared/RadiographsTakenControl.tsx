"use client";

import { useMemo, useState } from "react";
import { RapidDisclosure } from "@/components/forms/RapidChoiceControls";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { formControlClass } from "@/components/forms/controlStyles";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import {
  isRadiographCatalogueMetadata,
  type RadiographCatalogueMetadata,
} from "@/lib/catalogues/catalogue";

type RadiographDefinition = RadiographCatalogueMetadata & {
  id: string;
  label: string;
  hidden: boolean;
};

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass = `${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`;

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseQuantityForType(
  value: string,
  definition: RadiographDefinition,
): string | null {
  const clean = value.trim();
  if (definition.code === "PAN" && /^PAN$/i.test(clean)) return "1";
  const match = clean.match(
    new RegExp(
      `^(\\d+(?:\\.\\d+)?)\\s+${escapeRegularExpression(definition.code)}$`,
      "i",
    ),
  );
  if (!match) return null;
  const quantity = Number(match[1]);
  return Number.isFinite(quantity) && quantity > 0 ? String(quantity) : null;
}

function formatSelection(code: string, quantity: string): string {
  const numeric = Number(quantity);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";
  const clean = String(Math.round(numeric));
  return code === "PAN" && clean === "1" ? "PAN" : `${clean} ${code}`;
}

function controlId(prefix: string, code: string): string {
  return `${prefix}-radiographs-${code
    .toLocaleLowerCase("en-CA")
    .replace(/[^a-z0-9]+/g, "-")}`;
}

export function RadiographsTakenControl({
  values,
  onChange,
  idPrefix = "adult-hygiene",
  linkToTreatment = true,
  rapid = false,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  idPrefix?: string;
  linkToTreatment?: boolean;
  rapid?: boolean;
}) {
  const { findEquivalent, getItems, rememberValue, storageStatus } =
    useCatalogues();
  const [encounterTypes, setEncounterTypes] = useState<RadiographDefinition[]>(
    [],
  );
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const [newTypeCode, setNewTypeCode] = useState("");
  const [newTypeQuantity, setNewTypeQuantity] = useState("1");
  const [message, setMessage] = useState("");

  const definitions = useMemo(() => {
    const byCode = new Map<string, RadiographDefinition>();
    for (const item of getItems("imaging.radiographs", {
      includeHidden: true,
    })) {
      if (!isRadiographCatalogueMetadata(item.metadata)) continue;
      const definition = {
        ...item.metadata,
        id: item.id,
        label: item.label,
        hidden: item.hidden,
      };
      if (!byCode.has(definition.code)) byCode.set(definition.code, definition);
    }
    for (const definition of encounterTypes) {
      if (!byCode.has(definition.code)) byCode.set(definition.code, definition);
    }
    return [...byCode.values()];
  }, [encounterTypes, getItems]);

  const parsedValues = values.map((value, index) => {
    const definition = definitions.find(
      (candidate) => parseQuantityForType(value, candidate) !== null,
    );
    return {
      index,
      value,
      definition,
      quantity: definition
        ? parseQuantityForType(value, definition)
        : null,
    };
  });
  const otherValues = parsedValues.filter((entry) => !entry.definition);

  function typeEntries(definition: RadiographDefinition) {
    return parsedValues.filter(
      (entry) => entry.definition?.code === definition.code,
    );
  }

  function displayedQuantity(definition: RadiographDefinition): string {
    const quantities = typeEntries(definition).map((entry) =>
      Number(entry.quantity ?? 0),
    );
    return quantities.length
      ? String(quantities.reduce((total, quantity) => total + quantity, 0))
      : "";
  }

  function replaceType(definition: RadiographDefinition, quantity: string) {
    const formatted = formatSelection(definition.code, quantity);
    const remaining = values.filter(
      (value) => parseQuantityForType(value, definition) === null,
    );
    if (!formatted) {
      onChange(remaining);
      return;
    }
    const desiredRank = definitions.findIndex(
      (candidate) => candidate.code === definition.code,
    );
    const orderedInsertAt = remaining.findIndex((value) => {
      const candidateRank = definitions.findIndex(
        (candidate) => parseQuantityForType(value, candidate) !== null,
      );
      return candidateRank < 0 || candidateRank > desiredRank;
    });
    const insertAt = orderedInsertAt >= 0 ? orderedInsertAt : remaining.length;
    onChange([
      ...remaining.slice(0, insertAt),
      formatted,
      ...remaining.slice(insertAt),
    ]);
  }

  function adjust(definition: RadiographDefinition, direction: -1 | 1) {
    const current = Number(displayedQuantity(definition));
    replaceType(definition, String(Math.max(1, current + direction)));
  }

  function addRadiographType(remember: boolean) {
    const label = newTypeLabel.trim();
    const code = newTypeCode.trim().toUpperCase();
    const defaultQuantity = Number(newTypeQuantity);
    if (!label || !code) {
      setMessage("Enter both a radiograph type and a short code.");
      return;
    }
    if (!/^[A-Z0-9][A-Z0-9+./-]*$/.test(code)) {
      setMessage("Use letters, numbers, +, period, slash, or hyphen in the code.");
      return;
    }
    if (!Number.isSafeInteger(defaultQuantity) || defaultQuantity <= 0) {
      setMessage("The default image count must be a positive whole number.");
      return;
    }
    const duplicateCode = definitions.find(
      (definition) => definition.code === code,
    );
    if (duplicateCode) {
      setMessage(
        `${code} is already used by ${duplicateCode.label}. Adjust its count above.`,
      );
      return;
    }
    const duplicateLabel = findEquivalent("imaging.radiographs", label);
    if (duplicateLabel) {
      setMessage(
        `${label} already exists in the radiograph catalogue. Use its existing code or edit it on Manage catalogues.`,
      );
      return;
    }
    const metadata: RadiographCatalogueMetadata = {
      kind: "radiograph",
      code,
      defaultQuantity,
    };
    try {
      if (remember) {
        rememberValue("imaging.radiographs", label, metadata);
      } else {
        setEncounterTypes((current) => [
          ...current,
          {
            ...metadata,
            id: `encounter-radiograph-${code}`,
            label,
            hidden: false,
          },
        ]);
      }
      onChange([...values, formatSelection(code, String(defaultQuantity))]);
      setNewTypeLabel("");
      setNewTypeCode("");
      setNewTypeQuantity("1");
      setMessage(`${label} added${remember ? " and remembered" : ""}.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The radiograph type could not be added.",
      );
    }
  }

  const displayedDefinitions = definitions.filter(
    (definition) => !definition.hidden || Boolean(displayedQuantity(definition)),
  );
  const fieldsetId = `${idPrefix}-radiographs`;

  const customTypeControls = (
      <fieldset className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
        <legend className="px-1 text-sm font-semibold">
          Add a radiograph type
        </legend>
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(7rem,1fr)_minmax(8rem,1fr)]">
          <div>
            <label className="text-sm font-medium" htmlFor={`${fieldsetId}-new-label`}>
              Type name
            </label>
            <input
              id={`${fieldsetId}-new-label`}
              className={`mt-1 ${formControlClass()}`}
              value={newTypeLabel}
              placeholder="e.g. Occlusal view"
              onChange={(event) => setNewTypeLabel(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor={`${fieldsetId}-new-code`}>
              Short code
            </label>
            <input
              id={`${fieldsetId}-new-code`}
              className={`mt-1 ${formControlClass()}`}
              value={newTypeCode}
              placeholder="e.g. OCC"
              onChange={(event) => setNewTypeCode(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor={`${fieldsetId}-new-quantity`}>
              Default images
            </label>
            <input
              id={`${fieldsetId}-new-quantity`}
              type="number"
              min={1}
              step={1}
              className={`mt-1 ${formControlClass()}`}
              value={newTypeQuantity}
              onChange={(event) => setNewTypeQuantity(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={!newTypeLabel.trim() || !newTypeCode.trim()}
            onClick={() => addRadiographType(false)}
          >
            Add for this encounter
          </button>
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={
              !newTypeLabel.trim() ||
              !newTypeCode.trim() ||
              storageStatus !== "ready"
            }
            onClick={() => addRadiographType(true)}
          >
            Remember and add
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          {message ||
            "Remembered types become reusable catalogue entries; the image count remains encounter-specific."}
        </p>
      </fieldset>
  );

  return (
    <fieldset
      id={fieldsetId}
      className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-label="Radiographs taken today"
    >
      <legend className="px-1 font-semibold">Radiographs taken today</legend>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {linkToTreatment
          ? "Selected radiographs are linked automatically to Treatment completed today. Counts remain editable here."
          : "Select each radiograph type taken today and adjust the actual image count for this encounter."}
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {displayedDefinitions.map((definition) => {
          const quantity = displayedQuantity(definition);
          const active = Boolean(quantity);
          const multipleLegacyValues = typeEntries(definition).length > 1;
          const id = controlId(idPrefix, definition.code);
          return (
            <div
              key={definition.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <NativeChoiceControl
                type="checkbox"
                checked={active}
                className="w-full"
                onChange={(checked) =>
                  replaceType(
                    definition,
                    checked ? String(definition.defaultQuantity) : "",
                  )
                }
              >
                {definition.label} ({definition.code})
              </NativeChoiceControl>
              {active ? (
                <div>
                  <label className="text-sm font-medium" htmlFor={`${id}-quantity`}>
                    Number of images
                  </label>
                  <div className="mt-1 grid grid-cols-[auto_minmax(4rem,1fr)_auto] gap-2">
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      aria-label={`Decrease ${definition.code} images`}
                      onClick={() => adjust(definition, -1)}
                    >
                      −
                    </button>
                    <input
                      id={`${id}-quantity`}
                      type="number"
                      min={1}
                      step={1}
                      className={formControlClass()}
                      value={quantity}
                      onChange={(event) => {
                        if (event.target.value) {
                          replaceType(definition, event.target.value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      aria-label={`Increase ${definition.code} images`}
                      onClick={() => adjust(definition, 1)}
                    >
                      +
                    </button>
                  </div>
                  {multipleLegacyValues ? (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                      Multiple legacy {definition.code} entries are shown as
                      their combined count. Editing replaces them with one value.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {rapid ? <RapidDisclosure label="Other radiograph types">{customTypeControls}</RapidDisclosure> : customTypeControls}

      {otherValues.length ? (
        <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-sm font-medium">Legacy or unrecognized entries</p>
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
        </div>
      ) : null}
    </fieldset>
  );
}
