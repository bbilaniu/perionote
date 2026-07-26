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
      actions={
        canRemember || canUnhide ? (
          <button
            type="button"
            className="rounded-lg border border-sky-700 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-400 dark:text-sky-200 dark:hover:bg-sky-950"
            disabled={storageStatus !== "ready"}
            onClick={handleRemember}
          >
            {canUnhide ? "Unhide this value" : "Remember this value"}
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
