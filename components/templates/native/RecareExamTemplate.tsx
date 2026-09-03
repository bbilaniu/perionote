"use client";

import {
  useEffect,
  useId,
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
  RecareExtraoralFinding,
  RecareIntraoralFinding,
  RecareOcclusalFinding,
  RecareToothFinding,
  RecareTreatmentEntry,
} from "@/lib/templates/recareExam";
import {
  recareToothOptions,
  recareToothWnlOptionIds,
} from "@/lib/templates/recareTeethCatalog";
import {
  createEmptyRecareExamForm,
  hasRequiredRecareExamFields,
} from "@/lib/templates/recareExam";
import { applyPatientChiefConcernSelectionRules } from "@/lib/templates/patientChiefConcern";
import {
  buildRecareExamSummary,
  formatRecareExamLocalTimestamp,
} from "@/lib/templates/summary/buildRecareExamSummary";
import { CatalogueCombobox } from "@/components/catalogues/CatalogueCombobox";
import { CatalogueMultiCombobox } from "@/components/catalogues/CatalogueMultiCombobox";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import type { CatalogueKey } from "@/lib/catalogues/catalogue";
import {
  DropdownChevron,
  formControlClass,
} from "@/components/forms/controlStyles";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import {
  FixedChoiceMultiCombobox,
  type FixedChoiceMultiComboboxGroup,
} from "@/components/forms/FixedChoiceMultiCombobox";
import { IsoDateInput } from "@/components/forms/IsoDateInput";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { TooltipActionButton } from "@/components/forms/TooltipActionButton";
import { GeneratedNotePanel } from "@/components/templates/shared/GeneratedNotePanel";
import { InteractiveTemplateWorkspace } from "@/components/templates/shared/InteractiveTemplateWorkspace";
import { LocalDraftRecovery } from "@/components/templates/shared/LocalDraftRecovery";
import { RadiographsTakenControl } from "@/components/templates/shared/RadiographsTakenControl";
import { useLocalInteractiveDraft } from "@/components/templates/shared/useLocalInteractiveDraft";
import {
  createRecareNormalStructuredIntraoralFindings,
  recareIntraoralLocationChoices,
  recareIntraoralOptionById,
  recareIntraoralOptionConflicts,
  recareIntraoralQuickPresets,
  recareIntraoralStructures,
  type RecareIntraoralQuickPreset,
  type RecareIntraoralStructure,
} from "@/lib/templates/recareIntraoralCatalog";
import {
  createRecareExtraoralFinding,
  extraoralLateralityToSides,
  extraoralSideOptions,
  extraoralSidesToLaterality,
  recareExtraoralOptions,
} from "@/lib/templates/extraoralObservationsCatalog";
import { matchesDraftShape } from "@/lib/templates/localDrafts";
import {
  createTemplateSectionNavigation,
  getTemplateSectionId,
} from "@/lib/templates/sectionNavigation";
import type { InteractiveTemplateProps } from "@/lib/templates/types";

const inputClass = `mt-1 ${formControlClass()}`;

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const treatmentRowButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const treatmentRowRemoveButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";

const recareNoteDiscardWarning =
  "Clear all entered Recare Exam values and start a new note? The current local draft will remain available on Saved drafts for up to seven days.";
const recareDraftExemplar = createEmptyRecareExamForm();
const emptyRecareDraft = JSON.stringify(recareDraftExemplar);
const recareDraftArrayItemShapes = {
  radiographs: "",
  chiefConcern: "",
  structuredExtraoralFindings: {
    optionId: "",
    laterality: "",
    statuses: [],
    phases: [],
    locations: [],
    swelling: [],
  },
  "structuredExtraoralFindings[].statuses": "",
  "structuredExtraoralFindings[].phases": "",
  "structuredExtraoralFindings[].locations": "",
  "structuredExtraoralFindings[].swelling": "",
  structuredIntraoralFindings: { optionId: "", structureId: "" },
  additionalOcclusalFindings: { id: "", finding: "", locations: [] },
  "additionalOcclusalFindings[].locations": "",
  toothFindings: { id: "", optionId: "", toothAreas: [] },
  "toothFindings[].toothAreas": "",
  treatmentOptions: { id: "", treatmentType: "", toothArea: "" },
  treatmentPlan: { id: "", treatmentType: "", toothArea: "" },
} as const;

function isEmptyRecareDraft(form: RecareExamForm): boolean {
  return (
    JSON.stringify({ ...form, dentist: "", rdh: "", rda: "" }) ===
    emptyRecareDraft
  );
}

function isRecareDraftForm(value: unknown): value is RecareExamForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return matchesDraftShape(
    { ...recareDraftExemplar, ...value },
    recareDraftExemplar,
    recareDraftArrayItemShapes,
  );
}

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

