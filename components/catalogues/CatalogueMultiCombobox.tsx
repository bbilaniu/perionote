"use client";

import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import {
  type CatalogueKey,
  normalizeCatalogueLabel,
  validateCatalogueLabel,
} from "@/lib/catalogues/catalogue";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900 dark:disabled:bg-slate-900";
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
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-suggestions`;
  const helpId = `${id}-${generatedId}-help`;
  const statusId = `${id}-${generatedId}-status`;
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState("");

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
  const listboxOpen = open && suggestions.length > 0;

  function addValue(value: string) {
    try {
      const labelValue = validateCatalogueLabel(value);
      if (selectedLabels.has(normalizeCatalogueLabel(labelValue))) {
        setStatusMessage(`${labelValue} is already selected.`);
        return;
      }
      onChange([...values, labelValue]);
      setDraft("");
      setOpen(false);
      setActiveIndex(-1);
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
      setOpen(false);
      setActiveIndex(-1);
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

  function selectSuggestion(index: number) {
    const suggestion = suggestions[index];
    if (suggestion) {
      addValue(suggestion.label);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        suggestions.length ? Math.min(index + 1, suggestions.length - 1) : -1,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        suggestions.length
          ? index <= 0
            ? suggestions.length - 1
            : index - 1
          : -1,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (listboxOpen && activeIndex >= 0) {
        selectSuggestion(activeIndex);
      } else if (draft.trim()) {
        addValue(draft);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
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

  return (
    <div
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>

      {values.length ? (
        <ol
          className="mt-2 space-y-2"
          aria-label={`${label} selected values`}
        >
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
      ) : null}

      <div className="relative mt-2">
        <input
          id={id}
          className={inputClass}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={listboxOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            listboxOpen && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-describedby={`${helpId} ${statusId}`}
          autoComplete="off"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
            setStatusMessage("");
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Select or enter a value"
        />

        {listboxOpen ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={`${label} suggestions`}
            className="mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-300 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-950"
          >
            {suggestions.map((suggestion, index) => (
              <li
                id={`${listboxId}-option-${index}`}
                key={suggestion.id}
                role="option"
                aria-selected={activeIndex === index}
                className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${
                  activeIndex === index
                    ? "bg-sky-100 text-sky-950 dark:bg-sky-900 dark:text-sky-50"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(index)}
              >
                <span>{suggestion.label}</span>{" "}
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {suggestion.owner === "seed" ? "Starter" : "Local"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
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
        <span
          id={helpId}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          Typing or adding to this note does not save a reusable value.
        </span>
      </div>

      <p id={statusId} className="sr-only" aria-live="polite">
        {listboxOpen
          ? `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"} available. `
          : ""}
        {statusMessage}
      </p>
    </div>
  );
}
