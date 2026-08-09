"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { HideCatalogueSuggestionIcon } from "@/components/catalogues/HideCatalogueSuggestionIcon";
import { EditableCombobox } from "@/components/forms/EditableCombobox";
import { TooltipActionButton } from "@/components/forms/TooltipActionButton";
import {
  type CatalogueKey,
  normalizeCatalogueLabel,
  validateCatalogueLabel,
} from "@/lib/catalogues/catalogue";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const roomyButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const roomyRemoveButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";

export function CatalogueMultiCombobox({
  id,
  label,
  catalogueKey,
  values,
  onChange,
  allowDuplicateValues = false,
  roomySelectionActions = false,
  renderSelectedDetails,
}: {
  id: string;
  label: string;
  catalogueKey: CatalogueKey;
  values: string[];
  onChange: (values: string[]) => void;
  allowDuplicateValues?: boolean;
  roomySelectionActions?: boolean;
  renderSelectedDetails?: (value: string, index: number) => ReactNode;
}) {
  const {
    storageStatus,
    getItems,
    findEquivalent,
    rememberValue,
    setHidden,
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
        (allowDuplicateValues ||
          !selectedLabels.has(normalizeCatalogueLabel(item.label))) &&
        (!query || normalizeCatalogueLabel(item.label).includes(query)),
    );
  }, [
    allowDuplicateValues,
    catalogueKey,
    draft,
    getItems,
    selectedLabels,
  ]);
  const equivalent = findEquivalent(catalogueKey, draft);
  const canRemember = Boolean(draft.trim()) && !equivalent;
  const canUnhide = Boolean(draft.trim()) && equivalent?.hidden;

  function closeSuggestions() {
    setCloseSignal((signal) => signal + 1);
  }

  function addValue(value: string) {
    try {
      const labelValue = validateCatalogueLabel(value);
      if (
        !allowDuplicateValues &&
        selectedLabels.has(normalizeCatalogueLabel(labelValue))
      ) {
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
      if (
        allowDuplicateValues ||
        !selectedLabels.has(normalizeCatalogueLabel(labelValue))
      ) {
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

  function hideSuggestion(suggestion: (typeof suggestions)[number]) {
    try {
      setHidden(suggestion.id, suggestion.owner, true);
      setStatusMessage(
        `${suggestion.label} hidden from suggestions. You can unhide it in Manage Catalogues.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "This suggestion could not be hidden.",
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
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{value}</span>
            <span className="flex flex-wrap gap-2">
              <TooltipActionButton
                tooltip="Move this value earlier in the note."
                className={
                  roomySelectionActions
                    ? roomyButtonClass
                    : secondaryButtonClass
                }
                disabled={index === 0}
                ariaLabel={`Move ${value} earlier`}
                onClick={() => moveValue(index, "up")}
              >
                Earlier
              </TooltipActionButton>
              <TooltipActionButton
                tooltip="Move this value later in the note."
                className={
                  roomySelectionActions
                    ? roomyButtonClass
                    : secondaryButtonClass
                }
                disabled={index === values.length - 1}
                ariaLabel={`Move ${value} later`}
                onClick={() => moveValue(index, "down")}
              >
                Later
              </TooltipActionButton>
              <TooltipActionButton
                tooltip="Remove this value from the note."
                className={
                  roomySelectionActions
                    ? roomyRemoveButtonClass
                    : secondaryButtonClass
                }
                ariaLabel={`Remove ${value}`}
                onClick={() => removeValue(index)}
              >
                Remove
              </TooltipActionButton>
            </span>
          </div>
          {renderSelectedDetails ? renderSelectedDetails(value, index) : null}
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
      suggestionAction={
        !draft.trim()
          ? {
              label: (suggestion) =>
                `Hide ${suggestion.label} from suggestions`,
              icon: <HideCatalogueSuggestionIcon />,
              onAction: hideSuggestion,
              disabled: storageStatus !== "ready",
            }
          : undefined
      }
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
