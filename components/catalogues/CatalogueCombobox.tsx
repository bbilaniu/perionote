"use client";

import {
  useMemo,
  useState,
  type RefObject,
} from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { HideCatalogueSuggestionIcon } from "@/components/catalogues/HideCatalogueSuggestionIcon";
import { EditableCombobox } from "@/components/forms/EditableCombobox";
import {
  type CatalogueItem,
  type CatalogueItemMetadata,
  type CatalogueKey,
  normalizeCatalogueLabel,
} from "@/lib/catalogues/catalogue";
import { isProviderCatalogueKey } from "@/lib/catalogues/providerDefaults";

const actionButtonClass =
  "rounded-lg border border-sky-700 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-400 dark:text-sky-200 dark:hover:bg-sky-950";
const roomyActionButtonClass =
  "rounded-xl border border-sky-700 px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-400 dark:text-sky-200 dark:hover:bg-sky-950";
const defaultBadgeClass =
  "inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";

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
  roomyActions = false,
  showAllSuggestionsWhenSelected = false,
  suggestionFilter,
  rememberMetadata,
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
  roomyActions?: boolean;
  showAllSuggestionsWhenSelected?: boolean;
  suggestionFilter?: (item: CatalogueItem) => boolean;
  rememberMetadata?: CatalogueItemMetadata;
}) {
  const {
    storageStatus,
    getItems,
    findEquivalent,
    rememberValue,
    rememberAndSetProviderDefault,
    setHidden,
    providerDefaultsStorageStatus,
    getProviderDefault,
    setProviderDefault,
  } = useCatalogues();
  const [statusMessage, setStatusMessage] = useState("");

  const equivalent = findEquivalent(catalogueKey, value);
  const suggestions = useMemo(() => {
    const query = normalizeCatalogueLabel(value);
    const allItems = getItems(catalogueKey).filter(
      (item) => !suggestionFilter || suggestionFilter(item),
    );
    return query && !(showAllSuggestionsWhenSelected && equivalent)
      ? allItems.filter((item) =>
          normalizeCatalogueLabel(item.label).includes(query),
        )
      : allItems;
  }, [
    catalogueKey,
    equivalent,
    getItems,
    showAllSuggestionsWhenSelected,
    suggestionFilter,
    value,
  ]);

  const canRemember = Boolean(value.trim()) && !equivalent;
  const canUnhide = Boolean(value.trim()) && equivalent?.hidden;
  const providerCatalogueKey = isProviderCatalogueKey(catalogueKey)
    ? catalogueKey
    : null;
  const providerDefault = providerCatalogueKey
    ? getProviderDefault(providerCatalogueKey)
    : undefined;
  const isCurrentDefault = Boolean(
    equivalent && providerDefault?.id === equivalent.id,
  );
  const canSetCurrentDefault = Boolean(
    providerCatalogueKey &&
      equivalent &&
      !equivalent.hidden &&
      !isCurrentDefault,
  );
  const canWriteProviderDefault =
    storageStatus === "ready" && providerDefaultsStorageStatus === "ready";

  function handleRemember() {
    try {
      const result = rememberValue(catalogueKey, value, rememberMetadata);
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

  function handleRememberAndSetDefault() {
    if (!providerCatalogueKey) return;
    try {
      const result = rememberAndSetProviderDefault(
        providerCatalogueKey,
        value,
      );
      setStatusMessage(
        result === "reactivated"
          ? `${value.trim()} unhidden and set as the default ${label} for new notes.`
          : `${value.trim()} remembered and set as the default ${label} for new notes.`,
      );
    } catch (defaultError) {
      setStatusMessage(
        defaultError instanceof Error
          ? defaultError.message
          : "This value could not be saved as the default.",
      );
    }
  }

  function handleSetDefault() {
    if (!providerCatalogueKey || !equivalent) return;
    try {
      setProviderDefault(providerCatalogueKey, equivalent.id);
      setStatusMessage(
        `${equivalent.label} set as the default ${label} for new notes.`,
      );
    } catch (defaultError) {
      setStatusMessage(
        defaultError instanceof Error
          ? defaultError.message
          : "This value could not be set as the default.",
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
          {providerDefault?.id === suggestion.id ? (
            <span className="ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Default
            </span>
          ) : null}{" "}
          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
            {suggestion.owner === "seed" ? "Starter" : "Local"}
          </span>
        </>
      )}
      suggestionAction={
        !value.trim()
          ? {
              label: (suggestion) =>
                `Hide ${suggestion.label} from suggestions`,
              icon: <HideCatalogueSuggestionIcon />,
              onAction: handleHideSuggestion,
              disabled: storageStatus !== "ready",
            }
          : undefined
      }
      actions={
        <>
          {canRemember || canUnhide ? (
            <button
              type="button"
              className={
                roomyActions ? roomyActionButtonClass : actionButtonClass
              }
              disabled={storageStatus !== "ready"}
              onClick={handleRemember}
            >
              {canUnhide ? unhideActionLabel : rememberActionLabel}
            </button>
          ) : null}
          {providerCatalogueKey && (canRemember || canUnhide) ? (
            <button
              type="button"
              className={
                roomyActions ? roomyActionButtonClass : actionButtonClass
              }
              aria-label={`${
                canUnhide ? "Unhide" : "Remember"
              } ${value.trim()} and set it as the default ${label} for new notes`}
              disabled={!canWriteProviderDefault}
              onClick={handleRememberAndSetDefault}
            >
              {canUnhide
                ? "Unhide and set as default"
                : "Remember and set as default"}
            </button>
          ) : null}
          {canSetCurrentDefault ? (
            <button
              type="button"
              className={
                roomyActions ? roomyActionButtonClass : actionButtonClass
              }
              aria-label={`Set ${value.trim()} as the default ${label} for new notes`}
              disabled={!canWriteProviderDefault}
              onClick={handleSetDefault}
            >
              Set as default
            </button>
          ) : null}
          {isCurrentDefault ? (
            <span className={defaultBadgeClass}>Default for new notes</span>
          ) : null}
        </>
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
