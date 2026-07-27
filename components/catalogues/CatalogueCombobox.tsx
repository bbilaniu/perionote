"use client";

import {
  useMemo,
  useState,
  type RefObject,
} from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { EditableCombobox } from "@/components/forms/EditableCombobox";
import {
  CatalogueKey,
  normalizeCatalogueLabel,
} from "@/lib/catalogues/catalogue";

export function CatalogueCombobox({
  id,
  label,
  catalogueKey,
  value,
  onChange,
  error,
  inputRef,
  disabled,
  rememberActionLabel = "Remember this value",
  unhideActionLabel = "Unhide this value",
  allowHideSuggestionsWhenEmpty = false,
}: {
  id: string;
  label: string;
  catalogueKey: CatalogueKey;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  rememberActionLabel?: string;
  unhideActionLabel?: string;
  allowHideSuggestionsWhenEmpty?: boolean;
}) {
  const {
    storageStatus,
    getItems,
    findEquivalent,
    rememberValue,
    setHidden,
  } = useCatalogues();
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

  function handleHideSuggestion(
    suggestion: (typeof suggestions)[number],
  ) {
    try {
      setHidden(suggestion.id, suggestion.owner, true);
      setStatusMessage(
        `${suggestion.label} hidden from suggestions. You can unhide it in Manage Catalogues.`,
      );
    } catch (hideError) {
      setStatusMessage(
        hideError instanceof Error
          ? hideError.message
          : "This suggestion could not be hidden.",
      );
    }
  }

  return (
    <EditableCombobox
      id={id}
      label={label}
      value={value}
      suggestions={suggestions}
      onValueChange={(nextValue) => {
        onChange(nextValue);
        setStatusMessage("");
      }}
      onSelectSuggestion={(suggestion) => {
        onChange(suggestion.label);
        setStatusMessage(`${suggestion.label} selected.`);
      }}
      renderSuggestion={(suggestion) => (
        <>
          <span>{suggestion.label}</span>
          {suggestion.favorite ? (
            <span className="ml-2 text-xs text-amber-700 dark:text-amber-300">
              Favorite
            </span>
          ) : null}{" "}
          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
            {suggestion.owner === "seed" ? "Starter" : "Local"}
          </span>
        </>
      )}
      suggestionAction={
        allowHideSuggestionsWhenEmpty && !value.trim()
          ? {
              label: (suggestion) =>
                `Hide ${suggestion.label} from suggestions`,
              icon: (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                  <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9.5 4.8 10 8a9.8 9.8 0 0 1-2.2 4.3" />
                  <path d="M6.6 6.6A10.5 10.5 0 0 0 2 12c.5 3.2 4.5 8 10 8a10.7 10.7 0 0 0 5.4-1.5" />
                </svg>
              ),
              onAction: handleHideSuggestion,
              disabled: storageStatus !== "ready",
            }
          : undefined
      }
      actions={
        canRemember || canUnhide ? (
          <button
            type="button"
            className="rounded-lg border border-sky-700 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-400 dark:text-sky-200 dark:hover:bg-sky-950"
            disabled={storageStatus !== "ready"}
            onClick={handleRemember}
          >
            {canUnhide ? unhideActionLabel : rememberActionLabel}
          </button>
        ) : null
      }
      helpText="Suggestions are local to this browser. Typing alone does not save."
      statusMessage={statusMessage}
      emptyMessage={
        value.trim()
          ? "No matching catalogue suggestions."
          : "No catalogue suggestions saved yet."
      }
      error={error}
      inputRef={inputRef}
      disabled={disabled}
    />
  );
}
