"use client";

import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import {
  CatalogueKey,
  normalizeCatalogueLabel,
} from "@/lib/catalogues/catalogue";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900 dark:disabled:bg-slate-900";

export function CatalogueCombobox({
  id,
  label,
  catalogueKey,
  value,
  onChange,
  error,
  inputRef,
  disabled,
}: {
  id: string;
  label: string;
  catalogueKey: CatalogueKey;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}) {
  const {
    storageStatus,
    getItems,
    findEquivalent,
    rememberValue,
  } = useCatalogues();
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-suggestions`;
  const helpId = `${id}-${generatedId}-catalogue-help`;
  const errorId = `${id}-error`;
  const statusId = `${id}-${generatedId}-status`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState("");

  const suggestions = useMemo(() => {
    const query = normalizeCatalogueLabel(value);
    const allItems = getItems(catalogueKey);
    return query
      ? allItems.filter((item) =>
          normalizeCatalogueLabel(item.label).includes(query),
        )
      : allItems;
  }, [catalogueKey, getItems, value]);

  const equivalent = findEquivalent(catalogueKey, value);
  const canRemember = Boolean(value.trim()) && !equivalent;
  const canUnhide = Boolean(value.trim()) && equivalent?.hidden;
  const listboxOpen = open && suggestions.length > 0;
  const describedBy = [helpId, error ? errorId : null, statusId]
    .filter(Boolean)
    .join(" ");

  function selectSuggestion(index: number) {
    const suggestion = suggestions[index];
    if (!suggestion) {
      return;
    }
    onChange(suggestion.label);
    setStatusMessage(`${suggestion.label} selected.`);
    setOpen(false);
    setActiveIndex(-1);
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
    } else if (event.key === "Enter" && listboxOpen && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(activeIndex);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleRemember() {
    try {
      const result = rememberValue(catalogueKey, value);
      setStatusMessage(
        result === "reactivated"
          ? `${value.trim()} unhidden in this browser's catalogue.`
          : result === "existing"
            ? `${value.trim()} is already in this browser's catalogue.`
            : `${value.trim()} remembered in this browser's catalogue.`,
      );
    } catch (rememberError) {
      setStatusMessage(
        rememberError instanceof Error
          ? rememberError.message
          : "This value could not be remembered.",
      );
    }
  }

  return (
    <div
      className="relative"
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
      <input
        ref={inputRef}
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
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        autoComplete="off"
        disabled={disabled}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
          setStatusMessage("");
        }}
        onFocus={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
      />

      {listboxOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-300 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-950"
        >
          {suggestions.length ? (
            suggestions.map((suggestion, index) => (
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
                <span>{suggestion.label}</span>
                {suggestion.favorite ? (
                  <>
                    {" "}
                    <span className="ml-2 text-xs text-amber-700 dark:text-amber-300">
                    Favorite
                    </span>
                  </>
                ) : null}
                {" "}
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {suggestion.owner === "seed" ? "Starter" : "Local"}
                </span>
              </li>
            ))
          ) : null}
        </ul>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {canRemember || canUnhide ? (
          <button
            type="button"
            className="rounded-lg border border-sky-700 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-400 dark:text-sky-200 dark:hover:bg-sky-950"
            disabled={storageStatus !== "ready"}
            onClick={handleRemember}
          >
            {canUnhide ? "Unhide this value" : "Remember this value"}
          </button>
        ) : null}
        <span
          id={helpId}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          Suggestions are local to this browser. Typing alone does not save.
        </span>
      </div>

      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <p id={statusId} className="sr-only" aria-live="polite">
        {listboxOpen
          ? `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"} available. `
          : ""}
        {statusMessage}
      </p>
    </div>
  );
}
