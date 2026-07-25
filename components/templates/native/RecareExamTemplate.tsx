"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
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

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900 dark:disabled:bg-slate-900";

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

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
      <SelectField
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
      <SelectField
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
  const emptyForm = useMemo(() => createEmptyRecareExamForm(), []);
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

  const summary = useMemo(
    () =>
      buildRecareExamSummary(form, {
        ...(startedAt ? { startedAt } : {}),
      }),
    [form, startedAt],
  );
  const isDirty = JSON.stringify(form) !== JSON.stringify(emptyForm);

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
    if (
      isDirty &&
      !window.confirm(
        "Clear all entered Recare Exam values? This cannot be undone.",
      )
    ) {
      return;
    }

    setForm(createEmptyRecareExamForm());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    patientIdRef.current?.focus();
  }

  function handleCheckbox(
    key: keyof Pick<
      RecareExamForm,
      | "consentObtained"
      | "class5IndicatorsChecked"
      | "rightMolarOcclusionNotApplicable"
      | "leftMolarOcclusionNotApplicable"
      | "skeletalOcclusionNotApplicable"
      | "treatmentOptionsHygieneMaintenance"
      | "treatmentPlanHygieneMaintenance"
    >,
  ) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateField(key, event.target.checked);
    };
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
          Draft interactive conversion
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
                id="recare-form-started"
                label="Form started (page loaded)"
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
                <TextField
                  id="recare-dentist"
                  label="Dentist"
                  value={form.dentist}
                  onChange={(value) => updateField("dentist", value)}
                  inputRef={dentistRef}
                />
                <TextField
                  id="recare-rda"
                  label="RDA"
                  value={form.rda}
                  onChange={(value) => updateField("rda", value)}
                />
                <TextField
                  id="recare-rdh"
                  label="RDH"
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
            <label className="flex items-start gap-3 text-sm">
              <input
                id="recare-consent"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-sky-700"
                checked={form.consentObtained}
                onChange={handleCheckbox("consentObtained")}
              />
              <span>Informed verbal consent obtained for treatment today</span>
            </label>
            {form.consentObtained ? (
              <TextField
                id="recare-consent-details"
                label="Consent details"
                value={form.consentDetails}
                onChange={(value) => updateField("consentDetails", value)}
                placeholder="Optional details"
              />
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="recare-medical-history"
                label="Medical history"
                value={form.medicalHistoryStatus}
                options={[
                  { value: "not-documented", label: "Not documented" },
                  {
                    value: "reviewed-no-changes",
                    label: "Reviewed—no changes",
                  },
                  { value: "reviewed-updated", label: "Reviewed—updated" },
                ]}
                onChange={(value) =>
                  updateField("medicalHistoryStatus", value)
                }
              />
              {form.medicalHistoryStatus === "reviewed-updated" ? (
                <TextField
                  id="recare-medical-history-details"
                  label="Medical history update details"
                  value={form.medicalHistoryDetails}
                  onChange={(value) =>
                    updateField("medicalHistoryDetails", value)
                  }
                />
              ) : null}

              <SelectField
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

            <label className="flex items-start gap-3 text-sm">
              <input
                id="recare-class5"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-sky-700"
                checked={form.class5IndicatorsChecked}
                onChange={handleCheckbox("class5IndicatorsChecked")}
              />
              <span>Class 5 indicators checked</span>
            </label>
            <TextField
              id="recare-miele-codes"
              label="Miele sterilization codes"
              value={form.mieleCodes}
              onChange={(value) => updateField("mieleCodes", value)}
            />
          </Section>

          <Section title="Records and Chief Concern">
            <YesNoWithDetails
              id="recare-radiographs"
              label="Radiographs"
              status={form.radiographsStatus}
              details={form.radiographsDetails}
              onStatusChange={(value) =>
                updateField("radiographsStatus", value)
              }
              onDetailsChange={(value) =>
                updateField("radiographsDetails", value)
              }
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
              <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
                <TextField
                  id="recare-right-molar-occlusion"
                  label="Right molar occlusion"
                  value={form.rightMolarOcclusion}
                  onChange={(value) =>
                    updateField("rightMolarOcclusion", value)
                  }
                  disabled={form.rightMolarOcclusionNotApplicable}
                />
                <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
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
              <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
                <TextField
                  id="recare-left-molar-occlusion"
                  label="Left molar occlusion"
                  value={form.leftMolarOcclusion}
                  onChange={(value) =>
                    updateField("leftMolarOcclusion", value)
                  }
                  disabled={form.leftMolarOcclusionNotApplicable}
                />
                <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
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

            <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
              <TextField
                id="recare-skeletal-occlusion"
                label="Skeletal occlusion"
                value={form.skeletalOcclusion}
                onChange={(value) => updateField("skeletalOcclusion", value)}
                disabled={form.skeletalOcclusionNotApplicable}
              />
              <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
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
              <SelectField
                id="recare-cpap"
                label="CPAP use"
                value={form.cpapStatus}
                options={statusOptions}
                onChange={(value) => updateField("cpapStatus", value)}
              />
              <SelectField
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
                <SelectField
                  id="recare-occlusal-splint-use"
                  label="Uses the occlusal splint"
                  value={form.occlusalSplintUseStatus}
                  options={statusOptions}
                  onChange={(value) =>
                    updateField("occlusalSplintUseStatus", value)
                  }
                />
              ) : null}
              <SelectField
                id="recare-orthodontics"
                label="Orthodontic history"
                value={form.orthodonticHistoryStatus}
                options={statusOptions}
                onChange={(value) =>
                  updateField("orthodonticHistoryStatus", value)
                }
              />
              <SelectField
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
              <SelectField
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
            <fieldset className="space-y-3">
              <legend className="font-semibold">Treatment Options</legend>
              <label className="flex items-center gap-3 text-sm">
                <input
                  id="recare-treatment-option-hygiene"
                  type="checkbox"
                  className="h-4 w-4 accent-sky-700"
                  checked={form.treatmentOptionsHygieneMaintenance}
                  onChange={handleCheckbox(
                    "treatmentOptionsHygieneMaintenance",
                  )}
                />
                Hygiene maintenance
              </label>
              <TextareaField
                id="recare-other-treatment-options"
                label="Other treatment options"
                value={form.otherTreatmentOptions}
                onChange={(value) =>
                  updateField("otherTreatmentOptions", value)
                }
                placeholder="Enter one option per line"
              />
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-semibold">Treatment Plan</legend>
              <label className="flex items-center gap-3 text-sm">
                <input
                  id="recare-treatment-plan-hygiene"
                  type="checkbox"
                  className="h-4 w-4 accent-sky-700"
                  checked={form.treatmentPlanHygieneMaintenance}
                  onChange={handleCheckbox("treatmentPlanHygieneMaintenance")}
                />
                Hygiene maintenance
              </label>
              <TextareaField
                id="recare-other-treatment-plan"
                label="Other treatment plan"
                value={form.otherTreatmentPlan}
                onChange={(value) => updateField("otherTreatmentPlan", value)}
                placeholder="Enter one plan item per line"
              />
            </fieldset>

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
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
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
