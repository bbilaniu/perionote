"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import {
  CATALOGUE_DEFINITIONS,
  MAX_CATALOGUE_IMPORT_BYTES,
  CatalogueDefinition,
  CatalogueImportPreview,
  CatalogueItem,
  StoredCatalogueStateV1,
  formatCatalogueExportFilename,
  parseCatalogueExport,
  serializeCatalogueExport,
} from "@/lib/catalogues/catalogue";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-sky-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const dangerButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";
const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900";

type PendingImport = {
  state: StoredCatalogueStateV1;
  preview: CatalogueImportPreview;
  exportedAt: string;
  fileName: string;
};

function CatalogueActionButton({
  children,
  tooltip,
  className = secondaryButtonClass,
  disabled,
  ariaLabel,
  onClick,
}: {
  children: ReactNode;
  tooltip: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onClick: () => void;
}) {
  const tooltipId = useId();

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className={className}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        onClick={onClick}
      >
        {children}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-max max-w-64 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-within:block dark:bg-slate-100 dark:text-slate-950"
      >
        {tooltip}
      </span>
    </span>
  );
}

function CatalogueItemRow({
  item,
  definition,
  canMoveUp,
  canMoveDown,
}: {
  item: CatalogueItem;
  definition: CatalogueDefinition;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    storageStatus,
    updateItem,
    setHidden,
    setFavorite,
    deleteItem,
    moveItem,
  } = useCatalogues();
  const [draftLabel, setDraftLabel] = useState(item.label);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraftLabel(item.label);
  }, [item.label]);

  function run(action: () => void, successMessage: string) {
    try {
      action();
      setMessage(successMessage);
    } catch (actionError) {
      setMessage(
        actionError instanceof Error
          ? actionError.message
          : "The catalogue could not be updated.",
      );
    }
  }

  return (
    <li
      data-catalogue-item-id={item.id}
      className={`rounded-xl border p-3 ${
        item.hidden
          ? "border-dashed border-slate-300 bg-slate-100/60 opacity-60 dark:border-slate-700 dark:bg-slate-950/60"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          {item.owner === "user" ? (
            <div className="flex gap-2">
              <label className="sr-only" htmlFor={`catalogue-item-${item.id}`}>
                Edit {definition.title} value
              </label>
              <input
                id={`catalogue-item-${item.id}`}
                className={inputClass}
                value={draftLabel}
                onChange={(event) => setDraftLabel(event.target.value)}
              />
              <CatalogueActionButton
                tooltip="Save the edited text for this catalogue value."
                disabled={
                  draftLabel.trim() === item.label || storageStatus !== "ready"
                }
                onClick={() =>
                  run(
                    () => updateItem(item.id, draftLabel),
                    `${draftLabel.trim()} updated.`,
                  )
                }
              >
                Save
              </CatalogueActionButton>
            </div>
          ) : (
            <p className="font-medium">{item.label}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {item.owner === "seed"
                ? "Starter suggestion"
                : "Saved in this browser"}
            </span>
            {item.favorite ? <span>Favorite</span> : null}
            {item.hidden ? <span>Hidden</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CatalogueActionButton
            tooltip={
              item.hidden
                ? "Favorite this value and return it to future suggestions."
                : item.favorite
                ? "Return this value to its normal position in future suggestions."
                : "Place this value before non-favorites in future suggestions."
            }
            disabled={storageStatus !== "ready"}
            onClick={() =>
              run(
                () =>
                  setFavorite(
                    item.id,
                    item.owner,
                    item.hidden ? true : !item.favorite,
                  ),
                item.hidden
                  ? `${item.label} favorited and unhidden.`
                  : item.favorite
                  ? `${item.label} removed from favorites.`
                  : `${item.label} marked as favorite.`,
              )
            }
          >
            {item.hidden
              ? "Favorite"
              : item.favorite
                ? "Unfavorite"
                : "Favorite"}
          </CatalogueActionButton>
          <CatalogueActionButton
            tooltip="Move this value earlier within its current suggestion group."
            disabled={storageStatus !== "ready" || !canMoveUp}
            ariaLabel={`Move ${item.label} up`}
            onClick={() =>
              run(
                () => moveItem(definition.key, item.id, "up"),
                `${item.label} moved up.`,
              )
            }
          >
            Move up
          </CatalogueActionButton>
          <CatalogueActionButton
            tooltip="Move this value later within its current suggestion group."
            disabled={storageStatus !== "ready" || !canMoveDown}
            ariaLabel={`Move ${item.label} down`}
            onClick={() =>
              run(
                () => moveItem(definition.key, item.id, "down"),
                `${item.label} moved down.`,
              )
            }
          >
            Move down
          </CatalogueActionButton>
          <CatalogueActionButton
            tooltip={
              item.hidden
                ? "Return this value to future form suggestions."
                : "Remove this value from future form suggestions without deleting it."
            }
            disabled={storageStatus !== "ready"}
            onClick={() =>
              run(
                () => setHidden(item.id, item.owner, !item.hidden),
                item.hidden
                  ? `${item.label} unhidden.`
                  : `${item.label} hidden.`,
              )
            }
          >
            {item.hidden ? "Unhide" : "Hide"}
          </CatalogueActionButton>
          {item.owner === "user" ? (
            <CatalogueActionButton
              tooltip="Permanently delete this value from this browser's catalogue."
              className={dangerButtonClass}
              disabled={storageStatus !== "ready"}
              onClick={() => {
                if (
                  window.confirm(
                    `Delete “${item.label}” permanently from this browser's catalogue? It will no longer appear in future suggestions. Open forms and previously copied notes will not change. This cannot be undone.`,
                  )
                ) {
                  run(() => deleteItem(item.id), `${item.label} deleted.`);
                }
              }}
            >
              Delete
            </CatalogueActionButton>
          ) : null}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </li>
  );
}

