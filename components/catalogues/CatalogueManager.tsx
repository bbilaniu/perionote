"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { TooltipActionButton } from "@/components/forms/TooltipActionButton";
import {
  CATALOGUE_SECTIONS,
  COMPLETED_CARE_CATEGORIES,
  COMPLETED_CARE_CATEGORY_LABELS,
  MAX_CATALOGUE_IMPORT_BYTES,
  CatalogueDefinition,
  CatalogueImportPreview,
  CatalogueItem,
  CatalogueKey,
  isCompletedCareCatalogueMetadata,
  isPolishingProductCatalogueMetadata,
  isRadiographCatalogueMetadata,
  type CatalogueItemMetadata,
  type CompletedCareCategory,
  type CompletedCareProcedure,
  StoredCatalogueStateV1,
  formatCatalogueExportFilename,
  getCatalogueDefinitionsForBuild,
  parseCatalogueExport,
  serializeCatalogueExport,
} from "@/lib/catalogues/catalogue";
import { isProviderCatalogueKey } from "@/lib/catalogues/providerDefaults";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-sky-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const dangerButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";
const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900";

const catalogueTabGroups: Array<{
  section: (typeof CATALOGUE_SECTIONS)[number];
  title: string;
  keys: CatalogueKey[];
}> = [
  {
    section: "Visit Team",
    title: "Provider roles",
    keys: ["visit-team.dentist", "visit-team.rda", "visit-team.rdh"],
  },
  {
    section: "Clinical Exam",
    title: "Occlusion",
    keys: [
      "clinical-exam.molar-occlusion",
      "clinical-exam.skeletal-occlusion",
      "clinical-exam.additional-occlusal-findings",
    ],
  },
  {section: "Treatment", title: "Dental treatment", keys: ["dental-treatment.items", "hygiene-treatment.items"]},
  {
    section: "Continuity of care",
    title: "Intervals and next visits",
    keys: [
      "scheduling.recall-interval",
      "scheduling.hygiene-interval",
      "scheduling.hygiene-next-visit",
      "scheduling.dentist-next-visit",
    ],
  },
];

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
  return (
    <TooltipActionButton
      tooltip={tooltip}
      className={className}
      disabled={disabled}
      ariaLabel={ariaLabel}
      onClick={onClick}
    >
      {children}
    </TooltipActionButton>
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
    providerDefaultsStorageStatus,
    updateItem,
    setHidden,
    setFavorite,
    deleteItem,
    moveItem,
    getProviderDefault,
    setProviderDefault,
    clearProviderDefault,
  } = useCatalogues();
  const [draftLabel, setDraftLabel] = useState(item.label);
  const [draftRadiographCode, setDraftRadiographCode] = useState(
    isRadiographCatalogueMetadata(item.metadata) ? item.metadata.code : "",
  );
  const [draftRadiographQuantity, setDraftRadiographQuantity] = useState(
    isRadiographCatalogueMetadata(item.metadata)
      ? String(item.metadata.defaultQuantity)
      : "1",
  );
  const [draftCareCategory, setDraftCareCategory] =
    useState<CompletedCareCategory>(
      isCompletedCareCatalogueMetadata(item.metadata)
        ? item.metadata.category
        : "other",
    );
  const [message, setMessage] = useState("");
  const providerCatalogueKey = isProviderCatalogueKey(definition.key)
    ? definition.key
    : null;
  const defaultProvider = providerCatalogueKey
    ? getProviderDefault(providerCatalogueKey)
    : undefined;
  const isDefaultProvider = defaultProvider?.id === item.id;

  useEffect(() => {
    setDraftLabel(item.label);
    setDraftRadiographCode(
      isRadiographCatalogueMetadata(item.metadata) ? item.metadata.code : "",
    );
    setDraftRadiographQuantity(
      isRadiographCatalogueMetadata(item.metadata)
        ? String(item.metadata.defaultQuantity)
        : "1",
    );
    setDraftCareCategory(
      isCompletedCareCatalogueMetadata(item.metadata)
        ? item.metadata.category
        : "other",
    );
  }, [item.label, item.metadata]);

  function draftMetadata(): CatalogueItemMetadata | undefined {
    if (definition.key === "imaging.radiographs") {
      if (!draftRadiographCode.trim()) return undefined;
      return {
        kind: "radiograph",
        code: draftRadiographCode.trim().toUpperCase(),
        defaultQuantity: Number(draftRadiographQuantity),
      };
    }
    if (definition.key === "hygiene-treatment.completed") {
      const existing = isCompletedCareCatalogueMetadata(item.metadata)
        ? item.metadata
        : undefined;
      const procedure: CompletedCareProcedure =
        existing?.procedure === "scaling" ||
        existing?.procedure === "polish" ||
        existing?.procedure === "recare-exam" ||
        existing?.procedure === "fmp" ||
        existing?.procedure === "ohe" ||
        existing?.procedure === "radiographs"
          ? existing.procedure
          : draftCareCategory === "product-application"
            ? "product-application"
            : draftCareCategory === "preventive-procedure"
              ? "preventive-procedure"
              : "other";
      return {
        kind: "completed-care",
        category: draftCareCategory,
        procedure,
        ...(existing?.defaultQuantity === undefined
          ? {}
          : { defaultQuantity: existing.defaultQuantity }),
        ...(existing?.defaultProduct === undefined
          ? {}
          : { defaultProduct: existing.defaultProduct }),
        ...(existing?.defaultToothAreas === undefined
          ? {}
          : { defaultToothAreas: [...existing.defaultToothAreas] }),
      };
    }
    return undefined;
  }

  const pendingMetadata = draftMetadata();
  const metadataChanged =
    JSON.stringify(pendingMetadata) !== JSON.stringify(item.metadata);

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
            <div className="space-y-3">
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
                  (draftLabel.trim() === item.label && !metadataChanged) ||
                  storageStatus !== "ready" ||
                  (definition.key === "imaging.radiographs" &&
                    (!draftRadiographCode.trim() || !draftRadiographQuantity))
                }
                onClick={() =>
                  run(
                    () => updateItem(item.id, draftLabel, pendingMetadata),
                    `${draftLabel.trim()} updated.`,
                  )
                }
              >
                Save
              </CatalogueActionButton>
              </div>
              {definition.key === "imaging.radiographs" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label
                      className="text-xs font-medium"
                      htmlFor={`catalogue-item-${item.id}-code`}
                    >
                      Short code
                    </label>
                    <input
                      id={`catalogue-item-${item.id}-code`}
                      className={`${inputClass} mt-1`}
                      value={draftRadiographCode}
                      onChange={(event) =>
                        setDraftRadiographCode(event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-medium"
                      htmlFor={`catalogue-item-${item.id}-quantity`}
                    >
                      Default images
                    </label>
                    <input
                      id={`catalogue-item-${item.id}-quantity`}
                      type="number"
                      min={1}
                      step={1}
                      className={`${inputClass} mt-1`}
                      value={draftRadiographQuantity}
                      onChange={(event) =>
                        setDraftRadiographQuantity(event.target.value)
                      }
                    />
                  </div>
                </div>
              ) : null}
              {definition.key === "hygiene-treatment.completed" ? (
                <div>
                  <label
                    className="text-xs font-medium"
                    htmlFor={`catalogue-item-${item.id}-category`}
                  >
                    Category
                  </label>
                  <select
                    id={`catalogue-item-${item.id}-category`}
                    className={`${inputClass} mt-1`}
                    value={draftCareCategory}
                    onChange={(event) =>
                      setDraftCareCategory(
                        event.target.value as CompletedCareCategory,
                      )
                    }
                  >
                    {COMPLETED_CARE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {COMPLETED_CARE_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
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
            {isDefaultProvider ? <span>Default for new notes</span> : null}
            {item.hidden ? <span>Hidden</span> : null}
            {isRadiographCatalogueMetadata(item.metadata) ? (
              <span>
                Code {item.metadata.code}; default {item.metadata.defaultQuantity}{" "}
                image{item.metadata.defaultQuantity === 1 ? "" : "s"}
              </span>
            ) : null}
            {isCompletedCareCatalogueMetadata(item.metadata) ? (
              <span>
                {COMPLETED_CARE_CATEGORY_LABELS[item.metadata.category]}
              </span>
            ) : null}
            {isPolishingProductCatalogueMetadata(item.metadata) ? (
              <span>
                {item.metadata.productName}; {item.metadata.flavour}
                {item.metadata.containsFluoride ? "; with fluoride" : ""}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {providerCatalogueKey ? (
            <CatalogueActionButton
              tooltip={
                isDefaultProvider
                  ? `Stop prefilling ${definition.title} with this value in new notes.`
                  : `Prefill ${definition.title} with this value in new notes.`
              }
              disabled={
                item.hidden || providerDefaultsStorageStatus !== "ready"
              }
              onClick={() =>
                run(
                  () =>
                    isDefaultProvider
                      ? clearProviderDefault(providerCatalogueKey)
                      : setProviderDefault(providerCatalogueKey, item.id),
                  isDefaultProvider
                    ? `${item.label} is no longer the default ${definition.title}.`
                    : `${item.label} set as the default ${definition.title} for new notes.`,
                )
              }
            >
              {isDefaultProvider ? "Clear default" : "Set default"}
            </CatalogueActionButton>
          ) : null}
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

function CatalogueCard({
  definition,
  embeddedPanel,
}: {
  definition: CatalogueDefinition;
  embeddedPanel?: {
    id: string;
    labelledBy: string;
    hidden: boolean;
  };
}) {
  const { storageStatus, getItems, rememberValue } = useCatalogues();
  const [newValue, setNewValue] = useState("");
  const [newRadiographCode, setNewRadiographCode] = useState("");
  const [newRadiographQuantity, setNewRadiographQuantity] = useState("1");
  const [newCareCategory, setNewCareCategory] =
    useState<CompletedCareCategory>("other");
  const [message, setMessage] = useState("");
  const items = getItems(definition.key, { includeHidden: true });

  function addValue() {
    try {
      let metadata: CatalogueItemMetadata | undefined;
      if (definition.key === "imaging.radiographs") {
        metadata = {
          kind: "radiograph",
          code: newRadiographCode.trim().toUpperCase(),
          defaultQuantity: Number(newRadiographQuantity),
        };
      } else if (definition.key === "hygiene-treatment.completed") {
        const procedure: CompletedCareProcedure =
          newCareCategory === "product-application"
            ? "product-application"
            : newCareCategory === "preventive-procedure"
              ? "preventive-procedure"
              : "other";
        metadata = {
          kind: "completed-care",
          category: newCareCategory,
          procedure,
        };
      }
      const result = rememberValue(definition.key, newValue, metadata);
      setMessage(
        result === "reactivated"
          ? `${newValue.trim()} unhidden.`
          : result === "existing"
          ? `${newValue.trim()} already exists.`
          : `${newValue.trim()} added.`,
      );
      setNewValue("");
      setNewRadiographCode("");
      setNewRadiographQuantity("1");
    } catch (addError) {
      setMessage(
        addError instanceof Error
          ? addError.message
          : "The value could not be added.",
      );
    }
  }

  const content = (
    <>
      {!embeddedPanel ? (
        <h3 className="text-lg font-semibold">{definition.title}</h3>
      ) : null}
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Applies to: {definition.fieldLabels.join(", ")}
      </p>

      <div
        className={`mt-4 grid gap-2 ${
          definition.key === "imaging.radiographs"
            ? "sm:grid-cols-[minmax(0,2fr)_minmax(7rem,1fr)_minmax(8rem,1fr)_auto]"
            : definition.key === "hygiene-treatment.completed"
              ? "sm:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)_auto]"
              : "sm:grid-cols-[minmax(0,1fr)_auto]"
        }`}
      >
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
        {definition.key === "imaging.radiographs" ? (
          <>
            <div>
              <label
                className="text-sm font-medium"
                htmlFor={`add-${definition.key}-code`}
              >
                Short code
              </label>
              <input
                id={`add-${definition.key}-code`}
                className={`${inputClass} mt-1`}
                value={newRadiographCode}
                placeholder="e.g. OCC"
                onChange={(event) => setNewRadiographCode(event.target.value)}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                htmlFor={`add-${definition.key}-quantity`}
              >
                Default images
              </label>
              <input
                id={`add-${definition.key}-quantity`}
                type="number"
                min={1}
                step={1}
                className={`${inputClass} mt-1`}
                value={newRadiographQuantity}
                onChange={(event) =>
                  setNewRadiographQuantity(event.target.value)
                }
              />
            </div>
          </>
        ) : null}
        {definition.key === "hygiene-treatment.completed" ? (
          <div>
            <label
              className="text-sm font-medium"
              htmlFor={`add-${definition.key}-category`}
            >
              Category
            </label>
            <select
              id={`add-${definition.key}-category`}
              className={`${inputClass} mt-1`}
              value={newCareCategory}
              onChange={(event) =>
                setNewCareCategory(event.target.value as CompletedCareCategory)
              }
            >
              {COMPLETED_CARE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {COMPLETED_CARE_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <button
          type="button"
          className={`${primaryButtonClass} sm:self-end`}
          disabled={
            !newValue.trim() ||
            storageStatus !== "ready" ||
            (definition.key === "imaging.radiographs" &&
              (!newRadiographCode.trim() || !newRadiographQuantity))
          }
          onClick={addValue}
        >
          Add local value
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Adding here stores the value only in this browser profile.
      </p>
      {isProviderCatalogueKey(definition.key) ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Set one saved value as the default to prefill this provider role in
          new Adult Hygiene and Recare Exam notes. Restored drafts keep their
          saved provider values.
        </p>
      ) : null}
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
          No saved suggestions. Add a local value here or remember one from an
          applicable interactive form.
        </p>
      )}
    </>
  );

  if (embeddedPanel) {
    return (
      <div
        id={embeddedPanel.id}
        role="tabpanel"
        aria-labelledby={embeddedPanel.labelledBy}
        hidden={embeddedPanel.hidden}
        data-catalogue-key={definition.key}
        className="pt-4"
      >
        {content}
      </div>
    );
  }

  return (
    <section
      data-catalogue-key={definition.key}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {content}
    </section>
  );
}

function CatalogueTabbedCard({
  title,
  definitions,
}: {
  title: string;
  definitions: CatalogueDefinition[];
}) {
  const { getItems } = useCatalogues();
  const [activeKey, setActiveKey] = useState(definitions[0].key);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const groupId = `catalogue-group-${definitions
    .map((definition) => definition.key)
    .join("-")
    .replaceAll(".", "-")}`;

  function selectTab(index: number) {
    const definition = definitions[index];
    if (!definition) {
      return;
    }
    setActiveKey(definition.key);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % definitions.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + definitions.length) % definitions.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = definitions.length - 1;
    }
    if (nextIndex === undefined) {
      return;
    }
    event.preventDefault();
    selectTab(nextIndex);
  }

  return (
    <section
      aria-label={`${title} catalogues`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <div
        role="tablist"
        aria-label={`${title} catalogue`}
        className="mt-4 flex max-w-full gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700"
      >
        {definitions.map((definition, index) => {
          const selected = definition.key === activeKey;
          const tabId = `${groupId}-tab-${index}`;
          const panelId = `${groupId}-panel-${index}`;
          const itemCount = getItems(definition.key, {
            includeHidden: true,
          }).length;
          return (
            <button
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              key={definition.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={`inline-flex shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-slate-300 bg-slate-50 text-sky-900 dark:border-slate-700 dark:bg-slate-950 dark:text-sky-200"
                  : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              }`}
              onClick={() => setActiveKey(definition.key)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span>{definition.title}</span>
              <span
                className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                aria-label={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              >
                {itemCount}
              </span>
            </button>
          );
        })}
      </div>

      {definitions.map((definition, index) => (
        <CatalogueCard
          key={definition.key}
          definition={definition}
          embeddedPanel={{
            id: `${groupId}-panel-${index}`,
            labelledBy: `${groupId}-tab-${index}`,
            hidden: definition.key !== activeKey,
          }}
        />
      ))}
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
  const [selectedImportFileName, setSelectedImportFileName] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const [transferError, setTransferError] = useState("");

  const visibleDefinitions = useMemo(
    () => getCatalogueDefinitionsForBuild(process.env.NODE_ENV),
    [],
  );
  const sections = useMemo(
    () =>
      CATALOGUE_SECTIONS.map((section) => ({
        section,
        definitions: visibleDefinitions.filter(
          (definition) => definition.section === section,
        ),
      })).filter(({ definitions }) => definitions.length > 0),
    [visibleDefinitions],
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
    setSelectedImportFileName(file?.name ?? "");
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
      setSelectedImportFileName("");
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

      {sections.map(({ section, definitions }) => {
        const tabGroups = catalogueTabGroups
          .filter((group) => group.section === section)
          .map((group) => ({
            ...group,
            definitions: group.keys
              .map((key) =>
                definitions.find((definition) => definition.key === key),
              )
              .filter(
                (definition): definition is CatalogueDefinition =>
                  Boolean(definition),
              ),
          }))
          .filter((group) => group.definitions.length > 1);
        const groupedKeys = new Set(
          tabGroups.flatMap((group) =>
            group.definitions.map((definition) => definition.key),
          ),
        );
        const ungroupedDefinitions = definitions.filter(
          (definition) => !groupedKeys.has(definition.key),
        );

        return (
          <section key={section} className="space-y-4">
            <h2 className="text-2xl font-semibold">{section}</h2>
            <div className="grid gap-5">
              {tabGroups.map((group) => (
                <CatalogueTabbedCard
                  key={group.title}
                  title={group.title}
                  definitions={group.definitions}
                />
              ))}
              {ungroupedDefinitions.map((definition) => (
                <CatalogueCard key={definition.key} definition={definition} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Import and export</h2>
        <p className="mt-2 max-w-4xl text-sm text-slate-700 dark:text-slate-300">
          An export is readable JSON and may contain private staff names or
          clinic-specific shortcuts. Store and transfer it securely, then delete
          extra copies when they are no longer needed. HygieneNote does not
          upload the file. Provider defaults remain local to this browser and
          are not included in the catalogue export.
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
          <div className="min-w-0 flex-1 sm:min-w-96 sm:max-w-2xl">
            <label
              id="catalogue-import-label"
              className="block text-sm font-medium"
              htmlFor="catalogue-import"
            >
              Import catalogue JSON
            </label>
            <div className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className={secondaryButtonClass}
                aria-controls="catalogue-import"
                aria-describedby="catalogue-import-file-name"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose catalogue file
              </button>
              <span
                id="catalogue-import-file-name"
                className="flex min-h-10 min-w-0 flex-1 items-center rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                title={selectedImportFileName || undefined}
                aria-live="polite"
              >
                <span className="truncate">
                  {selectedImportFileName || "No file selected"}
                </span>
              </span>
              <input
                ref={fileInputRef}
                id="catalogue-import"
                className="sr-only"
                type="file"
                accept="application/json,.json"
                tabIndex={-1}
                aria-labelledby="catalogue-import-label"
                onChange={(event) => void selectImportFile(event)}
              />
            </div>
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
              {visibleDefinitions.map((definition) => {
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
                  setSelectedImportFileName("");
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