const recareExamSections = createTemplateSectionNavigation([
  "Patient and Visit Context",
  "Visit Team",
  "Consent, Medical History, and Sterilization",
  "Records and Chief Concern",
  "Clinical Exam",
  "Occlusion & Habits",
  "Appliances and Relevant History",
  "Odontogram",
  "Treatment and Next Visit",
]);

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
      className="scroll-mt-32 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:scroll-mt-6"
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
  type = "text",
  inputMode,
  disabled,
  readOnly,
  placeholder,
  helpText,
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
  helpText?: string;
}) {
  const errorId = `${id}-error`;
  const helpTextId = `${id}-help`;
  const describedBy =
    [helpText ? helpTextId : "", error ? errorId : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {type === "date" ? (
        <IsoDateInput
          id={id}
          label={label}
          value={value}
          onChange={onChange}
          inputRef={inputRef}
          disabled={disabled}
          readOnly={readOnly}
          ariaInvalid={Boolean(error)}
          ariaDescribedBy={describedBy}
        />
      ) : (
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
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {helpText ? (
        <p
          id={helpTextId}
          className="mt-1 text-xs text-slate-500 dark:text-slate-400"
        >
          {helpText}
        </p>
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

type TeethAssessmentForm = Pick<
  RecareExamForm,
  "teethStatus" | "toothFindings" | "additionalToothFindings"
>;

export function TeethAssessment({
  idPrefix = "recare",
  form,
  onChange,
}: {
  idPrefix?: string;
  form: TeethAssessmentForm;
  onChange: (patch: Partial<TeethAssessmentForm>) => void;
}) {
  const findings = form.toothFindings ?? [];
  const status = form.teethStatus ?? "not-assessed";
  const hasDocumented =
    findings.length > 0 || Boolean(form.additionalToothFindings?.trim());
  const structuredObservationCount =
    findings.length + Number(Boolean(form.additionalToothFindings?.trim()));
  const structuredObservationSummary =
    status === "wnl"
      ? "WNL"
      : structuredObservationCount
      ? `${structuredObservationCount} ${
          structuredObservationCount === 1 ? "observation" : "observations"
        } documented`
      : "Not assessed";
  const shouldAutoExpandStructuredObservations = status === "findings";
  const [structuredObservationsOpen, setStructuredObservationsOpen] = useState(
    shouldAutoExpandStructuredObservations,
  );

  useEffect(() => {
    if (shouldAutoExpandStructuredObservations) {
      setStructuredObservationsOpen(true);
    }
  }, [shouldAutoExpandStructuredObservations]);

  const createFinding = (optionId: string): RecareToothFinding => ({
    id: `${optionId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    optionId,
    toothAreas: [],
  });
  function setStatus(next: ExamStatus) {
    if (next === "wnl") {
      if (
        hasDocumented &&
        !window.confirm(
          "Clear the documented Teeth findings and set this assessment to WNL?",
        )
      )
        return;
      onChange({
        teethStatus: "wnl",
        toothFindings: recareToothWnlOptionIds.map(createFinding),
        additionalToothFindings: "",
      });
    } else if (next === "not-assessed") {
      if (
        hasDocumented &&
        !window.confirm(
          "Clear all documented Teeth observations and return this assessment to Not assessed?",
        )
      )
        return;
      onChange({
        teethStatus: next,
        toothFindings: [],
        additionalToothFindings: "",
      });
    } else onChange({ teethStatus: next });
  }
  function applyNormalStructuredObservations() {
    if (
      hasDocumented &&
      !window.confirm(
        "Replace all entered dental findings with the reviewed normal structured observations?",
      )
    )
      return;
    onChange({
      teethStatus: "findings",
      toothFindings: recareToothWnlOptionIds.map(createFinding),
      additionalToothFindings: "",
    });
  }
  function add(optionId: string) {
    const option = recareToothOptions.find((item) => item.id === optionId);
    if (!option) return;
    const conflicts = new Set(option.conflictsWithOptionIds);
    const removed = findings.filter((item) => conflicts.has(item.optionId));
    if (
      removed.some(
        (item) =>
          item.toothAreas.length ||
          item.surface ||
          item.activity ||
          item.millerGrade ||
          item.comment,
      ) &&
      !window.confirm(
        "Replace the conflicting documented tooth observation and discard its annotations?",
      )
    )
      return;
    onChange({
      teethStatus: "findings",
      toothFindings: [
        ...findings.filter((item) => !conflicts.has(item.optionId)),
        createFinding(optionId),
      ],
    });
  }
  function patch(id: string, changes: Partial<RecareToothFinding>) {
    onChange({
      teethStatus: "findings",
      toothFindings: findings.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    });
  }
  return (
    <div className="space-y-4">
      <FixedChoiceListbox
        id={`${idPrefix}-teeth-status`}
        label="Teeth"
        value={status}
        options={examStatusOptions}
        onChange={setStatus}
      />
      <fieldset
        className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
        aria-label="Structured dental observations"
      >
        <button
          id={`${idPrefix}-structured-dental-observations`}
          type="button"
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
          aria-expanded={structuredObservationsOpen}
          aria-controls={`${idPrefix}-structured-dental-observations-content`}
          onClick={() => setStructuredObservationsOpen((open) => !open)}
        >
          <span className="min-w-0">Structured dental observations</span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
              {structuredObservationSummary}
            </span>
            <DropdownChevron open={structuredObservationsOpen} />
          </span>
          <span className="col-span-2 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
            {structuredObservationSummary}
          </span>
        </button>
        {structuredObservationsOpen ? (
          <div
            id={`${idPrefix}-structured-dental-observations-content`}
            className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700"
          >
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apply the reviewed normal observations or select individual
                observations. Both document Findings.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`${buttonClass} bg-sky-700 text-white hover:bg-sky-800`}
                  onClick={applyNormalStructuredObservations}
                >
                  Apply normal structured observations
                </button>
                <button
                  type="button"
                  className={`${buttonClass} border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800`}
                  onClick={() => setStatus("not-assessed")}
                  disabled={status === "not-assessed" && !hasDocumented}
                >
                  Clear dental observations
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recareToothOptions
                  .filter(
                    (option) =>
                      !findings.some(
                        (finding) => finding.optionId === option.id,
                      ),
                  )
                  .map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`${buttonClass} border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900`}
                      onClick={() => add(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
              {recareToothOptions.flatMap((option) => {
                const optionFindings = findings.filter(
                  (finding) => finding.optionId === option.id,
                );
                if (!optionFindings.length) return [];
                const clinicalFieldCount =
                  Number(option.supportsTooth) +
                  Number(option.supportsSurface) +
                  Number(option.supportsActivity) +
                  Number(option.supportsGrade && !option.fixedGrade);
                const detailGridClass =
                  clinicalFieldCount > 0
                    ? "grid min-w-0 items-end gap-3 sm:grid-cols-2 [&>*]:min-w-0"
                    : "grid min-w-0 items-end gap-3 [&>*]:min-w-0";
                const clinicalGridClass =
                  clinicalFieldCount >= 3
                    ? "grid min-w-0 grid-cols-3 items-end gap-3 [&>*]:min-w-0"
                    : clinicalFieldCount === 2
                    ? "grid min-w-0 grid-cols-2 items-end gap-3 [&>*]:min-w-0"
                    : "grid min-w-0 grid-cols-1 items-end gap-3 [&>*]:min-w-0";
                return [
                  <fieldset
                    key={option.id}
                    className="min-w-0 space-y-3"
                    aria-label={`${option.label} dental observations`}
                  >
                    <legend className="px-1 text-sm font-semibold">
                      {option.label}
                      {optionFindings.length > 1
                        ? ` (${optionFindings.length} entries)`
                        : ""}
                    </legend>
                    {optionFindings.map((finding, index) => (
                      <div
                        key={finding.id}
                        role="group"
                        aria-label={`${option.label} entry ${index + 1}`}
                        className="min-w-0 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                      >
                        <div className={detailGridClass}>
                          {clinicalFieldCount > 0 ? (
                            <div className={clinicalGridClass}>
                              {option.supportsTooth ? (
                                <TextField
                                  id={`${idPrefix}-tooth-area-${finding.id}`}
                                  label="Tooth/area"
                                  value={finding.toothAreas.join(", ")}
                                  onChange={(value) =>
                                    patch(finding.id, {
                                      toothAreas: value
                                        .split(",")
                                        .map((item) => item.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                />
                              ) : null}
                              {option.supportsSurface ? (
                                <TextField
                                  id={`${idPrefix}-tooth-surface-${finding.id}`}
                                  label="Surface(s)"
                                  value={finding.surface ?? ""}
                                  onChange={(surface) =>
                                    patch(finding.id, { surface })
                                  }
                                />
                              ) : null}
                              {option.supportsActivity ? (
                                <FixedChoiceListbox
                                  id={`${idPrefix}-tooth-activity-${finding.id}`}
                                  label="Activity"
                                  value={finding.activity ?? ""}
                                  options={[
                                    { value: "", label: "Not assessed" },
                                    { value: "active", label: "Active" },
                                    { value: "inactive", label: "Inactive" },
                                  ]}
                                  onChange={(activity) =>
                                    patch(finding.id, {
                                      activity: activity || undefined,
                                    })
                                  }
                                />
                              ) : null}
                              {option.supportsGrade && !option.fixedGrade ? (
                                <FixedChoiceListbox
                                  id={`${idPrefix}-tooth-grade-${finding.id}`}
                                  label="Mobility — Miller Index"
                                  value={finding.millerGrade ?? ""}
                                  options={[
                                    { value: "", label: "Select grade" },
                                    { value: "M1", label: "M1" },
                                    { value: "M2", label: "M2" },
                                    { value: "M3", label: "M3" },
                                  ]}
                                  onChange={(millerGrade) =>
                                    patch(finding.id, {
                                      millerGrade: millerGrade || undefined,
                                    })
                                  }
                                />
                              ) : null}
                            </div>
                          ) : null}
                          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3 [&>*]:min-w-0">
                            <TextField
                              id={`${idPrefix}-tooth-notes-${finding.id}`}
                              label="Notes"
                              value={finding.comment ?? ""}
                              onChange={(comment) =>
                                patch(finding.id, { comment })
                              }
                            />
                            <button
                              type="button"
                              className={treatmentRowRemoveButtonClass}
                              onClick={() =>
                                onChange({
                                  toothFindings: findings.filter(
                                    (item) => item.id !== finding.id,
                                  ),
                                })
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {option.allowMultipleInstances ? (
                      <button
                        type="button"
                        className={treatmentRowButtonClass}
                        onClick={() => add(option.id)}
                      >
                        Add another {option.label}
                      </button>
                    ) : null}
                  </fieldset>,
                ];
              })}
              <TextareaField
                id={`${idPrefix}-additional-tooth-findings`}
                label="Additional tooth findings"
                value={form.additionalToothFindings ?? ""}
                onChange={(additionalToothFindings) =>
                  onChange({
                    teethStatus: "findings",
                    additionalToothFindings,
                  })
                }
              />
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-t border-slate-200 pt-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
                onClick={() => setStructuredObservationsOpen(false)}
              >
                Collapse observations
                <DropdownChevron open />
              </button>
            </>
          </div>
        ) : null}
      </fieldset>
    </div>
  );
}

export function TreatmentEntryList({
  id,
  label,
  addLabel,
  entries,
  onAdd,
  onChange,
  showCareType = false,
  catalogueKey = "dental-treatment.items",
}: {
  id: string;
  label: string;
  addLabel: string;
  entries: RecareTreatmentEntry[];
  onAdd: () => void;
  onChange: (entries: RecareTreatmentEntry[]) => void;
  showCareType?: boolean;
  catalogueKey?: CatalogueKey;
}) {
  function updateEntry(
    entryId: string,
    patch: Partial<Omit<RecareTreatmentEntry, "id">>,
  ) {
    onChange(
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, ...patch } : entry,
      ),
    );
  }

  function moveEntry(index: number, direction: "earlier" | "later") {
    const targetIndex = direction === "earlier" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) {
      return;
    }
    const reordered = [...entries];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    onChange(reordered);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{label}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Only the treatment type can be remembered.
      </p>
      {entries.length ? (
        <ol className="space-y-3" aria-label={`${label} entries`}>
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <div
                className={`grid gap-3 ${
                  showCareType
                    ? "md:grid-cols-[minmax(8rem,0.55fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                    : "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                }`}
              >
                {showCareType ? (
                  <FixedChoiceListbox
                    id={`${id}-${entry.id}-care-type`}
                    label="Care type"
                    value={entry.careType ?? "other"}
                    options={[
                      { value: "preventive", label: "Preventive" },
                      { value: "restorative", label: "Restorative" },
                      { value: "other", label: "Other" },
                    ]}
                    onChange={(careType) => updateEntry(entry.id, { careType })}
                  />
                ) : null}
                <CatalogueCombobox
                  id={`${id}-${entry.id}-type`}
                  label="Treatment type"
                  catalogueKey={
                    showCareType && entry.careType === "preventive"
                      ? "hygiene-treatment.items"
                      : catalogueKey
                  }
                  value={entry.treatmentType}
                  onChange={(value) =>
                    updateEntry(entry.id, { treatmentType: value })
                  }
                  rememberActionLabel="Remember treatment type"
                  unhideActionLabel="Unhide treatment type"
                  roomyActions
                />
                <TextField
                  id={`${id}-${entry.id}-tooth-area`}
                  label="Tooth/area"
                  value={entry.toothArea}
                  onChange={(value) =>
                    updateEntry(entry.id, { toothArea: value })
                  }
                  placeholder="Optional tooth, teeth, or area"
                  helpText="Not saved. This value stays in this note."
                />
                <div className="flex flex-wrap items-start gap-2 md:pt-7">
                  <TooltipActionButton
                    tooltip="Move this treatment line earlier in the note."
                    className={treatmentRowButtonClass}
                    disabled={index === 0}
                    ariaLabel={`Move ${label} item ${index + 1} earlier`}
                    onClick={() => moveEntry(index, "earlier")}
                  >
                    Earlier
                  </TooltipActionButton>
                  <TooltipActionButton
                    tooltip="Move this treatment line later in the note."
                    className={treatmentRowButtonClass}
                    disabled={index === entries.length - 1}
                    ariaLabel={`Move ${label} item ${index + 1} later`}
                    onClick={() => moveEntry(index, "later")}
                  >
                    Later
                  </TooltipActionButton>
                  <TooltipActionButton
                    tooltip="Remove this treatment line from the note."
                    className={treatmentRowRemoveButtonClass}
                    ariaLabel={`Remove ${label} item ${index + 1}`}
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
          No {label.toLocaleLowerCase("en-CA")} added.
        </p>
      )}
      <button type="button" className={treatmentRowButtonClass} onClick={onAdd}>
        {addLabel}
      </button>
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

export function ExamFinding({
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

function ChoiceToggleButtons({
  label,
  options,
  values,
  onChange,
  singleSelect = false,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  singleSelect?: boolean;
}) {
  const selected = new Set(values);
  const groupName = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.has(option);
          return (
            <NativeChoiceControl
              key={option}
              type={singleSelect ? "radio" : "checkbox"}
              name={singleSelect ? groupName : undefined}
              checked={active}
              onChange={(checked) =>
                onChange(
                  checked
                    ? singleSelect
                      ? [option]
                      : [...values, option]
                    : singleSelect
                    ? values
                    : values.filter((value) => value !== option),
                )
              }
            >
              {option}
            </NativeChoiceControl>
          );
        })}
      </div>
    </fieldset>
  );
}

type TmjAssessmentPatch = {
  tmjStatus?: ExamStatus;
  tmjFindings?: string;
  structuredExtraoralFindings?: RecareExtraoralFinding[];
};

export function TmjAssessmentControl({
  idPrefix = "recare",
  status,
  findings,
  structuredExtraoralFindings,
  onChange,
  children,
}: {
  idPrefix?: string;
  status: ExamStatus;
  findings: string;
  structuredExtraoralFindings: RecareExtraoralFinding[];
  onChange: (patch: TmjAssessmentPatch) => void;
  children?: ReactNode;
}) {
  const clickingOptionId = "eoe.tmj_clicking";
  const clicking = structuredExtraoralFindings.find(
    (finding) => finding.optionId === clickingOptionId,
  );
  const clickingOption = recareExtraoralOptions.find(
    (option) => option.id === clickingOptionId,
  )!;
  const hasTmjFindings = Boolean(findings.trim()) || Boolean(clicking);
  const hasLegacyConflict = Boolean(clicking) && status !== "findings";

  function withoutClicking() {
    return structuredExtraoralFindings.filter(
      (finding) => finding.optionId !== clickingOptionId,
    );
  }

  function changeStatus(nextStatus: ExamStatus) {
    if (
      nextStatus !== "findings" &&
      hasTmjFindings &&
      !window.confirm(
        `Set TMJ to ${
          nextStatus === "wnl" ? "WNL" : "Not assessed"
        } and clear the documented TMJ findings?`,
      )
    ) {
      return;
    }
    onChange({
      tmjStatus: nextStatus,
      ...(nextStatus !== "findings"
        ? {
            tmjFindings: "",
            structuredExtraoralFindings: withoutClicking(),
          }
        : {}),
    });
  }

  function toggleClicking() {
    onChange(
      clicking
        ? { structuredExtraoralFindings: withoutClicking() }
        : {
            tmjStatus: "findings",
            structuredExtraoralFindings: [
              ...withoutClicking(),
              createRecareExtraoralFinding(clickingOptionId),
            ],
          },
    );
  }

  function patchClicking(changes: Partial<RecareExtraoralFinding>) {
    if (!clicking) return;
    onChange({
      tmjStatus: "findings",
      structuredExtraoralFindings: structuredExtraoralFindings.map((finding) =>
        finding.optionId === clickingOptionId
          ? { ...finding, ...changes }
          : finding,
      ),
    });
  }

  return (
    <fieldset
      className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
      aria-label="Temporomandibular assessment"
    >
      <legend className="px-1 font-medium">Temporomandibular assessment</legend>
      {hasLegacyConflict ? (
        <div
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <p>
            TMJ clicking is documented in this legacy draft while the TMJ status
            is not Findings. Choose which value to keep.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`${buttonClass} bg-amber-700 text-white hover:bg-amber-800`}
              onClick={() => onChange({ tmjStatus: "findings" })}
            >
              Keep clicking and use Findings
            </button>
            <button
              type="button"
              className={`${buttonClass} border border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50`}
              onClick={() =>
                onChange({ structuredExtraoralFindings: withoutClicking() })
              }
            >
              Remove clicking
            </button>
          </div>
        </div>
      ) : null}
      <ExamFinding
        id={`${idPrefix}-tmj`}
        label="TMJ"
        status={status}
        findings={findings}
        onStatusChange={changeStatus}
        onFindingsChange={(tmjFindings) =>
          onChange({ tmjStatus: "findings", tmjFindings })
        }
      />
      <div
        className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700"
        role="group"
        aria-label="TMJ clicking"
      >
        <NativeChoiceControl
          type="checkbox"
          checked={Boolean(clicking)}
          className="w-full justify-start sm:w-auto"
          onChange={toggleClicking}
        >
          TMJ clicking
        </NativeChoiceControl>
        {clicking ? (
          <div className="grid gap-3 md:grid-cols-3">
            <ChoiceToggleButtons
              label="Laterality"
              options={extraoralSideOptions}
              values={extraoralLateralityToSides(clicking.laterality ?? "")}
              onChange={(sides) =>
                patchClicking({
                  laterality: extraoralSidesToLaterality(sides),
                })
              }
            />
            <ChoiceToggleButtons
              label="Status"
              options={clickingOption.statusOptions}
              values={clicking.statuses ?? []}
              onChange={(statuses) => patchClicking({ statuses })}
              singleSelect
            />
            <ChoiceToggleButtons
              label="On open / close"
              options={clickingOption.phaseOptions}
              values={clicking.phases ?? []}
              onChange={(phases) => patchClicking({ phases })}
            />
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
          {children}
        </div>
      ) : null}
    </fieldset>
  );
}

type LymphNodesAssessmentPatch = {
  lymphNodesStatus?: ExamStatus;
  lymphNodesFindings?: string;
  structuredExtraoralFindings?: RecareExtraoralFinding[];
};

export function LymphNodesAssessmentControl({
  idPrefix = "recare",
  status,
  findings,
  structuredExtraoralFindings,
  onChange,
}: {
  idPrefix?: string;
  status: ExamStatus;
  findings: string;
  structuredExtraoralFindings: RecareExtraoralFinding[];
  onChange: (patch: LymphNodesAssessmentPatch) => void;
}) {
  const palpableOptionId = "eoe.palpable_lymph_nodes";
  const palpable = structuredExtraoralFindings.find(
    (finding) => finding.optionId === palpableOptionId,
  );
  const palpableOption = recareExtraoralOptions.find(
    (option) => option.id === palpableOptionId,
  )!;
  const hasLymphNodeFindings = Boolean(findings.trim()) || Boolean(palpable);
  const hasLegacyConflict = Boolean(palpable) && status !== "findings";

  function withoutPalpable() {
    return structuredExtraoralFindings.filter(
      (finding) => finding.optionId !== palpableOptionId,
    );
  }

  function changeStatus(nextStatus: ExamStatus) {
    if (
      nextStatus !== "findings" &&
      hasLymphNodeFindings &&
      !window.confirm(
        `Set Lymph nodes to ${
          nextStatus === "wnl" ? "WNL" : "Not assessed"
        } and clear the documented lymph-node findings?`,
      )
    ) {
      return;
    }
    onChange({
      lymphNodesStatus: nextStatus,
      ...(nextStatus !== "findings"
        ? {
            lymphNodesFindings: "",
            structuredExtraoralFindings: withoutPalpable(),
          }
        : {}),
    });
  }

  function togglePalpable() {
    onChange(
      palpable
        ? { structuredExtraoralFindings: withoutPalpable() }
        : {
            lymphNodesStatus: "findings",
            structuredExtraoralFindings: [
              ...withoutPalpable(),
              createRecareExtraoralFinding(palpableOptionId),
            ],
          },
    );
  }

  function patchPalpable(changes: Partial<RecareExtraoralFinding>) {
    if (!palpable) return;
    onChange({
      lymphNodesStatus: "findings",
      structuredExtraoralFindings: structuredExtraoralFindings.map((finding) =>
        finding.optionId === palpableOptionId
          ? { ...finding, ...changes }
          : finding,
      ),
    });
  }

  return (
    <fieldset
      className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
      aria-label="Lymph nodes"
    >
      <legend className="px-1 font-medium">Lymph nodes</legend>
      {hasLegacyConflict ? (
        <div
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <p>
            Palpable lymph nodes are documented in this legacy draft while the
            Lymph nodes status is not Findings. Choose which value to keep.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`${buttonClass} bg-amber-700 text-white hover:bg-amber-800`}
              onClick={() => onChange({ lymphNodesStatus: "findings" })}
            >
              Keep palpable finding and use Findings
            </button>
            <button
              type="button"
              className={`${buttonClass} border border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50`}
              onClick={() =>
                onChange({ structuredExtraoralFindings: withoutPalpable() })
              }
            >
              Remove palpable finding
            </button>
          </div>
        </div>
      ) : null}
      <ExamFinding
        id={`${idPrefix}-lymph-nodes`}
        label="Lymph nodes"
        status={status}
        findings={findings}
        onStatusChange={changeStatus}
        onFindingsChange={(lymphNodesFindings) =>
          onChange({ lymphNodesStatus: "findings", lymphNodesFindings })
        }
      />
      <div
        className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700"
        role="group"
        aria-label="Palpable lymph nodes"
      >
        <NativeChoiceControl
          type="checkbox"
          checked={Boolean(palpable)}
          className="w-full justify-start sm:w-auto"
          onChange={togglePalpable}
        >
          Palpable
        </NativeChoiceControl>
        {palpable ? (
          <div className="grid gap-3 md:grid-cols-3">
            <ChoiceToggleButtons
              label="Laterality"
              options={extraoralSideOptions}
              values={extraoralLateralityToSides(palpable.laterality ?? "")}
              onChange={(sides) =>
                patchPalpable({
                  laterality: extraoralSidesToLaterality(sides),
                })
              }
            />
            <ChoiceToggleButtons
              label="Location"
              options={palpableOption.locationOptions}
              values={palpable.locations ?? []}
              onChange={(locations) => patchPalpable({ locations })}
            />
            <ChoiceToggleButtons
              label="Swelling"
              options={palpableOption.swellingOptions}
              values={palpable.swelling ?? []}
              onChange={(swelling) => patchPalpable({ swelling })}
            />
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}

function recareIntraoralChoiceGroups(
  structure: RecareIntraoralStructure,
): FixedChoiceMultiComboboxGroup[] {
  const groups = [
    { classification: "normal", label: "Normal" },
    { classification: "abnormal", label: "Abnormal" },
    { classification: "normal_variation", label: "Common variations" },
  ] as const;

  return groups.flatMap((group) => {
    const choices = structure.options
      .filter((option) => option.classification === group.classification)
      .map((option) => option.label);
    return choices.length ? [{ label: group.label, choices }] : [];
  });
}

export function StructuredExtraoralObservations({
  idPrefix = "recare",
  status,
  additionalStatuses,
  values,
  onApplyNormal,
  onClear,
  clearDisabled,
  onChange,
  linkedStatusByOptionId = {},
  children,
}: {
  idPrefix?: string;
  status: ExamStatus;
  additionalStatuses: ExamStatus[];
  values: RecareExtraoralFinding[];
  onApplyNormal: () => void;
  onClear: () => void;
  clearDisabled: boolean;
  onChange: (values: RecareExtraoralFinding[]) => void;
  linkedStatusByOptionId?: Partial<Record<string, ExamStatus>>;
  children: ReactNode;
}) {
  const additionalAssessedCount = additionalStatuses.filter(
    (status) => status !== "not-assessed",
  ).length;
  const linkedFindingDuplicates = values.filter(
    (finding) => linkedStatusByOptionId[finding.optionId] === "findings",
  ).length;
  const documentedFindingCount =
    additionalStatuses.filter((status) => status === "findings").length +
    values.length -
    linkedFindingDuplicates;
  const summary = documentedFindingCount
    ? `${documentedFindingCount} ${
        documentedFindingCount === 1 ? "finding" : "findings"
      } documented`
    : status === "wnl"
    ? "WNL"
    : status === "findings"
    ? "Findings"
    : additionalAssessedCount
    ? `${additionalAssessedCount} of ${additionalStatuses.length} additional exams assessed`
    : "Not assessed";
  const shouldAutoExpand = status === "findings" || documentedFindingCount > 0;
  const [open, setOpen] = useState(shouldAutoExpand);
  const otherExtraoralOptions = recareExtraoralOptions.filter(
    (option) =>
      option.id !== "eoe.tmj_clicking" &&
      option.id !== "eoe.palpable_lymph_nodes",
  );

  useEffect(() => {
    if (shouldAutoExpand) setOpen(true);
  }, [shouldAutoExpand]);

  function patch(optionId: string, changes: Partial<RecareExtraoralFinding>) {
    onChange(
      values.map((value) =>
        value.optionId === optionId ? { ...value, ...changes } : value,
      ),
    );
  }

  function toggleOption(optionId: string) {
    const nextOptionIds = values.some((value) => value.optionId === optionId)
      ? values
          .filter((value) => value.optionId !== optionId)
          .map((value) => value.optionId)
      : [...values.map((value) => value.optionId), optionId];
    onChange(
      recareExtraoralOptions.flatMap((option) =>
        nextOptionIds.includes(option.id)
          ? [
              values.find((value) => value.optionId === option.id) ??
                createRecareExtraoralFinding(option.id),
            ]
          : [],
      ),
    );
  }

  return (
    <fieldset
      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-label="Structured extraoral observations"
    >
      <button
        id={`${idPrefix}-structured-extraoral-observations`}
        type="button"
        className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
        aria-expanded={open}
        aria-controls={`${idPrefix}-structured-extraoral-observations-content`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0">Structured extraoral observations</span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
            {summary}
          </span>
          <DropdownChevron open={open} />
        </span>
        <span className="col-span-2 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
          {summary}
        </span>
      </button>
      {open ? (
        <div
          id={`${idPrefix}-structured-extraoral-observations-content`}
          className="space-y-4 pt-2"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Assess the extraoral clinical exam and document applicable EOE
            findings.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${buttonClass} bg-sky-700 text-white hover:bg-sky-800`}
              onClick={onApplyNormal}
            >
              Apply normal extraoral exam
            </button>
            <button
              type="button"
              className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
              onClick={onClear}
              disabled={clearDisabled}
            >
              Clear extraoral observations
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
            {children}
          </div>

          {otherExtraoralOptions.length ? (
            <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
              <h3 className="font-medium">Other EOE findings</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {otherExtraoralOptions.map((option) => {
                  const selected = values.find(
                    (value) => value.optionId === option.id,
                  );
                  return (
                    <div
                      key={option.id}
                      role="group"
                      aria-label={option.label}
                      className="space-y-2"
                    >
                      <NativeChoiceControl
                        type="checkbox"
                        checked={Boolean(selected)}
                        className="w-full justify-start"
                        onChange={() => toggleOption(option.id)}
                      >
                        {option.label}
                      </NativeChoiceControl>
                      {selected ? (
                        <div className="grid gap-3">
                          <ChoiceToggleButtons
                            label="Laterality"
                            options={extraoralSideOptions}
                            values={extraoralLateralityToSides(
                              selected.laterality ?? "",
                            )}
                            onChange={(sides) =>
                              patch(option.id, {
                                laterality: extraoralSidesToLaterality(sides),
                              })
                            }
                          />
                          {option.statusOptions.length ? (
                            <ChoiceToggleButtons
                              label="Status"
                              options={option.statusOptions}
                              values={selected.statuses ?? []}
                              onChange={(statuses) =>
                                patch(option.id, { statuses })
                              }
                              singleSelect
                            />
                          ) : null}
                          {option.phaseOptions.length ? (
                            <ChoiceToggleButtons
                              label="On open / close"
                              options={option.phaseOptions}
                              values={selected.phases ?? []}
                              onChange={(phases) =>
                                patch(option.id, { phases })
                              }
                            />
                          ) : null}
                          {option.locationOptions.length ? (
                            <ChoiceToggleButtons
                              label="Location"
                              options={option.locationOptions}
                              values={selected.locations ?? []}
                              onChange={(locations) =>
                                patch(option.id, { locations })
                              }
                            />
                          ) : null}
                          {option.swellingOptions.length ? (
                            <ChoiceToggleButtons
                              label="Swelling"
                              options={option.swellingOptions}
                              values={selected.swelling ?? []}
                              onChange={(swelling) =>
                                patch(option.id, { swelling })
                              }
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-t border-slate-200 pt-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
            onClick={() => setOpen(false)}
          >
            Collapse observations
            <DropdownChevron open />
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}

export function StructuredIntraoralFindings({
  idPrefix = "recare",
  status,
  values,
  onApplyNormal,
  onClear,
  clearDisabled,
  onChange,
}: {
  idPrefix?: string;
  status: ExamStatus;
  values: RecareIntraoralFinding[];
  onApplyNormal: () => void;
  onClear: () => void;
  clearDisabled: boolean;
  onChange: (values: RecareIntraoralFinding[]) => void;
}) {
  const structuredObservationSummary = values.length
    ? `${values.length} ${
        values.length === 1 ? "observation" : "observations"
      } documented`
    : status === "wnl"
    ? "WNL"
    : "Not assessed";
  const shouldAutoExpandStructuredObservations = status === "findings";
  const [structuredObservationsOpen, setStructuredObservationsOpen] = useState(
    shouldAutoExpandStructuredObservations,
  );

  useEffect(() => {
    if (shouldAutoExpandStructuredObservations) {
      setStructuredObservationsOpen(true);
    }
  }, [shouldAutoExpandStructuredObservations]);

  function patch(optionId: string, changes: Partial<RecareIntraoralFinding>) {
    onChange(
      values.map((value) =>
        value.optionId === optionId ? { ...value, ...changes } : value,
      ),
    );
  }

  function updateStructureFindings(
    structure: RecareIntraoralStructure,
    selectedLabels: string[],
  ) {
    const structureOptionIds = new Set(
      structure.options.map((option) => option.id),
    );
    const currentOptionIds = values
      .filter((value) => structureOptionIds.has(value.optionId))
      .map((value) => value.optionId);
    let nextOptionIds = structure.options
      .filter((option) => selectedLabels.includes(option.label))
      .map((option) => option.id);
    const addedOptionId = nextOptionIds.find(
      (optionId) => !currentOptionIds.includes(optionId),
    );
    if (addedOptionId) {
      const conflicts = recareIntraoralOptionConflicts.get(addedOptionId);
      nextOptionIds = nextOptionIds.filter(
        (optionId) => !conflicts?.has(optionId),
      );
    }

    onChange([
      ...values.filter((value) => !structureOptionIds.has(value.optionId)),
      ...nextOptionIds.map(
        (optionId) =>
          values.find((value) => value.optionId === optionId) ?? {
            optionId,
            structureId: structure.id,
          },
      ),
    ]);
  }

  function quickPresetIsActive(preset: RecareIntraoralQuickPreset) {
    const finding = values.find((value) => value.optionId === preset.optionId);
    if (!finding) return false;
    if (preset.laterality && finding.laterality !== preset.laterality) {
      return false;
    }
    if (
      preset.locations &&
      (preset.locations.length !== (finding.locations ?? []).length ||
        preset.locations.some(
          (location) => !(finding.locations ?? []).includes(location),
        ))
    ) {
      return false;
    }
    return true;
  }

  function toggleQuickPreset(preset: RecareIntraoralQuickPreset) {
    if (quickPresetIsActive(preset)) {
      onChange(values.filter((value) => value.optionId !== preset.optionId));
      return;
    }
    const definition = recareIntraoralOptionById.get(preset.optionId);
    if (!definition) return;
    const conflicts = recareIntraoralOptionConflicts.get(preset.optionId);
    const current = values.find((value) => value.optionId === preset.optionId);
    onChange([
      ...values.filter(
        (value) =>
          value.optionId !== preset.optionId && !conflicts?.has(value.optionId),
      ),
      {
        ...current,
        optionId: preset.optionId,
        structureId: definition.structure.id,
        ...(preset.laterality ? { laterality: preset.laterality } : {}),
        ...(preset.locations ? { locations: [...preset.locations] } : {}),
      },
    ]);
  }
  return (
    <fieldset
      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-label="Structured intraoral observations"
    >
      <button
        id={`${idPrefix}-structured-intraoral-observations`}
        type="button"
        className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
        aria-expanded={structuredObservationsOpen}
        aria-controls={`${idPrefix}-structured-intraoral-observations-content`}
        onClick={() => setStructuredObservationsOpen((open) => !open)}
      >
        <span className="min-w-0">Structured intraoral observations</span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
            {structuredObservationSummary}
          </span>
          <DropdownChevron open={structuredObservationsOpen} />
        </span>
        <span className="col-span-2 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
          {structuredObservationSummary}
        </span>
      </button>
      {structuredObservationsOpen ? (
        <div
          id={`${idPrefix}-structured-intraoral-observations-content`}
          className="space-y-4 pt-2"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Apply the reviewed normal observations or document individual
            findings. Both document Findings.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${buttonClass} bg-sky-700 text-white hover:bg-sky-800`}
              onClick={onApplyNormal}
            >
              Apply normal structured observations
            </button>
            <button
              type="button"
              className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
              onClick={onClear}
              disabled={clearDisabled}
            >
              Clear intraoral observations
            </button>
          </div>
          <fieldset className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            <legend className="font-medium">IOE quick findings</legend>
            <div className="flex flex-wrap gap-2">
              {recareIntraoralQuickPresets.map((preset) => {
                const active = quickPresetIsActive(preset);
                return (
                  <NativeChoiceControl
                    key={preset.optionId}
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleQuickPreset(preset)}
                  >
                    {preset.label}
                  </NativeChoiceControl>
                );
              })}
            </div>
          </fieldset>
          {recareIntraoralStructures.map((structure) => {
            const selectedOptions = structure.options.filter((option) =>
              values.some((value) => value.optionId === option.id),
            );
            return (
              <fieldset
                key={structure.id}
                className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700"
              >
                <legend className="font-medium">{structure.label}</legend>
                <FixedChoiceMultiCombobox
                  id={`${idPrefix}-${structure.id.replaceAll(
                    ".",
                    "-",
                  )}-observations`}
                  label={`${structure.label} observations`}
                  choices={structure.options.map((option) => option.label)}
                  choiceGroups={recareIntraoralChoiceGroups(structure)}
                  values={selectedOptions.map((option) => option.label)}
                  onChange={(selectedLabels) =>
                    updateStructureFindings(structure, selectedLabels)
                  }
                  customPlaceholder={`Search ${structure.label.toLocaleLowerCase(
                    "en-CA",
                  )} observations`}
                  customHelpText=""
                  showSelectedChips={false}
                  allowCustomValues={false}
                />
                {selectedOptions.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedOptions.map((option) => {
                      const selected = values.find(
                        (value) => value.optionId === option.id,
                      )!;
                      return (
                        <div
                          key={option.id}
                          role="group"
                          aria-label={`${structure.label}: ${option.label}`}
                          className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                        >
                          <h4 className="text-sm font-semibold">
                            {option.label}
                          </h4>
                          <div className="mt-3 grid gap-3">
                            {option.supportsLocation ? (
                              <TextField
                                id={`${idPrefix}-${option.id}-location`}
                                label={`${option.label} location`}
                                value={(selected.locations ?? []).join(", ")}
                                onChange={(value) =>
                                  patch(option.id, {
                                    locations: value
                                      .split(",")
                                      .map((item) => item.trim())
                                      .filter(Boolean),
                                  })
                                }
                                placeholder="Tooth/area or region"
                              />
                            ) : null}
                            {option.supportsLaterality ? (
                              <FixedChoiceListbox
                                id={`${idPrefix}-${option.id}-laterality`}
                                label={`${option.label} laterality`}
                                value={selected.laterality ?? ""}
                                options={[
                                  { value: "", label: "None" },
                                  { value: "Right", label: "Right" },
                                  { value: "Left", label: "Left" },
                                  {
                                    value: "Bilateral",
                                    label: "Bilateral",
                                  },
                                ]}
                                onChange={(value) =>
                                  patch(option.id, { laterality: value })
                                }
                              />
                            ) : null}
                            {option.supportsMeasurement ? (
                              <TextField
                                id={`${idPrefix}-${option.id}-measurement`}
                                label={`${option.label} measurement${
                                  option.measurementUnits.length === 1
                                    ? ` (${option.measurementUnits[0]})`
                                    : ""
                                }`}
                                value={selected.measurement ?? ""}
                                onChange={(value) =>
                                  patch(option.id, {
                                    measurement: value,
                                    measurementUnit: option.measurementUnits[0],
                                  })
                                }
                                inputMode="decimal"
                              />
                            ) : null}
                            {structure.supportsComment ? (
                              <TextField
                                id={`${idPrefix}-${option.id}-comment`}
                                label={`${option.label} notes`}
                                value={selected.comment ?? ""}
                                onChange={(value) =>
                                  patch(option.id, { comment: value })
                                }
                                placeholder="Optional encounter-specific note"
                              />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </fieldset>
            );
          })}
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-t border-slate-200 pt-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
            onClick={() => setStructuredObservationsOpen(false)}
          >
            Collapse observations
            <DropdownChevron open />
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}

export function OcclusalFindingLocations({
  idPrefix = "recare",
  entry,
  onChange,
}: {
  idPrefix?: string;
  entry: RecareOcclusalFinding;
  onChange: (entry: RecareOcclusalFinding) => void;
}) {
  const quick = new Set(recareIntraoralLocationChoices);
  const custom = entry.locations.filter(
    (location) =>
      !quick.has(location as (typeof recareIntraoralLocationChoices)[number]),
  );
  return (
    <fieldset
      className="mt-3 space-y-2 border-l-2 border-slate-300 pl-3 dark:border-slate-600"
      aria-label={`${entry.finding} location`}
    >
      <legend className="text-xs font-medium">Location (optional)</legend>
      <div className="flex flex-wrap gap-3">
        {recareIntraoralLocationChoices.map((location) => (
          <label key={location} className="flex gap-1 text-xs">
            <input
              type="checkbox"
              checked={entry.locations.includes(location)}
              onChange={(event) =>
                onChange({
                  ...entry,
                  locations: event.target.checked
                    ? [...entry.locations, location]
                    : entry.locations.filter((item) => item !== location),
                })
              }
            />
            {location}
          </label>
        ))}
      </div>
      <TextField
        id={`${idPrefix}-occlusal-${entry.id}-region`}
        label="Tooth/area or region"
        value={custom.join(", ")}
        onChange={(value) =>
          onChange({
            ...entry,
            locations: [
              ...entry.locations.filter((location) =>
                quick.has(
                  location as (typeof recareIntraoralLocationChoices)[number],
                ),
              ),
              ...value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ],
          })
        }
      />
    </fieldset>
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
  presentation,
}: InteractiveTemplateProps<RecareExamForm>) {
  const [form, setForm] = useState<RecareExamForm>(() =>
    createEmptyRecareExamForm(),
  );
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [patientIdError, setPatientIdError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const treatmentEntrySequence = useRef(0);
  const patientIdRef = useRef<HTMLInputElement>(null);
  const dentistRef = useRef<HTMLInputElement>(null);
  const providerDefaultsAppliedRef = useRef(false);
  const { providerDefaultsStorageStatus, getProviderDefault } = useCatalogues();

  const localDraft = useLocalInteractiveDraft({
    templateId: "recare-exam",
    form,
    startedAt,
    isEmpty: isEmptyRecareDraft,
    isValidForm: isRecareDraftForm,
    onRestore: (draft) => {
      setForm({ ...createEmptyRecareExamForm(), ...draft.form });
      setStartedAt(new Date(draft.startedAt));
      setPatientIdError("");
      setProviderError("");
      setCopyMessage("");
    },
  });

  function createNewFormWithProviderDefaults(): RecareExamForm {
    return {
      ...createEmptyRecareExamForm(),
      dentist: getProviderDefault("visit-team.dentist")?.label ?? "",
      rdh: getProviderDefault("visit-team.rdh")?.label ?? "",
      rda: getProviderDefault("visit-team.rda")?.label ?? "",
    };
  }

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
      rdh: current.rdh || getProviderDefault("visit-team.rdh")?.label || "",
      rda: current.rda || getProviderDefault("visit-team.rda")?.label || "",
    }));
  }, [
    getProviderDefault,
    localDraft.hydrated,
    localDraft.restoredAt,
    providerDefaultsStorageStatus,
  ]);

  useEffect(() => {
    setStartedAt((current) => current ?? new Date());
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
    const draftSaveResult = localDraft.saveNow();
    const missingPatientId = !form.patientId.trim();
    const missingProvider = ![form.dentist, form.rda, form.rdh].some((value) =>
      Boolean(value.trim()),
    );

    setPatientIdError(missingPatientId ? "Enter a Patient ID." : "");
    setProviderError(
      missingProvider ? "Enter at least one of Dentist, RDA, or RDH." : "",
    );
    setCopyMessage("");

    if (
      missingPatientId ||
      missingProvider ||
      !hasRequiredRecareExamFields(form)
    ) {
      requestAnimationFrame(() => {
        (missingPatientId ? patientIdRef.current : dentistRef.current)?.focus();
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
      chiefConcern: [...fixture.chiefConcern],
      structuredExtraoralFindings: (
        fixture.structuredExtraoralFindings ?? []
      ).map((finding) => ({
        ...finding,
        statuses: [...(finding.statuses ?? [])],
        phases: [...(finding.phases ?? [])],
        locations: [...(finding.locations ?? [])],
        swelling: [...(finding.swelling ?? [])],
      })),
      structuredIntraoralFindings: (
        fixture.structuredIntraoralFindings ?? []
      ).map((finding) => ({
        ...finding,
        locations: [...(finding.locations ?? [])],
      })),
      additionalOcclusalFindings: (
        fixture.additionalOcclusalFindings ?? []
      ).map((finding) => ({ ...finding, locations: [...finding.locations] })),
    });
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("Synthetic demo data loaded.");
  }

  function hasExtraoralDocumentation() {
    return (
      [
        form.extraoralStatus,
        form.tmjStatus,
        form.lymphNodesStatus,
        form.masseterStatus,
        form.tmjLoadStatus,
      ].some((status) => status !== "not-assessed") ||
      [
        form.extraoralFindings,
        form.tmjFindings,
        form.lymphNodesFindings,
        form.masseterFindings,
        form.tmjLoadFindings,
      ].some((value) => Boolean(value.trim())) ||
      Boolean(form.structuredExtraoralFindings?.length)
    );
  }

  function changeExtraoralStatus(value: ExamStatus) {
    const hasFindings =
      Boolean(form.extraoralFindings.trim()) ||
      Boolean(form.structuredExtraoralFindings?.length);
    if (value === "wnl" && hasFindings) {
      if (
        !window.confirm(
          "Mark Extraoral WNL and clear all entered extraoral findings?",
        )
      )
        return;
      setForm((current) => ({
        ...current,
        extraoralStatus: "wnl",
        extraoralFindings: "",
        structuredExtraoralFindings: [],
      }));
      setCopyMessage("");
      return;
    }
    updateField("extraoralStatus", value);
  }

  function applyNormalStructuredExtraoral() {
    if (
      hasExtraoralDocumentation() &&
      !window.confirm("Replace all entered extraoral exam findings with WNL?")
    )
      return;
    setForm((current) => ({
      ...current,
      extraoralStatus: "wnl",
      extraoralFindings: "",
      structuredExtraoralFindings: [],
      tmjStatus: "wnl",
      tmjFindings: "",
      lymphNodesStatus: "wnl",
      lymphNodesFindings: "",
      masseterStatus: "wnl",
      masseterFindings: "",
      tmjLoadStatus: "wnl",
      tmjLoadFindings: "",
    }));
    setCopyMessage("");
  }

  function clearExtraoralObservations() {
    if (
      hasExtraoralDocumentation() &&
      !window.confirm(
        "Clear all entered extraoral observations and return the extraoral clinical exam to Not assessed?",
      )
    )
      return;
    setForm((current) => ({
      ...current,
      extraoralStatus: "not-assessed",
      extraoralFindings: "",
      structuredExtraoralFindings: [],
      tmjStatus: "not-assessed",
      tmjFindings: "",
      lymphNodesStatus: "not-assessed",
      lymphNodesFindings: "",
      masseterStatus: "not-assessed",
      masseterFindings: "",
      tmjLoadStatus: "not-assessed",
      tmjLoadFindings: "",
    }));
    setCopyMessage("");
  }

  function changeIntraoralStatus(value: ExamStatus) {
    const hasFindings =
      Boolean(form.intraoralFindings.trim()) ||
      Boolean(form.structuredIntraoralFindings?.length);
    if (value === "wnl" && hasFindings) {
      if (
        !window.confirm(
          "Mark Intraoral WNL and clear all entered intraoral findings?",
        )
      )
        return;
      setForm((current) => ({
        ...current,
        intraoralStatus: "wnl",
        intraoralFindings: "",
        structuredIntraoralFindings: [],
      }));
      setCopyMessage("");
      return;
    }
    updateField("intraoralStatus", value);
  }

  function applyNormalStructuredIntraoral() {
    const hasFindings =
      Boolean(form.intraoralFindings.trim()) ||
      Boolean(form.structuredIntraoralFindings?.length);
    if (
      hasFindings &&
      !window.confirm(
        "Replace all entered intraoral findings with the reviewed normal structured observations?",
      )
    )
      return;
    setForm((current) => ({
      ...current,
      intraoralStatus: "findings",
      intraoralFindings: "",
      structuredIntraoralFindings:
        createRecareNormalStructuredIntraoralFindings(),
    }));
    setCopyMessage("");
  }

  function clearIntraoralObservations() {
    const hasFindings =
      Boolean(form.intraoralFindings.trim()) ||
      Boolean(form.structuredIntraoralFindings?.length);
    if (
      hasFindings &&
      !window.confirm(
        "Clear all entered intraoral observations and return Intraoral to Not assessed?",
      )
    )
      return;
    setForm((current) => ({
      ...current,
      intraoralStatus: "not-assessed",
      intraoralFindings: "",
      structuredIntraoralFindings: [],
    }));
    setCopyMessage("");
  }

  function changeAdditionalOcclusalValues(values: string[]) {
    const existing = [...(form.additionalOcclusalFindings ?? [])];
    const next = values.map((finding, index) => {
      const sameIndex = existing[index];
      if (sameIndex?.finding === finding) return sameIndex;
      const matchIndex = existing.findIndex(
        (entry) => entry.finding === finding,
      );
      if (matchIndex >= 0) return existing.splice(matchIndex, 1)[0];
      return { id: `occlusal-${Date.now()}-${index}`, finding, locations: [] };
    });
    updateField("additionalOcclusalFindings", next);
  }

  function resetForm() {
    if (!window.confirm(recareNoteDiscardWarning)) {
      return false;
    }

    localDraft.beginNewDraft();
    setForm(createNewFormWithProviderDefaults());
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    patientIdRef.current?.focus();
    return true;
  }

  function createTreatmentEntry(
    scope: "option" | "plan",
    source?: RecareTreatmentEntry,
  ): RecareTreatmentEntry {
    treatmentEntrySequence.current += 1;
    return {
      id: `${scope}-${Date.now()}-${treatmentEntrySequence.current}`,
      treatmentType: source?.treatmentType ?? "",
      toothArea: source?.toothArea ?? "",
    };
  }

  return (
    <InteractiveTemplateWorkspace
      presentation={presentation}
      sections={recareExamSections}
      formRevision={JSON.stringify(form)}
      onSubmit={(event) => {
          event.preventDefault();
          void copyNote();
      }}
      onLoadDemo={loadDemo}
      onReset={resetForm}
      draftRecovery={
        <LocalDraftRecovery
            drafts={localDraft.recoverableDrafts}
            lastSavedAt={localDraft.lastSavedAt}
            restoredAt={localDraft.restoredAt}
            storageError={localDraft.storageError}
            onRestore={localDraft.restoreDraft}
        />
      }
      generatedNote={
        <GeneratedNotePanel
          textareaId="recare-summary"
          accessibleLabel="Generated Recare Exam note"
          value={summary}
          copyDisabled={!startedAt}
          statusMessage={copyMessage}
        />
      }
    >

          <Section title="Patient and Visit Context">
            <div className="grid gap-4 md:grid-cols-3">
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
              aria-describedby={
                providerError ? "recare-provider-error" : undefined
              }
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
            <div className="grid gap-4 md:grid-cols-3">
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
                onChange={(value) => updateField("medicalHistoryReview", value)}
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
            <RadiographsTakenControl
              idPrefix="recare"
              values={form.radiographs}
              onChange={(value) => updateField("radiographs", value)}
              linkToTreatment={false}
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
            <CatalogueMultiCombobox
              id="recare-chief-concern"
              label="Patient's chief concern"
              catalogueKey="patient.chief-concerns"
              values={form.chiefConcern}
              onChange={(values) =>
                updateField(
                  "chiefConcern",
                  applyPatientChiefConcernSelectionRules(
                    form.chiefConcern,
                    values,
                  ),
                )
              }
              roomySelectionActions
            />
            <CheckboxField
              id="recare-chief-concern-list-format"
              label="List each concern on a separate line in the note"
              checked={form.listChiefConcerns}
              onChange={(value) => updateField("listChiefConcerns", value)}
            />
          </Section>

          <Section title="Clinical Exam">
            <ExamFinding
              id="recare-extraoral"
              label="Extraoral"
              status={form.extraoralStatus}
              findings={form.extraoralFindings}
              onStatusChange={changeExtraoralStatus}
              onFindingsChange={(value) => {
                updateField("extraoralFindings", value);
                if (value.trim()) updateField("extraoralStatus", "findings");
              }}
            />
            <StructuredExtraoralObservations
              status={form.extraoralStatus}
              additionalStatuses={[
                form.tmjStatus,
                form.lymphNodesStatus,
                form.masseterStatus,
                form.tmjLoadStatus,
              ]}
              values={form.structuredExtraoralFindings ?? []}
              onApplyNormal={applyNormalStructuredExtraoral}
              onClear={clearExtraoralObservations}
              clearDisabled={!hasExtraoralDocumentation()}
              onChange={(values) => {
                updateField("structuredExtraoralFindings", values);
                if (values.length) updateField("extraoralStatus", "findings");
              }}
              linkedStatusByOptionId={{
                "eoe.tmj_clicking": form.tmjStatus,
                "eoe.palpable_lymph_nodes": form.lymphNodesStatus,
              }}
            >
              <TmjAssessmentControl
                idPrefix="recare"
                status={form.tmjStatus}
                findings={form.tmjFindings}
                structuredExtraoralFindings={
                  form.structuredExtraoralFindings ?? []
                }
                onChange={(patch) => {
                  setForm((current) => ({
                    ...current,
                    ...patch,
                    ...(patch.structuredExtraoralFindings?.length
                      ? { extraoralStatus: "findings" as const }
                      : {}),
                  }));
                  setCopyMessage("");
                }}
              >
                <ExamFinding
                  id="recare-masseter"
                  label="Masseter palpation"
                  status={form.masseterStatus}
                  findings={form.masseterFindings}
                  onStatusChange={(value) =>
                    updateField("masseterStatus", value)
                  }
                  onFindingsChange={(value) =>
                    updateField("masseterFindings", value)
                  }
                />
                <ExamFinding
                  id="recare-tmj-load"
                  label="TMJ loading test"
                  status={form.tmjLoadStatus}
                  findings={form.tmjLoadFindings}
                  onStatusChange={(value) =>
                    updateField("tmjLoadStatus", value)
                  }
                  onFindingsChange={(value) =>
                    updateField("tmjLoadFindings", value)
                  }
                />
              </TmjAssessmentControl>
              <LymphNodesAssessmentControl
                idPrefix="recare"
                status={form.lymphNodesStatus}
                findings={form.lymphNodesFindings}
                structuredExtraoralFindings={
                  form.structuredExtraoralFindings ?? []
                }
                onChange={(patch) => {
                  setForm((current) => ({
                    ...current,
                    ...patch,
                    ...(patch.lymphNodesStatus === "findings" ||
                    patch.structuredExtraoralFindings?.length
                      ? { extraoralStatus: "findings" as const }
                      : {}),
                  }));
                  setCopyMessage("");
                }}
              />
            </StructuredExtraoralObservations>
            <ExamFinding
              id="recare-intraoral"
              label="Intraoral"
              status={form.intraoralStatus}
              findings={form.intraoralFindings}
              onStatusChange={changeIntraoralStatus}
              onFindingsChange={(value) => {
                updateField("intraoralFindings", value);
                if (value.trim()) updateField("intraoralStatus", "findings");
              }}
            />
            <StructuredIntraoralFindings
              status={form.intraoralStatus}
              values={form.structuredIntraoralFindings ?? []}
              onApplyNormal={applyNormalStructuredIntraoral}
              onClear={clearIntraoralObservations}
              clearDisabled={
                form.intraoralStatus === "not-assessed" &&
                !form.intraoralFindings.trim() &&
                !form.structuredIntraoralFindings?.length
              }
              onChange={(values) => {
                updateField("structuredIntraoralFindings", values);
                if (values.length) updateField("intraoralStatus", "findings");
              }}
            />
          </Section>

          <Section title="Occlusion & Habits">
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
                  onChange={(value) => updateField("leftMolarOcclusion", value)}
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

            <div className="grid gap-4 md:grid-cols-3">
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
              <TextField
                id="recare-overbite-mm"
                label="Overbite (mm)"
                value={form.overbiteMm ?? ""}
                onChange={(value) => updateField("overbiteMm", value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-3">
              <CatalogueMultiCombobox
                id="recare-additional-occlusal-findings"
                label="Additional occlusal findings"
                catalogueKey="clinical-exam.additional-occlusal-findings"
                values={(form.additionalOcclusalFindings ?? []).map(
                  (entry) => entry.finding,
                )}
                onChange={changeAdditionalOcclusalValues}
                roomySelectionActions
                renderSelectedDetails={(_, index) => {
                  const entry = (form.additionalOcclusalFindings ?? [])[index];
                  return entry ? (
                    <OcclusalFindingLocations
                      entry={entry}
                      onChange={(updated) =>
                        updateField(
                          "additionalOcclusalFindings",
                          (form.additionalOcclusalFindings ?? []).map((item) =>
                            item.id === entry.id ? updated : item,
                          ),
                        )
                      }
                    />
                  ) : null;
                }}
              />
              <CheckboxField
                id="recare-additional-occlusal-findings-list-format"
                label="List each additional occlusal finding on a separate line in the note"
                checked={form.listAdditionalOcclusalFindings}
                onChange={(value) =>
                  updateField("listAdditionalOcclusalFindings", value)
                }
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
                label="Has an occlusal splint (night guard)"
                value={form.occlusalSplintStatus}
                options={statusOptions}
                onChange={(value) => {
                  updateField("occlusalSplintStatus", value);
                  if (value !== "yes") {
                    updateField("occlusalSplintUseStatus", "not-documented");
                  }
                }}
              />
              {form.occlusalSplintStatus === "yes" ? (
                <FixedChoiceListbox
                  id="recare-occlusal-splint-use"
                  label="Uses the occlusal splint (night guard)"
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
              {form.removableDenturesStatus === "yes" ? (
                <div className="md:col-span-2">
                  <TextareaField
                    id="recare-removable-dentures-comment"
                    label="Removable dentures comments"
                    value={form.removableDenturesComment}
                    onChange={(value) =>
                      updateField("removableDenturesComment", value)
                    }
                  />
                </div>
              ) : null}
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

          <Section title="Odontogram">
            <TeethAssessment
              form={form}
              onChange={(patch) => {
                setForm((current) => ({ ...current, ...patch }));
                setCopyMessage("");
              }}
            />
            <CheckboxField
              id="recare-odontogram-up-to-date"
              label="Odontogram up to date"
              checked={form.odontogramUpToDate}
              onChange={(value) => updateField("odontogramUpToDate", value)}
            />
          </Section>

          <Section title="Treatment and Next Visit">
            <TreatmentEntryList
              id="recare-treatment-options"
              label="Treatment Options"
              addLabel="Add Treatment Option"
              entries={form.treatmentOptions}
              onAdd={() =>
                updateField("treatmentOptions", [
                  ...form.treatmentOptions,
                  createTreatmentEntry("option"),
                ])
              }
              onChange={(value) => updateField("treatmentOptions", value)}
            />
            <CheckboxField
              id="recare-treatment-options-list-format"
              label="List each treatment option on a separate line in the note"
              checked={form.listTreatmentOptions}
              onChange={(value) => updateField("listTreatmentOptions", value)}
            />

            <div className="space-y-3">
              {form.treatmentPlan.every(
                (entry) =>
                  !entry.treatmentType.trim() && !entry.toothArea.trim(),
              ) ? (
                <button
                  type="button"
                  className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
                  disabled={
                    !form.treatmentOptions.some((entry) =>
                      Boolean(entry.treatmentType.trim()),
                    )
                  }
                  onClick={() =>
                    updateField(
                      "treatmentPlan",
                      form.treatmentOptions
                        .filter((entry) => entry.treatmentType.trim())
                        .map((entry) => createTreatmentEntry("plan", entry)),
                    )
                  }
                >
                  Copy Treatment Options to Treatment Plan
                </button>
              ) : null}
              <TreatmentEntryList
                id="recare-treatment-plan"
                label="Treatment Plan"
                addLabel="Add Treatment Plan Item"
                entries={form.treatmentPlan}
                onAdd={() =>
                  updateField("treatmentPlan", [
                    ...form.treatmentPlan,
                    createTreatmentEntry("plan"),
                  ])
                }
                onChange={(value) => updateField("treatmentPlan", value)}
              />
              <CheckboxField
                id="recare-treatment-plan-list-format"
                label="List each treatment plan item on a separate line in the note"
                checked={form.listTreatmentPlan}
                onChange={(value) => updateField("listTreatmentPlan", value)}
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
    </InteractiveTemplateWorkspace>
  );
}
