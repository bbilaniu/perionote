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
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import { formControlClass } from "@/components/forms/controlStyles";
import { IsoDateInput } from "@/components/forms/IsoDateInput";
import { LocalDraftRecovery } from "@/components/templates/shared/LocalDraftRecovery";
import { useLocalInteractiveDraft } from "@/components/templates/shared/useLocalInteractiveDraft";
import type {
  AdolescentDocumentationStatus,
  AdolescentHygieneForm,
  AdolescentRetainerStatus,
} from "@/lib/templates/adolescentHygiene";
import {
  createEmptyAdolescentHygieneForm,
  hasRequiredAdolescentHygieneFields,
} from "@/lib/templates/adolescentHygiene";
import { matchesDraftShape } from "@/lib/templates/localDrafts";
import {
  buildAdolescentHygieneSummary,
  formatAdolescentHygieneLocalTimestamp,
} from "@/lib/templates/summary/buildAdolescentHygieneSummary";

const inputClass = `mt-1 ${formControlClass()}`;
const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const adolescentDiscardWarning =
  "Clear all entered Adolescent Hygiene values and start a new note? The current local draft will remain available on Saved drafts for up to seven days.";
const adolescentDraftExemplar = createEmptyAdolescentHygieneForm();
const emptyAdolescentDraft = JSON.stringify(adolescentDraftExemplar);

const documentationStatusOptions: ReadonlyArray<{
  value: AdolescentDocumentationStatus;
  label: string;
}> = [
  { value: "not-documented", label: "Not documented" },
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

const retainerOptions: ReadonlyArray<{
  value: AdolescentRetainerStatus;
  label: string;
}> = [
  { value: "not-documented", label: "Not documented" },
  { value: "none", label: "None" },
  { value: "fixed", label: "Fixed" },
  { value: "removable", label: "Removable" },
  { value: "fixed-and-removable", label: "Fixed and removable" },
];

function isEmptyAdolescentDraft(form: AdolescentHygieneForm): boolean {
  return (
    JSON.stringify({ ...form, dentist: "", rdh: "", rda: "" }) ===
    emptyAdolescentDraft
  );
}

function isAdolescentDraftForm(value: unknown): value is AdolescentHygieneForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return matchesDraftShape(
    { ...adolescentDraftExemplar, ...value },
    adolescentDraftExemplar,
  );
}

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
        className={inputClass}
        type="text"
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
        className={`${inputClass} min-h-24 resize-y py-2`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
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
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
    >
      <input
        id={id}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-500"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function YesNoWithDetails({
  id,
  label,
  status,
  details,
  detailsLabel = "Details",
  onStatusChange,
  onDetailsChange,
}: {
  id: string;
  label: string;
  status: AdolescentDocumentationStatus;
  details: string;
  detailsLabel?: string;
  onStatusChange: (status: AdolescentDocumentationStatus) => void;
  onDetailsChange: (details: string) => void;
}) {
  return (
    <div className="space-y-3">
      <FixedChoiceListbox
        id={id}
        label={label}
        value={status}
        options={documentationStatusOptions}
        onChange={onStatusChange}
      />
      {status !== "not-documented" ? (
        <TextField
          id={`${id}-details`}
          label={detailsLabel}
          value={details}
          onChange={onDetailsChange}
          placeholder="Optional note-specific details"
        />
      ) : null}
    </div>
  );
}

