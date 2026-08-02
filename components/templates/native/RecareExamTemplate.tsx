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
  CariesRiskLevel,
  DocumentationStatus,
  ExamStatus,
  RecareExamForm,
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
import { TooltipActionButton } from "@/components/forms/TooltipActionButton";
import {
  createRecareNormalStructuredIntraoralFindings,
  recareIntraoralLocationChoices,
  recareIntraoralOptionConflicts,
  recareIntraoralStructures,
  type RecareIntraoralStructure,
} from "@/lib/templates/recareIntraoralCatalog";

const inputClass = `mt-1 ${formControlClass()}`;

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const treatmentRowButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const treatmentRowRemoveButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";

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

const cariesRiskLevelOptions: Array<{
  value: CariesRiskLevel;
  label: string;
}> = [
  { value: "", label: "None selected" },
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
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

function TeethAssessment({
  form,
  onChange,
}: {
  form: RecareExamForm;
  onChange: (patch: Partial<RecareExamForm>) => void;
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
          "Clear the documented Teeth findings and set this assessment to WNL?"
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
          "Clear all documented Teeth observations and return this assessment to Not assessed?"
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
        "Replace all entered dental findings with the reviewed normal structured observations?"
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
          item.comment
      ) &&
      !window.confirm(
        "Replace the conflicting documented tooth observation and discard its annotations?"
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
        item.id === id ? { ...item, ...changes } : item
      ),
    });
  }
  return (
    <div className="space-y-4">
      <FixedChoiceListbox
        id="recare-teeth-status"
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
          id="recare-structured-dental-observations"
          type="button"
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
          aria-expanded={structuredObservationsOpen}
          aria-controls="recare-structured-dental-observations-content"
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
            id="recare-structured-dental-observations-content"
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
                                    id={`tooth-area-${finding.id}`}
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
                                    id={`tooth-surface-${finding.id}`}
                                    label="Surface(s)"
                                    value={finding.surface ?? ""}
                                    onChange={(surface) =>
                                      patch(finding.id, { surface })
                                    }
                                  />
                                ) : null}
                                {option.supportsActivity ? (
                                  <FixedChoiceListbox
                                    id={`tooth-activity-${finding.id}`}
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
                                    id={`tooth-grade-${finding.id}`}
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
                                id={`tooth-notes-${finding.id}`}
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
                  id="recare-additional-tooth-findings"
                  label="Additional tooth findings"
                  value={form.additionalToothFindings ?? ""}
                  onChange={(additionalToothFindings) =>
                    onChange({
                      teethStatus: "findings",
                      additionalToothFindings,
                    })
                  }
                />
            </>
          </div>
        ) : null}
      </fieldset>
    </div>
  );
}

function TreatmentEntryList({
  id,
  label,
  addLabel,
  entries,
  onAdd,
  onChange,
}: {
  id: string;
  label: string;
  addLabel: string;
  entries: RecareTreatmentEntry[];
  onAdd: () => void;
  onChange: (entries: RecareTreatmentEntry[]) => void;
}) {
  function updateEntry(
    entryId: string,
    patch: Partial<Omit<RecareTreatmentEntry, "id">>
  ) {
    onChange(
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, ...patch } : entry
      )
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
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <CatalogueCombobox
                  id={`${id}-${entry.id}-type`}
                  label="Treatment type"
                  catalogueKey="recare-treatment.items"
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
                        entries.filter((candidate) => candidate.id !== entry.id)
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

function StructuredIntraoralFindings({
  status,
  values,
  onApplyNormal,
  onClear,
  clearDisabled,
  onChange,
}: {
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
        value.optionId === optionId ? { ...value, ...changes } : value
      )
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
  return (
    <fieldset
      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-label="Structured intraoral observations"
    >
      <button
        id="recare-structured-intraoral-observations"
        type="button"
        className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
        aria-expanded={structuredObservationsOpen}
        aria-controls="recare-structured-intraoral-observations-content"
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
          id="recare-structured-intraoral-observations-content"
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
                  id={`recare-${structure.id.replaceAll(".", "-")}-observations`}
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
                                id={`recare-${option.id}-location`}
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
                                id={`recare-${option.id}-laterality`}
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
                                id={`recare-${option.id}-measurement`}
                                label={`${option.label} measurement${
                                  option.measurementUnits.length === 1
                                    ? ` (${option.measurementUnits[0]})`
                                    : ""
                                }`}
                                value={selected.measurement ?? ""}
                                onChange={(value) =>
                                  patch(option.id, {
                                    measurement: value,
                                    measurementUnit:
                                      option.measurementUnits[0],
                                  })
                                }
                                inputMode="decimal"
                              />
                            ) : null}
                            {structure.supportsComment ? (
                              <TextField
                                id={`recare-${option.id}-comment`}
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
        </div>
      ) : null}
    </fieldset>
  );
}

