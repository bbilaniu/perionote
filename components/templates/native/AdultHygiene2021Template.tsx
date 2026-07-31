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
import { IsoDateInput } from "@/components/forms/IsoDateInput";
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
import {
  copyGingivalDescriptionAssessment,
  createEmptyGingivalDescriptionAssessment,
  createGingivalDescriptionWnlAssessment,
  gingivalDescriptionCatalog,
  type GingivalDescriptionAssessment,
  type GingivalDescriptionFinding,
  type GingivalDescriptionStatus,
} from "@/lib/templates/gingivalDescriptionCatalog";
import {
  assessedBooleanChoices,
  assessedPresenceChoices,
  choiceLabel,
  classifyGingivalHealthCandidate,
  classifyPeriodontalCandidate,
  formatDiabetesModifier,
  formatPeriodontalEvidence,
  formatSmokingModifier,
  healthGingivitisContextChoices,
  periodontalDiagnosisChoices,
  periodontalExtentChoices,
  periodontalGradeChoices,
  periodontalGradeCriterionCatalogue,
  periodontalPeriodontiumChoices,
  periodontalStageEvidence,
  periodontalStageChoices,
  periodontalStageCriterionCatalogue,
  periodontalStatusChoices,
  type ClinicalMeasurement,
  type DiabetesModifier,
  type GingivalHealthAssessment,
  type HealthGingivitisContext,
  type PeriodontalClassification,
  type PeriodontalCriterionEvidence,
  type PeriodontalGradeCriterionId,
  type PeriodontalStageCriterionId,
  type SmokingModifier,
} from "@/lib/templates/periodontalClassification";

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
const gingivalDescriptionStatusOptions: Array<{
  value: GingivalDescriptionStatus;
  label: string;
}> = [
  { value: "not_assessed", label: "Not assessed" },
  { value: "wnl", label: "WNL" },
  { value: "findings", label: "Findings" },
];
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

const calculusLocationFacetChoices = ["marginal", "interproximal"] as const;
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
      {type === "date" ? (
        <IsoDateInput
          id={id}
          label={label}
          value={value}
          onChange={onChange}
          inputRef={inputRef}
          readOnly={readOnly}
          ariaInvalid={Boolean(error)}
          ariaDescribedBy={error ? errorId : undefined}
        />
      ) : (
        <input
          ref={inputRef}
          id={id}
          className={inputClass}
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
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

function parseFacetedChoice(choice: string, facetChoices: readonly string[]) {
  const selectedTokens = new Set(
    choice
      .normalize("NFKC")
      .trim()
      .toLocaleLowerCase("en-CA")
      .split(/[\s/]+/)
      .filter(Boolean)
  );
  return facetChoices.filter((facet) =>
    selectedTokens.has(
      facet.normalize("NFKC").trim().toLocaleLowerCase("en-CA")
    )
  );
}

function FacetedChoiceWithComment({
  id,
  label,
  choice,
  comment,
  facetChoices,
  facetGroups,
  onChoiceChange,
  onCommentChange,
  formatChoice = (values) => values.join(" "),
  standaloneValue,
}: {
  id: string;
  label: string;
  choice: string;
  comment: string;
  facetChoices: readonly string[];
  facetGroups: readonly FixedChoiceMultiComboboxGroup[];
  onChoiceChange: (choice: string) => void;
  onCommentChange: (comment: string) => void;
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
              nextValues = values.filter((value) => value !== standaloneValue);
            }
          }
          const nextChoice = formatChoice(nextValues);
          onChoiceChange(nextChoice);
        }}
        customPlaceholder={`Search ${label.toLocaleLowerCase("en-CA")} options`}
        customHelpText="Choose options in each applicable section."
        showSelectedChips={false}
        allowCustomValues={false}
      />
      <TextField
        id={`${id}-comment`}
        label={`${label} comment`}
        value={comment}
        onChange={onCommentChange}
        placeholder="Optional comment"
      />
    </div>
  );
}

