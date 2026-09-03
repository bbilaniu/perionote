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
import { FixedChoiceMultiCombobox } from "@/components/forms/FixedChoiceMultiCombobox";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import { formControlClass } from "@/components/forms/controlStyles";
import { IsoDateInput } from "@/components/forms/IsoDateInput";
import { StaticSuggestionCombobox } from "@/components/forms/StaticSuggestionCombobox";
import {
  AdultHygieneCalculusControl,
  AdultHygienePlaqueControl,
  PeriodontalClassificationControl,
} from "@/components/templates/native/AdultHygiene2021Template";
import { InteractiveTemplateHeader } from "@/components/templates/shared/InteractiveTemplateHeader";
import { LocalAnesthesiaControl } from "@/components/templates/shared/LocalAnesthesiaControl";
import { LocalDraftRecovery } from "@/components/templates/shared/LocalDraftRecovery";
import { TemplateSectionNavigation } from "@/components/templates/shared/TemplateSectionNavigation";
import { TreatmentCompletedList } from "@/components/templates/shared/TreatmentCompletedList";
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
import {
  brushingFrequencyChoices,
  flossingFrequencyChoices,
  homeCareOheTopicChoices,
} from "@/lib/templates/adultHygiene2021";
import { isDesensitizingRemineralizingProductMetadata } from "@/lib/catalogues/catalogue";
import {
  createStandardTreatmentEntriesFromCatalogue,
  treatmentCompletedEntryIdentity,
} from "@/lib/templates/adultHygieneTreatment";
import { matchesDraftShape } from "@/lib/templates/localDrafts";
import {
  createTemplateSectionNavigation,
  getTemplateSectionId,
} from "@/lib/templates/sectionNavigation";
import {
  copyPeriodontalClassification,
  normalizePeriodontalClassification,
} from "@/lib/templates/periodontalClassification";
import {
  buildAdolescentHygieneSummary,
  formatAdolescentHygieneLocalTimestamp,
} from "@/lib/templates/summary/buildAdolescentHygieneSummary";
import type { InteractiveTemplateProps } from "@/lib/templates/types";

const inputClass = `mt-1 ${formControlClass()}`;
const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const adolescentDiscardWarning =
  "Clear all entered Adolescent Hygiene values and start a new note? The current local draft will remain available on Saved drafts for up to seven days.";
const adolescentDraftExemplar = createEmptyAdolescentHygieneForm();
const emptyAdolescentDraft = JSON.stringify(adolescentDraftExemplar);
const adolescentDraftArrayItemShapes = {
  "periodontalClassification.stageBasis": { criterionId: "" },
  "periodontalClassification.gradeBasis": { criterionId: "" },
  "periodontalClassification.gingivalHealth.reducedPeriodontiumBases": "",
  plaqueAreas: "",
  calculusAreas: "",
  ohiTechniques: "",
  treatmentCompleted: { id: "", treatmentType: "", toothAreas: [] },
  "treatmentCompleted[].toothAreas": "",
  localAnesthesiaEntries: {
    id: "",
    route: "injection",
    administrationType: "",
    toothAreas: [],
    product: "",
    amountMl: "",
    durationSeconds: "",
    timeAdministered: "",
  },
  "localAnesthesiaEntries[].toothAreas": "",
} as const;

function buildAdolescentOheTreatmentRecap(
  form: AdolescentHygieneForm,
): string {
  return [...form.ohiTechniques, form.oheNotes.trim()]
    .filter(Boolean)
    .join("; ");
}

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

const adolescentHygieneSections = createTemplateSectionNavigation([
  "Patient and Visit Context",
  "Visit Team",
  "Consent, Medical History, and Sterilization",
  "Hygiene Findings",
  "Periodontal and Gingival Assessment",
  "Oral Hygiene Instruction",
  "Appliances and Orthodontic History",
  "Treatment and Communication",
  "Comments and Scheduling",
]);

function isEmptyAdolescentDraft(form: AdolescentHygieneForm): boolean {
  return (
    JSON.stringify({ ...form, dentist: "", rdh: "", rda: "" }) ===
    emptyAdolescentDraft
  );
}