function CatalogueCard({ definition }: { definition: CatalogueDefinition }) {
  const { storageStatus, getItems, rememberValue } = useCatalogues();
  const [newValue, setNewValue] = useState("");
  const [message, setMessage] = useState("");
  const items = getItems(definition.key, { includeHidden: true });

  function addValue() {
    try {
      const result = rememberValue(definition.key, newValue);
      setMessage(
        result === "reactivated"
          ? `${newValue.trim()} unhidden.`
          : result === "existing"
          ? `${newValue.trim()} already exists.`
          : `${newValue.trim()} added.`,
      );
      setNewValue("");
    } catch (addError) {
      setMessage(
        addError instanceof Error
          ? addError.message
          : "The value could not be added.",
      );
    }
  }

  return (
    <section
      data-catalogue-key={definition.key}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="text-lg font-semibold">{definition.title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Applies to: {definition.fieldLabels.join(", ")}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label
            className="text-sm font-medium"
            htmlFor={`add-${definition.key}`}
          >
            Add {definition.title} value
          </label>
          <input
            id={`add-${definition.key}`}
            className={`${inputClass} mt-1`}
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addValue();
              }
            }}
          />
        </div>
        <button
          type="button"
          className={`${primaryButtonClass} sm:self-end`}
          disabled={!newValue.trim() || storageStatus !== "ready"}
          onClick={addValue}
        >
          Add local value
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Adding here stores the value only in this browser profile.
      </p>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const orderingGroup = items.filter(
              (candidate) => candidate.favorite === item.favorite,
            );
            const orderingIndex = orderingGroup.findIndex(
              (candidate) => candidate.id === item.id,
            );
            return (
              <CatalogueItemRow
                key={item.id}
                item={item}
                definition={definition}
                canMoveUp={orderingIndex > 0}
                canMoveDown={
                  orderingIndex >= 0 &&
                  orderingIndex < orderingGroup.length - 1
                }
              />
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
          No saved suggestions. Add a local value here or remember one from the
          Recare Exam.
        </p>
      )}
    </section>
  );
}