function OcclusalFindingLocations({
  entry,
  onChange,
}: {
  entry: RecareOcclusalFinding;
  onChange: (entry: RecareOcclusalFinding) => void;
}) {
  const quick = new Set(recareIntraoralLocationChoices);
  const custom = entry.locations.filter(
    (location) =>
      !quick.has(location as (typeof recareIntraoralLocationChoices)[number])
  );
  return (
    <div className="mt-2 space-y-2 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
      <span className="text-xs font-medium">Location (optional)</span>
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
        id={`recare-occlusal-${entry.id}-region`}
        label="Tooth/area or region"
        value={custom.join(", ")}
        onChange={(value) =>
          onChange({
            ...entry,
            locations: [
              ...entry.locations.filter((location) =>
                quick.has(
                  location as (typeof recareIntraoralLocationChoices)[number]
                )
              ),
              ...value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ],
          })
        }
      />
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
    createEmptyRecareExamForm()
  );
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [patientIdError, setPatientIdError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const treatmentEntrySequence = useRef(0);
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
    [form, startedAt]
  );
  function updateField<TKey extends keyof RecareExamForm>(
    key: TKey,
    value: RecareExamForm[TKey]
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
      Boolean(value.trim())
    );

    setPatientIdError(missingPatientId ? "Enter a Patient ID." : "");
    setProviderError(
      missingProvider ? "Enter at least one of Dentist, RDA, or RDH." : ""
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
        ? "Note copied."
        : "The note could not be copied. Select the preview and copy it manually."
    );
  }

  function loadDemo() {
    setForm({
      ...fixture,
      chiefConcern: [...fixture.chiefConcern],
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

  function changeIntraoralStatus(value: ExamStatus) {
    const hasFindings =
      Boolean(form.intraoralFindings.trim()) ||
      Boolean(form.structuredIntraoralFindings?.length);
    if (value === "wnl" && hasFindings) {
      if (
        !window.confirm(
          "Mark Intraoral WNL and clear all entered intraoral findings?"
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
        "Replace all entered intraoral findings with the reviewed normal structured observations?"
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
        "Clear all entered intraoral observations and return Intraoral to Not assessed?"
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
        (entry) => entry.finding === finding
      );
      if (matchIndex >= 0) return existing.splice(matchIndex, 1)[0];
      return { id: `occlusal-${Date.now()}-${index}`, finding, locations: [] };
    });
    updateField("additionalOcclusalFindings", next);
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

  function createTreatmentEntry(
    scope: "option" | "plan",
    source?: RecareTreatmentEntry
  ): RecareTreatmentEntry {
    treatmentEntrySequence.current += 1;
    return {
      id: `${scope}-${Date.now()}-${treatmentEntrySequence.current}`,
      treatmentType: source?.treatmentType ?? "",
      toothArea: source?.toothArea ?? "",
    };
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
            <CatalogueMultiCombobox
              id="recare-radiographs"
              label="Radiographs"
              catalogueKey="imaging.radiographs"
              values={form.radiographs}
              onChange={(value) => updateField("radiographs", value)}
              allowDuplicateValues
              roomySelectionActions
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
                    values
                  )
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
              onFindingsChange={(value) => updateField("tmjFindings", value)}
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

            <TextField
              id="recare-oral-habits"
              label="Oral habits"
              value={form.oralHabits}
              onChange={(value) => updateField("oralHabits", value)}
            />

            <div className="grid gap-4 md:grid-cols-3">
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
                        event.target.checked
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
                        event.target.checked
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
                      event.target.checked
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
            <div>
              <CatalogueMultiCombobox
                id="recare-additional-occlusal-findings"
                label="Additional occlusal findings"
                catalogueKey="clinical-exam.additional-occlusal-findings"
                values={(form.additionalOcclusalFindings ?? []).map(
                  (entry) => entry.finding
                )}
                onChange={changeAdditionalOcclusalValues}
                roomySelectionActions
              />
              {(form.additionalOcclusalFindings ?? []).map((entry) => (
                <OcclusalFindingLocations
                  key={entry.id}
                  entry={entry}
                  onChange={(updated) =>
                    updateField(
                      "additionalOcclusalFindings",
                      (form.additionalOcclusalFindings ?? []).map((item) =>
                        item.id === entry.id ? updated : item
                      )
                    )
                  }
                />
              ))}
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
                label="Has an occlusal splint?"
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

          <Section title="Odontogram and Caries Risk">
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
            <div className="grid gap-4 md:grid-cols-2">
              <FixedChoiceListbox
                id="recare-caries-risk-level"
                label="Caries risk level"
                value={form.cariesRiskLevel}
                options={cariesRiskLevelOptions}
                onChange={(value) => updateField("cariesRiskLevel", value)}
              />
              <div className="md:col-span-2">
                <CatalogueMultiCombobox
                  id="recare-caries-risk-factors"
                  label="Caries risk factors"
                  catalogueKey="clinical-exam.caries-risk-factors"
                  values={form.cariesRiskFactors}
                  onChange={(value) => updateField("cariesRiskFactors", value)}
                  roomySelectionActions
                />
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  id="recare-caries-risk-notes"
                  label="Caries risk notes"
                  placeholder="Document rationale for the caries risk selection."
                  value={form.cariesRiskNotes}
                  onChange={(value) => updateField("cariesRiskNotes", value)}
                />
              </div>
            </div>
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
                  !entry.treatmentType.trim() && !entry.toothArea.trim()
              ) ? (
                <button
                  type="button"
                  className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
                  disabled={
                    !form.treatmentOptions.some((entry) =>
                      Boolean(entry.treatmentType.trim())
                    )
                  }
                  onClick={() =>
                    updateField(
                      "treatmentPlan",
                      form.treatmentOptions
                        .filter((entry) => entry.treatmentType.trim())
                        .map((entry) => createTreatmentEntry("plan", entry))
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
