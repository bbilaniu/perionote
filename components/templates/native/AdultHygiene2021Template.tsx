"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { CatalogueCombobox } from "@/components/catalogues/CatalogueCombobox";
import { CatalogueMultiCombobox } from "@/components/catalogues/CatalogueMultiCombobox";
import { formControlClass } from "@/components/forms/controlStyles";
import {
  FixedChoiceMultiCombobox,
  type FixedChoiceMultiComboboxGroup,
} from "@/components/forms/FixedChoiceMultiCombobox";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import { StaticSuggestionCombobox } from "@/components/forms/StaticSuggestionCombobox";
import { TooltipActionButton } from "@/components/forms/TooltipActionButton";
import {
  type AdultHygieneTreatmentCompletedEntry,
  type AdultHygiene2021Form,
  brushingFrequencyChoices,
  createEmptyAdultHygiene2021Form,
  diseaseAndRiskOheTopicChoices,
  flossingFrequencyChoices,
  hasRequiredAdultHygiene2021Fields,
  homeCareOheTopicChoices,
  oheTopicChoices,
  periodontitisGradeChoices,
  periodontitisStageChoices,
  preventionAndMaintenanceOheTopicChoices,
  treatmentToothAreaChoices,
} from "@/lib/templates/adultHygiene2021";
import { applyPatientChiefConcernSelectionRules } from "@/lib/templates/patientChiefConcern";
import type {
  DocumentationStatus,
  PremedicationStatus,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { formatRecareExamLocalTimestamp } from "@/lib/templates/summary/buildRecareExamSummary";

const inputClass = `mt-1 ${formControlClass()}`;
const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const checkboxClass = "mt-1 h-4 w-4 accent-sky-700";
const treatmentRowButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const treatmentRowRemoveButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";
const adultHygieneDiscardWarning =
  "Clear all entered 2021 Adult Hygiene values and start a new note? This cannot be undone.";
const psrSextantOrder = [1, 2, 3, 6, 5, 4] as const;
const treatmentToothAreaChoiceGroups = [
  {
    choices: ["full mouth", "maxilla", "mandible"],
    columns: 1,
  },
  {
    label: "Quadrants",
    choices: ["Q1", "Q2", "Q4", "Q3"],
    columns: 2,
  },
  {
    label: "Sextants",
    choices: ["S1", "S2", "S3", "S6", "S5", "S4"],
    columns: 3,
  },
] as const;

const oheTopicChoiceGroups = [
  {
    label: "Home-care techniques",
    choices: homeCareOheTopicChoices,
  },
  {
    label: "Disease and risk",
    choices: diseaseAndRiskOheTopicChoices,
  },
  {
    label: "Prevention and maintenance",
    choices: preventionAndMaintenanceOheTopicChoices,
  },
] as const;

const extentFacetChoices = ["Localized", "Generalized"] as const;
const mildIntensityFacetChoices = ["mild", "moderate", "heavy"] as const;
const plaqueLocationFacetChoices = ["marginal", "interproximal"] as const;
const plaqueFacetChoices = [
  ...extentFacetChoices,
  ...mildIntensityFacetChoices,
  ...plaqueLocationFacetChoices,
] as const;
const plaqueFacetGroups = [
  {
    label: "Extent",
    choices: extentFacetChoices,
    columns: 2,
    selectionMode: "single",
  },
  {
    label: "Intensity",
    choices: mildIntensityFacetChoices,
    columns: 3,
    selectionMode: "single",
  },
  {
    label: "Location",
    choices: plaqueLocationFacetChoices,
    columns: 2,
    selectionMode: "single",
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const stainIntensityFacetChoices = ["slight", "moderate", "heavy"] as const;
const stainFacetChoices = [
  "None",
  ...extentFacetChoices,
  ...stainIntensityFacetChoices,
] as const;
const stainFacetGroups = [
  {
    label: "Finding",
    choices: ["None"],
    columns: 1,
    selectionMode: "single",
  },
  {
    label: "Extent",
    choices: extentFacetChoices,
    columns: 2,
    selectionMode: "single",
  },
  {
    label: "Intensity",
    choices: stainIntensityFacetChoices,
    columns: 3,
    selectionMode: "single",
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const calculusLocationFacetChoices = [
  "marginal",
  "interproximal",
] as const;
const calculusFacetChoices = [
  ...extentFacetChoices,
  ...mildIntensityFacetChoices,
  ...calculusLocationFacetChoices,
] as const;
const calculusFacetGroups = [
  {
    label: "Extent",
    choices: extentFacetChoices,
    columns: 2,
    selectionMode: "single",
  },
  {
    label: "Intensity",
    choices: mildIntensityFacetChoices,
    columns: 3,
    selectionMode: "single",
  },
  {
    label: "Location",
    choices: calculusLocationFacetChoices,
    columns: 2,
    selectionMode: "multiple",
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const bleedingSeverityFacetChoices = ["mild", "moderate", "severe"] as const;
const bleedingFacetChoices = [
  ...extentFacetChoices,
  ...bleedingSeverityFacetChoices,
] as const;
const bleedingFacetGroups = [
  {
    label: "Extent",
    choices: extentFacetChoices,
    columns: 2,
    selectionMode: "single",
  },
  {
    label: "Severity",
    choices: bleedingSeverityFacetChoices,
    columns: 3,
    selectionMode: "single",
  },
] as const satisfies readonly FixedChoiceMultiComboboxGroup[];

const documentationStatusOptions: Array<{
  value: DocumentationStatus;
  label: string;
}> = [
  { value: "not-documented", label: "Not documented" },
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  required,
  error,
  inputRef,
  type = "text",
  readOnly,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  type?: "text" | "date";
  readOnly?: boolean;
  placeholder?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        ref={inputRef}
        id={id}
        className={`${inputClass} ${
          type === "date" ? "h-10 appearance-none" : ""
        }`}
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={`${inputClass} min-h-24 resize-y`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function parseFacetedChoice(
  choice: string,
  facetChoices: readonly string[],
) {
  const selectedTokens = new Set(
    choice
      .normalize("NFKC")
      .trim()
      .toLocaleLowerCase("en-CA")
      .split(/[\s/]+/)
      .filter(Boolean),
  );
  return facetChoices.filter((facet) =>
    selectedTokens.has(
      facet.normalize("NFKC").trim().toLocaleLowerCase("en-CA"),
    ),
  );
}

function FacetedChoiceWithOther({
  id,
  label,
  choice,
  other,
  facetChoices,
  facetGroups,
  onChoiceChange,
  onOtherChange,
  formatChoice = (values) => values.join(" "),
  standaloneValue,
}: {
  id: string;
  label: string;
  choice: string;
  other: string;
  facetChoices: readonly string[];
  facetGroups: readonly FixedChoiceMultiComboboxGroup[];
  onChoiceChange: (choice: string) => void;
  onOtherChange: (other: string) => void;
  formatChoice?: (values: string[]) => string;
  standaloneValue?: string;
}) {
  const selectedFacets = parseFacetedChoice(choice, facetChoices);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <FixedChoiceMultiCombobox
        id={`${id}-choice`}
        label={label}
        choices={facetChoices}
        choiceGroups={facetGroups}
        values={selectedFacets}
        onChange={(values) => {
          let nextValues = values;
          if (standaloneValue) {
            const hadStandaloneValue = selectedFacets.includes(standaloneValue);
            const hasStandaloneValue = values.includes(standaloneValue);
            if (hasStandaloneValue && !hadStandaloneValue) {
              nextValues = [standaloneValue];
            } else if (hadStandaloneValue && values.length > 1) {
              nextValues = values.filter(
                (value) => value !== standaloneValue,
              );
            }
          }
          const nextChoice = formatChoice(nextValues);
          onChoiceChange(nextChoice);
          if (nextChoice) {
            onOtherChange("");
          }
        }}
        customPlaceholder={`Search ${label.toLocaleLowerCase("en-CA")} options`}
        customHelpText="Choose options in each applicable section."
        showSelectedChips={false}
        allowCustomValues={false}
      />
      <TextField
        id={`${id}-other`}
        label={`Other ${label.toLocaleLowerCase("en-CA")}`}
        value={other}
        onChange={(value) => {
          onOtherChange(value);
          if (value.trim()) {
            onChoiceChange("");
          }
        }}
        placeholder="Optional custom value"
      />
    </div>
  );
}

function ChoiceWithComment({
  id,
  label,
  choice,
  comment,
  commentLabel,
  choices,
  onChoiceChange,
  onCommentChange,
}: {
  id: string;
  label: string;
  choice: string;
  comment: string;
  commentLabel: string;
  choices: readonly string[];
  onChoiceChange: (choice: string) => void;
  onCommentChange: (comment: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <FixedChoiceListbox
        id={`${id}-choice`}
        label={label}
        value={choice}
        options={[
          { value: "", label: "Not documented" },
          ...choices.map((value) => ({ value, label: value })),
        ]}
        onChange={onChoiceChange}
      />
      <TextField
        id={`${id}-comments`}
        label={commentLabel}
        value={comment}
        onChange={onCommentChange}
        placeholder="Optional comments"
      />
    </div>
  );
}

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        id={id}
        type="checkbox"
        className={checkboxClass}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function TreatmentCompletedList({
  entries,
  onAdd,
  onChange,
}: {
  entries: AdultHygieneTreatmentCompletedEntry[];
  onAdd: () => void;
  onChange: (entries: AdultHygieneTreatmentCompletedEntry[]) => void;
}) {
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

  function moveEntry(index: number, direction: "earlier" | "later") {
    const targetIndex = direction === "earlier" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;
    const reordered = [...entries];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    onChange(reordered);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Treatment completed today</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Treatment types can be remembered. Select one or more standard
        Tooth/area choices, or add custom text for this note only.
      </p>
      {entries.length ? (
        <ol
          className="space-y-3"
          aria-label="Treatment completed today entries"
        >
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <CatalogueCombobox
                  id={`adult-hygiene-treatment-completed-${entry.id}-type`}
                  label="Treatment type"
                  catalogueKey="hygiene-treatment.completed"
                  value={entry.treatmentType}
                  onChange={(value) =>
                    updateEntry(entry.id, { treatmentType: value })
                  }
                  rememberActionLabel="Remember treatment type"
                  unhideActionLabel="Unhide treatment type"
                  roomyActions
                />
                <FixedChoiceMultiCombobox
                  id={`adult-hygiene-treatment-completed-${entry.id}-tooth-area`}
                  label="Tooth/area"
                  choices={treatmentToothAreaChoices}
                  choiceGroups={treatmentToothAreaChoiceGroups}
                  values={entry.toothAreas}
                  onChange={(values) =>
                    updateEntry(entry.id, { toothAreas: values })
                  }
                  customPlaceholder="Search or add a Tooth/area"
                  showSelectedChips={false}
                />
                <div className="flex flex-wrap items-start gap-2 md:col-span-2">
                  <TooltipActionButton
                    tooltip="Move this treatment line earlier in the note."
                    className={treatmentRowButtonClass}
                    disabled={index === 0}
                    ariaLabel={`Move treatment completed item ${index + 1} earlier`}
                    onClick={() => moveEntry(index, "earlier")}
                  >
                    Earlier
                  </TooltipActionButton>
                  <TooltipActionButton
                    tooltip="Move this treatment line later in the note."
                    className={treatmentRowButtonClass}
                    disabled={index === entries.length - 1}
                    ariaLabel={`Move treatment completed item ${index + 1} later`}
                    onClick={() => moveEntry(index, "later")}
                  >
                    Later
                  </TooltipActionButton>
                  <TooltipActionButton
                    tooltip="Remove this treatment line from the note."
                    className={treatmentRowRemoveButtonClass}
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
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
          No treatment completed today added.
        </p>
      )}
      <button type="button" className={treatmentRowButtonClass} onClick={onAdd}>
        Add treatment completed
      </button>
    </div>
  );
}

async function writeClipboard(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // The explicit fallback below supports browsers without clipboard access.
    }
  }
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);
  return copied;
}

export function AdultHygiene2021Template({
  fixture,
}: {
  fixture: AdultHygiene2021Form;
  summary: string;
}) {
  const [form, setForm] = useState<AdultHygiene2021Form>(
    createEmptyAdultHygiene2021Form,
  );
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [patientIdError, setPatientIdError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const patientIdRef = useRef<HTMLInputElement>(null);
  const dentistRef = useRef<HTMLInputElement>(null);
  const treatmentEntrySequence = useRef(0);

  useEffect(() => setStartedAt(new Date()), []);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = adultHygieneDiscardWarning;
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, []);

  const summary = useMemo(
    () =>
      buildAdultHygiene2021Summary(form, {
        ...(startedAt ? { startedAt } : {}),
      }),
    [form, startedAt],
  );

  function updateField<TKey extends keyof AdultHygiene2021Form>(
    key: TKey,
    value: AdultHygiene2021Form[TKey],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setCopyMessage("");
    if (key === "patientId" && String(value).trim()) {
      setPatientIdError("");
    }
    if (
      (key === "dentist" || key === "rdh" || key === "rda") &&
      String(value).trim()
    ) {
      setProviderError("");
    }
  }

  async function copyNote() {
    const missingPatientId = !form.patientId.trim();
    const missingProvider = ![form.dentist, form.rdh, form.rda].some((value) =>
      Boolean(value.trim()),
    );
    setPatientIdError(missingPatientId ? "Enter a Patient ID." : "");
    setProviderError(
      missingProvider ? "Enter at least one of Dentist, RDH, or RDA." : "",
    );
    setCopyMessage("");
    if (
      missingPatientId ||
      missingProvider ||
      !hasRequiredAdultHygiene2021Fields(form)
    ) {
      requestAnimationFrame(() => {
        (missingPatientId ? patientIdRef.current : dentistRef.current)?.focus();
      });
      return;
    }
    const copied = await writeClipboard(summary);
    setCopyMessage(
      copied
        ? "Note copied."
        : "The note could not be copied. Select the preview and copy it manually.",
    );
  }

  function loadDemo() {
    setForm({
      ...fixture,
      psrPocketing: [...fixture.psrPocketing],
      patientChiefConcern: [...fixture.patientChiefConcern],
      ohiAidsReviewed: [...fixture.ohiAidsReviewed],
      oheTopicsReviewed: [...fixture.oheTopicsReviewed],
      treatmentCompleted: fixture.treatmentCompleted.map((entry) => ({
        ...entry,
        toothAreas: [...entry.toothAreas],
      })),
    });
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("Synthetic demo data loaded.");
  }

  function resetForm() {
    if (!window.confirm(adultHygieneDiscardWarning)) return;
    setForm(createEmptyAdultHygiene2021Form());
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    patientIdRef.current?.focus();
  }

  function createTreatmentCompletedEntry(): AdultHygieneTreatmentCompletedEntry {
    treatmentEntrySequence.current += 1;
    return {
      id: `completed-${Date.now()}-${treatmentEntrySequence.current}`,
      treatmentType: "",
      toothAreas: [],
    };
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
          Pilot interactive conversion
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          2021 Adult Hygiene
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Complete the form and copy a structured Adult Hygiene note. Encounter
          values remain only in this page&apos;s memory. Deliberately remembered
          catalogue suggestions stay only in this browser profile.
        </p>
      </header>

      <form
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.8fr)]"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          void copyNote();
        }}
      >
        <div className="space-y-6">
          <Section title="Patient and Visit Context">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                id="adult-hygiene-patient-id"
                label="Patient ID"
                value={form.patientId}
                onChange={(value) => updateField("patientId", value)}
                required
                error={patientIdError}
                inputRef={patientIdRef}
              />
              <TextField
                id="adult-hygiene-note-started"
                label="Note started"
                value={
                  startedAt ? formatRecareExamLocalTimestamp(startedAt) : ""
                }
                onChange={() => undefined}
                readOnly
              />
              <TextField
                id="adult-hygiene-last-recall-date"
                label="Last recall date"
                value={form.noteLastRecallDate}
                onChange={(value) => updateField("noteLastRecallDate", value)}
                type="date"
              />
            </div>
          </Section>

          <Section
            title="Visit Team"
            description="At least one provider field is required before copying."
          >
            <fieldset
              aria-invalid={Boolean(providerError)}
              aria-describedby={
                providerError ? "adult-hygiene-provider-error" : undefined
              }
            >
              <legend className="sr-only">Visit team providers</legend>
              <div className="grid gap-4 md:grid-cols-3">
                <CatalogueCombobox
                  id="adult-hygiene-dentist"
                  label="Dentist"
                  catalogueKey="visit-team.dentist"
                  value={form.dentist}
                  onChange={(value) => updateField("dentist", value)}
                  inputRef={dentistRef}
                />
                <CatalogueCombobox
                  id="adult-hygiene-rdh"
                  label="RDH"
                  catalogueKey="visit-team.rdh"
                  value={form.rdh}
                  onChange={(value) => updateField("rdh", value)}
                />
                <CatalogueCombobox
                  id="adult-hygiene-rda"
                  label="RDA"
                  catalogueKey="visit-team.rda"
                  value={form.rda}
                  onChange={(value) => updateField("rda", value)}
                />
              </div>
              {providerError ? (
                <p
                  id="adult-hygiene-provider-error"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {providerError}
                </p>
              ) : null}
            </fieldset>
          </Section>

          <Section title="Consent, Medical History, and Sterilization">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center md:pt-6">
                <CheckboxField
                  id="adult-hygiene-class5"
                  label="Class 5 indicators checked"
                  checked={form.class5IndicatorStatus === "yes"}
                  onChange={(value) =>
                    updateField(
                      "class5IndicatorStatus",
                      value ? "yes" : "not-documented",
                    )
                  }
                />
              </div>
              <TextField
                id="adult-hygiene-miele-codes"
                label="Miele sterilization codes"
                value={form.mieleCodes}
                onChange={(value) => updateField("mieleCodes", value)}
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="font-semibold">Consent given by</legend>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select every applicable source.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <CheckboxField
                  id="adult-hygiene-consent-patient"
                  label="Patient"
                  checked={form.consentPatient}
                  onChange={(value) => updateField("consentPatient", value)}
                />
                <CheckboxField
                  id="adult-hygiene-consent-parent"
                  label="Parent"
                  checked={form.consentParent}
                  onChange={(value) => updateField("consentParent", value)}
                />
                <CheckboxField
                  id="adult-hygiene-consent-guardian"
                  label="Legal guardian"
                  checked={form.consentLegalGuardian}
                  onChange={(value) =>
                    updateField("consentLegalGuardian", value)
                  }
                />
              </div>
              {form.consentPatient ||
              form.consentParent ||
              form.consentLegalGuardian ? (
                <TextField
                  id="adult-hygiene-consent-details"
                  label="Consent details"
                  value={form.consentDetails}
                  onChange={(value) => updateField("consentDetails", value)}
                  placeholder="Optional details"
                />
              ) : null}
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="adult-hygiene-medical-history"
                label="Medical history reviewed"
                catalogueKey="medical-history.review"
                value={form.medicalHistoryReview}
                onChange={(value) => updateField("medicalHistoryReview", value)}
              />

              <div className="space-y-4">
                <FixedChoiceListbox<PremedicationStatus>
                  id="adult-hygiene-premedication"
                  label="Premedication"
                  value={form.premedicationStatus}
                  options={[
                    { value: "not-documented", label: "Not documented" },
                    { value: "not-required", label: "Not required" },
                    { value: "required", label: "Required" },
                  ]}
                  onChange={(value) =>
                    updateField("premedicationStatus", value)
                  }
                />
                {form.premedicationStatus === "required" ? (
                  <TextField
                    id="adult-hygiene-premedication-details"
                    label="Premedication details"
                    value={form.premedicationDetails}
                    onChange={(value) =>
                      updateField("premedicationDetails", value)
                    }
                  />
                ) : null}
              </div>
            </div>
          </Section>

          <Section title="Patient Concerns and Hygiene Findings">
            <CatalogueMultiCombobox
              id="adult-hygiene-chief-concern"
              label="Patient chief concern"
              catalogueKey="patient.chief-concerns"
              values={form.patientChiefConcern}
              onChange={(values) =>
                updateField(
                  "patientChiefConcern",
                  applyPatientChiefConcernSelectionRules(
                    form.patientChiefConcern,
                    values,
                  ),
                )
              }
              roomySelectionActions
            />
            <CheckboxField
              id="adult-hygiene-chief-concern-list-format"
              label="List each concern on a separate line in the note"
              checked={form.listChiefConcerns}
              onChange={(value) => updateField("listChiefConcerns", value)}
            />
            <TextareaField
              id="adult-hygiene-area-of-concern"
              label="Hygiene area of concern"
              value={form.hygieneAreaOfConcern}
              onChange={(value) => updateField("hygieneAreaOfConcern", value)}
            />
            <FacetedChoiceWithOther
              id="adult-hygiene-plaque"
              label="Plaque"
              choice={form.plaqueChoice}
              other={form.plaqueOther}
              facetChoices={plaqueFacetChoices}
              facetGroups={plaqueFacetGroups}
              onChoiceChange={(value) => updateField("plaqueChoice", value)}
              onOtherChange={(value) => updateField("plaqueOther", value)}
            />
            <FacetedChoiceWithOther
              id="adult-hygiene-stain"
              label="Stain"
              choice={form.stainChoice}
              other={form.stainOther}
              facetChoices={stainFacetChoices}
              facetGroups={stainFacetGroups}
              onChoiceChange={(value) => updateField("stainChoice", value)}
              onOtherChange={(value) => updateField("stainOther", value)}
              standaloneValue="None"
            />
            <FacetedChoiceWithOther
              id="adult-hygiene-calculus"
              label="Calculus"
              choice={form.calculusChoice}
              other={form.calculusOther}
              facetChoices={calculusFacetChoices}
              facetGroups={calculusFacetGroups}
              onChoiceChange={(value) => updateField("calculusChoice", value)}
              onOtherChange={(value) => updateField("calculusOther", value)}
              formatChoice={(values) => {
                const locationValues = values.filter((value) =>
                  calculusLocationFacetChoices.includes(
                    value as (typeof calculusLocationFacetChoices)[number],
                  ),
                );
                return [
                  ...values.filter(
                    (value) =>
                      !calculusLocationFacetChoices.includes(
                        value as (typeof calculusLocationFacetChoices)[number],
                      ),
                  ),
                  locationValues.join("/"),
                ]
                  .filter(Boolean)
                  .join(" ");
              }}
            />
            <FacetedChoiceWithOther
              id="adult-hygiene-bleeding"
              label="Bleeding"
              choice={form.bleedingChoice}
              other={form.bleedingOther}
              facetChoices={bleedingFacetChoices}
              facetGroups={bleedingFacetGroups}
              onChoiceChange={(value) => updateField("bleedingChoice", value)}
              onOtherChange={(value) => updateField("bleedingOther", value)}
            />
          </Section>

          <Section title="Periodontal Assessment">
            <fieldset>
              <legend className="font-semibold">PSR/Pocketing</legend>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Enter the six sextants in clockwise order. Blank sextants remain
                visibly unfilled when another sextant is documented.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {form.psrPocketing.map((value, index) => {
                  const sextant = psrSextantOrder[index];
                  return (
                    <TextField
                      key={sextant}
                      id={`adult-hygiene-psr-${sextant}`}
                      label={`Sextant ${sextant}`}
                      value={value}
                      onChange={(nextValue) => {
                        const next = [
                          ...form.psrPocketing,
                        ] as AdultHygiene2021Form["psrPocketing"];
                        next[index] = nextValue;
                        updateField("psrPocketing", next);
                      }}
                    />
                  );
                })}
              </div>
            </fieldset>
            <TextField
              id="adult-hygiene-recession"
              label="Recession"
              value={form.recession}
              onChange={(value) => updateField("recession", value)}
            />
            <CatalogueCombobox
              id="adult-hygiene-fmp-done"
              label="FMP done"
              catalogueKey="periodontal.fmp-done"
              value={form.fmpDone}
              onChange={(value) => updateField("fmpDone", value)}
            />
            <CatalogueCombobox
              id="adult-hygiene-health-gingivitis"
              label="Health/Gingivitis"
              catalogueKey="periodontal.health-gingivitis"
              value={form.healthGingivitis}
              onChange={(value) => updateField("healthGingivitis", value)}
            />
            <ChoiceWithComment
              id="adult-hygiene-periodontitis-stage"
              label="Periodontitis stage"
              choice={form.periodontitisStageChoice}
              comment={form.periodontitisStageComments}
              commentLabel="Periodontitis stage comments"
              choices={periodontitisStageChoices}
              onChoiceChange={(value) =>
                updateField("periodontitisStageChoice", value)
              }
              onCommentChange={(value) =>
                updateField("periodontitisStageComments", value)
              }
            />
            <ChoiceWithComment
              id="adult-hygiene-periodontitis-grade"
              label="Periodontitis grade"
              choice={form.periodontitisGradeChoice}
              comment={form.periodontitisGradeComments}
              commentLabel="Periodontitis grade comments"
              choices={periodontitisGradeChoices}
              onChoiceChange={(value) =>
                updateField("periodontitisGradeChoice", value)
              }
              onCommentChange={(value) =>
                updateField("periodontitisGradeComments", value)
              }
            />
          </Section>

          <Section title="Oral Hygiene and Education">
            <div className="grid gap-3 md:grid-cols-2">
              <CatalogueCombobox
                id="adult-hygiene-compliance"
                label="Oral hygiene compliance"
                catalogueKey="oral-hygiene.compliance"
                value={form.oralHygieneCompliance}
                onChange={(value) =>
                  updateField("oralHygieneCompliance", value)
                }
              />
              <TextField
                id="adult-hygiene-compliance-comment"
                label="Oral hygiene compliance comment"
                value={form.oralHygieneComplianceComment}
                onChange={(value) =>
                  updateField("oralHygieneComplianceComment", value)
                }
                placeholder="Optional comment"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <StaticSuggestionCombobox
                id="adult-hygiene-flossing"
                label="Flossing frequency"
                value={form.flossingFrequency}
                suggestions={flossingFrequencyChoices}
                onChange={(value) => updateField("flossingFrequency", value)}
                placeholder="Select or enter a flossing frequency"
              />
              <StaticSuggestionCombobox
                id="adult-hygiene-brushing"
                label="Brushing frequency"
                value={form.brushingFrequency}
                suggestions={brushingFrequencyChoices}
                onChange={(value) => updateField("brushingFrequency", value)}
                placeholder="Select or enter a brushing frequency"
              />
            </div>
            <CheckboxField
              id="adult-hygiene-home-care-reviewed"
              label="Standard home-care instruction reviewed"
              checked={form.homeCareInstructionReviewed}
              onChange={(value) =>
                updateField("homeCareInstructionReviewed", value)
              }
            />
            <CatalogueMultiCombobox
              id="adult-hygiene-ohi-aids"
              label="OH aids reviewed/recommended"
              catalogueKey="oral-hygiene.aids-reviewed"
              values={form.ohiAidsReviewed}
              onChange={(value) => updateField("ohiAidsReviewed", value)}
              roomySelectionActions
            />
            <CheckboxField
              id="adult-hygiene-disease-process-reviewed"
              label="Disease process reviewed with patient today"
              checked={form.diseaseProcessReviewed}
              onChange={(value) => updateField("diseaseProcessReviewed", value)}
            />
            <FixedChoiceMultiCombobox
              id="adult-hygiene-ohe-topics"
              label="Additional OHE topics reviewed"
              choices={oheTopicChoices}
              choiceGroups={oheTopicChoiceGroups}
              values={form.oheTopicsReviewed}
              onChange={(values) => updateField("oheTopicsReviewed", values)}
              customPlaceholder="Search OHE topics"
              customHelpText=""
              showSelectedChips={false}
              allowCustomValues={false}
            />
            <TextareaField
              id="adult-hygiene-ohe-notes"
              label="OHE notes"
              value={form.oheNotes}
              onChange={(value) => updateField("oheNotes", value)}
              placeholder="Optional OHE details discussed today"
            />
            <TextareaField
              id="adult-hygiene-goal"
              label="Hygiene goal"
              value={form.hygieneGoal}
              onChange={(value) => updateField("hygieneGoal", value)}
            />
          </Section>

          <Section title="Treatment">
            <fieldset className="space-y-3">
              <legend className="font-semibold">Treatment recommended</legend>
              <CheckboxField
                id="adult-hygiene-treatment-recommended-maintenance"
                label="Hygiene maintenance"
                checked={form.treatmentRecommendedHygieneMaintenance}
                onChange={(value) =>
                  updateField("treatmentRecommendedHygieneMaintenance", value)
                }
              />
              <TextareaField
                id="adult-hygiene-other-treatment-recommended"
                label="Other treatment recommended"
                value={form.otherTreatmentRecommended}
                onChange={(value) =>
                  updateField("otherTreatmentRecommended", value)
                }
                placeholder="Enter one item per line"
              />
            </fieldset>
            <TreatmentCompletedList
              entries={form.treatmentCompleted}
              onAdd={() =>
                updateField("treatmentCompleted", [
                  ...form.treatmentCompleted,
                  createTreatmentCompletedEntry(),
                ])
              }
              onChange={(value) => updateField("treatmentCompleted", value)}
            />
            <CatalogueCombobox
              id="adult-hygiene-anesthetic"
              label="Anesthetic"
              catalogueKey="hygiene-treatment.anesthetic"
              value={form.anesthetic}
              onChange={(value) => updateField("anesthetic", value)}
            />
            <CatalogueCombobox
              id="adult-hygiene-desensitizer"
              label="Desensitizer"
              catalogueKey="hygiene-treatment.desensitizer"
              value={form.desensitizer}
              onChange={(value) => updateField("desensitizer", value)}
            />
          </Section>

          <Section title="Appliances and Relevant History">
            <div className="grid gap-4 md:grid-cols-2">
              <FixedChoiceListbox
                id="adult-hygiene-night-guard"
                label="Has a night guard"
                value={form.nightGuardStatus}
                options={documentationStatusOptions}
                onChange={(value) => {
                  updateField("nightGuardStatus", value);
                  if (value !== "yes") {
                    updateField("nightGuardUseStatus", "not-documented");
                  }
                }}
              />
              {form.nightGuardStatus === "yes" ? (
                <FixedChoiceListbox
                  id="adult-hygiene-night-guard-use"
                  label="Uses the night guard"
                  value={form.nightGuardUseStatus}
                  options={documentationStatusOptions}
                  onChange={(value) =>
                    updateField("nightGuardUseStatus", value)
                  }
                />
              ) : null}
              <FixedChoiceListbox
                id="adult-hygiene-orthodontics"
                label="Orthodontic history"
                value={form.orthodonticHistoryStatus}
                options={documentationStatusOptions}
                onChange={(value) =>
                  updateField("orthodonticHistoryStatus", value)
                }
              />
              <FixedChoiceListbox<RetainerStatus>
                id="adult-hygiene-retainers"
                label="Retainers"
                value={form.retainerStatus}
                options={[
                  { value: "not-documented", label: "Not documented" },
                  { value: "none", label: "None" },
                  { value: "fixed", label: "Fixed" },
                  { value: "removable", label: "Removable" },
                  {
                    value: "fixed-and-removable",
                    label: "Fixed and removable",
                  },
                ]}
                onChange={(value) => updateField("retainerStatus", value)}
              />
            </div>
            <TextareaField
              id="adult-hygiene-additional-notes"
              label="Additional notes"
              value={form.additionalNotes}
              onChange={(value) => updateField("additionalNotes", value)}
            />
          </Section>

          <Section title="Intervals and Next Visit">
            <CheckboxField
              id="adult-hygiene-ppe"
              label="Standard PPE statement applies"
              checked={form.ppeStatementApplies}
              onChange={(value) => updateField("ppeStatementApplies", value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <CatalogueCombobox
                id="adult-hygiene-recall-interval"
                label="Recommended recall interval"
                catalogueKey="scheduling.recall-interval"
                value={form.recallInterval}
                onChange={(value) => updateField("recallInterval", value)}
              />
              <TextField
                id="adult-hygiene-recall-interval-comments"
                label="Recommended recall interval comments"
                value={form.recallIntervalComments}
                onChange={(value) =>
                  updateField("recallIntervalComments", value)
                }
                placeholder="Optional comments"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <CatalogueCombobox
                id="adult-hygiene-hygiene-interval"
                label="Recommended hygiene interval"
                catalogueKey="scheduling.hygiene-interval"
                value={form.hygieneInterval}
                onChange={(value) => updateField("hygieneInterval", value)}
              />
              <TextField
                id="adult-hygiene-hygiene-interval-comments"
                label="Recommended hygiene interval comments"
                value={form.hygieneIntervalComments}
                onChange={(value) =>
                  updateField("hygieneIntervalComments", value)
                }
                placeholder="Optional comments"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="adult-hygiene-next-visit"
                label="Next visit"
                catalogueKey="scheduling.next-visit"
                value={form.nextVisit}
                onChange={(value) => updateField("nextVisit", value)}
              />
              <TextField
                id="adult-hygiene-date-booked"
                label="Date booked"
                value={form.dateBooked}
                onChange={(value) => updateField("dateBooked", value)}
                type="date"
              />
            </div>
          </Section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Generated Note</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              The visible preview is copied unchanged.
            </p>
            <label className="sr-only" htmlFor="adult-hygiene-summary">
              Generated 2021 Adult Hygiene note
            </label>
            <textarea
              id="adult-hygiene-summary"
              className={`${inputClass} min-h-[34rem] resize-y font-mono leading-6`}
              readOnly
              value={summary}
              placeholder="Complete fields to build the note."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                className={`${buttonClass} bg-slate-900 text-white hover:bg-slate-700 dark:bg-sky-700 dark:hover:bg-sky-600`}
                disabled={!startedAt}
              >
                Copy note
              </button>
              <button
                type="button"
                className={`${buttonClass} border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800`}
                onClick={loadDemo}
              >
                Load synthetic demo
              </button>
              <button
                type="button"
                className={`${buttonClass} border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800`}
                onClick={resetForm}
              >
                Reset form
              </button>
            </div>
            <p
              className="mt-3 min-h-5 text-sm text-slate-700 dark:text-slate-300"
              role="status"
              aria-live="polite"
            >
              {copyMessage}
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}
