"use client";

import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { ClinicalLocationMultiCombobox } from "@/components/forms/ClinicalLocationMultiCombobox";
import { formControlClass } from "@/components/forms/controlStyles";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { Time24Input } from "@/components/forms/Time24Input";
import { isLocalAnestheticCatalogueMetadata } from "@/lib/catalogues/catalogue";
import { getCurrentTimeString } from "@/lib/templates/date";
import {
  localAnesthesiaInjectionTypes,
  localAnesthesiaTopicalApplicationTypes,
  type LocalAnesthesiaEntry,
  type LocalAnesthesiaRoute,
  type LocalAnesthesiaValue,
} from "@/lib/templates/localAnesthesia";

const dyclonineCatalogueItemId =
  "seed.hygiene-treatment.anesthetic.dyclonine-rinse";
const benzocaineCatalogueItemId =
  "seed.hygiene-treatment.anesthetic.benzocaine-20";
const buttonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const timeActionButtonClass =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 px-3 text-xs font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const inputClass = formControlClass();
const routeOptions: ReadonlyArray<{
  value: LocalAnesthesiaRoute;
  label: string;
}> = [
  { value: "injection", label: "Injection" },
  { value: "topical", label: "Topical" },
  { value: "rinse", label: "Rinse" },
];

function currentTime(): string {
  return getCurrentTimeString();
}

function newEntry(route: LocalAnesthesiaRoute): LocalAnesthesiaEntry {
  return {
    id: `local-anesthesia-${Date.now()}-${
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(16).slice(2)
    }`,
    route,
    administrationType: "",
    toothAreas: route === "rinse" ? ["full mouth"] : [],
    product: "",
    amountMl: route === "injection" ? "1.8" : "",
    durationSeconds: "",
    timeAdministered: currentTime(),
  };
}