export function CatalogueManager() {
  const {
    state,
    storageStatus,
    error,
    clearError,
    resetCatalogues,
    previewImport,
    applyImport,
  } = useCatalogues();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(
    null,
  );
  const [transferMessage, setTransferMessage] = useState("");
  const [transferError, setTransferError] = useState("");

  const sections = useMemo(
    () =>
      (["Visit Team", "Clinical Exam"] as const).map((section) => ({
        section,
        definitions: CATALOGUE_DEFINITIONS.filter(
          (definition) => definition.section === section,
        ),
      })),
    [],
  );

  function exportCatalogue() {
    try {
      const data = serializeCatalogueExport(state);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = formatCatalogueExportFilename();
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setTransferError("");
      setTransferMessage(
        "Catalogue exported locally. Store and transfer the file securely.",
      );
    } catch (exportError) {
      setTransferMessage("");
      setTransferError(
        exportError instanceof Error
          ? exportError.message
          : "The catalogue could not be exported.",
      );
    }
  }

  async function selectImportFile(event: ChangeEvent<HTMLInputElement>) {
    setPendingImport(null);
    setTransferMessage("");
    setTransferError("");
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_CATALOGUE_IMPORT_BYTES) {
      setTransferError("Catalogue files must be 1 MiB or smaller.");
      return;
    }
    try {
      const parsed = parseCatalogueExport(await file.text());
      setPendingImport({
        state: parsed.catalogueState,
        preview: previewImport(parsed.catalogueState),
        exportedAt: parsed.exportedAt,
        fileName: file.name,
      });
    } catch (importError) {
      setTransferError(
        importError instanceof Error
          ? importError.message
          : "The catalogue file could not be read.",
      );
    }
  }

  function finishImport(mode: "merge" | "replace") {
    if (!pendingImport) {
      return;
    }
    const currentCount = state.userItems.length;
    const confirmation =
      mode === "replace"
        ? `Replace ${currentCount} local catalogue value${
            currentCount === 1 ? "" : "s"
          } with the validated import? This cannot be undone.`
        : `Merge ${pendingImport.preview.importedUserItems} imported value${
            pendingImport.preview.importedUserItems === 1 ? "" : "s"
          } into this browser's catalogue?`;
    if (!window.confirm(confirmation)) {
      return;
    }
    try {
      applyImport(pendingImport.state, mode);
      setTransferError("");
      setTransferMessage(
        mode === "replace"
          ? "Local catalogues replaced with the imported catalogue."
          : "Imported catalogue merged with local catalogues.",
      );
      setPendingImport(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (importError) {
      setTransferMessage("");
      setTransferError(
        importError instanceof Error
          ? importError.message
          : "The catalogue import could not be applied.",
      );
    }
  }

  return (
    <div className="space-y-8">
      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
          Browser-local settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Catalogues
        </h1>
        <p className="mt-3 text-slate-700 dark:text-slate-300">
          Manage reusable documentation suggestions. These values are separate
          from encounter forms and remain in this browser profile unless you
          deliberately export them.
        </p>
      </header>

      <aside className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <h2 className="font-semibold">Local storage limitations</h2>
        <p className="mt-2">
          Anyone using this browser profile may see these values. Private
          browsing may not preserve them, and clearing site data may remove
          them. Another device or browser will not receive them automatically.
        </p>
      </aside>

      {storageStatus === "loading" ? (
        <p role="status">Loading the local catalogue…</p>
      ) : null}
      {storageStatus === "unavailable" || storageStatus === "invalid" ? (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p>{error ?? "Browser-local catalogue storage is unavailable."}</p>
          {storageStatus === "invalid" ? (
            <p className="mt-2">
              Import a valid catalogue or reset local catalogues to recover.
            </p>
          ) : null}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p>{error}</p>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {sections.map(({ section, definitions }) => (
        <section key={section} className="space-y-4">
          <h2 className="text-2xl font-semibold">{section}</h2>
          <div className="grid gap-5">
            {definitions.map((definition) => (
              <CatalogueCard key={definition.key} definition={definition} />
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Import and export</h2>
        <p className="mt-2 max-w-4xl text-sm text-slate-700 dark:text-slate-300">
          An export is readable JSON and may contain private staff names or
          clinic-specific shortcuts. Store and transfer it securely, then delete
          extra copies when they are no longer needed. HygieneNote does not
          upload the file.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <button
            type="button"
            className={primaryButtonClass}
            disabled={storageStatus !== "ready"}
            onClick={exportCatalogue}
          >
            Export catalogue
          </button>
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="catalogue-import"
            >
              Import catalogue JSON
            </label>
            <input
              ref={fileInputRef}
              id="catalogue-import"
              className="mt-1 block max-w-full text-sm"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void selectImportFile(event)}
            />
          </div>
        </div>

        {pendingImport ? (
          <div className="mt-5 rounded-xl border border-sky-300 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950">
            <h3 className="font-semibold">Import preview</h3>
            <p className="mt-1 text-sm">
              {pendingImport.fileName}, exported{" "}
              {new Date(pendingImport.exportedAt).toLocaleString()}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              <li>
                {pendingImport.preview.importedUserItems} local{" "}
                {pendingImport.preview.importedUserItems === 1
                  ? "value"
                  : "values"}{" "}
                in file
              </li>
              <li>
                {pendingImport.preview.importedSeedPreferences} starter
                preference
                {pendingImport.preview.importedSeedPreferences === 1
                  ? ""
                  : "s"}{" "}
                in file
              </li>
              <li>{pendingImport.preview.additions} new values when merged</li>
              <li>
                {pendingImport.preview.equivalentItems} equivalent existing
                values
              </li>
              <li>
                {pendingImport.preview.idConflicts} identifier conflicts that
                merge will leave unchanged
              </li>
              {CATALOGUE_DEFINITIONS.map((definition) => {
                const count =
                  pendingImport.preview.itemsByCatalogue[definition.key];
                return count ? (
                  <li key={definition.key}>
                    {definition.title}: {count}
                  </li>
                ) : null;
              })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={primaryButtonClass}
                onClick={() => finishImport("merge")}
              >
                Merge with this catalogue
              </button>
              <button
                type="button"
                className={dangerButtonClass}
                onClick={() => finishImport("replace")}
              >
                Replace this catalogue
              </button>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setPendingImport(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Cancel import
              </button>
            </div>
          </div>
        ) : null}

        {transferError ? (
          <p
            className="mt-3 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            {transferError}
          </p>
        ) : null}
        <p
          className="mt-3 text-sm text-emerald-800 dark:text-emerald-300"
          aria-live="polite"
        >
          {transferMessage}
        </p>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/60">
        <h2 className="text-xl font-semibold text-red-950 dark:text-red-100">
          Reset local catalogues
        </h2>
        <p className="mt-2 text-sm text-red-900 dark:text-red-200">
          This deletes all locally remembered values and preferences and
          restores the starter suggestions. It does not clear an open form.
        </p>
        <button
          type="button"
          className={`${dangerButtonClass} mt-4`}
          disabled={storageStatus === "loading"}
          onClick={() => {
            if (
              window.confirm(
                "Delete every locally remembered catalogue value and restore starter suggestions? This cannot be undone.",
              )
            ) {
              try {
                resetCatalogues();
                setTransferMessage("Local catalogues reset.");
                setTransferError("");
              } catch (resetError) {
                setTransferMessage("");
                setTransferError(
                  resetError instanceof Error
                    ? resetError.message
                    : "The local catalogues could not be reset.",
                );
              }
            }
          }}
        >
          Reset local catalogues
        </button>
      </section>
    </div>
  );
}