async function writeClipboard(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Use the explicit fallback below when browser clipboard access fails.
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

export function AdolescentHygieneTemplate({
  fixture,
}: {
  fixture: AdolescentHygieneForm;
  summary: string;
}) {
  const [form, setForm] = useState<AdolescentHygieneForm>(() =>
    createEmptyAdolescentHygieneForm(),
  );
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [patientIdError, setPatientIdError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const patientIdRef = useRef<HTMLInputElement>(null);
  const rdhRef = useRef<HTMLInputElement>(null);
  const providerDefaultsAppliedRef = useRef(false);
  const { providerDefaultsStorageStatus, getProviderDefault } = useCatalogues();

  const localDraft = useLocalInteractiveDraft({
    templateId: "adolescent-hygiene",
    form,
    startedAt,
    isEmpty: isEmptyAdolescentDraft,
    isValidForm: isAdolescentDraftForm,
    onRestore: (draft) => {
      setForm({ ...createEmptyAdolescentHygieneForm(), ...draft.form });
      setStartedAt(new Date(draft.startedAt));
      setPatientIdError("");
      setProviderError("");
      setCopyMessage("");
    },
  });

  function createNewFormWithProviderDefaults(): AdolescentHygieneForm {
    return {
      ...createEmptyAdolescentHygieneForm(),
      dentist: getProviderDefault("visit-team.dentist")?.label ?? "",
      rdh: getProviderDefault("visit-team.rdh")?.label ?? "",
      rda: getProviderDefault("visit-team.rda")?.label ?? "",
    };
  }

  useEffect(() => {
    setStartedAt((current) => current ?? new Date());
  }, []);

  useEffect(() => {
    if (
      !localDraft.hydrated ||
      providerDefaultsStorageStatus !== "ready" ||
      providerDefaultsAppliedRef.current
    ) {
      return;
    }
    providerDefaultsAppliedRef.current = true;
    if (localDraft.restoredAt) return;
    setForm((current) => ({
      ...current,
      dentist:
        current.dentist ||
        getProviderDefault("visit-team.dentist")?.label ||
        "",
      rdh:
        current.rdh || getProviderDefault("visit-team.rdh")?.label || "",
      rda:
        current.rda || getProviderDefault("visit-team.rda")?.label || "",
    }));
  }, [
    getProviderDefault,
    localDraft.hydrated,
    localDraft.restoredAt,
    providerDefaultsStorageStatus,
  ]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = adolescentDiscardWarning;
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, []);

  const summary = useMemo(
    () =>
      buildAdolescentHygieneSummary(form, {
        ...(startedAt ? { startedAt } : {}),
      }),
    [form, startedAt],
  );

  function updateField<TKey extends keyof AdolescentHygieneForm>(
    key: TKey,
    value: AdolescentHygieneForm[TKey],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setCopyMessage("");
    if (key === "patientId" && String(value).trim()) setPatientIdError("");
    if (
      (key === "dentist" || key === "rdh" || key === "rda") &&
      String(value).trim()
    ) {
      setProviderError("");
    }
  }

  async function copyNote() {
    const draftSaveResult = localDraft.saveNow();
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
      !hasRequiredAdolescentHygieneFields(form)
    ) {
      requestAnimationFrame(() => {
        (missingPatientId ? patientIdRef.current : rdhRef.current)?.focus();
      });
      return;
    }

    const copied = await writeClipboard(summary);
    setCopyMessage(
      copied
        ? draftSaveResult === "failed"
          ? "Note copied, but the local draft could not be saved."
          : "Note copied."
        : "The note could not be copied. Select the preview and copy it manually.",
    );
  }

  function loadDemo() {
    setForm({ ...fixture });
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("Synthetic demo data loaded.");
  }

  function resetForm() {
    if (!window.confirm(adolescentDiscardWarning)) return;
    localDraft.beginNewDraft();
    setForm(createNewFormWithProviderDefaults());
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    patientIdRef.current?.focus();
  }

  return (
    <div className="space-y-6">
      <form
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.8fr)]"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          void copyNote();
        }}
      >
        <div className="space-y-6">
          <header className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              Draft interactive conversion
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              12–17 Years Old Hygiene Template
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
              Complete the form and copy a structured adolescent hygiene note.
              This draft preserves the ClearDent workflow and includes optional
              Dentist and treatment-completed fields from the August 6 request.
            </p>
          </header>

          <LocalDraftRecovery
            drafts={localDraft.recoverableDrafts}
            lastSavedAt={localDraft.lastSavedAt}
            restoredAt={localDraft.restoredAt}
            storageError={localDraft.storageError}
            onRestore={localDraft.restoreDraft}
          />

          <Section title="Patient and Visit Context">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="adolescent-hygiene-patient-id"
                label="Patient ID"
                value={form.patientId}
                onChange={(value) => updateField("patientId", value)}
                required
                error={patientIdError}
                inputRef={patientIdRef}
              />
              <TextField
                id="adolescent-hygiene-note-started"
                label="Note started"
                value={
                  startedAt
                    ? formatAdolescentHygieneLocalTimestamp(startedAt)
                    : ""
                }
                onChange={() => undefined}
                readOnly
              />
            </div>
          </Section>

          <Section
            title="Visit Team"
            description="RDH and RDA come from the ClearDent source; Dentist is an optional request extension. At least one provider is required before copying."
          >
            <fieldset
              aria-invalid={Boolean(providerError)}
              aria-describedby={
                providerError ? "adolescent-provider-error" : undefined
              }
            >
              <legend className="sr-only">Visit team providers</legend>
              <div className="grid gap-4 md:grid-cols-3">
                <CatalogueCombobox
                  id="adolescent-hygiene-dentist"
                  label="Dentist"
                  catalogueKey="visit-team.dentist"
                  value={form.dentist}
                  onChange={(value) => updateField("dentist", value)}
                />
                <CatalogueCombobox
                  id="adolescent-hygiene-rdh"
                  label="RDH"
                  catalogueKey="visit-team.rdh"
                  value={form.rdh}
                  onChange={(value) => updateField("rdh", value)}
                  inputRef={rdhRef}
                />
                <CatalogueCombobox
                  id="adolescent-hygiene-rda"
                  label="RDA"
                  catalogueKey="visit-team.rda"
                  value={form.rda}
                  onChange={(value) => updateField("rda", value)}
                />
              </div>
              {providerError ? (
                <p
                  id="adolescent-provider-error"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {providerError}
                </p>
              ) : null}
            </fieldset>
          </Section>

          <Section title="Consent, Medical History, and Sterilization">
            <fieldset className="space-y-3">
              <legend className="font-semibold">Consent given by</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                <CheckboxField
                  id="adolescent-consent-patient"
                  label="Patient"
                  checked={form.consentPatient}
                  onChange={(value) => updateField("consentPatient", value)}
                />
                <CheckboxField
                  id="adolescent-consent-parent"
                  label="Parent"
                  checked={form.consentParent}
                  onChange={(value) => updateField("consentParent", value)}
                />
                <CheckboxField
                  id="adolescent-consent-guardian"
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
                  id="adolescent-consent-details"
                  label="Consent details"
                  value={form.consentDetails}
                  onChange={(value) => updateField("consentDetails", value)}
                  placeholder="Optional details"
                />
              ) : null}
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="adolescent-medical-history"
                label="Medical history reviewed"
                catalogueKey="medical-history.review"
                value={form.medicalHistoryReview}
                onChange={(value) =>
                  updateField("medicalHistoryReview", value)
                }
              />
              <div className="space-y-3">
                <FixedChoiceListbox
                  id="adolescent-premedication"
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
                    id="adolescent-premedication-details"
                    label="Premedication details"
                    value={form.premedicationDetails}
                    onChange={(value) =>
                      updateField("premedicationDetails", value)
                    }
                  />
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CheckboxField
                id="adolescent-class5"
                label="Class 5 indicators checked"
                checked={form.class5IndicatorsChecked}
                onChange={(value) =>
                  updateField("class5IndicatorsChecked", value)
                }
              />
              <TextField
                id="adolescent-miele-codes"
                label="Miele sterilization codes"
                value={form.mieleCodes}
                onChange={(value) => updateField("mieleCodes", value)}
              />
            </div>
          </Section>

          <Section title="Hygiene Findings">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="adolescent-gingival-health"
                label="Gingival health"
                value={form.gingivalHealth}
                onChange={(value) => updateField("gingivalHealth", value)}
              />
              <TextField
                id="adolescent-plaque-index"
                label="Plaque index"
                value={form.plaqueIndex}
                onChange={(value) => updateField("plaqueIndex", value)}
              />
              <YesNoWithDetails
                id="adolescent-calculus"
                label="Calculus"
                status={form.calculusStatus}
                details={form.calculusDetails}
                detailsLabel="Calculus location/details"
                onStatusChange={(value) =>
                  updateField("calculusStatus", value)
                }
                onDetailsChange={(value) =>
                  updateField("calculusDetails", value)
                }
              />
              <YesNoWithDetails
                id="adolescent-intraoral-images"
                label="Intraoral images"
                status={form.intraoralImagesStatus}
                details={form.intraoralImagesDetails}
                detailsLabel="Image details"
                onStatusChange={(value) =>
                  updateField("intraoralImagesStatus", value)
                }
                onDetailsChange={(value) =>
                  updateField("intraoralImagesDetails", value)
                }
              />
            </div>
          </Section>

          <Section title="Oral Hygiene Instruction">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="adolescent-flossing-technique"
                label="Flossing technique"
                value={form.flossingTechnique}
                onChange={(value) => updateField("flossingTechnique", value)}
              />
              <TextField
                id="adolescent-brushing-technique"
                label="Brushing technique"
                value={form.brushingTechnique}
                onChange={(value) => updateField("brushingTechnique", value)}
              />
            </div>
          </Section>

          <Section title="Appliances and Orthodontic History">
            <div className="grid gap-4 md:grid-cols-2">
              <YesNoWithDetails
                id="adolescent-nightguard"
                label="NightGuard"
                status={form.nightGuardStatus}
                details={form.nightGuardDetails}
                onStatusChange={(value) =>
                  updateField("nightGuardStatus", value)
                }
                onDetailsChange={(value) =>
                  updateField("nightGuardDetails", value)
                }
              />
              <YesNoWithDetails
                id="adolescent-orthodontics"
                label="Orthodontic history"
                status={form.orthodonticHistoryStatus}
                details={form.orthodonticHistoryDetails}
                onStatusChange={(value) =>
                  updateField("orthodonticHistoryStatus", value)
                }
                onDetailsChange={(value) =>
                  updateField("orthodonticHistoryDetails", value)
                }
              />
              <div className="space-y-3">
                <FixedChoiceListbox
                  id="adolescent-retainers"
                  label="Retainers"
                  value={form.retainerStatus}
                  options={retainerOptions}
                  onChange={(value) => updateField("retainerStatus", value)}
                />
                {form.retainerStatus !== "not-documented" &&
                form.retainerStatus !== "none" ? (
                  <TextField
                    id="adolescent-retainer-details"
                    label="Retainer details"
                    value={form.retainerDetails}
                    onChange={(value) =>
                      updateField("retainerDetails", value)
                    }
                  />
                ) : null}
              </div>
            </div>
          </Section>

          <Section title="Treatment and Communication">
            <div className="grid gap-4 md:grid-cols-2">
              <YesNoWithDetails
                id="adolescent-scaling"
                label="Scaling"
                status={form.scalingStatus}
                details={form.scalingUnits}
                detailsLabel="Scaling units"
                onStatusChange={(value) =>
                  updateField("scalingStatus", value)
                }
                onDetailsChange={(value) =>
                  updateField("scalingUnits", value)
                }
              />
              <YesNoWithDetails
                id="adolescent-polish"
                label="Polish"
                status={form.polishStatus}
                details={form.polishDetails}
                detailsLabel="Polish details"
                onStatusChange={(value) => updateField("polishStatus", value)}
                onDetailsChange={(value) =>
                  updateField("polishDetails", value)
                }
              />
              <YesNoWithDetails
                id="adolescent-fluoride"
                label="Fluoride"
                status={form.fluorideStatus}
                details={form.fluorideDetails}
                detailsLabel="Fluoride details"
                onStatusChange={(value) =>
                  updateField("fluorideStatus", value)
                }
                onDetailsChange={(value) =>
                  updateField("fluorideDetails", value)
                }
              />
              <YesNoWithDetails
                id="adolescent-information-relayed"
                label="Relayed info to parent or legal guardian"
                status={form.informationRelayedStatus}
                details={form.informationRelayedDetails}
                detailsLabel="Communication details"
                onStatusChange={(value) =>
                  updateField("informationRelayedStatus", value)
                }
                onDetailsChange={(value) =>
                  updateField("informationRelayedDetails", value)
                }
              />
            </div>
            <TextareaField
              id="adolescent-treatment-completed"
              label="Treatments done today"
              value={form.treatmentCompletedToday}
              onChange={(value) =>
                updateField("treatmentCompletedToday", value)
              }
              placeholder="Optional August 6 request extension"
            />
            <TextareaField
              id="adolescent-next-visit-goal"
              label="Goal for next visit"
              value={form.nextVisitGoal}
              onChange={(value) => updateField("nextVisitGoal", value)}
            />
          </Section>

          <Section title="Comments and Scheduling">
            <TextareaField
              id="adolescent-comments"
              label="RDH/RDA comments"
              value={form.comments}
              onChange={(value) => updateField("comments", value)}
            />
            <CheckboxField
              id="adolescent-ppe"
              label="All proper PPE was worn during the appointment as per AHS and CRDHA guidelines"
              checked={form.properPpeWorn}
              onChange={(value) => updateField("properPpeWorn", value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="adolescent-recall-interval"
                label="Recall interval"
                catalogueKey="scheduling.recall-interval"
                value={form.recallInterval}
                onChange={(value) => updateField("recallInterval", value)}
              />
              <CatalogueCombobox
                id="adolescent-hygiene-interval"
                label="Hygiene interval"
                catalogueKey="scheduling.hygiene-interval"
                value={form.hygieneInterval}
                onChange={(value) => updateField("hygieneInterval", value)}
              />
              <CatalogueCombobox
                id="adolescent-next-visit"
                label="Next visit"
                catalogueKey="scheduling.next-visit"
                value={form.nextVisit}
                onChange={(value) => updateField("nextVisit", value)}
              />
              <div>
                <label className="text-sm font-medium" htmlFor="adolescent-date-booked">
                  Date booked
                </label>
                <IsoDateInput
                  id="adolescent-date-booked"
                  label="Date booked"
                  value={form.dateBooked}
                  onChange={(value) => updateField("dateBooked", value)}
                />
              </div>
            </div>
          </Section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Generated Note</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              The visible preview is copied unchanged.
            </p>
            <label className="sr-only" htmlFor="adolescent-hygiene-summary">
              Generated adolescent hygiene note
            </label>
            <textarea
              id="adolescent-hygiene-summary"
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
