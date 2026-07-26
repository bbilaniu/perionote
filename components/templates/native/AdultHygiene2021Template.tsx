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
import {
  type AdultHygiene2021Form,
  bleedingChoices,
  brushingFrequencyChoices,
  calculusChoices,
  createEmptyAdultHygiene2021Form,
  flossingFrequencyChoices,
  hasRequiredAdultHygiene2021Fields,
  hygieneIntervalChoices,
  oralHygieneComplianceChoices,
  patientChiefConcernChoices,
  periodontitisGradeChoices,
  periodontitisStageChoices,
  plaqueChoices,
  recallIntervalChoices,
  stainChoices,
} from "@/lib/templates/adultHygiene2021";
import type {
  DocumentationStatus,
  PremedicationStatus,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { formatRecareExamLocalTimestamp } from "@/lib/templates/summary/buildRecareExamSummary";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900 dark:disabled:bg-slate-900";
const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const checkboxClass = "mt-1 h-4 w-4 accent-sky-700";
const adultHygieneDiscardWarning =
  "Clear all entered 2021 Adult Hygiene values and start a new note? This cannot be undone.";

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
  list,
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
  list?: readonly string[];
}) {
  const errorId = `${id}-error`;
  const listId = list ? `${id}-choices` : undefined;
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        ref={inputRef}
        id={id}
        className={inputClass}
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        autoComplete="off"
        list={listId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {listId ? (
        <datalist id={listId}>
          {list?.map((choice) => <option key={choice} value={choice} />)}
        </datalist>
      ) : null}
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

function SelectField<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: TValue;
  options: Array<{ value: TValue; label: string }>;
  onChange: (value: TValue) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChoiceWithOther({
  id,
  label,
  choice,
  other,
  choices,
  onChoiceChange,
  onOtherChange,
}: {
  id: string;
  label: string;
  choice: string;
  other: string;
  choices: readonly string[];
  onChoiceChange: (choice: string) => void;
  onOtherChange: (other: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <SelectField
        id={`${id}-choice`}
        label={label}
        value={choice}
        options={[
          { value: "", label: "Not documented" },
          ...choices.map((value) => ({ value, label: value })),
        ]}
        onChange={(value) => {
          onChoiceChange(value);
          if (value) {
            onOtherChange("");
          }
        }}
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
      ohiAidsReviewed: [...fixture.ohiAidsReviewed],
      treatmentCompleted: [...fixture.treatmentCompleted],
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

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-violet-300 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-950/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-300">
          Draft interactive conversion
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
                onChange={(value) =>
                  updateField("medicalHistoryReview", value)
                }
              />

              <div className="space-y-4">
                <SelectField<PremedicationStatus>
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
            <TextField
              id="adult-hygiene-chief-concern"
              label="Patient chief concern"
              value={form.patientChiefConcern}
              onChange={(value) => updateField("patientChiefConcern", value)}
              list={patientChiefConcernChoices}
            />
            <TextareaField
              id="adult-hygiene-area-of-concern"
              label="Hygiene area of concern"
              value={form.hygieneAreaOfConcern}
              onChange={(value) => updateField("hygieneAreaOfConcern", value)}
            />
            <ChoiceWithOther
              id="adult-hygiene-plaque"
              label="Plaque"
              choice={form.plaqueChoice}
              other={form.plaqueOther}
              choices={plaqueChoices}
              onChoiceChange={(value) => updateField("plaqueChoice", value)}
              onOtherChange={(value) => updateField("plaqueOther", value)}
            />
            <ChoiceWithOther
              id="adult-hygiene-stain"
              label="Stain"
              choice={form.stainChoice}
              other={form.stainOther}
              choices={stainChoices}
              onChoiceChange={(value) => updateField("stainChoice", value)}
              onOtherChange={(value) => updateField("stainOther", value)}
            />
            <ChoiceWithOther
              id="adult-hygiene-calculus"
              label="Calculus"
              choice={form.calculusChoice}
              other={form.calculusOther}
              choices={calculusChoices}
              onChoiceChange={(value) => updateField("calculusChoice", value)}
              onOtherChange={(value) => updateField("calculusOther", value)}
            />
            <ChoiceWithOther
              id="adult-hygiene-bleeding"
              label="Bleeding"
              choice={form.bleedingChoice}
              other={form.bleedingOther}
              choices={bleedingChoices}
              onChoiceChange={(value) => updateField("bleedingChoice", value)}
              onOtherChange={(value) => updateField("bleedingOther", value)}
            />
          </Section>

          <Section title="Periodontal Assessment">
            <fieldset>
              <legend className="font-semibold">PSR/Pocketing</legend>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Enter the six positions in source order. Blank positions remain
                visibly unfilled when another position is documented.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {form.psrPocketing.map((value, index) => (
                  <TextField
                    key={index}
                    id={`adult-hygiene-psr-${index + 1}`}
                    label={`Position ${index + 1}`}
                    value={value}
                    onChange={(nextValue) => {
                      const next = [...form.psrPocketing] as AdultHygiene2021Form["psrPocketing"];
                      next[index] = nextValue;
                      updateField("psrPocketing", next);
                    }}
                  />
                ))}
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
            <ChoiceWithOther
              id="adult-hygiene-periodontitis-stage"
              label="Periodontitis stage"
              choice={form.periodontitisStageChoice}
              other={form.periodontitisStageOther}
              choices={periodontitisStageChoices}
              onChoiceChange={(value) =>
                updateField("periodontitisStageChoice", value)
              }
              onOtherChange={(value) =>
                updateField("periodontitisStageOther", value)
              }
            />
            <ChoiceWithOther
              id="adult-hygiene-periodontitis-grade"
              label="Periodontitis grade"
              choice={form.periodontitisGradeChoice}
              other={form.periodontitisGradeOther}
              choices={periodontitisGradeChoices}
              onChoiceChange={(value) =>
                updateField("periodontitisGradeChoice", value)
              }
              onOtherChange={(value) =>
                updateField("periodontitisGradeOther", value)
              }
            />
          </Section>

          <Section title="Oral Hygiene and Education">
            <ChoiceWithOther
              id="adult-hygiene-compliance"
              label="Oral hygiene compliance"
              choice={form.oralHygieneComplianceChoice}
              other={form.oralHygieneComplianceOther}
              choices={oralHygieneComplianceChoices}
              onChoiceChange={(value) =>
                updateField("oralHygieneComplianceChoice", value)
              }
              onOtherChange={(value) =>
                updateField("oralHygieneComplianceOther", value)
              }
            />
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
            />
            <CheckboxField
              id="adult-hygiene-disease-process-reviewed"
              label="Disease process reviewed with patient today"
              checked={form.diseaseProcessReviewed}
              onChange={(value) =>
                updateField("diseaseProcessReviewed", value)
              }
            />
            <ChoiceWithOther
              id="adult-hygiene-flossing"
              label="Flossing frequency"
              choice={form.flossingFrequencyChoice}
              other={form.flossingFrequencyOther}
              choices={flossingFrequencyChoices}
              onChoiceChange={(value) =>
                updateField("flossingFrequencyChoice", value)
              }
              onOtherChange={(value) =>
                updateField("flossingFrequencyOther", value)
              }
            />
            <ChoiceWithOther
              id="adult-hygiene-brushing"
              label="Brushing frequency"
              choice={form.brushingFrequencyChoice}
              other={form.brushingFrequencyOther}
              choices={brushingFrequencyChoices}
              onChoiceChange={(value) =>
                updateField("brushingFrequencyChoice", value)
              }
              onOtherChange={(value) =>
                updateField("brushingFrequencyOther", value)
              }
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
                  updateField(
                    "treatmentRecommendedHygieneMaintenance",
                    value,
                  )
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
            <CatalogueMultiCombobox
              id="adult-hygiene-treatment-completed"
              label="Treatment completed today"
              catalogueKey="hygiene-treatment.completed"
              values={form.treatmentCompleted}
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
              <SelectField
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
                <SelectField
                  id="adult-hygiene-night-guard-use"
                  label="Uses the night guard"
                  value={form.nightGuardUseStatus}
                  options={documentationStatusOptions}
                  onChange={(value) =>
                    updateField("nightGuardUseStatus", value)
                  }
                />
              ) : null}
              <SelectField
                id="adult-hygiene-orthodontics"
                label="Orthodontic history"
                value={form.orthodonticHistoryStatus}
                options={documentationStatusOptions}
                onChange={(value) =>
                  updateField("orthodonticHistoryStatus", value)
                }
              />
              <SelectField<RetainerStatus>
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
            <ChoiceWithOther
              id="adult-hygiene-recall-interval"
              label="Recommended recall interval"
              choice={form.recallIntervalChoice}
              other={form.recallIntervalOther}
              choices={recallIntervalChoices}
              onChoiceChange={(value) =>
                updateField("recallIntervalChoice", value)
              }
              onOtherChange={(value) =>
                updateField("recallIntervalOther", value)
              }
            />
            <ChoiceWithOther
              id="adult-hygiene-hygiene-interval"
              label="Recommended hygiene interval"
              choice={form.hygieneIntervalChoice}
              other={form.hygieneIntervalOther}
              choices={hygieneIntervalChoices}
              onChoiceChange={(value) =>
                updateField("hygieneIntervalChoice", value)
              }
              onOtherChange={(value) =>
                updateField("hygieneIntervalOther", value)
              }
            />
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
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
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