function isAdolescentDraftForm(value: unknown): value is AdolescentHygieneForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return matchesDraftShape(
    {
      ...adolescentDraftExemplar,
      ...value,
      periodontalClassification: normalizePeriodontalClassification(
        (value as Record<string, unknown>).periodontalClassification,
      ),
    },
    adolescentDraftExemplar,
    adolescentDraftArrayItemShapes,
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
    <section
      id={getTemplateSectionId(title)}
      className="scroll-mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
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
  presentation,
}: InteractiveTemplateProps<AdolescentHygieneForm>) {
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
  const treatmentEntrySequence = useRef(0);
  const { providerDefaultsStorageStatus, getProviderDefault, getItems } =
    useCatalogues();

  const localDraft = useLocalInteractiveDraft({
    templateId: "adolescent-hygiene",
    form,
    startedAt,
    isEmpty: isEmptyAdolescentDraft,
    isValidForm: isAdolescentDraftForm,
    onRestore: (draft) => {
      setForm({
        ...createEmptyAdolescentHygieneForm(),
        ...draft.form,
        periodontalClassification: normalizePeriodontalClassification(
          draft.form.periodontalClassification,
        ),
      });
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
    setForm({
      ...fixture,
      periodontalClassification: copyPeriodontalClassification(
        fixture.periodontalClassification,
      ),
      plaqueAreas: [...fixture.plaqueAreas],
      calculusAreas: [...fixture.calculusAreas],
      ohiTechniques: [...fixture.ohiTechniques],
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
    if (!window.confirm(adolescentDiscardWarning)) return;
    localDraft.beginNewDraft();
    setForm(createNewFormWithProviderDefaults());
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    patientIdRef.current?.focus();
  }

  function nextTreatmentEntryId(): string {
    treatmentEntrySequence.current += 1;
    return `adolescent-treatment-${Date.now()}-${treatmentEntrySequence.current}`;
  }

  function applyStandardTreatment() {
    const existing = new Set(
      form.treatmentCompleted.map(treatmentCompletedEntryIdentity),
    );
    const additions = createStandardTreatmentEntriesFromCatalogue(
      getItems("hygiene-treatment.completed"),
      nextTreatmentEntryId,
      buildAdolescentOheTreatmentRecap(form),
    ).filter(
      (entry) => !existing.has(treatmentCompletedEntryIdentity(entry)),
    );
    if (additions.length) {
      updateField("treatmentCompleted", [
        ...form.treatmentCompleted,
        ...additions,
      ]);
    }
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
          <InteractiveTemplateHeader {...presentation} />

          <LocalDraftRecovery
            drafts={localDraft.recoverableDrafts}
            lastSavedAt={localDraft.lastSavedAt}
            restoredAt={localDraft.restoredAt}
            storageError={localDraft.storageError}
            onRestore={localDraft.restoreDraft}
          />

          <div className="grid min-w-0 items-start gap-6 2xl:grid-cols-[13rem_minmax(0,1fr)]">
            <TemplateSectionNavigation sections={adolescentHygieneSections} />
            <div className="min-w-0 space-y-6">

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
            <AdultHygienePlaqueControl
              id="adolescent-hygiene-plaque"
              choice={form.plaqueChoice}
              areas={form.plaqueAreas}
              comment={form.plaqueComment}
              onChoiceChange={(value) => updateField("plaqueChoice", value)}
              onAreasChange={(value) => updateField("plaqueAreas", value)}
              onCommentChange={(value) =>
                updateField("plaqueComment", value)
              }
            />
            <AdultHygieneCalculusControl
              id="adolescent-hygiene-calculus"
              choice={form.calculusChoice}
              areas={form.calculusAreas}
              comment={form.calculusComment}
              onChoiceChange={(value) => updateField("calculusChoice", value)}
              onAreasChange={(value) => updateField("calculusAreas", value)}
              onCommentChange={(value) =>
                updateField("calculusComment", value)
              }
            />
            <div className="md:max-w-xl">
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

          <Section
            title="Periodontal and Gingival Assessment"
            description="Uses the same structured assessment, suggestions, staging, grading, and status workflow as the 2021 Adult Hygiene form."
          >
            <PeriodontalClassificationControl
              value={form.periodontalClassification}
              onChange={(value) =>
                updateField("periodontalClassification", value)
              }
            />
          </Section>

          <Section title="Oral Hygiene Instruction">
            <div className="grid gap-4 md:grid-cols-2">
              <StaticSuggestionCombobox
                id="adolescent-flossing-frequency"
                label="Flossing frequency"
                value={form.flossingFrequency}
                suggestions={flossingFrequencyChoices}
                onChange={(value) => updateField("flossingFrequency", value)}
                placeholder="Select or enter a flossing frequency"
              />
              <StaticSuggestionCombobox
                id="adolescent-brushing-frequency"
                label="Brushing frequency"
                value={form.brushingFrequency}
                suggestions={brushingFrequencyChoices}
                onChange={(value) => updateField("brushingFrequency", value)}
                placeholder="Select or enter a brushing frequency"
              />
            </div>
            <FixedChoiceMultiCombobox
              id="adolescent-ohi-techniques"
              label="OHI techniques reviewed"
              choices={homeCareOheTopicChoices}
              values={form.ohiTechniques}
              onChange={(value) => updateField("ohiTechniques", value)}
              allowCustomValues={false}
              customHelpText="Uses the reviewed Adult Hygiene home-care technique choices."
            />
            <TextareaField
              id="adolescent-ohe-notes"
              label="OHE notes"
              value={form.oheNotes}
              onChange={(value) => updateField("oheNotes", value)}
            />
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
              <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <FixedChoiceListbox
                  id="adolescent-polish"
                  label="Polish"
                  value={form.polishStatus}
                  options={documentationStatusOptions}
                  onChange={(value) => updateField("polishStatus", value)}
                />
                {form.polishStatus === "yes" ? (
                  <CatalogueCombobox
                    id="adolescent-polish-product"
                    label="Polish product"
                    catalogueKey="hygiene-treatment.polishing-products"
                    value={form.polishDetails}
                    onChange={(value) => updateField("polishDetails", value)}
                    showAllSuggestionsWhenSelected
                  />
                ) : null}
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <FixedChoiceListbox
                  id="adolescent-fluoride"
                  label="Fluoride"
                  value={form.fluorideStatus}
                  options={documentationStatusOptions}
                  onChange={(value) => updateField("fluorideStatus", value)}
                />
                {form.fluorideStatus === "yes" ? (
                  <CatalogueCombobox
                    id="adolescent-fluoride-product"
                    label="Fluoride product"
                    catalogueKey="hygiene-treatment.desensitizer"
                    value={form.fluorideDetails}
                    rememberMetadata={{
                      kind: "desensitizing-remineralizing-product",
                      productType: "fluoride-varnish",
                    }}
                    suggestionFilter={(item) => {
                      const metadata = item.metadata;
                      return (
                        isDesensitizingRemineralizingProductMetadata(metadata) &&
                        metadata.productType === "fluoride-varnish"
                      );
                    }}
                    onChange={(value) => updateField("fluorideDetails", value)}
                    showAllSuggestionsWhenSelected
                  />
                ) : null}
              </div>
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
            <TreatmentCompletedList
              entries={form.treatmentCompleted}
              oheRecap={buildAdolescentOheTreatmentRecap(form)}
              onApplyStandard={applyStandardTreatment}
              onChange={(value) => updateField("treatmentCompleted", value)}
            />
            <LocalAnesthesiaControl
              value={{
                localAnesthesiaNoContraindication:
                  form.localAnesthesiaNoContraindication,
                localAnesthesiaEntries: form.localAnesthesiaEntries,
                localAnesthesiaNoAdverseReactions:
                  form.localAnesthesiaNoAdverseReactions,
                localAnesthesiaAdequateAchieved:
                  form.localAnesthesiaAdequateAchieved,
                localAnesthesiaNotes: form.localAnesthesiaNotes,
              }}
              onChange={(localAnesthesia) =>
                setForm((current) => ({ ...current, ...localAnesthesia }))
              }
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
                catalogueKey="scheduling.hygiene-next-visit"
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
          </div>
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
