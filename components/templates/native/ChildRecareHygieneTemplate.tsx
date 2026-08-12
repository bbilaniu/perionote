"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CatalogueCombobox } from "@/components/catalogues/CatalogueCombobox";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { formControlClass } from "@/components/forms/controlStyles";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import { IsoDateInput } from "@/components/forms/IsoDateInput";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { InteractiveTemplateHeader } from "@/components/templates/shared/InteractiveTemplateHeader";
import { LocalDraftRecovery } from "@/components/templates/shared/LocalDraftRecovery";
import { useLocalInteractiveDraft } from "@/components/templates/shared/useLocalInteractiveDraft";
import type {
  ChildDocumentationStatus,
  ChildExamStatus,
  ChildRecareHygieneForm,
  ChildRecareHygieneOutput,
} from "@/lib/templates/childRecareHygiene";
import {
  createEmptyChildRecareHygieneForm,
  hasRequiredChildRecareHygieneFields,
} from "@/lib/templates/childRecareHygiene";
import { matchesDraftShape } from "@/lib/templates/localDrafts";
import { buildChildRecareHygieneSummary } from "@/lib/templates/summary/buildChildRecareHygieneSummary";
import type { InteractiveTemplateProps } from "@/lib/templates/types";

const templateId = "child-recare-exam-hygiene-notes";
const emptyForm = createEmptyChildRecareHygieneForm();
const emptySerializedForm = JSON.stringify(emptyForm);
const controlClass = formControlClass();
const buttonClass =
  "rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