export function LocalAnesthesiaControl({
  value,
  onChange,
}: {
  value: LocalAnesthesiaValue;
  onChange: (value: LocalAnesthesiaValue) => void;
}) {
  const { getItems } = useCatalogues();
  const products = getItems("hygiene-treatment.anesthetic").filter((item) =>
    isLocalAnestheticCatalogueMetadata(item.metadata),
  );
  const dyclonine = products.find(
    (item) => item.id === dyclonineCatalogueItemId,
  );
  const benzocaine = products.find(
    (item) => item.id === benzocaineCatalogueItemId,
  );
  const hasDyclonineRinse = value.localAnesthesiaEntries.some(
    (entry) => entry.catalogueItemId === dyclonineCatalogueItemId,
  );
  const hasBenzocaineTopical = value.localAnesthesiaEntries.some(
    (entry) => entry.catalogueItemId === benzocaineCatalogueItemId,
  );
  const assessmentIncomplete =
    value.localAnesthesiaEntries.length > 0 &&
    (!value.localAnesthesiaNoContraindication ||
      !value.localAnesthesiaNoAdverseReactions ||
      !value.localAnesthesiaAdequateAchieved);

  function updateEntry(
    entryId: string,
    patch: Partial<Omit<LocalAnesthesiaEntry, "id">>,
  ) {
    onChange({
      ...value,
      localAnesthesiaEntries: value.localAnesthesiaEntries.map((entry) =>
        entry.id === entryId ? { ...entry, ...patch } : entry,
      ),
    });
  }

  function addEntry(route: LocalAnesthesiaRoute) {
    onChange({
      ...value,
      localAnesthesiaEntries: [
        ...value.localAnesthesiaEntries,
        newEntry(route),
      ],
    });
  }

  function applyDyclonineRinse() {
    if (!dyclonine || hasDyclonineRinse) return;
    const metadata = isLocalAnestheticCatalogueMetadata(dyclonine.metadata)
      ? dyclonine.metadata
      : undefined;
    onChange({
      ...value,
      localAnesthesiaEntries: [
        ...value.localAnesthesiaEntries,
        {
          ...newEntry("rinse"),
          product: dyclonine.label,
          catalogueItemId: dyclonine.id,
          amountMl: String(metadata?.defaultAmountMl ?? 5),
          durationSeconds: String(metadata?.defaultDurationSeconds ?? 60),
        },
      ],
    });
  }

  function applyBenzocaineTopical() {
    if (!benzocaine || hasBenzocaineTopical) return;
    const metadata = isLocalAnestheticCatalogueMetadata(benzocaine.metadata)
      ? benzocaine.metadata
      : undefined;
    onChange({
      ...value,
      localAnesthesiaEntries: [
        ...value.localAnesthesiaEntries,
        {
          ...newEntry("topical"),
          administrationType: "Mucosal application",
          toothAreas: ["before injection"],
          product: benzocaine.label,
          catalogueItemId: benzocaine.id,
          amountMl: String(metadata?.defaultAmountMl ?? 0.5),
        },
      ],
    });
  }

  return (
    <fieldset
      className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-label="Local anesthesia"
    >
      <legend className="px-1 font-semibold">Local Anesthesia</legend>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <NativeChoiceControl
          type="checkbox"
          checked={value.localAnesthesiaNoContraindication}
          onChange={(localAnesthesiaNoContraindication) =>
            onChange({ ...value, localAnesthesiaNoContraindication })
          }
        >
          No C/I to LA
        </NativeChoiceControl>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${buttonClass} border-sky-700 text-sky-800 dark:border-sky-400 dark:text-sky-200`}
            disabled={!benzocaine || hasBenzocaineTopical}
            onClick={applyBenzocaineTopical}
          >
            {hasBenzocaineTopical
              ? "Benzocaine topical applied"
              : "Apply Benzocaine topical"}
          </button>
          <button
            type="button"
            className={`${buttonClass} border-sky-700 text-sky-800 dark:border-sky-400 dark:text-sky-200`}
            disabled={!dyclonine || hasDyclonineRinse}
            onClick={applyDyclonineRinse}
          >
            {hasDyclonineRinse
              ? "Dyclonine rinse applied"
              : "Apply Dyclonine rinse"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass}
          onClick={() => addEntry("injection")}
        >
          Add injection entry
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => addEntry("topical")}
        >
          Add topical entry
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => addEntry("rinse")}
        >
          Add rinse entry
        </button>
      </div>

      {value.localAnesthesiaEntries.length ? (
        <ol className="space-y-3" aria-label="Local anesthesia entries">
          {value.localAnesthesiaEntries.map((entry, index) => {
            const routeProducts = products.filter(
              (item) =>
                item.metadata?.kind === "local-anesthetic" &&
                item.metadata.route === entry.route,
            );
            const typeOptions =
              entry.route === "injection"
                ? localAnesthesiaInjectionTypes
                : localAnesthesiaTopicalApplicationTypes;
            return (
              <li
                key={entry.id}
                className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold">
                    Local anesthesia entry #{index + 1}
                  </h4>
                  <button
                    type="button"
                    className={`${buttonClass} border-red-300 text-red-800 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950`}
                    onClick={() =>
                      onChange({
                        ...value,
                        localAnesthesiaEntries:
                          value.localAnesthesiaEntries.filter(
                            (candidate) => candidate.id !== entry.id,
                          ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                  <div className="text-sm lg:col-span-3">
                    <FixedChoiceListbox
                      id={`local-anesthesia-route-${entry.id}`}
                      label="Route"
                      value={entry.route}
                      options={routeOptions}
                      onChange={(route) => {
                        updateEntry(entry.id, {
                          route,
                          administrationType: "",
                          toothAreas: route === "rinse" ? ["full mouth"] : [],
                          product: "",
                          catalogueItemId: undefined,
                          amountMl: route === "injection" ? "1.8" : "",
                          durationSeconds: "",
                        });
                      }}
                    />
                  </div>

                  {entry.route !== "rinse" ? (
                    <div className="text-sm lg:col-span-3">
                      <FixedChoiceListbox
                        id={`local-anesthesia-administration-type-${entry.id}`}
                        label={
                          entry.route === "injection"
                            ? "Injection type"
                            : "Application type"
                        }
                        value={entry.administrationType}
                        options={[
                          { value: "", label: "None selected" },
                          ...typeOptions.map((option) => ({
                            value: option,
                            label: option,
                          })),
                        ]}
                        onChange={(administrationType) =>
                          updateEntry(entry.id, {
                            administrationType,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <label className="text-sm font-medium lg:col-span-3">
                      Duration (s)
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`mt-1 ${inputClass}`}
                        value={entry.durationSeconds}
                        onChange={(event) =>
                          updateEntry(entry.id, {
                            durationSeconds: event.target.value,
                          })
                        }
                      />
                    </label>
                  )}

                  <div className="text-sm md:col-span-2 lg:col-span-3">
                    <ClinicalLocationMultiCombobox
                      id={`local-anesthesia-${entry.id}-tooth-area`}
                      label="Tooth/area"
                      preset={`local-anesthesia-${entry.route}`}
                      values={entry.toothAreas}
                      onChange={(toothAreas) =>
                        updateEntry(entry.id, { toothAreas })
                      }
                    />
                  </div>

                  <div className="text-sm md:col-span-1 lg:col-span-3">
                    <FixedChoiceListbox
                      id={`local-anesthesia-product-${entry.id}`}
                      label="Anesthetic product"
                      value={entry.catalogueItemId ?? ""}
                      options={[
                        { value: "", label: "None selected" },
                        ...routeProducts.map((item) => ({
                          value: item.id,
                          label: item.label,
                        })),
                      ]}
                      onChange={(catalogueItemId) => {
                        const item = routeProducts.find(
                          (candidate) => candidate.id === catalogueItemId,
                        );
                        const metadata = isLocalAnestheticCatalogueMetadata(
                          item?.metadata,
                        )
                          ? item.metadata
                          : undefined;
                        updateEntry(entry.id, {
                          product: item?.label ?? "",
                          catalogueItemId: item?.id,
                          amountMl: metadata
                            ? String(metadata.defaultAmountMl)
                            : entry.amountMl,
                          durationSeconds: metadata?.defaultDurationSeconds
                            ? String(metadata.defaultDurationSeconds)
                            : "",
                        });
                      }}
                    />
                  </div>

                  <label className="text-sm font-medium sm:col-span-1 md:col-span-1 lg:col-span-3">
                    Amount (mL)
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className={`mt-1 ${inputClass}`}
                      value={entry.amountMl}
                      onChange={(event) =>
                        updateEntry(entry.id, { amountMl: event.target.value })
                      }
                    />
                  </label>

                  <div className="text-sm font-medium md:col-span-2 lg:col-span-9">
                    <label htmlFor={`local-anesthesia-time-${entry.id}`}>
                      Time administered
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Time24Input
                        id={`local-anesthesia-time-${entry.id}`}
                        className={`${inputClass} min-w-36 flex-1`}
                        value={entry.timeAdministered}
                        onChange={(timeAdministered) =>
                          updateEntry(entry.id, {
                            timeAdministered,
                          })
                        }
                      />
                      <button
                        type="button"
                        className={timeActionButtonClass}
                        onClick={() =>
                          updateEntry(entry.id, {
                            timeAdministered: currentTime(),
                          })
                        }
                      >
                        Set to now
                      </button>
                      <button
                        type="button"
                        className={timeActionButtonClass}
                        onClick={() =>
                          updateEntry(entry.id, { timeAdministered: "" })
                        }
                      >
                        Clear time
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      <div
        className={`space-y-3 rounded-xl border p-4 ${
          assessmentIncomplete
            ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <h4 className="font-semibold">Post-anesthetic assessment</h4>
        {assessmentIncomplete ? (
          <p
            className="text-sm text-amber-900 dark:text-amber-200"
            role="alert"
          >
            Confirm No C/I to LA and complete the post-anesthetic assessment
            before finishing the note.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <NativeChoiceControl
            type="checkbox"
            checked={value.localAnesthesiaNoAdverseReactions}
            onChange={(localAnesthesiaNoAdverseReactions) =>
              onChange({ ...value, localAnesthesiaNoAdverseReactions })
            }
          >
            No adverse reactions noted
          </NativeChoiceControl>
          <NativeChoiceControl
            type="checkbox"
            checked={value.localAnesthesiaAdequateAchieved}
            onChange={(localAnesthesiaAdequateAchieved) =>
              onChange({ ...value, localAnesthesiaAdequateAchieved })
            }
          >
            Adequate anesthesia achieved
          </NativeChoiceControl>
        </div>
        <label className="block text-sm font-medium">
          Anesthesia notes
          <textarea
            className={`mt-1 min-h-24 ${inputClass}`}
            value={value.localAnesthesiaNotes}
            onChange={(event) =>
              onChange({ ...value, localAnesthesiaNotes: event.target.value })
            }
          />
        </label>
      </div>
    </fieldset>
  );
}
