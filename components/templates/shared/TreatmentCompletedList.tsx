"use client";

import { useState } from "react";

import { CatalogueCombobox } from "@/components/catalogues/CatalogueCombobox";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { ClinicalLocationMultiCombobox } from "@/components/forms/ClinicalLocationMultiCombobox";
import { formControlClass } from "@/components/forms/controlStyles";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { StaticSuggestionCombobox } from "@/components/forms/StaticSuggestionCombobox";
import { TooltipActionButton } from "@/components/forms/TooltipActionButton";
import {
  COMPLETED_CARE_CATEGORIES,
  COMPLETED_CARE_CATEGORY_LABELS,
  isCompletedCareCatalogueMetadata,
  isDesensitizingRemineralizingProductMetadata,
  isPolishingProductCatalogueMetadata,
  type CatalogueItem,
  type CompletedCareCategory,
  type CompletedCareProcedure,
} from "@/lib/catalogues/catalogue";
import {
  createTreatmentEntryFromCatalogueItem,
  formatAdultHygieneTreatmentEntry,
  treatmentCompletedEntryIdentity,
  type AdultHygieneTreatmentCompletedEntry,
  type HygieneInstrumentationMethod,
} from "@/lib/templates/adultHygieneTreatment";
import {
  orderTreatmentToothAreas,
} from "@/lib/templates/adultHygiene2021";

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const rowButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const removeButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";
const inputClass = `mt-1 ${formControlClass()}`;

