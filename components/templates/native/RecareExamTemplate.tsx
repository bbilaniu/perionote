"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type {
  DocumentationStatus,
  ExamStatus,
  RecareExamForm,
} from "@/lib/templates/recareExam";
import {
  createEmptyRecareExamForm,
  hasRequiredRecareExamFields,
} from "@/lib/templates/recareExam";
import {
  buildRecareExamSummary,
  formatRecareExamLocalTimestamp,
} from "@/lib/templates/summary/buildRecareExamSummary";
import { CatalogueCombobox } from "@/components/catalogues/CatalogueCombobox";
import { CatalogueMultiCombobox } from "@/components/catalogues/CatalogueMultiCombobox";
import { formControlClass } from "@/components/forms/controlStyles";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";

const inputClass = `mt-1 ${formControlClass()}`;

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const recareNoteDiscardWarning =
  "Clear all entered Recare Exam values and start a new note? This cannot be undone.";

const statusOptions: Array<{ value: DocumentationStatus; label: string }> = [
  { value: "not-documented", label: "Not documented" },
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

const examStatusOptions: Array<{ value: ExamStatus; label: string }> = [
  { value: "not-assessed", label: "Not assessed" },
  { value: "wnl", label: "WNL" },
  { value: "findings", label: "Findings" },
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
  inputMode,
  disabled,
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
  inputMode?: "decimal";
  disabled?: boolean;
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
        type={type}
        inputMode={inputMode}
        value={value}
        disabled={disabled}
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
        className="mt-1 h-4 w-4 accent-sky-700"
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
  onStatusChange,
  onDetailsChange,
}: {
  id: string;
  label: string;
  status: DocumentationStatus;
  details: string;
  onStatusChange: (status: DocumentationStatus) => void;
  onDetailsChange: (details: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FixedChoiceListbox
        id={`${id}-status`}
        label={label}
        value={status}
        options={statusOptions}
        onChange={onStatusChange}
      />
      <TextField
        id={`${id}-details`}
        label={`${label} details`}
        value={details}
        onChange={onDetailsChange}
        placeholder="Optional details"
      />
    </div>
  );
}

function ExamFinding({
  id,
  label,
  status,
  findings,
  onStatusChange,
  onFindingsChange,
}: {
  id: string;
  label: string;
  status: ExamStatus;
  findings: string;
  onStatusChange: (status: ExamStatus) => void;
  onFindingsChange: (findings: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FixedChoiceListbox
        id={`${id}-status`}
        label={label}
        value={status}
        options={examStatusOptions}
        onChange={onStatusChange}
      />
      {status === "findings" ? (
        <TextField
          id={`${id}-findings`}
          label={`${label} findings`}
          value={findings}
          onChange={onFindingsChange}
          placeholder="Enter findings"
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

export function RecareExamTemplate({
  fixture,
}: {
  fixture: RecareExamForm;
  summary: string;
}) {
  const [form, setForm] = useState<RecareExamForm>(() =>
    createEmptyRecareExamForm(),
  );
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [patientIdError, setPatientIdError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const patientIdRef = useRef<HTMLInputElement>(null);
  const dentistRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStartedAt(new Date());
  }, []);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = recareNoteDiscardWarning;
    }

    window.addEventListener("beforeunload", warnBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, []);

  const summary = useMemo(
    () =>
      buildRecareExamSummary(form, {
        ...(startedAt ? { startedAt } : {}),
      }),
    [form, startedAt],
  );
  function updateField<TKey extends keyof RecareExamForm>(
    key: TKey,
    value: RecareExamForm[TKey],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setCopyMessage("");

    if (key === "patientId" && String(value).trim()) {
      setPatientIdError("");
    }

    if (
      (key === "dentist" || key === "rda" || key === "rdh") &&
      String(value).trim()
    ) {
      setProviderError("");
    }
  }

  async function copyNote() {
    const missingPatientId = !form.patientId.trim();
    const missingProvider = ![form.dentist, form.rda, form.rdh].some((value) =>
      Boolean(value.trim()),
    );

    setPatientIdError(missingPatientId ? "Enter a Patient ID." : "");
    setProviderError(
      missingProvider ? "Enter at least one of Dentist, RDA, or RDH." : "",
    );
    setCopyMessage("");

    if (missingPatientId || missingProvider || !hasRequiredRecareExamFields(form)) {
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
    setForm({ ...fixture });
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("Synthetic demo data loaded.");
  }

  function resetForm() {
    if (!window.confirm(recareNoteDiscardWarning)) {
      return;
    }

    setForm(createEmptyRecareExamForm());
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    patientIdRef.current?.focus();
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
          Pilot interactive conversion
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Recare Exam
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Complete the form and copy a structured Recare Exam note. Entered
          values remain only in this page&apos;s memory and are discarded when
          the page reloads or closes.
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
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="recare-patient-id"
                label="Patient ID"
                value={form.patientId}
                onChange={(value) => updateField("patientId", value)}
                required
                error={patientIdError}
                inputRef={patientIdRef}
              />
              <TextField
                id="recare-note-started"
                label="Note started"
                value={
                  startedAt ? formatRecareExamLocalTimestamp(startedAt) : ""
                }
                onChange={() => undefined}
                readOnly
              />
            </div>
          </Section>

          <Section
            title="Visit Team"
            description="At least one provider field is required before copying."
          >
            <fieldset
              aria-invalid={Boolean(providerError)}
              aria-describedby={providerError ? "recare-provider-error" : undefined}
            >
              <legend className="sr-only">Visit team providers</legend>
              <div className="grid gap-4 md:grid-cols-3">
                <CatalogueCombobox
                  id="recare-dentist"
                  label="Dentist"
                  catalogueKey="visit-team.dentist"
                  value={form.dentist}
                  onChange={(value) => updateField("dentist", value)}
                  inputRef={dentistRef}
                />
                <CatalogueCombobox
                  id="recare-rda"
                  label="RDA"
                  catalogueKey="visit-team.rda"
                  value={form.rda}
                  onChange={(value) => updateField("rda", value)}
                />
                <CatalogueCombobox
                  id="recare-rdh"
                  label="RDH"
                  catalogueKey="visit-team.rdh"
                  value={form.rdh}
                  onChange={(value) => updateField("rdh", value)}
                />
              </div>
              {providerError ? (
                <p
                  id="recare-provider-error"
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
                  id="recare-class5"
                  label="Class 5 indicators checked"
                  checked={form.class5IndicatorsChecked}
                  onChange={(value) =>
                    updateField("class5IndicatorsChecked", value)
                  }
                />
              </div>
              <TextField
                id="recare-miele-codes"
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
                  id="recare-consent-patient"
                  label="Patient"
                  checked={form.consentPatient}
                  onChange={(value) => updateField("consentPatient", value)}
                />
                <CheckboxField
                  id="recare-consent-parent"
                  label="Parent"
                  checked={form.consentParent}
                  onChange={(value) => updateField("consentParent", value)}
                />
                <CheckboxField
                  id="recare-consent-guardian"
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
                  id="recare-consent-details"
                  label="Consent details"
                  value={form.consentDetails}
                  onChange={(value) => updateField("consentDetails", value)}
                  placeholder="Optional details"
                />
              ) : null}
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="recare-medical-history"
                label="Medical history reviewed"
                catalogueKey="medical-history.review"
                value={form.medicalHistoryReview}
                onChange={(value) =>
                  updateField("medicalHistoryReview", value)
                }
              />

              <div className="space-y-4">
                <FixedChoiceListbox
                  id="recare-premedication"
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
                    id="recare-premedication-details"
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

          <Section title="Records and Chief Concern">
            <CatalogueMultiCombobox
              id="recare-radiographs"
              label="Radiographs"
              catalogueKey="imaging.radiographs"
              values={form.radiographs}
              onChange={(value) => updateField("radiographs", value)}
            />
            <YesNoWithDetails
              id="recare-intraoral-photos"
              label="Intraoral photos"
              status={form.intraoralPhotosStatus}
              details={form.intraoralPhotosDetails}
              onStatusChange={(value) =>
                updateField("intraoralPhotosStatus", value)
              }
              onDetailsChange={(value) =>
                updateField("intraoralPhotosDetails", value)
              }
            />
            <TextareaField
              id="recare-chief-concern"
              label="Patient's chief concern"
              value={form.chiefConcern}
              onChange={(value) => updateField("chiefConcern", value)}
            />
          </Section>

          <Section title="Clinical Exam">
            <ExamFinding
              id="recare-extraoral"
              label="Extraoral"
              status={form.extraoralStatus}
              findings={form.extraoralFindings}
              onStatusChange={(value) => updateField("extraoralStatus", value)}
              onFindingsChange={(value) =>
                updateField("extraoralFindings", value)
              }
            />
            <ExamFinding
              id="recare-tmj"
              label="TMJ"
              status={form.tmjStatus}
              findings={form.tmjFindings}
              onStatusChange={(value) => updateField("tmjStatus", value)}
              onFindingsChange={(value) =>
                updateField("tmjFindings", value)
              }
            />
            <ExamFinding
              id="recare-masseter"
              label="Palpation of the masseter test"
              status={form.masseterStatus}
              findings={form.masseterFindings}
              onStatusChange={(value) => updateField("masseterStatus", value)}
              onFindingsChange={(value) =>
                updateField("masseterFindings", value)
              }
            />
            <ExamFinding
              id="recare-tmj-load"
              label="Load TMJ joint test"
              status={form.tmjLoadStatus}
              findings={form.tmjLoadFindings}
              onStatusChange={(value) => updateField("tmjLoadStatus", value)}
              onFindingsChange={(value) =>
                updateField("tmjLoadFindings", value)
              }
            />
            <ExamFinding
              id="recare-intraoral"
              label="Intraoral"
              status={form.intraoralStatus}
              findings={form.intraoralFindings}
              onStatusChange={(value) => updateField("intraoralStatus", value)}
              onFindingsChange={(value) =>
                updateField("intraoralFindings", value)
              }
            />

            <TextField
              id="recare-oral-habits"
              label="Oral habits"
              value={form.oralHabits}
              onChange={(value) => updateField("oralHabits", value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
                <CatalogueCombobox
                  id="recare-right-molar-occlusion"
                  label="Right molar occlusion"
                  catalogueKey="clinical-exam.molar-occlusion"
                  value={form.rightMolarOcclusion}
                  onChange={(value) =>
                    updateField("rightMolarOcclusion", value)
                  }
                  disabled={form.rightMolarOcclusionNotApplicable}
                />
                <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 sm:mt-6">
                  <input
                    id="recare-right-molar-na"
                    type="checkbox"
                    className="h-4 w-4 accent-sky-700"
                    checked={form.rightMolarOcclusionNotApplicable}
                    onChange={(event) => {
                      updateField(
                        "rightMolarOcclusionNotApplicable",
                        event.target.checked,
                      );
                      if (event.target.checked) {
                        updateField("rightMolarOcclusion", "");
                      }
                    }}
                  />
                  N/A
                </label>
              </div>
              <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
                <CatalogueCombobox
                  id="recare-left-molar-occlusion"
                  label="Left molar occlusion"
                  catalogueKey="clinical-exam.molar-occlusion"
                  value={form.leftMolarOcclusion}
                  onChange={(value) =>
                    updateField("leftMolarOcclusion", value)
                  }
                  disabled={form.leftMolarOcclusionNotApplicable}
                />
                <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 sm:mt-6">
                  <input
                    id="recare-left-molar-na"
                    type="checkbox"
                    className="h-4 w-4 accent-sky-700"
                    checked={form.leftMolarOcclusionNotApplicable}
                    onChange={(event) => {
                      updateField(
                        "leftMolarOcclusionNotApplicable",
                        event.target.checked,
                      );
                      if (event.target.checked) {
                        updateField("leftMolarOcclusion", "");
                      }
                    }}
                  />
                  N/A
                </label>
              </div>
            </div>

            <div className="grid items-start gap-4 md:grid-cols-[1fr_auto]">
              <CatalogueCombobox
                id="recare-skeletal-occlusion"
                label="Skeletal occlusion"
                catalogueKey="clinical-exam.skeletal-occlusion"
                value={form.skeletalOcclusion}
                onChange={(value) => updateField("skeletalOcclusion", value)}
                disabled={form.skeletalOcclusionNotApplicable}
              />
              <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 md:mt-6">
                <input
                  id="recare-skeletal-na"
                  type="checkbox"
                  className="h-4 w-4 accent-sky-700"
                  checked={form.skeletalOcclusionNotApplicable}
                  onChange={(event) => {
                    updateField(
                      "skeletalOcclusionNotApplicable",
                      event.target.checked,
                    );
                    if (event.target.checked) {
                      updateField("skeletalOcclusion", "");
                    }
                  }}
                />
                N/A
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="recare-overjet"
                label="Overjet (mm)"
                value={form.overjetMm}
                onChange={(value) => updateField("overjetMm", value)}
                inputMode="decimal"
              />
              <TextField
                id="recare-overbite"
                label="Overbite (%)"
                value={form.overbitePercent}
                onChange={(value) => updateField("overbitePercent", value)}
                inputMode="decimal"
              />
            </div>
          </Section>

          <Section title="Appliances and Relevant History">
            <div className="grid gap-4 md:grid-cols-2">
              <FixedChoiceListbox
                id="recare-cpap"
                label="Has a CPAP?"
                value={form.cpapStatus}
                options={statusOptions}
                onChange={(value) => {
                  updateField("cpapStatus", value);
                  if (value !== "yes") {
                    updateField("cpapUseStatus", "not-documented");
                  }
                }}
              />
              {form.cpapStatus === "yes" ? (
                <FixedChoiceListbox
                  id="recare-cpap-use"
                  label="Uses the CPAP?"
                  value={form.cpapUseStatus}
                  options={statusOptions}
                  onChange={(value) => updateField("cpapUseStatus", value)}
                />
              ) : null}
              <FixedChoiceListbox
                id="recare-occlusal-splint"
                label="Has an occlusal splint"
                value={form.occlusalSplintStatus}
                options={statusOptions}
                onChange={(value) => {
                  updateField("occlusalSplintStatus", value);
                  if (value !== "yes") {
                    updateField(
                      "occlusalSplintUseStatus",
                      "not-documented",
                    );
                  }
                }}
              />
              {form.occlusalSplintStatus === "yes" ? (
                <FixedChoiceListbox
                  id="recare-occlusal-splint-use"
                  label="Uses the occlusal splint"
                  value={form.occlusalSplintUseStatus}
                  options={statusOptions}
                  onChange={(value) =>
                    updateField("occlusalSplintUseStatus", value)
                  }
                />
              ) : null}
              <FixedChoiceListbox
                id="recare-orthodontics"
                label="Orthodontic history"
                value={form.orthodonticHistoryStatus}
                options={statusOptions}
                onChange={(value) =>
                  updateField("orthodonticHistoryStatus", value)
                }
              />
              <FixedChoiceListbox
                id="recare-retainers"
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
              <FixedChoiceListbox
                id="recare-removable-dentures"
                label="Partial/complete removable dentures"
                value={form.removableDenturesStatus}
                options={statusOptions}
                onChange={(value) =>
                  updateField("removableDenturesStatus", value)
                }
              />
            </div>
            <TextareaField
              id="recare-improvement-request"
              label="What would the patient like to improve about their smile or teeth?"
              value={form.improvementRequest}
              onChange={(value) => updateField("improvementRequest", value)}
            />
            <TextareaField
              id="recare-additional-comments"
              label="Additional comments"
              value={form.additionalComments}
              onChange={(value) => updateField("additionalComments", value)}
            />
          </Section>

          <Section title="Treatment and Next Visit">
            <CatalogueMultiCombobox
              id="recare-treatment-options"
              label="Treatment Options"
              catalogueKey="recare-treatment.items"
              values={form.treatmentOptions}
              onChange={(value) => updateField("treatmentOptions", value)}
            />

            <div className="space-y-3">
              {form.treatmentPlan.length === 0 ? (
                <button
                  type="button"
                  className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
                  disabled={form.treatmentOptions.length === 0}
                  onClick={() =>
                    updateField("treatmentPlan", [...form.treatmentOptions])
                  }
                >
                  Copy Treatment Options to Treatment Plan
                </button>
              ) : null}
              <CatalogueMultiCombobox
                id="recare-treatment-plan"
                label="Treatment Plan"
                catalogueKey="recare-treatment.items"
                values={form.treatmentPlan}
                onChange={(value) => updateField("treatmentPlan", value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="recare-next-visit"
                label="Next visit"
                value={form.nextVisit}
                onChange={(value) => updateField("nextVisit", value)}
              />
              <TextField
                id="recare-date-booked"
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
            <label className="sr-only" htmlFor="recare-summary">
              Generated Recare Exam note
            </label>
            <textarea
              id="recare-summary"
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