function CheckboxField({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        id={id}
        type="checkbox"
        className={checkboxClass}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function measurementFor(
  evidence: readonly PeriodontalCriterionEvidence[],
  criterionId: string
) {
  return evidence.find((item) => item.criterionId === criterionId)?.measurement;
}

function numericValue(measurement: ClinicalMeasurement | undefined): string {
  return measurement ? String(measurement.value) : "";
}

function PeriodontalClassificationControl({
  value,
  onChange,
}: {
  value: PeriodontalClassification;
  onChange: (value: PeriodontalClassification) => void;
}) {
  const candidate = classifyPeriodontalCandidate(value);
  const gingivalHealthCandidate = classifyGingivalHealthCandidate(value);
  const stageReasons = periodontalStageEvidence(value)
    .filter((evidence) =>
      candidate.stageReasonIds.includes(evidence.criterionId)
    )
    .map((evidence) => formatPeriodontalEvidence(evidence));
  const gradeReasons = [
    ...value.gradeBasis
      .filter((evidence) =>
        candidate.gradeReasonIds.includes(evidence.criterionId)
      )
      .map((evidence) => formatPeriodontalEvidence(evidence)),
    ...(candidate.gradeReasonIds.includes("modifier.smoking")
      ? [formatSmokingModifier(value.smoking)]
      : []),
    ...(candidate.gradeReasonIds.includes("modifier.diabetes")
      ? [formatDiabetesModifier(value.diabetes)]
      : []),
  ].filter(Boolean);
  const healthGingivitisOptions = [
    { value: "" as HealthGingivitisContext, label: "Not assessed" },
    ...healthGingivitisContextChoices
      .filter((choice) => choice.diagnosis === value.diagnosis)
      .map(({ value: contextValue, label }) => ({
        value: contextValue as HealthGingivitisContext,
        label,
      })),
  ];

  function update(patch: Partial<PeriodontalClassification>) {
    onChange({ ...value, ...patch });
  }

  function updateGingivalHealth(
    patch: Partial<GingivalHealthAssessment>,
    { invalidatesStage = false } = {}
  ) {
    update({
      gingivalHealth: {
        ...value.gingivalHealth,
        ...patch,
        confirmed: false,
      },
      ...(invalidatesStage ? { stageConfirmed: false } : {}),
    });
  }

  function updateMeasurement<
    TCriterionId extends
      | PeriodontalStageCriterionId
      | PeriodontalGradeCriterionId
  >(
    key: "stageBasis" | "gradeBasis",
    criterionId: TCriterionId,
    unit: ClinicalMeasurement["unit"],
    rawValue: string
  ) {
    const current = value[key] as PeriodontalCriterionEvidence<TCriterionId>[];
    const withoutCriterion = current.filter(
      (evidence) => evidence.criterionId !== criterionId
    );
    if (!rawValue.trim()) {
      update({
        [key]: withoutCriterion,
        ...(key === "stageBasis"
          ? { stageConfirmed: false }
          : { gradeConfirmed: false }),
      });
      return;
    }
    const nextValue = Number(rawValue);
    if (!Number.isFinite(nextValue)) return;
    update({
      [key]: [
        ...withoutCriterion,
        {
          criterionId,
          measurement: { operator: "eq", value: nextValue, unit },
        },
      ],
      ...(key === "stageBasis"
        ? { stageConfirmed: false }
        : { gradeConfirmed: false }),
    });
  }

  function updateBoolean<
    TCriterionId extends
      | PeriodontalStageCriterionId
      | PeriodontalGradeCriterionId
  >(
    key: "stageBasis" | "gradeBasis",
    criterionId: TCriterionId,
    checked: boolean
  ) {
    const current = value[key] as PeriodontalCriterionEvidence<TCriterionId>[];
    update({
      [key]: checked
        ? [
            ...current.filter(
              (evidence) => evidence.criterionId !== criterionId
            ),
            { criterionId },
          ]
        : current.filter((evidence) => evidence.criterionId !== criterionId),
      ...(key === "stageBasis"
        ? { stageConfirmed: false }
        : { gradeConfirmed: false }),
    });
  }

  function updateSmokingStatus(status: SmokingModifier["status"]) {
    const smoking: SmokingModifier =
      status === "cigarettes"
        ? { status }
        : status === "other-exposure"
        ? { status, details: "" }
        : { status };
    update({ smoking, gradeConfirmed: false });
  }

  function updateDiabetesStatus(status: DiabetesModifier["status"]) {
    const diabetes: DiabetesModifier = { status };
    update({ diabetes, gradeConfirmed: false });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <FixedChoiceListbox
          id="adult-hygiene-periodontal-diagnosis"
          label="Periodontal diagnosis category"
          value={value.diagnosis}
          options={periodontalDiagnosisChoices}
          onChange={(diagnosis) =>
            update({
              diagnosis,
              gingivalHealth: {
                ...value.gingivalHealth,
                context: "",
                confirmed: false,
                overrideReason: "",
              },
              ...(diagnosis !== "periodontitis"
                ? {
                    extent: "",
                    stage: "",
                    grade: "",
                    stageConfirmed: false,
                    gradeConfirmed: false,
                  }
                : {}),
            })
          }
        />
        <FixedChoiceListbox
          id="adult-hygiene-periodontal-extent"
          label="Extent/distribution"
          value={value.extent}
          options={periodontalExtentChoices}
          onChange={(extent) => update({ extent })}
          disabled={value.diagnosis !== "periodontitis"}
        />
      </div>

      {value.diagnosis === "health" ||
      value.diagnosis === "gingivitis" ||
      value.diagnosis === "periodontitis" ? (
        <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <legend className="font-semibold">
            Health/Gingivitis classification
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            <FixedChoiceListbox
              id="adult-hygiene-periodontium"
              label="Periodontium"
              value={value.gingivalHealth.periodontium}
              options={periodontalPeriodontiumChoices}
              onChange={(periodontium) =>
                updateGingivalHealth({ periodontium })
              }
            />
            <label className="block text-sm font-medium">
              Bleeding on probing (%)
              <input
                id="adult-hygiene-bop-percent"
                className={inputClass}
                type="number"
                min={0}
                max={100}
                step={1}
                value={numericValue(value.gingivalHealth.bopPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  updateGingivalHealth({
                    ...(raw
                      ? {
                          bopPercent: {
                            operator: "eq",
                            value: Number(raw),
                            unit: "percent",
                          },
                        }
                      : { bopPercent: undefined }),
                  });
                }}
              />
            </label>
            <label className="block text-sm font-medium">
              Maximum PPD (mm)
              <input
                id="adult-hygiene-maximum-ppd"
                className={inputClass}
                type="number"
                min={0}
                step={1}
                value={numericValue(value.gingivalHealth.maximumPpd)}
                onChange={(event) => {
                  const raw = event.target.value;
                  updateGingivalHealth(
                    {
                      ...(raw
                        ? {
                            maximumPpd: {
                              operator: "eq",
                              value: Number(raw),
                              unit: "mm",
                            },
                          }
                        : { maximumPpd: undefined }),
                    },
                    { invalidatesStage: true }
                  );
                }}
              />
            </label>
            <FixedChoiceListbox
              id="adult-hygiene-attachment-loss"
              label="Probing attachment loss"
              value={value.gingivalHealth.attachmentLoss}
              options={assessedPresenceChoices}
              onChange={(attachmentLoss) =>
                updateGingivalHealth({ attachmentLoss })
              }
            />
            <FixedChoiceListbox
              id="adult-hygiene-radiographic-bone-loss"
              label="Radiographic bone loss"
              value={value.gingivalHealth.radiographicBoneLoss}
              options={assessedPresenceChoices}
              onChange={(radiographicBoneLoss) =>
                updateGingivalHealth({ radiographicBoneLoss })
              }
            />
            {value.diagnosis === "periodontitis" ? (
              <>
                <FixedChoiceListbox
                  id="adult-hygiene-ppd4-bop"
                  label="Any site with PPD ≥4 mm and BOP"
                  value={value.gingivalHealth.ppd4OrGreaterWithBop}
                  options={assessedBooleanChoices}
                  onChange={(ppd4OrGreaterWithBop) =>
                    updateGingivalHealth({ ppd4OrGreaterWithBop })
                  }
                />
                <FixedChoiceListbox
                  id="adult-hygiene-progressive-destruction"
                  label="Evidence of progressive periodontal destruction"
                  value={value.gingivalHealth.progressiveDestruction}
                  options={assessedBooleanChoices}
                  onChange={(progressiveDestruction) =>
                    updateGingivalHealth({ progressiveDestruction })
                  }
                />
              </>
            ) : null}
          </div>

          <div className="border-l-4 border-sky-600 pl-4">
            <h3 className="font-semibold">Candidate Health/Gingivitis</h3>
            <p className="mt-1 text-sm">
              {gingivalHealthCandidate.context
                ? choiceLabel(
                    healthGingivitisContextChoices,
                    gingivalHealthCandidate.context
                  )
                : "Not available"}
            </p>
            {gingivalHealthCandidate.warnings.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {gingivalHealthCandidate.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
            {gingivalHealthCandidate.context ? (
              <button
                type="button"
                className={`${buttonClass} mt-3 bg-sky-700 text-white hover:bg-sky-800`}
                onClick={() =>
                  updateGingivalHealth({
                    context: gingivalHealthCandidate.context,
                    overrideReason: "",
                  })
                }
              >
                Use candidate
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3">
              <FixedChoiceListbox
                id="adult-hygiene-health-gingivitis-context"
                label="Health/Gingivitis"
                value={value.gingivalHealth.context}
                options={healthGingivitisOptions}
                onChange={(context) =>
                  updateGingivalHealth({ context, overrideReason: "" })
                }
              />
              <CheckboxField
                id="adult-hygiene-health-gingivitis-confirmed"
                label="Confirm selected Health/Gingivitis classification"
                checked={value.gingivalHealth.confirmed}
                disabled={
                  !value.gingivalHealth.context ||
                  (value.gingivalHealth.context !==
                    gingivalHealthCandidate.context &&
                    !value.gingivalHealth.overrideReason.trim())
                }
                onChange={(confirmed) =>
                  update({
                    gingivalHealth: {
                      ...value.gingivalHealth,
                      confirmed:
                        Boolean(value.gingivalHealth.context) && confirmed,
                    },
                  })
                }
              />
            </div>
            {value.gingivalHealth.context &&
            value.gingivalHealth.context !==
              gingivalHealthCandidate.context ? (
              <TextField
                id="adult-hygiene-health-gingivitis-override"
                label="Health/Gingivitis override reason"
                value={value.gingivalHealth.overrideReason}
                onChange={(overrideReason) =>
                  updateGingivalHealth({ overrideReason })
                }
              />
            ) : null}
          </div>
        </fieldset>
      ) : null}

      {value.diagnosis === "periodontitis" ? (
        <>
      <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <legend className="font-semibold">Patient-specific stage evidence</legend>
        {(["severity", "complexity"] as const).map((group) => (
          <div key={group}>
            <h3 className="mb-2 text-sm font-semibold capitalize">{group}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {periodontalStageCriterionCatalogue
                .filter(
                  (criterion) =>
                    criterion.group === group &&
                    criterion.id !== "stage.max-ppd"
                )
                .map((criterion) =>
                  criterion.input === "measurement" ? (
                    <label
                      key={criterion.id}
                      className="block text-sm font-medium"
                    >
                      {criterion.label} (
                      {criterion.unit === "percent"
                        ? "%"
                        : criterion.unit === "opposing-pairs"
                        ? "opposing pairs"
                        : criterion.unit}
                      )
                      <input
                        id={`adult-hygiene-${criterion.id.replaceAll(".", "-")}`}
                        className={inputClass}
                        type="number"
                        min={criterion.minimum}
                        step={criterion.step}
                        value={numericValue(
                          measurementFor(value.stageBasis, criterion.id)
                        )}
                        onChange={(event) =>
                          updateMeasurement(
                            "stageBasis",
                            criterion.id,
                            criterion.unit,
                            event.target.value
                          )
                        }
                      />
                    </label>
                  ) : (
                    <CheckboxField
                      key={criterion.id}
                      id={`adult-hygiene-${criterion.id.replaceAll(".", "-")}`}
                      label={criterion.label}
                      checked={value.stageBasis.some(
                        (evidence) => evidence.criterionId === criterion.id
                      )}
                      onChange={(checked) =>
                        updateBoolean(
                          "stageBasis",
                          criterion.id,
                          checked
                        )
                      }
                    />
                  )
                )}
            </div>
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <legend className="font-semibold">Patient-specific grade evidence</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {periodontalGradeCriterionCatalogue.map((criterion) =>
            criterion.input === "measurement" ? (
              <label
                key={criterion.id}
                className="block text-sm font-medium"
              >
                {criterion.label} ({criterion.unit})
                <input
                  id={`adult-hygiene-${criterion.id.replaceAll(".", "-")}`}
                  className={inputClass}
                  type="number"
                  min={criterion.minimum}
                  step={criterion.step}
                  value={numericValue(
                    measurementFor(value.gradeBasis, criterion.id)
                  )}
                  onChange={(event) =>
                    updateMeasurement(
                      "gradeBasis",
                      criterion.id,
                      criterion.unit,
                      event.target.value
                    )
                  }
                />
              </label>
            ) : (
              <CheckboxField
                key={criterion.id}
                id={`adult-hygiene-${criterion.id.replaceAll(".", "-")}`}
                label={criterion.label}
                checked={value.gradeBasis.some(
                  (evidence) => evidence.criterionId === criterion.id
                )}
                onChange={(checked) =>
                  updateBoolean("gradeBasis", criterion.id, checked)
                }
              />
            )
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <legend className="font-semibold">Grade modifiers</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <FixedChoiceListbox
              id="adult-hygiene-smoking-modifier"
              label="Smoking and tobacco/nicotine exposure"
              value={value.smoking.status}
              options={[
                { value: "not-assessed", label: "Not assessed" },
                { value: "non-smoker", label: "Non-smoker" },
                {
                  value: "cigarettes",
                  label: "Smokes cigarettes",
                },
                {
                  value: "other-exposure",
                  label: "Other exposure",
                },
              ]}
              onChange={updateSmokingStatus}
            />
            {value.smoking.status === "cigarettes" ? (
              <label className="mt-3 block text-sm font-medium">
                Cigarettes per day
                <input
                  id="adult-hygiene-cigarettes-per-day"
                  className={inputClass}
                  type="number"
                  min={0}
                  step={1}
                  value={numericValue(value.smoking.measurement)}
                  onChange={(event) => {
                    const raw = event.target.value;
                    update({
                      smoking: {
                        status: "cigarettes",
                        ...(raw
                          ? {
                              measurement: {
                                operator: "eq",
                                value: Number(raw),
                                unit: "cigarettes-per-day",
                              },
                            }
                          : {}),
                      },
                      gradeConfirmed: false,
                    });
                  }}
                />
              </label>
            ) : value.smoking.status === "other-exposure" ? (
              <TextField
                id="adult-hygiene-other-nicotine-exposure"
                label="Other exposure details"
                value={value.smoking.details}
                onChange={(details) =>
                  update({
                    smoking: { status: "other-exposure", details },
                  })
                }
              />
            ) : null}
          </div>
          <div>
            <FixedChoiceListbox
              id="adult-hygiene-diabetes-modifier"
              label="Diabetes modifier"
              value={value.diabetes.status}
              options={[
                { value: "not-assessed", label: "Not assessed" },
                {
                  value: "no-diabetes",
                  label: "No diagnosis / normoglycemic",
                },
                {
                  value: "diabetes",
                  label: "Diabetes with current HbA1c",
                },
                {
                  value: "diabetes-hba1c-unknown",
                  label: "Diabetes; HbA1c unknown",
                },
              ]}
              onChange={updateDiabetesStatus}
            />
            {value.diabetes.status === "diabetes" ? (
              <label className="mt-3 block text-sm font-medium">
                HbA1c (%)
                <input
                  id="adult-hygiene-hba1c"
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.1}
                  value={numericValue(value.diabetes.measurement)}
                  onChange={(event) => {
                    const raw = event.target.value;
                    update({
                      diabetes: {
                        status: "diabetes",
                        ...(raw
                          ? {
                              measurement: {
                                operator: "eq",
                                value: Number(raw),
                                unit: "percent",
                              },
                            }
                          : {}),
                      },
                      gradeConfirmed: false,
                    });
                  }}
                />
              </label>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className="border-l-4 border-sky-600 pl-4">
        <h3 className="font-semibold">Candidate classification</h3>
        <p className="mt-1 text-sm">
          Stage {candidate.stage || "not available"}; Grade{" "}
          {candidate.grade || "not available"}
          {candidate.gradeSource === "assumed" ? " (working assumption)" : ""}.
        </p>
        {stageReasons.length ? (
          <p className="mt-2 text-sm">
            Stage evidence: {stageReasons.join("; ")}.
          </p>
        ) : null}
        {gradeReasons.length ? (
          <p className="mt-1 text-sm">
            Grade evidence: {gradeReasons.join("; ")}.
          </p>
        ) : null}
        {candidate.warnings.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {candidate.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
        {candidate.stage || candidate.grade ? (
          <button
            type="button"
            className={`${buttonClass} mt-3 bg-sky-700 text-white hover:bg-sky-800`}
            onClick={() =>
              update({
                ...(candidate.stage ? { stage: candidate.stage } : {}),
                ...(candidate.grade ? { grade: candidate.grade } : {}),
                stageConfirmed: false,
                gradeConfirmed: false,
              })
            }
          >
            Use candidates
          </button>
        ) : null}
      </div>

      <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <legend className="font-semibold">Clinician confirmation</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            <FixedChoiceListbox
              id="adult-hygiene-periodontitis-stage"
              label="Periodontitis stage"
              value={value.stage}
              options={periodontalStageChoices}
              onChange={(stage) =>
                update({
                  stage,
                  stageConfirmed: false,
                  stageOverrideReason: "",
                })
              }
            />
            <CheckboxField
              id="adult-hygiene-periodontitis-stage-confirmed"
              label="Confirm selected stage"
              checked={value.stageConfirmed}
              disabled={!value.stage}
              onChange={(stageConfirmed) =>
                update({
                  stageConfirmed: Boolean(value.stage) && stageConfirmed,
                })
              }
            />
            {value.stage &&
            candidate.stage &&
            value.stage !== candidate.stage ? (
              <TextField
                id="adult-hygiene-periodontitis-stage-override"
                label="Stage override reason"
                value={value.stageOverrideReason}
                onChange={(stageOverrideReason) =>
                  update({ stageOverrideReason })
                }
              />
            ) : null}
          </div>
          <div className="space-y-3">
            <FixedChoiceListbox
              id="adult-hygiene-periodontitis-grade"
              label="Periodontitis grade"
              value={value.grade}
              options={periodontalGradeChoices}
              onChange={(grade) =>
                update({
                  grade,
                  gradeConfirmed: false,
                  gradeOverrideReason: "",
                })
              }
            />
            <CheckboxField
              id="adult-hygiene-periodontitis-grade-confirmed"
              label="Confirm selected grade"
              checked={value.gradeConfirmed}
              disabled={!value.grade}
              onChange={(gradeConfirmed) =>
                update({
                  gradeConfirmed: Boolean(value.grade) && gradeConfirmed,
                })
              }
            />
            {value.grade &&
            candidate.grade &&
            value.grade !== candidate.grade ? (
              <TextField
                id="adult-hygiene-periodontitis-grade-override"
                label="Grade override reason"
                value={value.gradeOverrideReason}
                onChange={(gradeOverrideReason) =>
                  update({ gradeOverrideReason })
                }
              />
            ) : null}
          </div>
        </div>
        <FixedChoiceListbox
          id="adult-hygiene-periodontal-status"
          label="Current periodontal status"
          value={value.status}
          options={periodontalStatusChoices}
          onChange={(status) => update({ status })}
        />
      </fieldset>
        </>
      ) : null}
    </div>
  );
}

function GingivalDescriptionControl({
  value,
  onChange,
}: {
  value: GingivalDescriptionAssessment | undefined;
  onChange: (value: GingivalDescriptionAssessment) => void;
}) {
  const assessment = value ?? createEmptyGingivalDescriptionAssessment();
  const [showWnlDetails, setShowWnlDetails] = useState(false);
  const selected = new Map(
    assessment.findings.map((finding) => [finding.optionId, finding])
  );
  const hasObservations =
    assessment.findings.length > 0 ||
    Boolean((assessment.customFindings ?? "").trim());

  function updateFinding(
    optionId: string,
    patch: Partial<Omit<GingivalDescriptionFinding, "optionId">>
  ) {
    const current = selected.get(optionId);
    if (!current) return;
    onChange({
      ...assessment,
      status: "findings",
      findings: assessment.findings.map((finding) =>
        finding.optionId === optionId ? { ...finding, ...patch } : finding
      ),
    });
  }

  function toggleFinding(optionId: string, checked: boolean) {
    onChange({
      ...assessment,
      status: "findings",
      findings: checked
        ? [
            ...assessment.findings.filter(
              (finding) => finding.optionId !== optionId
            ),
            {
              optionId,
              extent: "",
              locations: [],
              measurement: "",
              comment: "",
            },
          ]
        : assessment.findings.filter(
            (finding) => finding.optionId !== optionId
          ),
    });
  }

  function setWnl() {
    if (
      assessment.status !== "wnl" &&
      hasObservations &&
      !window.confirm(
        "Clear the documented Gingival Description findings and set this assessment to WNL?"
      )
    ) {
      return;
    }
    setShowWnlDetails(false);
    onChange(createGingivalDescriptionWnlAssessment());
  }

  function changeStatus(status: GingivalDescriptionStatus) {
    if (status === "wnl") {
      setWnl();
      return;
    }
    setShowWnlDetails(false);
    onChange({ ...assessment, status });
  }

  function applyNormalStructuredObservations() {
    if (
      assessment.status !== "wnl" &&
      hasObservations &&
      !window.confirm(
        "Replace all documented Gingival Description observations with the reviewed normal structured observations?"
      )
    ) {
      return;
    }
    onChange(createGingivalDescriptionWnlAssessment());
    setShowWnlDetails(true);
  }

  function clearAssessment() {
    if (
      hasObservations &&
      !window.confirm(
        "Clear all documented Gingival Description observations and return this assessment to Not assessed?"
      )
    ) {
      return;
    }
    setShowWnlDetails(false);
    onChange(createEmptyGingivalDescriptionAssessment());
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FixedChoiceListbox
          id="adult-hygiene-gingival-description-status"
          label="Gingival Description"
          value={assessment.status}
          options={gingivalDescriptionStatusOptions}
          onChange={changeStatus}
        />
        {assessment.status === "findings" ? (
          <TextField
            id="adult-hygiene-gingival-description-findings"
            label="Gingival Description findings"
            value={assessment.customFindings ?? ""}
            onChange={(customFindings) =>
              onChange({
                ...assessment,
                status: "findings",
                customFindings,
              })
            }
            placeholder="Enter additional gingival findings"
          />
        ) : null}
      </div>
      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <legend className="px-1 font-semibold">
          Structured gingival observations
        </legend>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Apply the reviewed normal observations or document individual
          findings. Detailed controls are shown for Findings.
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
            className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
            onClick={clearAssessment}
            disabled={
              assessment.status === "not_assessed" && !hasObservations
            }
          >
            Clear gingival description
          </button>
        </div>
        {assessment.status === "findings" || showWnlDetails
          ? gingivalDescriptionCatalog.dimensions.map((dimension) => (
        <fieldset
          key={dimension.id}
          className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700"
        >
          <legend className="font-medium">{dimension.label}</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {dimension.options.map((option) => {
              const finding = selected.get(option.id);
              const supportsLocation =
                dimension.supportsLocation ||
                ("supportsLocation" in option && option.supportsLocation);
              const supportsMeasurement =
                "supportsMeasurement" in option && option.supportsMeasurement;
              return (
                <div
                  key={option.id}
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <CheckboxField
                    id={`adult-hygiene-${option.id.replaceAll(".", "-")}`}
                    label={option.label}
                    checked={Boolean(finding)}
                    onChange={(checked) => toggleFinding(option.id, checked)}
                  />
                  {finding ? (
                    <div className="mt-3 grid gap-3">
                      <FixedChoiceListbox
                        id={`adult-hygiene-${option.id.replaceAll(
                          ".",
                          "-"
                        )}-extent`}
                        label={`${option.label} extent`}
                        value={finding.extent}
                        options={[
                          { value: "", label: "Not specified" },
                          { value: "generalized", label: "Generalized" },
                          { value: "localized", label: "Localized" },
                        ]}
                        onChange={(extent) =>
                          updateFinding(option.id, { extent })
                        }
                        compact
                      />
                      {supportsLocation ? (
                        <TextField
                          id={`adult-hygiene-${option.id.replaceAll(
                            ".",
                            "-"
                          )}-location`}
                          label={`${option.label} location`}
                          value={finding.locations.join(", ")}
                          onChange={(locations) =>
                            updateFinding(option.id, {
                              locations: locations
                                .split(/[,;\n]/)
                                .map((item) => item.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Arch, quadrant, sextant, tooth, surface, or region"
                        />
                      ) : null}
                      {supportsMeasurement ? (
                        <TextField
                          id={`adult-hygiene-${option.id.replaceAll(
                            ".",
                            "-"
                          )}-measurement`}
                          label={`${option.label} measurement (mm)`}
                          value={finding.measurement}
                          onChange={(measurement) =>
                            updateFinding(option.id, { measurement })
                          }
                        />
                      ) : null}
                      <TextField
                        id={`adult-hygiene-${option.id.replaceAll(
                          ".",
                          "-"
                        )}-comment`}
                        label={`${option.label} notes`}
                        value={finding.comment}
                        onChange={(comment) =>
                          updateFinding(option.id, { comment })
                        }
                        placeholder="Optional encounter-specific note"
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
            ))
          : null}
      </fieldset>
    </>
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
    patch: Partial<Omit<AdultHygieneTreatmentCompletedEntry, "id">>
  ) {
    onChange(
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, ...patch } : entry
      )
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
                    ariaLabel={`Move treatment completed item ${
                      index + 1
                    } earlier`}
                    onClick={() => moveEntry(index, "earlier")}
                  >
                    Earlier
                  </TooltipActionButton>
                  <TooltipActionButton
                    tooltip="Move this treatment line later in the note."
                    className={treatmentRowButtonClass}
                    disabled={index === entries.length - 1}
                    ariaLabel={`Move treatment completed item ${
                      index + 1
                    } later`}
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
    createEmptyAdultHygiene2021Form
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
    [form, startedAt]
  );

  function updateField<TKey extends keyof AdultHygiene2021Form>(
    key: TKey,
    value: AdultHygiene2021Form[TKey]
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
      Boolean(value.trim())
    );
    setPatientIdError(missingPatientId ? "Enter a Patient ID." : "");
    setProviderError(
      missingProvider ? "Enter at least one of Dentist, RDH, or RDA." : ""
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
        : "The note could not be copied. Select the preview and copy it manually."
    );
  }

  function loadDemo() {
    setForm({
      ...fixture,
      gingivalDescription: copyGingivalDescriptionAssessment(
        fixture.gingivalDescription
      ),
      periodontalClassification: {
        ...fixture.periodontalClassification,
        stageBasis: fixture.periodontalClassification.stageBasis.map(
          (evidence) => ({
            ...evidence,
            ...(evidence.measurement
              ? { measurement: { ...evidence.measurement } }
              : {}),
          })
        ),
        gradeBasis: fixture.periodontalClassification.gradeBasis.map(
          (evidence) => ({
            ...evidence,
            ...(evidence.measurement
              ? { measurement: { ...evidence.measurement } }
              : {}),
          })
        ),
        smoking: { ...fixture.periodontalClassification.smoking },
        diabetes: { ...fixture.periodontalClassification.diabetes },
        gingivalHealth: {
          ...fixture.periodontalClassification.gingivalHealth,
          ...(fixture.periodontalClassification.gingivalHealth.bopPercent
            ? {
                bopPercent: {
                  ...fixture.periodontalClassification.gingivalHealth
                    .bopPercent,
                },
              }
            : {}),
          ...(fixture.periodontalClassification.gingivalHealth.maximumPpd
            ? {
                maximumPpd: {
                  ...fixture.periodontalClassification.gingivalHealth
                    .maximumPpd,
                },
              }
            : {}),
        },
      },
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
                      value ? "yes" : "not-documented"
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
                    values
                  )
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
            <FacetedChoiceWithComment
              id="adult-hygiene-plaque"
              label="Plaque"
              choice={form.plaqueChoice}
              comment={form.plaqueComment}
              facetChoices={plaqueFacetChoices}
              facetGroups={plaqueFacetGroups}
              onChoiceChange={(value) => updateField("plaqueChoice", value)}
              onCommentChange={(value) => updateField("plaqueComment", value)}
            />
            <FacetedChoiceWithComment
              id="adult-hygiene-stain"
              label="Stain"
              choice={form.stainChoice}
              comment={form.stainComment}
              facetChoices={stainFacetChoices}
              facetGroups={stainFacetGroups}
              onChoiceChange={(value) => updateField("stainChoice", value)}
              onCommentChange={(value) => updateField("stainComment", value)}
              standaloneValue="None"
            />
            <FacetedChoiceWithComment
              id="adult-hygiene-calculus"
              label="Calculus"
              choice={form.calculusChoice}
              comment={form.calculusComment}
              facetChoices={calculusFacetChoices}
              facetGroups={calculusFacetGroups}
              onChoiceChange={(value) => updateField("calculusChoice", value)}
              onCommentChange={(value) =>
                updateField("calculusComment", value)
              }
              formatChoice={(values) => {
                const locationValues = values.filter((value) =>
                  calculusLocationFacetChoices.includes(
                    value as (typeof calculusLocationFacetChoices)[number]
                  )
                );
                return [
                  ...values.filter(
                    (value) =>
                      !calculusLocationFacetChoices.includes(
                        value as (typeof calculusLocationFacetChoices)[number]
                      )
                  ),
                  locationValues.join("/"),
                ]
                  .filter(Boolean)
                  .join(" ");
              }}
            />
            <FacetedChoiceWithComment
              id="adult-hygiene-bleeding"
              label="Bleeding"
              choice={form.bleedingChoice}
              comment={form.bleedingComment}
              facetChoices={bleedingFacetChoices}
              facetGroups={bleedingFacetGroups}
              onChoiceChange={(value) => updateField("bleedingChoice", value)}
              onCommentChange={(value) =>
                updateField("bleedingComment", value)
              }
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
            <GingivalDescriptionControl
              value={form.gingivalDescription}
              onChange={(value) => updateField("gingivalDescription", value)}
            />
            <PeriodontalClassificationControl
              value={form.periodontalClassification}
              onChange={(value) =>
                updateField("periodontalClassification", value)
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