function QuantityStepper({
  id,
  label,
  value,
  defaultValue,
  step = 0.5,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  defaultValue: string;
  step?: number;
  onChange: (value: string) => void;
}) {
  const numeric = Number(value || defaultValue);

  function adjust(direction: -1 | 1) {
    const next = Math.max(step, (Number.isFinite(numeric) ? numeric : 0) + direction * step);
    onChange(String(Number(next.toFixed(2))));
  }

  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="mt-1 grid grid-cols-[auto_minmax(5rem,1fr)_auto] gap-2">
        <button
          type="button"
          className={rowButtonClass}
          aria-label={`Decrease ${label}`}
          onClick={() => adjust(-1)}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          min={step}
          step={step}
          className={formControlClass()}
          value={value}
          placeholder={defaultValue}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className={rowButtonClass}
          aria-label={`Increase ${label}`}
          onClick={() => adjust(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function InstrumentationToggle({
  method,
  active,
  onChange,
}: {
  method: HygieneInstrumentationMethod;
  active: boolean;
  onChange: (active: boolean) => void;
}) {
  const label = method === "hand" ? "Hand instrumentation" : "Power instrumentation";
  return (
    <NativeChoiceControl
      type="checkbox"
      checked={active}
      onChange={onChange}
    >
      {label}
    </NativeChoiceControl>
  );
}

function TextInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function TreatmentCompletedList({
  entries,
  oheRecap = "",
  onApplyStandard,
  onApplyRecare,
  radiographsHref,
  onChange,
  showHeading = true,
}: {
  entries: AdultHygieneTreatmentCompletedEntry[];
  oheRecap?: string;
  onApplyStandard: () => void;
  onApplyRecare?: () => void;
  radiographsHref?: string;
  onChange: (entries: AdultHygieneTreatmentCompletedEntry[]) => void;
  showHeading?: boolean;
}) {
  const { findEquivalent, getItems, rememberValue, storageStatus } =
    useCatalogues();
  const [showAddCare, setShowAddCare] = useState(false);
  const [customCareLabel, setCustomCareLabel] = useState("");
  const [customCareCategory, setCustomCareCategory] =
    useState<CompletedCareCategory>("other");
  const [rememberCustomCare, setRememberCustomCare] = useState(false);
  const [addCareMessage, setAddCareMessage] = useState("");
  const catalogueItems = getItems("hygiene-treatment.completed");

  function nextEntryId(prefix: string): string {
    return `${prefix}-${Date.now()}-${
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(16).slice(2)
    }`;
  }

  function addCatalogueCare(item: CatalogueItem) {
    const added = createTreatmentEntryFromCatalogueItem(
      item,
      nextEntryId("completed"),
      oheRecap,
    );
    if (!added) return;
    const identity = treatmentCompletedEntryIdentity(added);
    if (
      added.procedureKind &&
      entries.some(
        (entry) => treatmentCompletedEntryIdentity(entry) === identity,
      )
    ) {
      setAddCareMessage(`${item.label} is already in completed care.`);
      return;
    }
    onChange([...entries, added]);
    setAddCareMessage(`${item.label} added.`);
  }

  function addCustomCare() {
    const label = customCareLabel.trim();
    if (!label) return;
    const procedure: CompletedCareProcedure =
      customCareCategory === "product-application"
        ? "product-application"
        : customCareCategory === "preventive-procedure"
          ? "preventive-procedure"
          : "other";
    const metadata = {
      kind: "completed-care" as const,
      category: customCareCategory,
      procedure,
    };
    try {
      if (rememberCustomCare) {
        rememberValue("hygiene-treatment.completed", label, metadata);
      }
      addCatalogueCare({
        id: nextEntryId("encounter-care"),
        catalogueKey: "hygiene-treatment.completed",
        label,
        owner: "user",
        hidden: false,
        favorite: false,
        sortOrder: catalogueItems.length,
        metadata,
      });
      setCustomCareLabel("");
    } catch (error) {
      setAddCareMessage(
        error instanceof Error ? error.message : "Completed care could not be added.",
      );
    }
  }
  function updateEntry(
    entryId: string,
    patch: Partial<Omit<AdultHygieneTreatmentCompletedEntry, "id">>,
  ) {
    onChange(
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, ...patch } : entry,
      ),
    );
  }

  function updatePolishingProduct(entryId: string, product: string) {
    const catalogueItem = findEquivalent(
      "hygiene-treatment.polishing-products",
      product,
    );
    const metadata = isPolishingProductCatalogueMetadata(
      catalogueItem?.metadata,
    )
      ? catalogueItem.metadata
      : undefined;
    updateEntry(entryId, {
      product,
      productName: metadata?.productName,
      productFlavour: metadata?.flavour,
      productContainsFluoride: metadata?.containsFluoride,
    });
  }

  function moveEntry(index: number, direction: "earlier" | "later") {
    const targetIndex = direction === "earlier" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;
    if (
      entries[index].procedureSource === "radiographs" ||
      entries[targetIndex].procedureSource === "radiographs"
    ) {
      return;
    }
    const reordered = [...entries];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    onChange(reordered);
  }

  function toggleInstrumentation(
    entry: AdultHygieneTreatmentCompletedEntry,
    method: HygieneInstrumentationMethod,
    active: boolean,
  ) {
    const current = new Set(entry.instrumentation ?? []);
    if (active) current.add(method);
    else current.delete(method);
    updateEntry(entry.id, { instrumentation: [...current] });
  }

  return (
    <section
      className="space-y-4"
      aria-labelledby={showHeading ? "completed-care-heading" : undefined}
      aria-label={showHeading ? undefined : "Treatment completed today controls"}
    >
      {showHeading ? (
        <div>
          <h3 id="completed-care-heading" className="font-semibold">
            Treatment completed today
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Choose completed care by category. Catalogue defaults prefill common
            quantities and products, while this encounter remains editable.
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose completed care by category. Catalogue defaults prefill common
          quantities and products, while this encounter remains editable.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${buttonClass} bg-sky-700 text-white hover:bg-sky-800`}
          onClick={onApplyStandard}
        >
          Apply standard treatment
        </button>
        {onApplyRecare ? (
          <button
            type="button"
            className={`${buttonClass} border border-sky-700 text-sky-800 hover:bg-sky-50 dark:border-sky-400 dark:text-sky-200 dark:hover:bg-sky-950`}
            onClick={onApplyRecare}
          >
            Apply recare exam
          </button>
        ) : null}
        <button
          type="button"
          className={rowButtonClass}
          aria-expanded={showAddCare}
          aria-controls="adult-hygiene-add-completed-care"
          onClick={() => setShowAddCare((current) => !current)}
        >
          {showAddCare ? "Close completed care catalogue" : "Add completed care"}
        </button>
      </div>

      {showAddCare ? (
        <div
          id="adult-hygiene-add-completed-care"
          className="space-y-4 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          {COMPLETED_CARE_CATEGORIES.filter((category) =>
            catalogueItems.some((item) => {
              const metadata = isCompletedCareCatalogueMetadata(item.metadata)
                ? item.metadata
                : undefined;
              return (metadata?.category ?? "other") === category;
            }),
          ).map((category) => (
            <fieldset key={category} className="space-y-2">
              <legend className="text-sm font-semibold">
                {COMPLETED_CARE_CATEGORY_LABELS[category]}
              </legend>
              <div className="flex flex-wrap gap-2">
                {catalogueItems
                  .filter((item) => {
                    const metadata = isCompletedCareCatalogueMetadata(item.metadata)
                      ? item.metadata
                      : undefined;
                    return (metadata?.category ?? "other") === category;
                  })
                  .map((item) => {
                    const metadata = isCompletedCareCatalogueMetadata(item.metadata)
                      ? item.metadata
                      : undefined;
                    if (metadata?.procedure === "radiographs") {
                      if (!radiographsHref) return null;
                      return (
                        <a
                          key={item.id}
                          href={radiographsHref}
                          className={rowButtonClass}
                        >
                          Edit radiographs
                        </a>
                      );
                    }
                    const previewEntry = createTreatmentEntryFromCatalogueItem(
                      item,
                      "preview",
                      oheRecap,
                    );
                    const alreadyAdded = Boolean(
                      previewEntry?.procedureKind &&
                        entries.some(
                          (entry) =>
                            treatmentCompletedEntryIdentity(entry) ===
                            treatmentCompletedEntryIdentity(previewEntry),
                        ),
                    );
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={rowButtonClass}
                        disabled={alreadyAdded}
                        onClick={() => addCatalogueCare(item)}
                      >
                        {alreadyAdded ? `${item.label} added` : item.label}
                      </button>
                    );
                  })}
              </div>
            </fieldset>
          ))}

          <fieldset className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <legend className="px-1 text-sm font-semibold">
              Encounter-specific completed care
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput
                id="adult-hygiene-custom-completed-care"
                label="Completed care"
                value={customCareLabel}
                onChange={setCustomCareLabel}
              />
              <div>
                <label
                  className="text-sm font-medium"
                  htmlFor="adult-hygiene-custom-completed-care-category"
                >
                  Category
                </label>
                <select
                  id="adult-hygiene-custom-completed-care-category"
                  className={inputClass}
                  value={customCareCategory}
                  onChange={(event) =>
                    setCustomCareCategory(
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
            </div>
            <NativeChoiceControl
              type="checkbox"
              checked={rememberCustomCare}
              disabled={storageStatus !== "ready"}
              onChange={setRememberCustomCare}
            >
              Remember this completed-care item in this browser
            </NativeChoiceControl>
            <button
              type="button"
              className={rowButtonClass}
              disabled={!customCareLabel.trim()}
              onClick={addCustomCare}
            >
              Add completed care
            </button>
          </fieldset>
          <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
            {addCareMessage}
          </p>
        </div>
      ) : null}

      {entries.length ? (
        <ol className="space-y-3" aria-label="Treatment completed today entries">
          {entries.map((entry, index) => {
            const linkedRadiograph = entry.procedureSource === "radiographs";
            const preview = formatAdultHygieneTreatmentEntry(
              entry,
              orderTreatmentToothAreas,
            );
            const methods = new Set(entry.instrumentation ?? []);
            const canMoveEarlier =
              index > 0 &&
              !linkedRadiograph &&
              entries[index - 1].procedureSource !== "radiographs";
            const canMoveLater =
              index < entries.length - 1 &&
              !linkedRadiograph &&
              entries[index + 1].procedureSource !== "radiographs";

            return (
              <li
                key={entry.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold">
                      {entry.procedureKind === "scaling"
                        ? "Scaling"
                        : entry.procedureKind === "polish"
                          ? "Selective polish"
                          : entry.procedureKind === "ohe"
                            ? "Oral hygiene education"
                            : entry.procedureKind === "radiograph"
                              ? "Radiographs"
                              : entry.procedureKind === "recare-exam"
                                ? "Dentist Recare Exam"
                                : entry.procedureKind === "product-application"
                                  ? entry.treatmentType
                                  : entry.careCategory
                                    ? COMPLETED_CARE_CATEGORY_LABELS[
                                        entry.careCategory
                                      ]
                                    : "Other completed care"}
                    </h4>
                    {entry.procedureSource ? (
                      <span className="mt-1 inline-flex rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {entry.procedureSource === "radiographs"
                          ? "Linked from Radiographs taken today"
                          : entry.procedureSource === "recare-exam"
                            ? "Recare action"
                            : entry.procedureSource === "ohe"
                              ? "Linked to education provided"
                              : "Standard treatment"}
                      </span>
                    ) : null}
                  </div>
                  {linkedRadiograph ? (
                    <a
                      href="#adult-hygiene-radiographs"
                      className="text-sm font-semibold text-sky-700 hover:underline dark:text-sky-300"
                    >
                      Edit radiographs
                    </a>
                  ) : null}
                </div>

                {entry.procedureKind === "scaling" ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <QuantityStepper
                      id={`adult-hygiene-${entry.id}-units`}
                      label="Scaling units"
                      value={entry.quantity ?? ""}
                      defaultValue="3"
                      onChange={(quantity) => updateEntry(entry.id, { quantity })}
                    />
                    <ClinicalLocationMultiCombobox
                      id={`adult-hygiene-${entry.id}-area`}
                      label="Area"
                      preset="treatment"
                      values={entry.toothAreas}
                      onChange={(toothAreas) =>
                        updateEntry(entry.id, { toothAreas })
                      }
                    />
                    <fieldset className="space-y-2 md:col-span-2">
                      <legend className="text-sm font-medium">
                        Instrumentation
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {(["hand", "power"] as const).map((method) => (
                          <InstrumentationToggle
                            key={method}
                            method={method}
                            active={methods.has(method)}
                            onChange={(active) =>
                              toggleInstrumentation(entry, method, active)
                            }
                          />
                        ))}
                      </div>
                    </fieldset>
                    {methods.has("power") ? (
                      <div className="md:col-span-2">
                        <StaticSuggestionCombobox
                          id={`adult-hygiene-${entry.id}-power-device`}
                          label="Power device"
                          value={entry.powerDevice ?? ""}
                          suggestions={["Cavitron", "Piezo"]}
                          onChange={(powerDevice) =>
                            updateEntry(entry.id, { powerDevice })
                          }
                          placeholder="Select or enter a power device"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : entry.procedureKind === "polish" ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <QuantityStepper
                      id={`adult-hygiene-${entry.id}-units`}
                      label="Polish units"
                      value={entry.quantity ?? ""}
                      defaultValue="1"
                      onChange={(quantity) => updateEntry(entry.id, { quantity })}
                    />
                    <CatalogueCombobox
                      id={`adult-hygiene-${entry.id}-product`}
                      label="Polish product"
                      catalogueKey="hygiene-treatment.polishing-products"
                      value={entry.product ?? ""}
                      onChange={(product) =>
                        updatePolishingProduct(entry.id, product)
                      }
                      rememberActionLabel="Remember polishing product"
                      unhideActionLabel="Unhide polishing product"
                      roomyActions
                      showAllSuggestionsWhenSelected
                    />
                    <div className="md:col-span-2">
                      <ClinicalLocationMultiCombobox
                        id={`adult-hygiene-${entry.id}-area`}
                        label="Area (optional)"
                        preset="treatment"
                        values={entry.toothAreas}
                        onChange={(toothAreas) =>
                          updateEntry(entry.id, { toothAreas })
                        }
                      />
                    </div>
                  </div>
                ) : entry.procedureKind === "product-application" &&
                  entry.productApplicationType ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <CatalogueCombobox
                      id={`adult-hygiene-${entry.id}-preventive-product`}
                      label={
                        entry.productApplicationType === "fluoride-varnish"
                          ? "Fluoride varnish product"
                          : entry.productApplicationType ===
                              "silver-diamine-fluoride"
                            ? "SDF product"
                            : "Desensitizing product"
                      }
                      catalogueKey="hygiene-treatment.desensitizer"
                      value={entry.product ?? ""}
                      onChange={(product) => updateEntry(entry.id, { product })}
                      suggestionFilter={(item) => {
                        const metadata =
                          isDesensitizingRemineralizingProductMetadata(
                            item.metadata,
                          )
                            ? item.metadata
                            : undefined;
                        return (
                          !metadata ||
                          metadata.productType === entry.productApplicationType
                        );
                      }}
                      rememberMetadata={{
                        kind: "desensitizing-remineralizing-product",
                        productType: entry.productApplicationType,
                      }}
                      rememberActionLabel="Remember product"
                      unhideActionLabel="Unhide product"
                      roomyActions
                      showAllSuggestionsWhenSelected
                    />
                    <ClinicalLocationMultiCombobox
                      id={`adult-hygiene-${entry.id}-area`}
                      label="Tooth/area"
                      preset="treatment"
                      values={entry.toothAreas}
                      onChange={(toothAreas) =>
                        updateEntry(entry.id, { toothAreas })
                      }
                    />
                  </div>
                ) : entry.procedureKind === "ohe" ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label
                        className="text-sm font-medium"
                        htmlFor={`adult-hygiene-${entry.id}-details`}
                      >
                        Treatment-line recap
                      </label>
                      <textarea
                        id={`adult-hygiene-${entry.id}-details`}
                        className={`${inputClass} min-h-20 resize-y`}
                        value={entry.details ?? ""}
                        readOnly={!entry.detailsCustomized}
                        placeholder="Document education provided to the patient"
                        onChange={(event) =>
                          updateEntry(entry.id, {
                            details: event.target.value,
                            detailsCustomized: true,
                          })
                        }
                      />
                    </div>
                    {entry.detailsCustomized ? (
                      <button
                        type="button"
                        className={rowButtonClass}
                        onClick={() =>
                          updateEntry(entry.id, {
                            details: oheRecap,
                            detailsCustomized: false,
                          })
                        }
                      >
                        Reset from education
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={rowButtonClass}
                        onClick={() =>
                          updateEntry(entry.id, { detailsCustomized: true })
                        }
                      >
                        Customize recap
                      </button>
                    )}
                  </div>
                ) : linkedRadiograph || entry.procedureKind === "recare-exam" ? null : (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <CatalogueCombobox
                      id={`adult-hygiene-treatment-completed-${entry.id}-type`}
                      label="Completed care"
                      catalogueKey="hygiene-treatment.completed"
                      value={entry.treatmentType}
                      onChange={(treatmentType) =>
                        updateEntry(entry.id, { treatmentType })
                      }
                      rememberActionLabel="Remember completed care"
                      unhideActionLabel="Unhide completed care"
                      roomyActions
                    />
                    <ClinicalLocationMultiCombobox
                      id={`adult-hygiene-treatment-completed-${entry.id}-tooth-area`}
                      label="Tooth/area"
                      preset="treatment"
                      values={entry.toothAreas}
                      onChange={(toothAreas) =>
                        updateEntry(entry.id, { toothAreas })
                      }
                    />
                  </div>
                )}

                {preview ? (
                  <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <span className="font-medium">Note preview:</span> {preview}
                  </p>
                ) : null}

                {!linkedRadiograph ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <TooltipActionButton
                      tooltip="Move this treatment line earlier in the note."
                      className={rowButtonClass}
                      disabled={!canMoveEarlier}
                      ariaLabel={`Move treatment completed item ${index + 1} earlier`}
                      onClick={() => moveEntry(index, "earlier")}
                    >
                      Earlier
                    </TooltipActionButton>
                    <TooltipActionButton
                      tooltip="Move this treatment line later in the note."
                      className={rowButtonClass}
                      disabled={!canMoveLater}
                      ariaLabel={`Move treatment completed item ${index + 1} later`}
                      onClick={() => moveEntry(index, "later")}
                    >
                      Later
                    </TooltipActionButton>
                    <TooltipActionButton
                      tooltip="Remove this treatment line from the note."
                      className={removeButtonClass}
                      ariaLabel={`Remove treatment completed item ${index + 1}`}
                      onClick={() =>
                        onChange(
                          entries.filter(
                            (candidate) => candidate.id !== entry.id,
                          ),
                        )
                      }
                    >
                      Remove
                    </TooltipActionButton>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
          No treatment completed today added.
        </p>
      )}
    </section>
  );
}