const documentationOptions = [
  { value: "not-documented", label: "Not documented" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

const examOptions = [
  { value: "not-assessed", label: "Not assessed" },
  { value: "wnl", label: "WNL" },
  { value: "findings", label: "Findings" },
] as const;

const outputOptions = [
  { value: "combined", label: "Combined" },
  { value: "dentist", label: "Dentist" },
  { value: "hygienist", label: "Hygienist" },
] as const;

function isValidForm(value: unknown): value is ChildRecareHygieneForm {
  return matchesDraftShape(value, emptyForm);
}

function isEmptyForm(value: ChildRecareHygieneForm): boolean {
  return JSON.stringify(value) === emptySerializedForm;
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
  type = "text",
  suffix,
  error,
  inputRef,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  suffix?: string;
  error?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "any" : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`${formControlClass({ invalid: Boolean(error) })} ${suffix ? "pr-14" : ""}`}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500 dark:text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        className={`${controlClass} mt-1 min-h-24 resize-y py-2`}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ExamControl({
  id,
  label,
  status,
  findings,
  onStatusChange,
  onFindingsChange,
}: {
  id: string;
  label: string;
  status: ChildExamStatus;
  findings: string;
  onStatusChange: (value: ChildExamStatus) => void;
  onFindingsChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <FixedChoiceListbox
        id={`${id}-status`}
        label={label}
        value={status}
        options={examOptions}
        onChange={onStatusChange}
      />
      {status === "findings" ? (
        <TextareaField
          id={`${id}-findings`}
          label={`${label} findings`}
          value={findings}
          onChange={onFindingsChange}
        />
      ) : null}
    </div>
  );
}

function StatusControl({
  id,
  label,
  status,
  detail,
  detailLabel,
  onStatusChange,
  onDetailChange,
}: {
  id: string;
  label: string;
  status: ChildDocumentationStatus;
  detail?: string;
  detailLabel?: string;
  onStatusChange: (value: ChildDocumentationStatus) => void;
  onDetailChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <FixedChoiceListbox
        id={`${id}-status`}
        label={label}
        value={status}
        options={documentationOptions}
        onChange={onStatusChange}
      />
      {status === "yes" && onDetailChange ? (
        <TextField
          id={`${id}-details`}
          label={detailLabel ?? `${label} details`}
          value={detail ?? ""}
          onChange={onDetailChange}
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
      // Use the explicit fallback for browsers without clipboard permission.
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

export function ChildRecareHygieneTemplate({
  fixture,
  presentation,
}: InteractiveTemplateProps<ChildRecareHygieneForm>) {
  const [form, setForm] = useState<ChildRecareHygieneForm>(
    createEmptyChildRecareHygieneForm,
  );
  const [output, setOutput] =
    useState<ChildRecareHygieneOutput>("combined");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [patientIdError, setPatientIdError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const patientIdRef = useRef<HTMLInputElement>(null);
  const dentistRef = useRef<HTMLInputElement>(null);
  const providerDefaultsApplied = useRef(false);
  const { providerDefaultsStorageStatus, getProviderDefault } = useCatalogues();

  const localDraft = useLocalInteractiveDraft({
    templateId,
    form,
    startedAt,
    isEmpty: isEmptyForm,
    isValidForm,
    onRestore: (draft) => {
      setForm({ ...createEmptyChildRecareHygieneForm(), ...draft.form });
      setStartedAt(new Date(draft.startedAt));
      setPatientIdError("");
      setProviderError("");
      setCopyMessage("");
    },
  });

  useEffect(() => setStartedAt((current) => current ?? new Date()), []);

  useEffect(() => {
    if (
      !localDraft.hydrated ||
      providerDefaultsStorageStatus !== "ready" ||
      providerDefaultsApplied.current
    ) {
      return;
    }
    providerDefaultsApplied.current = true;
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

  const summaries = useMemo(
    () => ({
      combined: buildChildRecareHygieneSummary(form, { output: "combined" }),
      dentist: buildChildRecareHygieneSummary(form, { output: "dentist" }),
      hygienist: buildChildRecareHygieneSummary(form, { output: "hygienist" }),
    }),
    [form],
  );
  const summary = summaries[output];
  const outputLabel =
    outputOptions.find((option) => option.value === output)?.label ?? "Note";

  function updateField<TKey extends keyof ChildRecareHygieneForm>(
    key: TKey,
    value: ChildRecareHygieneForm[TKey],
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
    const missingPatientId = !form.patientId.trim();
    const missingProvider = ![form.dentist, form.rdh, form.rda].some((value) =>
      value.trim(),
    );
    setPatientIdError(missingPatientId ? "Enter a Patient ID." : "");
    setProviderError(
      missingProvider ? "Enter at least one of Dentist, RDH, or RDA." : "",
    );
    setCopyMessage("");
    if (!hasRequiredChildRecareHygieneFields(form)) {
      requestAnimationFrame(() =>
        (missingPatientId ? patientIdRef : dentistRef).current?.focus(),
      );
      return;
    }
    const draftResult = localDraft.saveNow();
    const copied = await writeClipboard(summary);
    setCopyMessage(
      copied
        ? draftResult === "failed"
          ? `${outputLabel} note copied, but the local draft could not be saved.`
          : `${outputLabel} note copied.`
        : "The note could not be copied. Select the preview and copy it manually.",
    );
  }

  function resetForm() {
    if (
      !isEmptyForm(form) &&
      !window.confirm(
        "Clear all entered Child Recare Exam & Hygiene values and start a new note? The current local draft will remain available for up to seven days.",
      )
    ) {
      return;
    }
    localDraft.beginNewDraft();
    setForm({
      ...createEmptyChildRecareHygieneForm(),
      dentist: getProviderDefault("visit-team.dentist")?.label ?? "",
      rdh: getProviderDefault("visit-team.rdh")?.label ?? "",
      rda: getProviderDefault("visit-team.rda")?.label ?? "",
    });
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
  }

  return (
    <div className="space-y-5">
      <InteractiveTemplateHeader {...presentation} />
      <LocalDraftRecovery
        drafts={localDraft.recoverableDrafts}
        lastSavedAt={localDraft.lastSavedAt}
        restoredAt={localDraft.restoredAt}
        storageError={localDraft.storageError}
        onRestore={localDraft.restoreDraft}
      />

      <form
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)]"
        onSubmit={(event) => {
          event.preventDefault();
          void copyNote();
        }}
      >
        <div className="space-y-5">
          <Section
            title="Patient and visit"
            description="Record the pediatric recall team, consent, infection-control checks, and visit context."
          >
            <TextField
              id="child-recare-patient-id"
              label="Patient ID"
              value={form.patientId}
              inputRef={patientIdRef}
              error={patientIdError}
              onChange={(value) => updateField("patientId", value)}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <CatalogueCombobox
                id="child-recare-dentist"
                label="Dentist"
                catalogueKey="visit-team.dentist"
                value={form.dentist}
                inputRef={dentistRef}
                error={providerError}
                onChange={(value) => updateField("dentist", value)}
              />
              <CatalogueCombobox
                id="child-recare-rdh"
                label="RDH"
                catalogueKey="visit-team.rdh"
                value={form.rdh}
                onChange={(value) => updateField("rdh", value)}
              />
              <CatalogueCombobox
                id="child-recare-rda"
                label="RDA"
                catalogueKey="visit-team.rda"
                value={form.rda}
                onChange={(value) => updateField("rda", value)}
              />
            </div>
            <TextField
              id="child-recare-consent"
              label="Consent given by"
              value={form.consentBy}
              onChange={(value) => updateField("consentBy", value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <StatusControl
                id="child-recare-class5"
                label="Class 5 indicator strip checked"
                status={form.class5IndicatorStatus}
                onStatusChange={(value) =>
                  updateField("class5IndicatorStatus", value)
                }
              />
              <TextField
                id="child-recare-miele"
                label="Miele sterilization codes"
                value={form.mieleCodes}
                onChange={(value) => updateField("mieleCodes", value)}
              />
            </div>
            <CatalogueCombobox
              id="child-recare-chief-concern"
              label="Patient's chief concern"
              catalogueKey="patient.chief-concerns"
              value={form.chiefConcern}
              onChange={(value) => updateField("chiefConcern", value)}
            />
            <TextareaField
              id="child-recare-medical-history"
              label="Medical history"
              value={form.medicalHistory}
              onChange={(value) => updateField("medicalHistory", value)}
            />
            <StatusControl
              id="child-recare-premedication"
              label="Premedication required"
              status={form.premedicationStatus}
              detail={form.premedicationDetails}
              detailLabel="Premedication details"
              onStatusChange={(value) =>
                updateField("premedicationStatus", value)
              }
              onDetailChange={(value) =>
                updateField("premedicationDetails", value)
              }
            />
          </Section>

          <Section
            title="Records and dental exam"
            description="Document only assessed findings; unanswered controls are omitted from the note."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="child-recare-radiographs"
                label="Radiographs"
                value={form.radiographs}
                onChange={(value) => updateField("radiographs", value)}
              />
              <StatusControl
                id="child-recare-photos"
                label="Intraoral photos"
                status={form.intraoralPhotosStatus}
                detail={form.intraoralPhotosDetails}
                onStatusChange={(value) =>
                  updateField("intraoralPhotosStatus", value)
                }
                onDetailChange={(value) =>
                  updateField("intraoralPhotosDetails", value)
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ExamControl
                id="child-recare-extraoral"
                label="Extraoral exam"
                status={form.extraoralStatus}
                findings={form.extraoralFindings}
                onStatusChange={(value) => updateField("extraoralStatus", value)}
                onFindingsChange={(value) =>
                  updateField("extraoralFindings", value)
                }
              />
              <ExamControl
                id="child-recare-intraoral"
                label="Intraoral exam"
                status={form.intraoralStatus}
                findings={form.intraoralFindings}
                onStatusChange={(value) => updateField("intraoralStatus", value)}
                onFindingsChange={(value) =>
                  updateField("intraoralFindings", value)
                }
              />
              <StatusControl
                id="child-recare-habits"
                label="Oral habits present"
                status={form.oralHabitsStatus}
                detail={form.oralHabitsDetails}
                detailLabel="Oral habits"
                onStatusChange={(value) =>
                  updateField("oralHabitsStatus", value)
                }
                onDetailChange={(value) =>
                  updateField("oralHabitsDetails", value)
                }
              />
              <ExamControl
                id="child-recare-tmj"
                label="TMJ"
                status={form.tmjStatus}
                findings={form.tmjFindings}
                onStatusChange={(value) => updateField("tmjStatus", value)}
                onFindingsChange={(value) => updateField("tmjFindings", value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="child-recare-molar-occlusion"
                label="Molar occlusion / molar classification"
                value={form.molarOcclusion}
                onChange={(value) => updateField("molarOcclusion", value)}
              />
              <TextField
                id="child-recare-skeletal-classification"
                label="Skeletal classification"
                value={form.skeletalClassification}
                onChange={(value) =>
                  updateField("skeletalClassification", value)
                }
              />
              <TextField
                id="child-recare-overjet"
                label="Overjet"
                value={form.overjetMm}
                type="number"
                suffix="mm"
                onChange={(value) => updateField("overjetMm", value)}
              />
              <TextField
                id="child-recare-overbite"
                label="Overbite"
                value={form.overbitePercent}
                type="number"
                suffix="%"
                onChange={(value) => updateField("overbitePercent", value)}
              />
            </div>
            <TextareaField
              id="child-recare-doctor-comments"
              label="Doctor comments"
              value={form.doctorComments}
              onChange={(value) => updateField("doctorComments", value)}
            />
            <StatusControl
              id="child-recare-caries"
              label="Caries detected"
              status={form.cariesStatus}
              detail={form.cariesDetails}
              detailLabel="Caries details"
              onStatusChange={(value) => updateField("cariesStatus", value)}
              onDetailChange={(value) => updateField("cariesDetails", value)}
            />
          </Section>

          <Section title="Hygiene assessment and treatment">
            <div className="grid gap-4 md:grid-cols-2">
              <StatusControl
                id="child-recare-disclosed"
                label="Disclosed"
                status={form.disclosedStatus}
                onStatusChange={(value) => updateField("disclosedStatus", value)}
              />
              <TextField
                id="child-recare-plaque-index"
                label="Plaque index"
                value={form.plaqueIndex}
                onChange={(value) => updateField("plaqueIndex", value)}
              />
              <StatusControl
                id="child-recare-calculus"
                label="Calculus present"
                status={form.calculusStatus}
                detail={form.calculusLocation}
                detailLabel="Calculus location"
                onStatusChange={(value) => updateField("calculusStatus", value)}
                onDetailChange={(value) =>
                  updateField("calculusLocation", value)
                }
              />
            </div>
            <NativeChoiceControl
              type="checkbox"
              checked={form.ohiReviewed}
              onChange={(checked) => updateField("ohiReviewed", checked)}
            >
              OHI reviewed
            </NativeChoiceControl>
            <div className="grid gap-4 md:grid-cols-2">
              <TextareaField
                id="child-recare-flossing"
                label="Flossing technique"
                value={form.flossingTechnique}
                onChange={(value) => updateField("flossingTechnique", value)}
              />
              <TextareaField
                id="child-recare-brushing"
                label="Brushing technique"
                value={form.brushingTechnique}
                onChange={(value) => updateField("brushingTechnique", value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <StatusControl
                id="child-recare-scaling"
                label="Scaling completed"
                status={form.scalingStatus}
                detail={form.scalingUnits}
                detailLabel="Scaling units"
                onStatusChange={(value) => updateField("scalingStatus", value)}
                onDetailChange={(value) => updateField("scalingUnits", value)}
              />
              <StatusControl
                id="child-recare-polish"
                label="Polish completed"
                status={form.polishStatus}
                detail={form.polishDetails}
                onStatusChange={(value) => updateField("polishStatus", value)}
                onDetailChange={(value) => updateField("polishDetails", value)}
              />
              <StatusControl
                id="child-recare-fluoride"
                label="Fluoride completed"
                status={form.fluorideStatus}
                detail={form.fluorideDetails}
                onStatusChange={(value) => updateField("fluorideStatus", value)}
                onDetailChange={(value) => updateField("fluorideDetails", value)}
              />
            </div>
          </Section>

          <Section title="Communication and follow-up">
            <StatusControl
              id="child-recare-guardian"
              label="Information relayed to parent or legal guardian"
              status={form.guardianCommunicationStatus}
              detail={form.guardianCommunicationDetails}
              detailLabel="Information relayed"
              onStatusChange={(value) =>
                updateField("guardianCommunicationStatus", value)
              }
              onDetailChange={(value) =>
                updateField("guardianCommunicationDetails", value)
              }
            />
            <TextareaField
              id="child-recare-goal"
              label="Goal for next visit"
              value={form.goalForNextVisit}
              onChange={(value) => updateField("goalForNextVisit", value)}
            />
            <TextareaField
              id="child-recare-comments"
              label="RDH/RDA comments"
              value={form.clinicalComments}
              onChange={(value) => updateField("clinicalComments", value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="child-recare-recall-interval"
                label="Recall interval"
                catalogueKey="scheduling.recall-interval"
                value={form.recallInterval}
                onChange={(value) => updateField("recallInterval", value)}
              />
              <CatalogueCombobox
                id="child-recare-hygiene-interval"
                label="Hygiene interval"
                catalogueKey="scheduling.hygiene-interval"
                value={form.hygieneInterval}
                onChange={(value) => updateField("hygieneInterval", value)}
              />
              <CatalogueCombobox
                id="child-recare-next-visit"
                label="Next visit"
                catalogueKey="scheduling.dentist-next-visit"
                value={form.nextVisit}
                onChange={(value) => updateField("nextVisit", value)}
              />
              <IsoDateInput
                id="child-recare-booked"
                label="Booked date"
                value={form.bookedDate}
                onChange={(value) => updateField("bookedDate", value)}
              />
            </div>
          </Section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Generated note</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Select the audience-specific view. The visible preview is copied unchanged.
            </p>
            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Note output</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {outputOptions.map((option) => (
                  <NativeChoiceControl
                    key={option.value}
                    type="radio"
                    name="child-recare-output"
                    checked={output === option.value}
                    className="px-2"
                    onChange={() => {
                      setOutput(option.value);
                      setCopyMessage("");
                    }}
                  >
                    {option.label}
                  </NativeChoiceControl>
                ))}
              </div>
            </fieldset>
            <label className="sr-only" htmlFor="child-recare-summary">
              Generated {outputLabel.toLowerCase()} note
            </label>
            <textarea
              id="child-recare-summary"
              className={`${controlClass} mt-4 min-h-[34rem] resize-y py-2 font-mono leading-6`}
              readOnly
              value={summary}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!startedAt}
                className={`${buttonClass} bg-slate-900 text-white hover:bg-slate-700 dark:bg-sky-700 dark:hover:bg-sky-600`}
              >
                Copy {outputLabel.toLowerCase()} note
              </button>
              <button
                type="button"
                className={`${buttonClass} border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800`}
                onClick={() => {
                  setForm({ ...fixture });
                  setPatientIdError("");
                  setProviderError("");
                  setCopyMessage("Synthetic demo data loaded.");
                }}
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
