"use client";

import { useMemo, useState } from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { EditableCombobox } from "@/components/forms/EditableCombobox";
import {
  type CatalogueKey,
  normalizeCatalogueLabel,
  validateCatalogueLabel,
} from "@/lib/catalogues/catalogue";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";

export function CatalogueMultiCombobox({
  id,
  label,
  catalogueKey,
  values,
  onChange,
}: {
  id: string;
  label: string;
  catalogueKey: CatalogueKey;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const {
    storageStatus,
    getItems,
    findEquivalent,
    rememberValue,
  } = useCatalogues();
  const [draft, setDraft] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [closeSignal, setCloseSignal] = useState(0);

  const selectedLabels = useMemo(
    () => new Set(values.map(normalizeCatalogueLabel)),
    [values],
  );
  const suggestions = useMemo(() => {
    const query = normalizeCatalogueLabel(draft);
    return getItems(catalogueKey).filter(
      (item) =>
        !selectedLabels.has(normalizeCatalogueLabel(item.label)) &&
        (!query || normalizeCatalogueLabel(item.label).includes(query)),
    );
  }, [catalogueKey, draft, getItems, selectedLabels]);
  const equivalent = findEquivalent(catalogueKey, draft);
  const canRemember = Boolean(draft.trim()) && !equivalent;
  const canUnhide = Boolean(draft.trim()) && equivalent?.hidden;

  function closeSuggestions() {
    setCloseSignal((signal) => signal + 1);
  }

  function addValue(value: string) {
    try {
      const labelValue = validateCatalogueLabel(value);
      if (selectedLabels.has(normalizeCatalogueLabel(labelValue))) {
        setStatusMessage(`${labelValue} is already selected.`);
        return;
      }
      onChange([...values, labelValue]);
      setDraft("");
      closeSuggestions();
      setStatusMessage(`${labelValue} added to this note.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "The value could not be added.",
      );
    }
  }

  function rememberAndAdd() {
    try {
      const labelValue = validateCatalogueLabel(draft);
      const result = rememberValue(catalogueKey, labelValue);
      if (!selectedLabels.has(normalizeCatalogueLabel(labelValue))) {
        onChange([...values, labelValue]);
      }
      setDraft("");
      closeSuggestions();
      setStatusMessage(
        result === "reactivated"
          ? `${labelValue} unhidden in this browser and added to this note.`
          : result === "existing"
            ? `${labelValue} added to this note.`
            : `${labelValue} remembered in this browser and added to this note.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "The value could not be remembered.",
      );
    }
  }

  function removeValue(index: number) {
    const removed = values[index];
    onChange(values.filter((_, valueIndex) => valueIndex !== index));
    setStatusMessage(`${removed} removed from this note.`);
  }

  function moveValue(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= values.length) {
      return;
    }
    const reordered = [...values];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    onChange(reordered);
    setStatusMessage(`${values[index]} moved ${direction}.`);
  }

  const selectedContent = values.length ? (
    <ol className="mt-2 space-y-2" aria-label={`${label} selected values`}>
      {values.map((value, index) => (
        <li
          key={`${normalizeCatalogueLabel(value)}-${index}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <span>{value}</span>
          <span className="flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={index === 0}
              aria-label={`Move ${value} earlier`}
              onClick={() => moveValue(index, "up")}
            >
              Earlier
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={index === values.length - 1}
              aria-label={`Move ${value} later`}
              onClick={() => moveValue(index, "down")}
            >
              Later
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              aria-label={`Remove ${value}`}
              onClick={() => removeValue(index)}
            >
              Remove
            </button>
          </span>
        </li>
      ))}
    </ol>
  ) : null;

  return (
    <EditableCombobox
      id={id}
      label={label}
      value={draft}
      suggestions={suggestions}
      onValueChange={(nextValue) => {
        setDraft(nextValue);
        setStatusMessage("");
      }}
      onSelectSuggestion={(suggestion) => addValue(suggestion.label)}
      renderSuggestion={(suggestion) => (
        <>
          <span>{suggestion.label}</span>{" "}
          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
            {suggestion.owner === "seed" ? "Starter" : "Local"}
          </span>
        </>
      )}
      selectedContent={selectedContent}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={!draft.trim()}
            onClick={() => addValue(draft)}
          >
            Add to note
          </button>
          {canRemember || canUnhide ? (
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={storageStatus !== "ready"}
              onClick={rememberAndAdd}
            >
              {canUnhide ? "Unhide and add" : "Remember and add"}
            </button>
          ) : null}
        </>
      }
      helpText="Typing or adding to this note does not save a reusable value."
      statusMessage={statusMessage}
      emptyMessage={
        draft.trim()
          ? "No matching catalogue suggestions."
          : "No additional catalogue suggestions."
      }
      placeholder="Select or enter a value"
      onEnterWithoutSuggestion={() => {
        if (draft.trim()) {
          addValue(draft);
        }
      }}
      closeSignal={closeSignal}
    />
  );
}
