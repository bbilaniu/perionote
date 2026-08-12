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
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { ClinicalLocationMultiCombobox } from "@/components/forms/ClinicalLocationMultiCombobox";
import {
  DropdownChevron,
  formControlClass,
} from "@/components/forms/controlStyles";
import {
  FixedChoiceMultiCombobox,
  type FixedChoiceMultiComboboxGroup,
} from "@/components/forms/FixedChoiceMultiCombobox";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import { IsoDateInput } from "@/components/forms/IsoDateInput";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { StaticSuggestionCombobox } from "@/components/forms/StaticSuggestionCombobox";
import { TooltipActionButton } from "@/components/forms/TooltipActionButton";
import { Time24Input } from "@/components/forms/Time24Input";
import { InteractiveTemplateHeader } from "@/components/templates/shared/InteractiveTemplateHeader";
import { LocalDraftRecovery } from "@/components/templates/shared/LocalDraftRecovery";
import { LocalAnesthesiaControl } from "@/components/templates/shared/LocalAnesthesiaControl";
import { OheEducationControl } from "@/components/templates/shared/OheEducationControl";
import { RadiographsTakenControl } from "@/components/templates/shared/RadiographsTakenControl";
import { TreatmentCompletedList as StructuredTreatmentCompletedList } from "@/components/templates/shared/TreatmentCompletedList";
import { useLocalInteractiveDraft } from "@/components/templates/shared/useLocalInteractiveDraft";
import {
  ExamFinding,
  LymphNodesAssessmentControl,
  OcclusalFindingLocations,
  StructuredExtraoralObservations,
  StructuredIntraoralFindings,
  TeethAssessment,
  TmjAssessmentControl,
  TreatmentEntryList,
} from "@/components/templates/native/RecareExamTemplate";
import {
  type AdultHygieneTreatmentCompletedEntry,
  type AdultHygiene2026Output,
  type AdultHygiene2026Form,
  type CariesRiskLevel,
  brushingFrequencyChoices,
  createEmptyAdultHygiene2026Form,
  diseaseAndRiskOheTopicChoices,
  flossingFrequencyChoices,
  hasRequiredAdultHygiene2026Fields,
  homeCareOheTopicChoices,
  oheTopicChoices,
  preventionAndMaintenanceOheTopicChoices,
  resolveOcclusalSplintState,
  standardHygieneGoal,
  standardOheStatement,
} from "@/lib/templates/adultHygiene2026";
import { applyPatientChiefConcernSelectionRules } from "@/lib/templates/patientChiefConcern";
import { suggestAdultCariesRisk } from "@/lib/templates/cariesRisk";
import { matchesDraftShape } from "@/lib/templates/localDrafts";
import type { InteractiveTemplateProps } from "@/lib/templates/types";
import {
  buildOheTreatmentRecap,
  createStandardTreatmentEntriesFromCatalogue,
  migrateLegacyDesensitizerToTreatmentCompleted,
  recareExamTreatmentPreset,
  syncDerivedOheTreatmentDetails,
  syncRadiographTreatmentEntries,
  treatmentCompletedEntryIdentity,
} from "@/lib/templates/adultHygieneTreatment";
import type {
  DocumentationStatus,
  ExamStatus,
  PremedicationStatus,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import { createRecareNormalStructuredIntraoralFindings } from "@/lib/templates/recareIntraoralCatalog";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";
import { formatRecareExamLocalTimestamp } from "@/lib/templates/summary/buildRecareExamSummary";
import {
  createEmptyVitalsReading,
  getCurrentVitalsTime,
  hasVitalsMeasurement,
  type VitalsReading,
} from "@/lib/templates/vitalsReadings";
import {
  applyGingivitisObservationPreset,
  copyGingivalDescriptionAssessment,
  createEmptyGingivalDescriptionAssessment,
  createGingivalDescriptionWnlAssessment,
  gingivalDescriptionCatalog,
  hasConflictingGingivitisPresetObservations,
  type GingivalCatalogDimension,
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
  classifyPeriodontalDiagnosisCandidates,
  deepPocketBopChoices,
  formatDiabetesModifier,
  formatPeriodontalEvidence,
  formatSmokingModifier,
  healthGingivitisContextChoices,
  isReducedNonPeriodontitisContext,
  normalizePeriodontalClassification,
  periodontalDiagnosisChoices,
  periodontalExtentChoices,
  periodontalGradeChoices,
  periodontalGradeCriterionCatalogue,
  periodontalPeriodontiumChoices,
  periodontalStageEvidence,
  periodontalStageChoices,
  periodontalStageCriterionCatalogue,
  periodontalStatusChoices,
  reducedPeriodontiumBasisChoices,
  requiredPeriodontalStatusForContext,
  isPeriodontalStatusCompatibleWithContext,
  type ClinicalMeasurement,
  type DiabetesModifier,
  type GingivalHealthAssessment,
  type GingivalHealthCandidateMissingFieldId,
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
const vitalsActionButtonClass =
  "inline-flex h-10 self-end items-center justify-center rounded-xl border border-slate-300 px-3 text-xs font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800";
const vitalsRemoveButtonClass =
  "inline-flex h-10 items-center justify-center rounded-xl border border-red-300 px-3 text-xs font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950";
const evidenceSectionClass =
  "space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700";
const evidenceSectionHeadingClass = "mb-2 text-center text-sm font-semibold";
const cariesRiskLevelOptions: Array<{
  value: CariesRiskLevel;
  label: string;
}> = [
  { value: "", label: "None selected" },
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
];
const gingivalCandidateFieldTargetIds: Record<
  GingivalHealthCandidateMissingFieldId,
  string
> = {
  "periodontal-support": "adult-hygiene-periodontium",
  "bop-percentage": "adult-hygiene-bop-percent",
  "maximum-ppd": "adult-hygiene-maximum-ppd",
  "attachment-loss": "adult-hygiene-attachment-loss",
  "radiographic-bone-loss": "adult-hygiene-radiographic-bone-loss",
  "ppd-4-or-greater-with-bop": "adult-hygiene-ppd4-bop",
  "progressive-destruction": "adult-hygiene-progressive-destruction",
};

function GingivalCandidateFieldTarget({
  id,
  activeId,
  children,
}: {
  id: GingivalHealthCandidateMissingFieldId;
  activeId?: GingivalHealthCandidateMissingFieldId;
  children: ReactNode;
}) {
  const highlighted = id === activeId;
  return (
    <div
      className={`scroll-mt-24 rounded-xl transition-shadow duration-300 ${
        highlighted
          ? "ring-2 ring-amber-400 ring-offset-4 ring-offset-white dark:ring-amber-300 dark:ring-offset-slate-950"
          : ""
      }`}
      data-candidate-field={id}
      data-candidate-highlighted={highlighted ? "true" : undefined}
    >
      {children}
    </div>
  );
}

const stageEvidenceGroups = [
  { value: "severity", label: "Severity evidence" },
  { value: "complexity", label: "Complexity evidence" },
] as const;
const adultHygieneDiscardWarning =
  "Clear all entered 2026 Adult Hygiene values and start a new note? The current local draft will remain available on Saved drafts for up to seven days.";
const adolescentHygieneDiscardWarning =
  "Clear all entered 2026 Adolescent Hygiene values and start a new note? The current local draft will remain available on Saved drafts for up to seven days.";

export type Hygiene2026Variant = "adult" | "adolescent";

const outputChoicesByVariant = {
  adult: [
    ["complete", "Complete"],
    ["hygiene", "Hygiene"],
    ["recare", "Recare"],
  ],
  adolescent: [
    ["complete", "Combined"],
    ["recare", "Dentist"],
    ["hygiene", "Hygienist"],
  ],
} as const satisfies Record<
  Hygiene2026Variant,
  readonly (readonly [AdultHygiene2026Output, string])[]
>;
const adultHygieneDraftExemplar = createEmptyAdultHygiene2026Form();
const emptyAdultHygieneDraft = JSON.stringify(adultHygieneDraftExemplar);
const adultHygieneDraftArrayItemShapes = {
  patientChiefConcern: "",
  radiographs: "",
  vitalsReadings: {
    systolic: "",
    diastolic: "",
    heartRate: "",
    time: "",
  },
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
  plaqueAreas: "",
  stainAreas: "",
  calculusAreas: "",
  bleedingAreas: "",
  "gingivalDescription.findings": {
    optionId: "",
    extent: "",
    locations: [],
    measurement: "",
    comment: "",
  },
  "gingivalDescription.findings[].locations": "",
  "periodontalClassification.stageBasis": { criterionId: "" },
  "periodontalClassification.gradeBasis": { criterionId: "" },
  "periodontalClassification.gingivalHealth.reducedPeriodontiumBases": "",
  cariesRiskFactors: "",
  ohiAidsReviewed: "",
  oheTopicsReviewed: "",
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
  treatmentOptions: { id: "", treatmentType: "", toothArea: "" },
  hygieneTreatmentOptions: { id: "", treatmentType: "", toothArea: "" },
  treatmentPlan: { id: "", treatmentType: "", toothArea: "" },
} as const;

function isEmptyAdultHygieneDraft(form: AdultHygiene2026Form): boolean {
  return (
    JSON.stringify({
      ...form,
      dentist: "",
      rdh: "",
      rda: "",
      class5IndicatorStatus: "not-documented",
      ppeStatementApplies: false,
      vitalsReadings: form.vitalsReadings.filter(hasVitalsMeasurement),
    }) === emptyAdultHygieneDraft
  );
}

export function isAdultHygieneDraftForm(
  value: unknown,
): value is AdultHygiene2026Form {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  const gingivalDescription = candidate.gingivalDescription;
  return matchesDraftShape(
    {
      ...adultHygieneDraftExemplar,
      ...candidate,
      periodontalClassification: normalizePeriodontalClassification(
        candidate.periodontalClassification,
      ),
      gingivalDescription:
        gingivalDescription &&
        typeof gingivalDescription === "object" &&
        !Array.isArray(gingivalDescription)
          ? {
              ...adultHygieneDraftExemplar.gingivalDescription,
              ...gingivalDescription,
            }
          : adultHygieneDraftExemplar.gingivalDescription,
    },
    adultHygieneDraftExemplar,
    adultHygieneDraftArrayItemShapes,
  );
}
const gingivalDescriptionStatusOptions: Array<{
  value: GingivalDescriptionStatus;
  label: string;
}> = [
  { value: "not_assessed", label: "Not assessed" },
  { value: "wnl", label: "WNL" },
  { value: "findings", label: "Findings" },
];
type GingivalChoiceGroupDefinition = {
  label: string;
  optionIds: readonly string[];
  selectionMode?: "multiple" | "single";
};
const gingivalChoiceGroupDefinitions = {
  "gingiva.color": [
    {
      label: "Primary color",
      optionIds: [
        "gingiva.color.coral_pink",
        "gingiva.color.red_erythematous",
        "gingiva.color.marginal_redness",
        "gingiva.color.bright_red",
        "gingiva.color.bluish_red",
        "gingiva.color.pale_pink",
      ],
      selectionMode: "single",
    },
    {
      label: "Additional findings",
      optionIds: [
        "gingiva.color.physiologic_pigmentation",
        "gingiva.color.white_patch",
      ],
    },
  ],
  "gingiva.contour": [
    {
      label: "Marginal form",
      optionIds: [
        "gingiva.contour.knife_edged_margins",
        "gingiva.contour.rounded_margins",
        "gingiva.contour.rolled_margins",
        "gingiva.contour.bulbous_margins",
      ],
      selectionMode: "single",
    },
    {
      label: "Marginal adaptation",
      optionIds: ["gingiva.contour.flat_against_teeth"],
    },
    {
      label: "Papillae",
      optionIds: [
        "gingiva.contour.papillae_fill_embrasures",
        "gingiva.contour.blunted_papillae",
        "gingiva.contour.cratered_papillae",
        "gingiva.contour.enlarged_papillae",
      ],
      selectionMode: "single",
    },
  ],
  "gingiva.consistency": [
    {
      label: "Tissue character",
      optionIds: [
        "gingiva.consistency.firm",
        "gingiva.consistency.soft",
        "gingiva.consistency.spongy",
        "gingiva.consistency.fibrotic",
        "gingiva.consistency.edematous",
      ],
      selectionMode: "single",
    },
    {
      label: "Tissue response",
      optionIds: [
        "gingiva.consistency.resilient",
        "gingiva.consistency.easily_displaced",
      ],
      selectionMode: "single",
    },
  ],
  "gingiva.surface": [
    {
      label: "Attached gingiva",
      optionIds: [
        "gingiva.surface.stippled_attached",
        "gingiva.surface.smooth_attached",
        "gingiva.surface.loss_of_stippling",
        "gingiva.surface.excessive_stippling_fibrotic",
      ],
      selectionMode: "single",
    },
    {
      label: "Marginal gingiva",
      optionIds: ["gingiva.surface.smooth_marginal", "gingiva.surface.shiny"],
      selectionMode: "single",
    },
  ],
  "gingiva.position": [
    {
      label: "Recession",
      optionIds: [
        "gingiva.position.no_recession",
        "gingiva.position.recession",
      ],
      selectionMode: "single",
    },
    {
      label: "Exposure",
      optionIds: ["gingiva.position.root_exposure"],
    },
    {
      label: "Size",
      optionIds: [
        "gingiva.position.no_overgrowth",
        "gingiva.position.enlargement",
        "gingiva.position.overgrowth",
      ],
      selectionMode: "single",
    },
  ],
} as const satisfies Record<string, readonly GingivalChoiceGroupDefinition[]>;
const gingivalOptionConflicts: Record<string, readonly string[]> = {
  "gingiva.position.no_recession": [
    "gingiva.position.recession",
    "gingiva.position.root_exposure",
  ],
  "gingiva.position.recession": ["gingiva.position.no_recession"],
  "gingiva.position.root_exposure": ["gingiva.position.no_recession"],
};

function gingivalChoiceGroups(
  dimension: GingivalCatalogDimension,
): FixedChoiceMultiComboboxGroup[] {
  const definitions =
    gingivalChoiceGroupDefinitions[
      dimension.id as keyof typeof gingivalChoiceGroupDefinitions
    ] ?? [];
  const configuredOptionIds = new Set<string>(
    definitions.flatMap((definition) => definition.optionIds),
  );
  const groups = definitions.map((definition) => ({
    label: definition.label,
    choices: definition.optionIds.flatMap((optionId) => {
      const option = dimension.options.find(
        (candidate) => candidate.id === optionId,
      );
      return option ? [option.label] : [];
    }),
    ...("selectionMode" in definition
      ? { selectionMode: definition.selectionMode }
      : {}),
  }));
  const ungroupedChoices = dimension.options
    .filter((option) => !configuredOptionIds.has(option.id))
    .map((option) => option.label);
  return ungroupedChoices.length
    ? [...groups, { label: "Other", choices: ungroupedChoices }]
    : groups;
}
const rblExtentOptions = [
  { value: "", label: "Not assessed" },
  {
    value: "middle-third-or-beyond",
    label: "Middle third or beyond",
  },
] as const;
const boneLossPatternOptions = [
  { value: "", label: "Not assessed" },
  { value: "horizontal", label: "Mostly horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "mixed", label: "Mixed horizontal and vertical" },
] as const;
const furcationInvolvementOptions = [
  { value: "", label: "Not assessed" },
  { value: "stage.furcation-class-ii", label: "Class II" },
  { value: "stage.furcation-class-iii", label: "Class III" },
] as const;
const ridgeDefectOptions = [
  { value: "", label: "Not assessed" },
  { value: "stage.ridge-defect-moderate", label: "Moderate" },
  { value: "stage.ridge-defect-severe", label: "Severe" },
] as const;
const advancedFunctionalComplexityOptions = [
  {
    value: "stage.masticatory-dysfunction",
    label: "Masticatory dysfunction",
  },
  {
    value: "stage.secondary-occlusal-trauma",
    label: "Secondary occlusal trauma",
  },
  { value: "stage.mobility-degree-2", label: "Tooth mobility degree ≥2" },
  { value: "stage.bite-collapse", label: "Bite collapse" },
  { value: "stage.pathologic-drifting", label: "Pathologic drifting" },
  { value: "stage.pathologic-flaring", label: "Pathologic flaring" },
] as const;
const furcationCriterionIds = [
  "stage.furcation-class-ii",
  "stage.furcation-class-iii",
] as const satisfies readonly PeriodontalStageCriterionId[];
const ridgeDefectCriterionIds = [
  "stage.ridge-defect-moderate",
  "stage.ridge-defect-severe",
] as const satisfies readonly PeriodontalStageCriterionId[];
const advancedFunctionalComplexityCriterionIds: readonly PeriodontalStageCriterionId[] =
  advancedFunctionalComplexityOptions.map((option) => option.value);
const consolidatedComplexityCriterionIds = new Set<PeriodontalStageCriterionId>(
  [
    "stage.horizontal-bone-loss",
    "stage.vertical-bone-loss",
    ...furcationCriterionIds,
    ...ridgeDefectCriterionIds,
    ...advancedFunctionalComplexityCriterionIds,
  ],
);
const gradePhenotypeOptions = [
  { value: "", label: "Not assessed" },
  {
    value: "grade.phenotype-low",
    label: "Destruction low relative to biofilm",
  },
  {
    value: "grade.phenotype-commensurate",
    label: "Destruction commensurate with biofilm",
  },
  {
    value: "grade.phenotype-exceeds",
    label: "Destruction exceeds expectations given biofilm",
  },
] as const;
const psrSextantOrder = [1, 2, 3, 6, 5, 4] as const;
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
  "None",
  ...extentFacetChoices,
  ...mildIntensityFacetChoices,
  ...plaqueLocationFacetChoices,
] as const;
const plaqueFacetGroups = [
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
    choices: mildIntensityFacetChoices,
    columns: 3,
    selectionMode: "single",
  },
  {
    label: "Location",
    choices: plaqueLocationFacetChoices,
    columns: 2,
    selectionMode: "multiple",
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
  "None",
  ...extentFacetChoices,
  ...mildIntensityFacetChoices,
  ...calculusLocationFacetChoices,
] as const;
const calculusFacetGroups = [
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
  "None",
  ...extentFacetChoices,
  ...bleedingSeverityFacetChoices,
] as const;
const bleedingFacetGroups = [
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
  inputMode,
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
  type?: "text" | "date" | "number" | "time";
  inputMode?: "decimal" | "numeric";
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
      ) : type === "time" ? (
        <Time24Input
          id={id}
          className={inputClass}
          value={value}
          onChange={onChange}
          inputRef={inputRef}
          ariaInvalid={Boolean(error)}
          ariaDescribedBy={error ? errorId : undefined}
        />
      ) : (
        <input
          ref={inputRef}
          id={id}
          className={inputClass}
          type={type}
          inputMode={inputMode}
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
      .filter(Boolean),
  );
  return facetChoices.filter((facet) =>
    selectedTokens.has(
      facet.normalize("NFKC").trim().toLocaleLowerCase("en-CA"),
    ),
  );
}

function formatChoiceWithJoinedLocations(
  values: string[],
  locationFacetChoices: readonly string[],
) {
  const locationValues = values.filter((value) =>
    locationFacetChoices.includes(value),
  );
  return [
    ...values.filter((value) => !locationFacetChoices.includes(value)),
    locationValues.join("/"),
  ]
    .filter(Boolean)
    .join(" ");
}

function FacetedChoiceWithComment({
  id,
  label,
  choice,
  areas,
  comment,
  facetChoices,
  facetGroups,
  onChoiceChange,
  onAreasChange,
  onCommentChange,
  formatChoice = (values) => values.join(" "),
  standaloneValue,
}: {
  id: string;
  label: string;
  choice: string;
  areas: string[];
  comment: string;
  facetChoices: readonly string[];
  facetGroups: readonly FixedChoiceMultiComboboxGroup[];
  onChoiceChange: (choice: string) => void;
  onAreasChange: (areas: string[]) => void;
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
      {selectedFacets.includes("Localized") ? (
        <div className="md:col-span-2">
          <ClinicalLocationMultiCombobox
            id={`${id}-areas`}
            label={`${label} areas`}
            preset="finding"
            values={areas}
            onChange={onAreasChange}
          />
        </div>
      ) : null}
    </div>
  );
}

export function AdultHygienePlaqueControl({
  id,
  choice,
  areas,
  comment,
  onChoiceChange,
  onAreasChange,
  onCommentChange,
}: {
  id: string;
  choice: string;
  areas: string[];
  comment: string;
  onChoiceChange: (choice: string) => void;
  onAreasChange: (areas: string[]) => void;
  onCommentChange: (comment: string) => void;
}) {
  return (
    <FacetedChoiceWithComment
      id={id}
      label="Plaque"
      choice={choice}
      areas={areas}
      comment={comment}
      facetChoices={plaqueFacetChoices}
      facetGroups={plaqueFacetGroups}
      onChoiceChange={onChoiceChange}
      onAreasChange={onAreasChange}
      onCommentChange={onCommentChange}
      formatChoice={(values) =>
        formatChoiceWithJoinedLocations(values, plaqueLocationFacetChoices)
      }
      standaloneValue="None"
    />
  );
}

export function AdultHygieneCalculusControl({
  id,
  choice,
  areas,
  comment,
  onChoiceChange,
  onAreasChange,
  onCommentChange,
}: {
  id: string;
  choice: string;
  areas: string[];
  comment: string;
  onChoiceChange: (choice: string) => void;
  onAreasChange: (areas: string[]) => void;
  onCommentChange: (comment: string) => void;
}) {
  return (
    <FacetedChoiceWithComment
      id={id}
      label="Calculus"
      choice={choice}
      areas={areas}
      comment={comment}
      facetChoices={calculusFacetChoices}
      facetGroups={calculusFacetGroups}
      onChoiceChange={onChoiceChange}
      onAreasChange={onAreasChange}
      onCommentChange={onCommentChange}
      formatChoice={(values) =>
        formatChoiceWithJoinedLocations(values, calculusLocationFacetChoices)
      }
      standaloneValue="None"
    />
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

function ObservationDisclosure({
  id,
  label,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const contentId = `${id}-content`;
  return (
    <fieldset
      className="border-t border-slate-200 pt-3 dark:border-slate-700"
      aria-label={label}
    >
      <button
        id={id}
        type="button"
        className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span className="min-w-0">{label}</span>
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
        <div id={contentId} className="space-y-4 pt-3">
          {children}
        </div>
      ) : null}
    </fieldset>
  );
}

function measurementFor(
  evidence: readonly PeriodontalCriterionEvidence[],
  criterionId: string,
) {
  return evidence.find((item) => item.criterionId === criterionId)?.measurement;
}

function numericValue(measurement: ClinicalMeasurement | undefined): string {
  return measurement ? String(measurement.value) : "";
}

function documentedObservationSummary(count: number) {
  return count
    ? `${count} ${count === 1 ? "observation" : "observations"} documented`
    : "Not assessed";
}

export function PeriodontalClassificationControl({
  value,
  onChange,
}: {
  value: PeriodontalClassification;
  onChange: (value: PeriodontalClassification) => void;
}) {
  const candidate = classifyPeriodontalCandidate(value);
  const gingivalHealthCandidate = classifyGingivalHealthCandidate(value);
  const diagnosisCandidates = classifyPeriodontalDiagnosisCandidates(value);
  const stageEvidence = periodontalStageEvidence(value);
  const stageReasons = stageEvidence
    .filter((evidence) =>
      candidate.stageReasonIds.includes(evidence.criterionId),
    )
    .map((evidence) => formatPeriodontalEvidence(evidence));
  const gradeReasons = [
    ...value.gradeBasis
      .filter((evidence) =>
        candidate.gradeReasonIds.includes(evidence.criterionId),
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
  const isHealthGingivitisDiagnosis =
    value.diagnosis === "health" || value.diagnosis === "gingivitis";
  const isGingivitisDiagnosis = value.diagnosis === "gingivitis";
  const hasAssessedDiagnosis = Boolean(value.diagnosis);
  const isPeriodontitisDiagnosis = value.diagnosis === "periodontitis";
  const isTreatedPeriodontitisContext =
    isPeriodontitisDiagnosis &&
    value.gingivalHealth.periodontium === "reduced-treated-periodontitis";
  const showGingivalContextWorkflow =
    isHealthGingivitisDiagnosis || isTreatedPeriodontitisContext;
  const showReducedPeriodontiumBasis = isReducedNonPeriodontitisContext(
    value.gingivalHealth.context,
  );
  const gingivalContextLabel = isTreatedPeriodontitisContext
    ? "Treated-periodontitis context"
    : "Health/Gingivitis classification";
  const gingivalContextOverrideLabel = isTreatedPeriodontitisContext
    ? "Treated-periodontitis context override reason"
    : "Health/Gingivitis classification override reason";
  const requiredContextStatus = value.gingivalHealth.context
    ? requiredPeriodontalStatusForContext(value.gingivalHealth.context)
    : "";
  const compatiblePeriodontalStatusChoices = requiredContextStatus
    ? periodontalStatusChoices.filter(
        (choice) => !choice.value || choice.value === requiredContextStatus,
      )
    : periodontalStatusChoices;
  const displayedPeriodontalStatus = isPeriodontalStatusCompatibleWithContext(
    value.status,
    value.gingivalHealth.context,
    Boolean(value.gingivalHealth.context),
  )
    ? value.status
    : "";
  const extentOptions = isGingivitisDiagnosis
    ? periodontalExtentChoices.filter(
        (choice) => choice.value !== "molar-incisor",
      )
    : periodontalExtentChoices;
  const extentLabel = isGingivitisDiagnosis
    ? "Extent of gingivitis"
    : isPeriodontitisDiagnosis
      ? "Periodontitis extent/distribution"
      : "Extent/distribution";
  const hasHorizontalBoneLoss = value.stageBasis.some(
    (evidence) => evidence.criterionId === "stage.horizontal-bone-loss",
  );
  const hasVerticalBoneLoss = value.stageBasis.some(
    (evidence) => evidence.criterionId === "stage.vertical-bone-loss",
  );
  const selectedBoneLossPattern = hasHorizontalBoneLoss
    ? hasVerticalBoneLoss
      ? "mixed"
      : "horizontal"
    : hasVerticalBoneLoss
    ? "vertical"
    : "";
  const selectedFurcationInvolvement = value.stageBasis.some(
    (evidence) => evidence.criterionId === "stage.furcation-class-iii",
  )
    ? "stage.furcation-class-iii"
    : value.stageBasis.some(
        (evidence) => evidence.criterionId === "stage.furcation-class-ii",
      )
    ? "stage.furcation-class-ii"
    : "";
  const selectedRidgeDefect = value.stageBasis.some(
    (evidence) => evidence.criterionId === "stage.ridge-defect-severe",
  )
    ? "stage.ridge-defect-severe"
    : value.stageBasis.some(
        (evidence) => evidence.criterionId === "stage.ridge-defect-moderate",
      )
    ? "stage.ridge-defect-moderate"
    : "";
  const selectedAdvancedFunctionalComplexity =
    advancedFunctionalComplexityOptions
      .filter((option) =>
        value.stageBasis.some(
          (evidence) => evidence.criterionId === option.value,
        ),
      )
      .map((option) => option.label);
  const selectedGradePhenotype =
    [...gradePhenotypeOptions]
      .reverse()
      .find(
        (option) =>
          option.value &&
          value.gradeBasis.some(
            (evidence) => evidence.criterionId === option.value,
          ),
      )?.value ?? "";
  const stageObservationCount = stageEvidence.length;
  const hasStageSectionObservations = value.stageBasis.length > 0;
  const gradeObservationCount =
    value.gradeBasis.length +
    Number(value.smoking.status !== "not-assessed") +
    Number(value.diabetes.status !== "not-assessed");
  const structuredObservationCount =
    Number(Boolean(value.gingivalHealth.periodontium)) +
    Number(Boolean(value.gingivalHealth.bopPercent)) +
    Number(Boolean(value.gingivalHealth.maximumPpd)) +
    Number(value.gingivalHealth.attachmentLoss !== "not-assessed") +
    Number(value.gingivalHealth.radiographicBoneLoss !== "not-assessed") +
    Number(value.gingivalHealth.ppd4OrGreaterWithBop !== "not-assessed") +
    Number(value.gingivalHealth.progressiveDestruction !== "not-assessed") +
    value.stageBasis.length +
    value.gradeBasis.length +
    Number(value.smoking.status !== "not-assessed") +
    Number(value.diabetes.status !== "not-assessed");
  const hasStructuredObservations = structuredObservationCount > 0;
  const structuredObservationSummary = documentedObservationSummary(
    structuredObservationCount,
  );
  const stageObservationSummary = documentedObservationSummary(
    stageObservationCount,
  );
  const gradeObservationSummary = documentedObservationSummary(
    gradeObservationCount,
  );
  const [structuredObservationsOpen, setStructuredObservationsOpen] = useState(
    hasStructuredObservations,
  );
  const [stageEvidenceOpen, setStageEvidenceOpen] = useState(
    hasStageSectionObservations,
  );
  const [gradeEvidenceOpen, setGradeEvidenceOpen] = useState(
    gradeObservationCount > 0,
  );
  const [pendingMissingField, setPendingMissingField] =
    useState<GingivalHealthCandidateMissingFieldId>();
  const [highlightedMissingField, setHighlightedMissingField] =
    useState<GingivalHealthCandidateMissingFieldId>();

  useEffect(() => {
    if (hasStructuredObservations) setStructuredObservationsOpen(true);
  }, [hasStructuredObservations]);

  useEffect(() => {
    if (hasStageSectionObservations) setStageEvidenceOpen(true);
  }, [hasStageSectionObservations]);

  useEffect(() => {
    if (gradeObservationCount > 0) setGradeEvidenceOpen(true);
  }, [gradeObservationCount]);

  useEffect(() => {
    if (!pendingMissingField || !structuredObservationsOpen) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(
        gingivalCandidateFieldTargetIds[pendingMissingField],
      );
      if (!(target instanceof HTMLElement)) {
        setPendingMissingField(undefined);
        return;
      }

      setHighlightedMissingField(pendingMissingField);
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      target.focus({ preventScroll: true });
    });
    const timeout = window.setTimeout(() => {
      setHighlightedMissingField(undefined);
      setPendingMissingField(undefined);
    }, 2000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [pendingMissingField, structuredObservationsOpen]);

  function navigateToMissingField(
    fieldId: GingivalHealthCandidateMissingFieldId,
  ) {
    setStructuredObservationsOpen(true);
    setPendingMissingField(fieldId);
  }

  function update(patch: Partial<PeriodontalClassification>) {
    onChange({ ...value, ...patch });
  }

  function updateGingivalHealth(patch: Partial<GingivalHealthAssessment>) {
    update({
      gingivalHealth: {
        ...value.gingivalHealth,
        ...patch,
      },
    });
  }

  function updatePeriodontalSupport(
    periodontium: GingivalHealthAssessment["periodontium"],
  ) {
    const hidesTreatedPeriodontitisContext =
      value.diagnosis === "periodontitis" &&
      periodontium !== "reduced-treated-periodontitis";
    if (hidesTreatedPeriodontitisContext) {
      update({
        gingivalHealth: {
          ...value.gingivalHealth,
          periodontium,
          context: "",
          overrideReason: "",
        },
        status: "",
        statusComment: "",
      });
      return;
    }
    updateGingivalHealth({ periodontium });
  }

  function updateMaximumPpd(rawValue: string) {
    const nextValue = Number(rawValue);
    if (rawValue && !Number.isFinite(nextValue)) return;
    updateGingivalHealth({
      ...(rawValue
        ? {
            maximumPpd: {
              operator: "eq",
              value: nextValue,
              unit: "mm",
            } as const,
          }
        : { maximumPpd: undefined }),
    });
  }

  function updateGingivalContext(context: HealthGingivitisContext) {
    const requiredStatus = context
      ? requiredPeriodontalStatusForContext(context)
      : "";
    update({
      gingivalHealth: {
        ...value.gingivalHealth,
        context,
        ...(!isReducedNonPeriodontitisContext(context)
          ? {
              reducedPeriodontiumBases: [],
              reducedPeriodontiumBasisDetails: "",
            }
          : {}),
        overrideReason: "",
      },
      ...(requiredStatus && value.status && value.status !== requiredStatus
        ? { status: "", statusComment: "" }
        : {}),
    });
  }

  function updateMeasurement<
    TCriterionId extends
      | PeriodontalStageCriterionId
      | PeriodontalGradeCriterionId,
  >(
    key: "stageBasis" | "gradeBasis",
    criterionId: TCriterionId,
    unit: ClinicalMeasurement["unit"],
    rawValue: string,
  ) {
    const current = value[key] as PeriodontalCriterionEvidence<TCriterionId>[];
    const withoutCriterion = current.filter(
      (evidence) => evidence.criterionId !== criterionId,
    );
    if (!rawValue.trim()) {
      update({ [key]: withoutCriterion });
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
    });
  }

  function updateBoolean<
    TCriterionId extends
      | PeriodontalStageCriterionId
      | PeriodontalGradeCriterionId,
  >(
    key: "stageBasis" | "gradeBasis",
    criterionId: TCriterionId,
    checked: boolean,
  ) {
    const current = value[key] as PeriodontalCriterionEvidence<TCriterionId>[];
    update({
      [key]: checked
        ? [
            ...current.filter(
              (evidence) => evidence.criterionId !== criterionId,
            ),
            { criterionId },
          ]
        : current.filter((evidence) => evidence.criterionId !== criterionId),
    });
  }

  function updateGradePhenotype(
    criterionId: (typeof gradePhenotypeOptions)[number]["value"],
  ) {
    const withoutPhenotype = value.gradeBasis.filter(
      (evidence) =>
        !gradePhenotypeOptions.some(
          (option) => option.value === evidence.criterionId,
        ),
    );
    update({
      gradeBasis: criterionId
        ? [...withoutPhenotype, { criterionId }]
        : withoutPhenotype,
    });
  }

  function replaceStageCriterionGroup(
    criterionIds: readonly PeriodontalStageCriterionId[],
    criterionId: PeriodontalStageCriterionId | "",
  ) {
    const withoutGroup = value.stageBasis.filter(
      (evidence) => !criterionIds.includes(evidence.criterionId),
    );
    update({
      stageBasis: criterionId
        ? [...withoutGroup, { criterionId }]
        : withoutGroup,
    });
  }

  function updateBoneLossPattern(
    pattern: (typeof boneLossPatternOptions)[number]["value"],
  ) {
    const verticalEvidence = value.stageBasis.find(
      (evidence) => evidence.criterionId === "stage.vertical-bone-loss",
    );
    const stageBasis = value.stageBasis.filter(
      (evidence) =>
        evidence.criterionId !== "stage.horizontal-bone-loss" &&
        evidence.criterionId !== "stage.vertical-bone-loss",
    );

    if (pattern === "horizontal" || pattern === "mixed") {
      stageBasis.push({ criterionId: "stage.horizontal-bone-loss" });
    }
    if (pattern === "vertical" || pattern === "mixed") {
      stageBasis.push(
        verticalEvidence ?? { criterionId: "stage.vertical-bone-loss" },
      );
    }
    update({ stageBasis });
  }

  function updateVerticalBoneLoss(rawValue: string) {
    const withoutVerticalBoneLoss = value.stageBasis.filter(
      (evidence) => evidence.criterionId !== "stage.vertical-bone-loss",
    );
    if (!rawValue.trim()) {
      update({
        stageBasis: [
          ...withoutVerticalBoneLoss,
          { criterionId: "stage.vertical-bone-loss" },
        ],
      });
      return;
    }
    const nextValue = Number(rawValue);
    if (!Number.isFinite(nextValue)) return;
    update({
      stageBasis: [
        ...withoutVerticalBoneLoss,
        {
          criterionId: "stage.vertical-bone-loss",
          measurement: { operator: "eq", value: nextValue, unit: "mm" },
        },
      ],
    });
  }

  function updateAdvancedFunctionalComplexity(selectedLabels: string[]) {
    const selected = new Set(selectedLabels);
    const withoutAdvancedFunctionalComplexity = value.stageBasis.filter(
      (evidence) =>
        !advancedFunctionalComplexityCriterionIds.includes(
          evidence.criterionId,
        ),
    );
    update({
      stageBasis: [
        ...withoutAdvancedFunctionalComplexity,
        ...advancedFunctionalComplexityOptions
          .filter((option) => selected.has(option.label))
          .map((option) => ({ criterionId: option.value })),
      ],
    });
  }

  function updateSmokingStatus(status: SmokingModifier["status"]) {
    const smoking: SmokingModifier =
      status === "cigarettes"
        ? { status }
        : status === "other-exposure"
        ? { status, details: "" }
        : { status };
    update({ smoking });
  }

  function updateDiabetesStatus(status: DiabetesModifier["status"]) {
    const diabetes: DiabetesModifier = { status };
    update({ diabetes });
  }

  return (
    <div className="space-y-5">
      <fieldset
        className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
        aria-label="Structured periodontal observations"
      >
        <button
          id="adult-hygiene-structured-periodontal-observations"
          type="button"
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
          aria-expanded={structuredObservationsOpen}
          aria-controls="adult-hygiene-structured-periodontal-observations-content"
          onClick={() => setStructuredObservationsOpen((open) => !open)}
        >
          <span className="min-w-0">Structured periodontal observations</span>
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
            id="adult-hygiene-structured-periodontal-observations-content"
            className="space-y-4 pt-2"
          >
            <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <legend className="font-semibold">
                Periodontal assessment findings
              </legend>
              <div className="grid gap-3 md:grid-cols-2">
                <GingivalCandidateFieldTarget
                  id="bop-percentage"
                  activeId={highlightedMissingField}
                >
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
                </GingivalCandidateFieldTarget>
                <GingivalCandidateFieldTarget
                  id="maximum-ppd"
                  activeId={highlightedMissingField}
                >
                  <label className="block text-sm font-medium">
                    Maximum PPD (mm)
                    <input
                      id="adult-hygiene-maximum-ppd"
                      className={inputClass}
                      type="number"
                      min={1}
                      step={1}
                      value={numericValue(value.gingivalHealth.maximumPpd)}
                      onChange={(event) => updateMaximumPpd(event.target.value)}
                    />
                  </label>
                </GingivalCandidateFieldTarget>
                <GingivalCandidateFieldTarget
                  id="attachment-loss"
                  activeId={highlightedMissingField}
                >
                  <FixedChoiceListbox
                    id="adult-hygiene-attachment-loss"
                    label="Probing attachment loss"
                    value={value.gingivalHealth.attachmentLoss}
                    options={assessedPresenceChoices}
                    onChange={(attachmentLoss) =>
                      updateGingivalHealth({ attachmentLoss })
                    }
                  />
                </GingivalCandidateFieldTarget>
                <GingivalCandidateFieldTarget
                  id="radiographic-bone-loss"
                  activeId={highlightedMissingField}
                >
                  <FixedChoiceListbox
                    id="adult-hygiene-radiographic-bone-loss"
                    label="Radiographic bone loss (RBL)"
                    value={value.gingivalHealth.radiographicBoneLoss}
                    options={assessedPresenceChoices}
                    onChange={(radiographicBoneLoss) =>
                      updateGingivalHealth({ radiographicBoneLoss })
                    }
                  />
                </GingivalCandidateFieldTarget>
                <GingivalCandidateFieldTarget
                  id="ppd-4-or-greater-with-bop"
                  activeId={highlightedMissingField}
                >
                  <FixedChoiceListbox
                    id="adult-hygiene-ppd4-bop"
                    label="Sites with PPD ≥4 mm and BOP"
                    value={value.gingivalHealth.ppd4OrGreaterWithBop}
                    options={deepPocketBopChoices}
                    onChange={(ppd4OrGreaterWithBop) =>
                      updateGingivalHealth({ ppd4OrGreaterWithBop })
                    }
                  />
                </GingivalCandidateFieldTarget>
                <GingivalCandidateFieldTarget
                  id="progressive-destruction"
                  activeId={highlightedMissingField}
                >
                  <FixedChoiceListbox
                    id="adult-hygiene-progressive-destruction"
                    label="Evidence of progressive periodontal destruction"
                    value={value.gingivalHealth.progressiveDestruction}
                    options={assessedBooleanChoices}
                    onChange={(progressiveDestruction) =>
                      updateGingivalHealth({ progressiveDestruction })
                    }
                  />
                </GingivalCandidateFieldTarget>
                <GingivalCandidateFieldTarget
                  id="periodontal-support"
                  activeId={highlightedMissingField}
                >
                  <FixedChoiceListbox
                    id="adult-hygiene-periodontium"
                    label="Periodontal support (if known)"
                    value={value.gingivalHealth.periodontium}
                    options={periodontalPeriodontiumChoices}
                    onChange={updatePeriodontalSupport}
                  />
                </GingivalCandidateFieldTarget>
              </div>
            </fieldset>

            <ObservationDisclosure
              id="adult-hygiene-patient-specific-stage-evidence"
              label="Patient-specific stage evidence"
              summary={stageObservationSummary}
              open={stageEvidenceOpen}
              onToggle={() => setStageEvidenceOpen((open) => !open)}
            >
              {stageEvidenceGroups.map(({ value: group, label }) => (
                <div key={group} className={evidenceSectionClass}>
                  <h3 className={evidenceSectionHeadingClass}>{label}</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {group === "complexity" ? (
                      <>
                        <label className="block text-sm font-medium">
                          Maximum PPD (mm, shared)
                          <input
                            id="adult-hygiene-stage-maximum-ppd"
                            className={inputClass}
                            type="number"
                            min={1}
                            step={1}
                            value={numericValue(
                              value.gingivalHealth.maximumPpd,
                            )}
                            onChange={(event) =>
                              updateMaximumPpd(event.target.value)
                            }
                          />
                        </label>
                        <FixedChoiceListbox
                          id="adult-hygiene-stage-ppd4-bop"
                          label="Sites with PPD ≥4 mm and BOP (shared)"
                          value={value.gingivalHealth.ppd4OrGreaterWithBop}
                          options={deepPocketBopChoices}
                          onChange={(ppd4OrGreaterWithBop) =>
                            updateGingivalHealth({ ppd4OrGreaterWithBop })
                          }
                        />
                        <FixedChoiceListbox
                          id="adult-hygiene-stage-bone-loss-pattern"
                          label="Bone-loss pattern"
                          value={selectedBoneLossPattern}
                          options={boneLossPatternOptions}
                          onChange={updateBoneLossPattern}
                        />
                        {hasVerticalBoneLoss ? (
                          <label className="block text-sm font-medium">
                            Vertical (angular) bone loss (mm)
                            <input
                              id="adult-hygiene-stage-vertical-bone-loss"
                              className={inputClass}
                              type="number"
                              min={0}
                              step={1}
                              value={numericValue(
                                measurementFor(
                                  value.stageBasis,
                                  "stage.vertical-bone-loss",
                                ),
                              )}
                              onChange={(event) =>
                                updateVerticalBoneLoss(event.target.value)
                              }
                            />
                          </label>
                        ) : null}
                        <FixedChoiceListbox
                          id="adult-hygiene-stage-furcation-involvement"
                          label="Highest furcation involvement"
                          value={selectedFurcationInvolvement}
                          options={furcationInvolvementOptions}
                          onChange={(criterionId) =>
                            replaceStageCriterionGroup(
                              furcationCriterionIds,
                              criterionId,
                            )
                          }
                        />
                        <FixedChoiceListbox
                          id="adult-hygiene-stage-ridge-defect"
                          label="Worst ridge defect"
                          value={selectedRidgeDefect}
                          options={ridgeDefectOptions}
                          onChange={(criterionId) =>
                            replaceStageCriterionGroup(
                              ridgeDefectCriterionIds,
                              criterionId,
                            )
                          }
                        />
                        <FixedChoiceMultiCombobox
                          id="adult-hygiene-stage-advanced-functional-complexity"
                          label="Advanced functional complexity"
                          choices={advancedFunctionalComplexityOptions.map(
                            (option) => option.label,
                          )}
                          values={selectedAdvancedFunctionalComplexity}
                          onChange={updateAdvancedFunctionalComplexity}
                          customPlaceholder="Search complexity findings"
                          customHelpText=""
                          showSelectedChips={false}
                          allowCustomValues={false}
                        />
                      </>
                    ) : null}
                    {periodontalStageCriterionCatalogue
                      .filter(
                        (criterion) =>
                          criterion.group === group &&
                          criterion.id !== "stage.max-ppd" &&
                          !consolidatedComplexityCriterionIds.has(criterion.id),
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
                              id={`adult-hygiene-${criterion.id.replaceAll(
                                ".",
                                "-",
                              )}`}
                              className={inputClass}
                              type="number"
                              min={criterion.minimum}
                              max={
                                "maximum" in criterion
                                  ? criterion.maximum
                                  : undefined
                              }
                              step={criterion.step}
                              value={numericValue(
                                measurementFor(value.stageBasis, criterion.id),
                              )}
                              onChange={(event) =>
                                updateMeasurement(
                                  "stageBasis",
                                  criterion.id,
                                  criterion.unit,
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        ) : criterion.id ===
                          "stage.rbl-middle-third-or-beyond" ? (
                          <FixedChoiceListbox
                            key={criterion.id}
                            id={`adult-hygiene-${criterion.id.replaceAll(
                              ".",
                              "-",
                            )}`}
                            label={criterion.label}
                            value={
                              value.stageBasis.some(
                                (evidence) =>
                                  evidence.criterionId === criterion.id,
                              )
                                ? "middle-third-or-beyond"
                                : ""
                            }
                            options={rblExtentOptions}
                            onChange={(extent) =>
                              updateBoolean(
                                "stageBasis",
                                criterion.id,
                                extent === "middle-third-or-beyond",
                              )
                            }
                          />
                        ) : (
                          <CheckboxField
                            key={criterion.id}
                            id={`adult-hygiene-${criterion.id.replaceAll(
                              ".",
                              "-",
                            )}`}
                            label={criterion.label}
                            checked={value.stageBasis.some(
                              (evidence) =>
                                evidence.criterionId === criterion.id,
                            )}
                            onChange={(checked) =>
                              updateBoolean("stageBasis", criterion.id, checked)
                            }
                          />
                        ),
                      )}
                  </div>
                </div>
              ))}
            </ObservationDisclosure>

            <ObservationDisclosure
              id="adult-hygiene-patient-specific-grade-evidence"
              label="Patient-specific grade evidence"
              summary={gradeObservationSummary}
              open={gradeEvidenceOpen}
              onToggle={() => setGradeEvidenceOpen((open) => !open)}
            >
              <div className={evidenceSectionClass}>
                <h3 className={evidenceSectionHeadingClass}>
                  Progression evidence
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {periodontalGradeCriterionCatalogue
                    .filter((criterion) => criterion.input === "measurement")
                    .map((criterion) => (
                      <label
                        key={criterion.id}
                        className="block text-sm font-medium"
                      >
                        {criterion.label} ({criterion.unit})
                        <input
                          id={`adult-hygiene-${criterion.id.replaceAll(
                            ".",
                            "-",
                          )}`}
                          className={inputClass}
                          type="number"
                          min={criterion.minimum}
                          step={criterion.step}
                          value={numericValue(
                            measurementFor(value.gradeBasis, criterion.id),
                          )}
                          onChange={(event) =>
                            updateMeasurement(
                              "gradeBasis",
                              criterion.id,
                              criterion.unit,
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    ))}
                  <FixedChoiceListbox
                    id="adult-hygiene-grade-phenotype"
                    label="Destruction relative to biofilm"
                    value={selectedGradePhenotype}
                    options={gradePhenotypeOptions}
                    onChange={updateGradePhenotype}
                  />
                </div>
              </div>

              <div className={evidenceSectionClass}>
                <h3 className={evidenceSectionHeadingClass}>Grade modifiers</h3>
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
                          min={1}
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
                          min={0.1}
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
                            });
                          }}
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
              </div>
            </ObservationDisclosure>
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

      <section
        className="space-y-3"
        aria-labelledby="periodontal-diagnosis-heading"
      >
        <h3 id="periodontal-diagnosis-heading" className="font-semibold">
          Diagnosis and distribution
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <FixedChoiceListbox
            id="adult-hygiene-periodontal-diagnosis"
            label="Periodontal diagnosis category"
            value={value.diagnosis}
            options={periodontalDiagnosisChoices}
            onChange={(diagnosis) =>
              update({
                diagnosis,
                ...(diagnosis === "gingivitis" &&
                value.extent === "molar-incisor"
                  ? { extent: "" }
                  : {}),
                gingivalHealth: {
                  ...value.gingivalHealth,
                  context: "",
                  reducedPeriodontiumBases: [],
                  reducedPeriodontiumBasisDetails: "",
                  overrideReason: "",
                },
                ...(diagnosis !== "periodontitis"
                  ? {
                      stage: "",
                      grade: "",
                      status: "",
                      statusComment: "",
                    }
                  : {}),
              })
            }
          />
          <FixedChoiceListbox
            id="adult-hygiene-periodontal-extent"
            label={extentLabel}
            value={value.extent}
            options={extentOptions}
            onChange={(extent) => update({ extent })}
          />
        </div>
      </section>

      {!hasAssessedDiagnosis ? (
        <section
          className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700"
          aria-labelledby="periodontal-current-condition-heading"
        >
          <h3
            id="periodontal-current-condition-heading"
            className="font-semibold"
          >
            Current clinical condition
          </h3>
          <div className="border-l-4 border-amber-500 pl-4">
            <h4 className="font-semibold">Possible diagnosis categories</h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Based only on findings documented so far. No diagnosis is selected
              or changed by these suggestions.
            </p>
            {diagnosisCandidates.possibilities.length ? (
              <ul className="mt-3 space-y-3">
                {diagnosisCandidates.possibilities.map((possibility) => (
                  <li key={possibility.diagnosis}>
                    <p className="font-medium">
                      {choiceLabel(
                        periodontalDiagnosisChoices,
                        possibility.diagnosis,
                      )}
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      {possibility.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm">No category suggestion available.</p>
            )}
            {diagnosisCandidates.missingFields.length ? (
              <details className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                <summary className="cursor-pointer font-medium text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100">
                  Information that may narrow the possibilities
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {diagnosisCandidates.missingFields.map((field) => (
                    <li key={field.id}>
                      <button
                        type="button"
                        className="rounded-sm font-medium text-sky-700 underline decoration-sky-400 underline-offset-2 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-300 dark:hover:text-sky-100"
                        onClick={() => navigateToMissingField(field.id)}
                      >
                        {field.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            {diagnosisCandidates.warnings.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {diagnosisCandidates.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasAssessedDiagnosis &&
      (showGingivalContextWorkflow || isPeriodontitisDiagnosis) ? (
        <fieldset className="space-y-6 border-t border-slate-200 pt-4 dark:border-slate-700">
          {isPeriodontitisDiagnosis ? (
            <section
              className="space-y-4"
              aria-labelledby="periodontal-stage-grade-heading"
            >
              <h3
                id="periodontal-stage-grade-heading"
                className="font-semibold"
              >
                Periodontitis classification
              </h3>

              <div className="border-l-4 border-sky-600 pl-4">
                <h4 className="font-semibold">Recommended stage and grade</h4>
                <p className="mt-1 text-sm">
                  Stage {candidate.stage || "not available"}; Grade{" "}
                  {candidate.grade || "not available"}
                  {candidate.gradeSource === "assumed"
                    ? " (working assumption)"
                    : ""}
                  .
                </p>
                {stageReasons.length || gradeReasons.length ? (
                  <details className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    <summary className="cursor-pointer font-medium text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100">
                      Why this was suggested
                    </summary>
                    <div className="mt-2 space-y-1 pl-4">
                      {stageReasons.length ? (
                        <p>Stage evidence: {stageReasons.join("; ")}.</p>
                      ) : null}
                      {gradeReasons.length ? (
                        <p>Grade evidence: {gradeReasons.join("; ")}.</p>
                      ) : null}
                    </div>
                  </details>
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
                        ...(candidate.stage ? { stageOverrideReason: "" } : {}),
                        ...(candidate.grade ? { gradeOverrideReason: "" } : {}),
                      })
                    }
                  >
                    Apply suggestions
                  </button>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <FixedChoiceListbox
                    id="adult-hygiene-periodontitis-stage"
                    label="Periodontitis stage"
                    value={value.stage}
                    options={periodontalStageChoices}
                    onChange={(stage) =>
                      update({
                        stage,
                        stageOverrideReason: "",
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
                <div className="grid gap-3 md:grid-cols-2">
                  <FixedChoiceListbox
                    id="adult-hygiene-periodontitis-grade"
                    label="Periodontitis grade"
                    value={value.grade}
                    options={periodontalGradeChoices}
                    onChange={(grade) =>
                      update({
                        grade,
                        gradeOverrideReason: "",
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
            </section>
          ) : null}

          <section
            className={`space-y-4 ${
              isPeriodontitisDiagnosis
                ? "border-t border-slate-200 pt-4 dark:border-slate-700"
                : ""
            }`}
            aria-labelledby="periodontal-current-condition-heading"
          >
              <h3
                id="periodontal-current-condition-heading"
                className="font-semibold"
              >
                Current clinical condition
              </h3>

              {showGingivalContextWorkflow ? (
                <>
                <div className="border-l-4 border-sky-600 pl-4">
                  <h4 className="font-semibold">
                    Recommended current condition
                  </h4>
                  <p className="mt-1 text-sm">
                    {gingivalHealthCandidate.context
                      ? choiceLabel(
                          healthGingivitisContextChoices,
                          gingivalHealthCandidate.context,
                        )
                      : "Not available"}
                  </p>
                  {gingivalHealthCandidate.missingFields.length ? (
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        More information is needed to calculate a suggestion:
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {gingivalHealthCandidate.missingFields.map((field) => (
                          <li key={field.id}>
                            <button
                              type="button"
                              className="rounded-sm font-medium text-sky-700 underline decoration-sky-400 underline-offset-2 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-300 dark:hover:text-sky-100"
                              onClick={() => navigateToMissingField(field.id)}
                            >
                              {field.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
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
                        updateGingivalContext(gingivalHealthCandidate.context)
                      }
                    >
                      Apply suggestion
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <FixedChoiceListbox
                    id="adult-hygiene-health-gingivitis-context"
                    label={gingivalContextLabel}
                    value={value.gingivalHealth.context}
                    options={healthGingivitisOptions}
                    onChange={updateGingivalContext}
                  />
                  {value.gingivalHealth.context &&
                  value.gingivalHealth.context !==
                    gingivalHealthCandidate.context ? (
                    <TextField
                      id="adult-hygiene-health-gingivitis-override"
                      label={gingivalContextOverrideLabel}
                      value={value.gingivalHealth.overrideReason}
                      onChange={(overrideReason) =>
                        updateGingivalHealth({ overrideReason })
                      }
                    />
                  ) : null}
                </div>
                {showReducedPeriodontiumBasis ? (
                  <div className="space-y-3">
                    <FixedChoiceMultiCombobox
                      id="adult-hygiene-reduced-periodontium-basis"
                      label="Basis for reduced periodontium"
                      choices={reducedPeriodontiumBasisChoices}
                      values={value.gingivalHealth.reducedPeriodontiumBases}
                      onChange={(reducedPeriodontiumBases) =>
                        updateGingivalHealth({
                          reducedPeriodontiumBases,
                          ...(!reducedPeriodontiumBases.length
                            ? { reducedPeriodontiumBasisDetails: "" }
                            : {}),
                        })
                      }
                      customPlaceholder="Search basis options"
                      allowCustomValues={false}
                    />
                    {value.gingivalHealth.reducedPeriodontiumBases.length ? (
                      <TextField
                        id="adult-hygiene-reduced-periodontium-basis-details"
                        label={
                          value.gingivalHealth.reducedPeriodontiumBases.includes(
                            "Other",
                          )
                            ? "Other basis details / location"
                            : "Basis details / location (optional)"
                        }
                        value={
                          value.gingivalHealth.reducedPeriodontiumBasisDetails
                        }
                        onChange={(reducedPeriodontiumBasisDetails) =>
                          updateGingivalHealth({
                            reducedPeriodontiumBasisDetails,
                          })
                        }
                      />
                    ) : null}
                  </div>
                ) : null}
                </>
              ) : null}

              {isPeriodontitisDiagnosis ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <FixedChoiceListbox
                    id="adult-hygiene-periodontal-status"
                    label="Current periodontal status"
                    value={displayedPeriodontalStatus}
                    options={compatiblePeriodontalStatusChoices}
                    onChange={(status) =>
                      update({
                        status,
                        ...(!status ? { statusComment: "" } : {}),
                      })
                    }
                  />
                  <TextField
                    id="adult-hygiene-periodontal-status-comment"
                    label="Periodontal status comment"
                    value={value.statusComment}
                    onChange={(statusComment) => update({ statusComment })}
                  />
                </div>
              ) : null}
          </section>
        </fieldset>
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
  const selected = new Map(
    assessment.findings.map((finding) => [finding.optionId, finding]),
  );
  const hasObservations =
    assessment.findings.length > 0 ||
    Boolean((assessment.customFindings ?? "").trim());
  const structuredObservationCount =
    assessment.findings.length +
    Number(Boolean((assessment.customFindings ?? "").trim()));
  const shouldAutoExpandStructuredObservations =
    assessment.status === "findings";
  const structuredObservationSummary = structuredObservationCount
    ? `${structuredObservationCount} ${
        structuredObservationCount === 1 ? "observation" : "observations"
      } documented`
    : assessment.status === "wnl"
    ? "WNL"
    : "Not assessed";
  const [structuredObservationsOpen, setStructuredObservationsOpen] = useState(
    shouldAutoExpandStructuredObservations,
  );

  useEffect(() => {
    if (shouldAutoExpandStructuredObservations) {
      setStructuredObservationsOpen(true);
    }
  }, [shouldAutoExpandStructuredObservations]);

  function updateFinding(
    optionId: string,
    patch: Partial<Omit<GingivalDescriptionFinding, "optionId">>,
  ) {
    const current = selected.get(optionId);
    if (!current) return;
    onChange({
      ...assessment,
      status: "findings",
      findings: assessment.findings.map((finding) =>
        finding.optionId === optionId ? { ...finding, ...patch } : finding,
      ),
    });
  }

  function updateDimensionFindings(
    dimension: GingivalCatalogDimension,
    selectedLabels: string[],
  ) {
    const dimensionOptionIds = new Set(
      dimension.options.map((option) => option.id),
    );
    const currentOptionIds = assessment.findings
      .filter((finding) => dimensionOptionIds.has(finding.optionId))
      .map((finding) => finding.optionId);
    let nextOptionIds = dimension.options
      .filter((option) => selectedLabels.includes(option.label))
      .map((option) => option.id);
    const addedOptionId = nextOptionIds.find(
      (optionId) => !currentOptionIds.includes(optionId),
    );
    if (addedOptionId) {
      const conflicts = new Set(gingivalOptionConflicts[addedOptionId] ?? []);
      nextOptionIds = nextOptionIds.filter(
        (optionId) => !conflicts.has(optionId),
      );
    }

    onChange({
      ...assessment,
      status: "findings",
      findings: [
        ...assessment.findings.filter(
          (finding) => !dimensionOptionIds.has(finding.optionId),
        ),
        ...nextOptionIds.map(
          (optionId) =>
            selected.get(optionId) ?? {
              optionId,
              extent: "" as const,
              locations: [],
              measurement: "",
              comment: "",
            },
        ),
      ],
    });
  }

  function setWnl() {
    if (
      assessment.status !== "wnl" &&
      hasObservations &&
      !window.confirm(
        "Clear the documented Gingival Description findings and set this assessment to WNL?",
      )
    ) {
      return;
    }
    onChange(createGingivalDescriptionWnlAssessment());
  }

  function changeStatus(status: GingivalDescriptionStatus) {
    if (status === "wnl") {
      setWnl();
      return;
    }
    onChange({ ...assessment, status });
  }

  function applyNormalStructuredObservations() {
    if (
      assessment.status !== "wnl" &&
      hasObservations &&
      !window.confirm(
        "Replace all documented Gingival Description observations with the reviewed normal structured observations?",
      )
    ) {
      return;
    }
    onChange(createGingivalDescriptionWnlAssessment());
  }

  function applyGingivitisObservations() {
    if (
      hasConflictingGingivitisPresetObservations(assessment) &&
      !window.confirm(
        "Replace conflicting Gingival Description observations with the reviewed generalized gingivitis observations?",
      )
    ) {
      return;
    }
    onChange(applyGingivitisObservationPreset(assessment));
  }

  function clearAssessment() {
    if (
      hasObservations &&
      !window.confirm(
        "Clear all documented Gingival Description observations and return this assessment to Not assessed?",
      )
    ) {
      return;
    }
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
      <fieldset
        className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
        aria-label="Structured gingival observations"
      >
        <button
          id="adult-hygiene-structured-gingival-observations"
          type="button"
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-slate-800"
          aria-expanded={structuredObservationsOpen}
          aria-controls="adult-hygiene-structured-gingival-observations-content"
          onClick={() => setStructuredObservationsOpen((open) => !open)}
        >
          <span className="min-w-0">Structured gingival observations</span>
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
            id="adult-hygiene-structured-gingival-observations-content"
            className="space-y-4 pt-2"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apply the reviewed normal observations or document individual
              findings.
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
                className={`${buttonClass} bg-rose-700 text-white hover:bg-rose-800`}
                onClick={applyGingivitisObservations}
              >
                Apply gingivitis observations
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
            {gingivalDescriptionCatalog.dimensions.map((dimension) => {
              const selectedOptions = dimension.options.filter((option) =>
                selected.has(option.id),
              );
              return (
                <fieldset
                  key={dimension.id}
                  className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700"
                >
                  <legend className="font-medium">{dimension.label}</legend>
                  <FixedChoiceMultiCombobox
                    id={`adult-hygiene-${dimension.id.replaceAll(
                      ".",
                      "-",
                    )}-observations`}
                    label={`${dimension.label} observations`}
                    choices={dimension.options.map((option) => option.label)}
                    choiceGroups={gingivalChoiceGroups(dimension)}
                    values={selectedOptions.map((option) => option.label)}
                    onChange={(selectedLabels) =>
                      updateDimensionFindings(dimension, selectedLabels)
                    }
                    customPlaceholder={`Search ${dimension.label.toLocaleLowerCase(
                      "en-CA",
                    )} observations`}
                    customHelpText=""
                    showSelectedChips={false}
                    allowCustomValues={false}
                  />
                  {selectedOptions.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedOptions.map((option) => {
                        const finding = selected.get(option.id)!;
                        const supportsLocation =
                          dimension.supportsLocation ||
                          ("supportsLocation" in option &&
                            option.supportsLocation);
                        const supportsMeasurement =
                          "supportsMeasurement" in option &&
                          option.supportsMeasurement;
                        return (
                          <div
                            key={option.id}
                            className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                          >
                            <h4 className="text-sm font-semibold">
                              {option.label}
                            </h4>
                            <div className="mt-3 grid gap-3">
                              <FixedChoiceListbox
                                id={`adult-hygiene-${option.id.replaceAll(
                                  ".",
                                  "-",
                                )}-extent`}
                                label={`${option.label} extent`}
                                value={finding.extent}
                                options={[
                                  { value: "", label: "Not specified" },
                                  {
                                    value: "generalized",
                                    label: "Generalized",
                                  },
                                  { value: "localized", label: "Localized" },
                                ]}
                                onChange={(extent) =>
                                  updateFinding(option.id, { extent })
                                }
                                compact
                              />
                              {supportsLocation ? (
                                <ClinicalLocationMultiCombobox
                                  id={`adult-hygiene-${option.id.replaceAll(
                                    ".",
                                    "-",
                                  )}-location`}
                                  label={`${option.label} location`}
                                  preset="gingival"
                                  values={finding.locations}
                                  onChange={(locations) =>
                                    updateFinding(option.id, { locations })
                                  }
                                />
                              ) : null}
                              {supportsMeasurement ? (
                                <TextField
                                  id={`adult-hygiene-${option.id.replaceAll(
                                    ".",
                                    "-",
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
                                  "-",
                                )}-comment`}
                                label={`${option.label} notes`}
                                value={finding.comment}
                                onChange={(comment) =>
                                  updateFinding(option.id, { comment })
                                }
                                placeholder="Optional encounter-specific note"
                              />
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
    </>
  );
}

export function TreatmentCompletedList({
  entries,
  onApplyStandard,
  onAdd,
  onChange,
}: {
  entries: AdultHygieneTreatmentCompletedEntry[];
  onApplyStandard: () => void;
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
      <button
        type="button"
        className={`${buttonClass} bg-sky-700 text-white hover:bg-sky-800`}
        onClick={onApplyStandard}
      >
        Apply standard treatment
      </button>
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
                <ClinicalLocationMultiCombobox
                  id={`adult-hygiene-treatment-completed-${entry.id}-tooth-area`}
                  label="Tooth/area"
                  preset="treatment"
                  values={entry.toothAreas}
                  onChange={(values) =>
                    updateEntry(entry.id, { toothAreas: values })
                  }
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

export function AdultHygiene2026Template({
  fixture,
  presentation,
  variant = "adult",
}: InteractiveTemplateProps<AdultHygiene2026Form> & {
  variant?: Hygiene2026Variant;
}) {
  const isAdolescent = variant === "adolescent";
  const templateId = isAdolescent
    ? "adolescent-hygiene-2026"
    : "adult-hygiene-2026";
  const discardWarning = isAdolescent
    ? adolescentHygieneDiscardWarning
    : adultHygieneDiscardWarning;
  const outputChoices = outputChoicesByVariant[variant];
  const [form, setForm] = useState<AdultHygiene2026Form>(() => ({
    ...createEmptyAdultHygiene2026Form(),
    class5IndicatorStatus: "yes",
    ppeStatementApplies: true,
  }));
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [patientIdError, setPatientIdError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [outputMode, setOutputMode] =
    useState<AdultHygiene2026Output>("complete");
  const patientIdRef = useRef<HTMLInputElement>(null);
  const dentistRef = useRef<HTMLInputElement>(null);
  const treatmentEntrySequence = useRef(0);
  const providerDefaultsAppliedRef = useRef(false);
  const { providerDefaultsStorageStatus, getProviderDefault, getItems } =
    useCatalogues();

  const localDraft = useLocalInteractiveDraft({
    templateId,
    form,
    startedAt,
    isEmpty: isEmptyAdultHygieneDraft,
    isValidForm: isAdultHygieneDraftForm,
    onRestore: (draft) => {
      const emptyForm = createEmptyAdultHygiene2026Form();
      setForm({
        ...emptyForm,
        ...draft.form,
        vitalsReadings: draft.form.vitalsReadings ?? [],
        periodontalClassification: normalizePeriodontalClassification(
          draft.form.periodontalClassification,
        ),
        treatmentCompleted: migrateLegacyDesensitizerToTreatmentCompleted(
          draft.form.treatmentCompleted ?? [],
          draft.form.desensitizer ?? "",
        ),
        desensitizer: "",
        gingivalDescription: copyGingivalDescriptionAssessment(
          draft.form.gingivalDescription,
        ),
      });
      setStartedAt(new Date(draft.startedAt));
      setPatientIdError("");
      setProviderError("");
      setCopyMessage("");
    },
  });

  function createNewFormWithProviderDefaults(): AdultHygiene2026Form {
    return {
      ...createEmptyAdultHygiene2026Form(),
      class5IndicatorStatus: "yes",
      ppeStatementApplies: true,
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

  useEffect(() => setStartedAt((current) => current ?? new Date()), []);

  useEffect(() => {
    if (
      !form.mieleCodes.trim() ||
      (form.class5IndicatorStatus === "yes" && form.ppeStatementApplies)
    ) {
      return;
    }
    setForm((current) =>
      !current.mieleCodes.trim() ||
      (current.class5IndicatorStatus === "yes" && current.ppeStatementApplies)
        ? current
        : {
            ...current,
            class5IndicatorStatus: "yes",
            ppeStatementApplies: true,
          },
    );
  }, [form.class5IndicatorStatus, form.mieleCodes, form.ppeStatementApplies]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = discardWarning;
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [discardWarning]);

  const summaries = useMemo(
    () => ({
      complete: buildAdultHygiene2026Summary(form, {
        ...(startedAt ? { startedAt } : {}),
        output: "complete",
      }),
      hygiene: buildAdultHygiene2026Summary(form, {
        ...(startedAt ? { startedAt } : {}),
        output: "hygiene",
      }),
      recare: buildAdultHygiene2026Summary(form, {
        ...(startedAt ? { startedAt } : {}),
        output: "recare",
      }),
    }),
    [form, startedAt],
  );
  const summary = summaries[outputMode];
  const selectedOutputLabel =
    outputChoices.find(([value]) => value === outputMode)?.[1] ?? "Note";
  const cariesRiskSuggestion = suggestAdultCariesRisk(form.cariesRiskFactors);
  const occlusalSplintState = resolveOcclusalSplintState(form);

  function updateField<TKey extends keyof AdultHygiene2026Form>(
    key: TKey,
    value: AdultHygiene2026Form[TKey],
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

  function updateVitalsReading(
    readingIndex: number,
    patch: Partial<VitalsReading>,
  ) {
    updateField(
      "vitalsReadings",
      form.vitalsReadings.map((reading, currentIndex) =>
        currentIndex === readingIndex ? { ...reading, ...patch } : reading,
      ),
    );
  }

  function addVitalsReading() {
    updateField("vitalsReadings", [
      ...form.vitalsReadings,
      createEmptyVitalsReading(true),
    ]);
  }

  function removeVitalsReading(readingIndex: number) {
    updateField(
      "vitalsReadings",
      form.vitalsReadings.filter(
        (_reading, currentIndex) => currentIndex !== readingIndex,
      ),
    );
  }

  async function copyNote(mode: AdultHygiene2026Output = outputMode) {
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
      !hasRequiredAdultHygiene2026Fields(form)
    ) {
      requestAnimationFrame(() => {
        const invalidField = missingPatientId
          ? patientIdRef.current
          : dentistRef.current;
        invalidField?.focus();
      });
      return;
    }
    const copied = await writeClipboard(summaries[mode]);
    const outputLabel =
      outputChoices.find(([value]) => value === mode)?.[1] ?? "Note";
    setCopyMessage(
      copied
        ? draftSaveResult === "failed"
          ? `${outputLabel} note copied, but the local draft could not be saved.`
          : `${outputLabel} note copied.`
        : "The note could not be copied. Select the preview and copy it manually.",
    );
  }

  function loadDemo() {
    setForm({
      ...fixture,
      gingivalDescription: copyGingivalDescriptionAssessment(
        fixture.gingivalDescription,
      ),
      periodontalClassification: {
        ...fixture.periodontalClassification,
        stageBasis: fixture.periodontalClassification.stageBasis.map(
          (evidence) => ({
            ...evidence,
            ...(evidence.measurement
              ? { measurement: { ...evidence.measurement } }
              : {}),
          }),
        ),
        gradeBasis: fixture.periodontalClassification.gradeBasis.map(
          (evidence) => ({
            ...evidence,
            ...(evidence.measurement
              ? { measurement: { ...evidence.measurement } }
              : {}),
          }),
        ),
        smoking: { ...fixture.periodontalClassification.smoking },
        diabetes: { ...fixture.periodontalClassification.diabetes },
        gingivalHealth: {
          ...fixture.periodontalClassification.gingivalHealth,
          reducedPeriodontiumBases: [
            ...fixture.periodontalClassification.gingivalHealth
              .reducedPeriodontiumBases,
          ],
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
      radiographs: [...fixture.radiographs],
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
      ).map((finding) => ({
        ...finding,
        locations: [...finding.locations],
      })),
      toothFindings: (fixture.toothFindings ?? []).map((finding) => ({
        ...finding,
        toothAreas: [...finding.toothAreas],
      })),
      plaqueAreas: [...(fixture.plaqueAreas ?? [])],
      stainAreas: [...(fixture.stainAreas ?? [])],
      calculusAreas: [...(fixture.calculusAreas ?? [])],
      bleedingAreas: [...(fixture.bleedingAreas ?? [])],
      cariesRiskFactors: [...fixture.cariesRiskFactors],
      ohiAidsReviewed: [...fixture.ohiAidsReviewed],
      oheTopicsReviewed: [...fixture.oheTopicsReviewed],
      treatmentCompleted: fixture.treatmentCompleted.map((entry) => ({
        ...entry,
        toothAreas: [...entry.toothAreas],
      })),
      localAnesthesiaEntries: fixture.localAnesthesiaEntries.map((entry) => ({
        ...entry,
        toothAreas: [...entry.toothAreas],
      })),
      treatmentOptions: fixture.treatmentOptions.map((entry) => ({ ...entry })),
      hygieneTreatmentOptions: fixture.hygieneTreatmentOptions.map((entry) => ({
        ...entry,
      })),
      treatmentPlan: fixture.treatmentPlan.map((entry) => ({ ...entry })),
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

  function createTreatmentRecommendation(
    kind: "option" | "plan",
    careType: "preventive" | "restorative" | "other" = "other",
  ) {
    treatmentEntrySequence.current += 1;
    return {
      id: `${kind}-${Date.now()}-${treatmentEntrySequence.current}`,
      treatmentType: "",
      toothArea: "",
      careType,
    };
  }

  function addDiscussedOptionsToCombinedPlan() {
    const normalize = (value: string) =>
      value.normalize("NFKC").trim().toLocaleLowerCase("en-CA");
    const identity = (
      entry: AdultHygiene2026Form["treatmentPlan"][number],
      careType: "preventive" | "restorative" | "other",
    ) =>
      `${careType}|${normalize(entry.treatmentType)}|${normalize(
        entry.toothArea,
      )}`;
    const seen = new Set(
      form.treatmentPlan
        .filter((entry) => entry.treatmentType.trim())
        .map((entry) => identity(entry, entry.careType ?? "other")),
    );
    const additions: AdultHygiene2026Form["treatmentPlan"] = [];

    for (const [options, careType] of [
      [form.treatmentOptions, "restorative"],
      [form.hygieneTreatmentOptions, "preventive"],
    ] as const) {
      for (const entry of options) {
        if (!entry.treatmentType.trim()) continue;
        const key = identity(entry, careType);
        if (seen.has(key)) continue;
        seen.add(key);
        additions.push({
          ...entry,
          id: createTreatmentRecommendation("plan", careType).id,
          careType,
        });
      }
    }

    if (additions.length) {
      updateField("treatmentPlan", [...form.treatmentPlan, ...additions]);
    }
  }

  function resetForm() {
    if (!window.confirm(discardWarning)) return;
    localDraft.beginNewDraft();
    setForm(createNewFormWithProviderDefaults());
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    setOutputMode("complete");
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

  function applyStandardTreatment() {
    const existingKeys = new Set(
      form.treatmentCompleted.map(treatmentCompletedEntryIdentity),
    );
    const oheRecap = buildOheTreatmentRecap(form);
    const additions = createStandardTreatmentEntriesFromCatalogue(
      getItems("hygiene-treatment.completed"),
      () => createTreatmentCompletedEntry().id,
      oheRecap,
    ).filter(
      (entry) => !existingKeys.has(treatmentCompletedEntryIdentity(entry)),
    );
    if (additions.length) {
      updateField("treatmentCompleted", [
        ...form.treatmentCompleted,
        ...additions,
      ]);
    }
  }

  function applyRecareExam() {
    if (
      form.treatmentCompleted.some(
        (entry) =>
          treatmentCompletedEntryIdentity(entry) === "procedure:recare-exam",
      )
    ) {
      return;
    }
    const entry = {
      ...createTreatmentCompletedEntry(),
      ...recareExamTreatmentPreset,
      toothAreas: [...recareExamTreatmentPreset.toothAreas],
    };
    const radiographCount = form.treatmentCompleted.filter(
      (candidate) => candidate.procedureSource === "radiographs",
    ).length;
    updateField("treatmentCompleted", [
      ...form.treatmentCompleted.slice(0, radiographCount),
      entry,
      ...form.treatmentCompleted.slice(radiographCount),
    ]);
  }

  const recordsControls = (
    <>
      <RadiographsTakenControl
        values={form.radiographs}
        onChange={(radiographs) => {
          setForm((current) => ({
            ...current,
            radiographs,
            treatmentCompleted: syncRadiographTreatmentEntries(
              current.treatmentCompleted,
              radiographs,
            ),
          }));
          setCopyMessage("");
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FixedChoiceListbox
          id="adult-hygiene-intraoral-photos-status"
          label="Intraoral photos"
          value={form.intraoralPhotosStatus}
          options={documentationStatusOptions}
          onChange={(value) => updateField("intraoralPhotosStatus", value)}
        />
        <TextField
          id="adult-hygiene-intraoral-photos-details"
          label="Intraoral photos details"
          value={form.intraoralPhotosDetails}
          onChange={(value) => updateField("intraoralPhotosDetails", value)}
          placeholder="Optional details"
        />
      </div>
    </>
  );

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
                label="Last recare date"
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
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
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
                <CheckboxField
                  id="adult-hygiene-ppe"
                  label="Standard PPE statement applies"
                  checked={form.ppeStatementApplies}
                  onChange={(value) =>
                    updateField("ppeStatementApplies", value)
                  }
                />
              </div>
              <TextField
                id="adult-hygiene-miele-codes"
                label="Sterilization codes"
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

            <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <legend className="px-1 font-semibold">Vitals Readings</legend>
              <div className="space-y-3">
                {form.vitalsReadings.map((reading, readingIndex) => (
                  <div
                    key={`adult-hygiene-vitals-${readingIndex}`}
                    className="space-y-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        Vitals Entry {readingIndex + 1}
                      </p>
                      <button
                        type="button"
                        className={vitalsRemoveButtonClass}
                        onClick={() => removeVitalsReading(readingIndex)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 xs:grid-cols-1 sm:grid-cols-3 md:grid-cols-6">
                      <TextField
                        id={`adult-hygiene-vitals-systolic-${readingIndex}`}
                        label="Systolic"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 118"
                        value={reading.systolic}
                        onChange={(value) =>
                          updateVitalsReading(readingIndex, { systolic: value })
                        }
                      />
                      <TextField
                        id={`adult-hygiene-vitals-diastolic-${readingIndex}`}
                        label="Diastolic"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 76"
                        value={reading.diastolic}
                        onChange={(value) =>
                          updateVitalsReading(readingIndex, { diastolic: value })
                        }
                      />
                      <TextField
                        id={`adult-hygiene-vitals-heart-rate-${readingIndex}`}
                        label="Heart Rate"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 72"
                        value={reading.heartRate}
                        onChange={(value) =>
                          updateVitalsReading(readingIndex, { heartRate: value })
                        }
                      />
                      <TextField
                        id={`adult-hygiene-vitals-time-${readingIndex}`}
                        label="Time"
                        type="time"
                        value={reading.time}
                        onChange={(value) =>
                          updateVitalsReading(readingIndex, { time: value })
                        }
                      />
                      <button
                        type="button"
                        className={vitalsActionButtonClass}
                        onClick={() =>
                          updateVitalsReading(readingIndex, {
                            time: getCurrentVitalsTime(),
                          })
                        }
                      >
                        Set to now
                      </button>
                      <button
                        type="button"
                        className={vitalsActionButtonClass}
                        onClick={() =>
                          updateVitalsReading(readingIndex, { time: "" })
                        }
                      >
                        Clear time
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={vitalsActionButtonClass}
                onClick={addVitalsReading}
              >
                Add reading
              </button>
            </fieldset>
          </Section>

          {!isAdolescent ? (
            <Section title="Records">{recordsControls}</Section>
          ) : null}

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
            {isAdolescent ? recordsControls : null}
            <TextareaField
              id="adult-hygiene-area-of-concern"
              label="Hygiene area of concern"
              value={form.hygieneAreaOfConcern}
              onChange={(value) => updateField("hygieneAreaOfConcern", value)}
            />
            <AdultHygienePlaqueControl
              id="adult-hygiene-plaque"
              choice={form.plaqueChoice}
              areas={form.plaqueAreas}
              comment={form.plaqueComment}
              onChoiceChange={(value) => updateField("plaqueChoice", value)}
              onAreasChange={(value) => updateField("plaqueAreas", value)}
              onCommentChange={(value) => updateField("plaqueComment", value)}
            />
            <FacetedChoiceWithComment
              id="adult-hygiene-stain"
              label="Stain"
              choice={form.stainChoice}
              areas={form.stainAreas}
              comment={form.stainComment}
              facetChoices={stainFacetChoices}
              facetGroups={stainFacetGroups}
              onChoiceChange={(value) => updateField("stainChoice", value)}
              onAreasChange={(value) => updateField("stainAreas", value)}
              onCommentChange={(value) => updateField("stainComment", value)}
              standaloneValue="None"
            />
            <AdultHygieneCalculusControl
              id="adult-hygiene-calculus"
              choice={form.calculusChoice}
              areas={form.calculusAreas}
              comment={form.calculusComment}
              onChoiceChange={(value) => updateField("calculusChoice", value)}
              onAreasChange={(value) => updateField("calculusAreas", value)}
              onCommentChange={(value) => updateField("calculusComment", value)}
            />
            <FacetedChoiceWithComment
              id="adult-hygiene-bleeding"
              label="Bleeding"
              choice={form.bleedingChoice}
              areas={form.bleedingAreas}
              comment={form.bleedingComment}
              facetChoices={bleedingFacetChoices}
              facetGroups={bleedingFacetGroups}
              onChoiceChange={(value) => updateField("bleedingChoice", value)}
              onAreasChange={(value) => updateField("bleedingAreas", value)}
              onCommentChange={(value) => updateField("bleedingComment", value)}
              standaloneValue="None"
            />
          </Section>

          <Section title="EOE">
            <ExamFinding
              id="adult-hygiene-extraoral"
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
              idPrefix="adult-hygiene"
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
                idPrefix="adult-hygiene"
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
                  id="adult-hygiene-masseter"
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
                  id="adult-hygiene-tmj-load"
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
                idPrefix="adult-hygiene"
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
          </Section>

          <Section title="IOE">
            <ExamFinding
              id="adult-hygiene-intraoral"
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
              idPrefix="adult-hygiene"
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

          <Section title="Occlusion and Habits">
            <TextField
              id="adult-hygiene-oral-habits"
              label="Oral habits"
              value={form.oralHabits}
              onChange={(value) => updateField("oralHabits", value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
                <CatalogueCombobox
                  id="adult-hygiene-right-molar-occlusion"
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
                    id="adult-hygiene-right-molar-na"
                    type="checkbox"
                    className={checkboxClass}
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
                  id="adult-hygiene-left-molar-occlusion"
                  label="Left molar occlusion"
                  catalogueKey="clinical-exam.molar-occlusion"
                  value={form.leftMolarOcclusion}
                  onChange={(value) => updateField("leftMolarOcclusion", value)}
                  disabled={form.leftMolarOcclusionNotApplicable}
                />
                <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 sm:mt-6">
                  <input
                    id="adult-hygiene-left-molar-na"
                    type="checkbox"
                    className={checkboxClass}
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
                id="adult-hygiene-skeletal-occlusion"
                label="Skeletal occlusion"
                catalogueKey="clinical-exam.skeletal-occlusion"
                value={form.skeletalOcclusion}
                onChange={(value) => updateField("skeletalOcclusion", value)}
                disabled={form.skeletalOcclusionNotApplicable}
              />
              <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 md:mt-6">
                <input
                  id="adult-hygiene-skeletal-na"
                  type="checkbox"
                  className={checkboxClass}
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
                id="adult-hygiene-overjet"
                label="Overjet (mm)"
                value={form.overjetMm}
                onChange={(value) => updateField("overjetMm", value)}
                inputMode="decimal"
              />
              <TextField
                id="adult-hygiene-overbite-percent"
                label="Overbite (%)"
                value={form.overbitePercent}
                onChange={(value) => updateField("overbitePercent", value)}
                inputMode="decimal"
              />
              <TextField
                id="adult-hygiene-overbite-mm"
                label="Overbite (mm)"
                value={form.overbiteMm ?? ""}
                onChange={(value) => updateField("overbiteMm", value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-3">
              <CatalogueMultiCombobox
                id="adult-hygiene-additional-occlusal-findings"
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
                      idPrefix="adult-hygiene"
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
                id="adult-hygiene-additional-occlusal-findings-list-format"
                label="List each additional occlusal finding on a separate line in the note"
                checked={form.listAdditionalOcclusalFindings}
                onChange={(value) =>
                  updateField("listAdditionalOcclusalFindings", value)
                }
              />
            </div>
          </Section>

          <Section title="Teeth and Odontogram">
            <TeethAssessment
              idPrefix="adult-hygiene"
              form={form}
              onChange={(patch) => {
                setForm((current) => ({ ...current, ...patch }));
                setCopyMessage("");
              }}
            />
            <CheckboxField
              id="adult-hygiene-odontogram-up-to-date"
              label="Odontogram up to date"
              checked={form.odontogramUpToDate}
              onChange={(value) => updateField("odontogramUpToDate", value)}
            />
          </Section>

          <Section title="Appliances and Relevant History">
            <div className="grid gap-4 md:grid-cols-2">
              <FixedChoiceListbox
                id="adult-hygiene-cpap"
                label="Has a CPAP"
                value={form.cpapStatus}
                options={documentationStatusOptions}
                onChange={(value) => {
                  updateField("cpapStatus", value);
                  if (value !== "yes") {
                    updateField("cpapUseStatus", "not-documented");
                  }
                }}
              />
              {form.cpapStatus === "yes" ? (
                <FixedChoiceListbox
                  id="adult-hygiene-cpap-use"
                  label="Uses the CPAP"
                  value={form.cpapUseStatus}
                  options={documentationStatusOptions}
                  onChange={(value) => updateField("cpapUseStatus", value)}
                />
              ) : null}
              <FixedChoiceListbox
                id="adult-hygiene-occlusal-splint"
                label="Has an occlusal splint (night guard)"
                value={occlusalSplintState.status}
                options={documentationStatusOptions}
                onChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    occlusalSplintStatus: value,
                    nightGuardStatus: value,
                    ...(value !== "yes"
                      ? {
                          occlusalSplintUseStatus: "not-documented" as const,
                          nightGuardUseStatus: "not-documented" as const,
                        }
                      : {}),
                  }));
                  setCopyMessage("");
                }}
              />
              {occlusalSplintState.status === "yes" ? (
                <FixedChoiceListbox
                  id="adult-hygiene-occlusal-splint-use"
                  label="Uses the occlusal splint (night guard)"
                  value={occlusalSplintState.useStatus}
                  options={documentationStatusOptions}
                  onChange={(value) => {
                    setForm((current) => ({
                      ...current,
                      occlusalSplintUseStatus: value,
                      nightGuardUseStatus: value,
                    }));
                    setCopyMessage("");
                  }}
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
              <FixedChoiceListbox
                id="adult-hygiene-removable-dentures"
                label="Partial/complete removable dentures"
                value={form.removableDenturesStatus}
                options={documentationStatusOptions}
                onChange={(value) =>
                  updateField("removableDenturesStatus", value)
                }
              />
              {form.removableDenturesStatus === "yes" ? (
                <div className="md:col-span-2">
                  <TextareaField
                    id="adult-hygiene-removable-dentures-comment"
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
              id="adult-hygiene-improvement-request"
              label="What would the patient like to improve about their smile or teeth?"
              value={form.improvementRequest}
              onChange={(value) => updateField("improvementRequest", value)}
            />
            <TextareaField
              id="adult-hygiene-recare-comments"
              label="Additional recare comments"
              value={form.recareAdditionalComments}
              onChange={(value) =>
                updateField("recareAdditionalComments", value)
              }
            />
            <TextareaField
              id="adult-hygiene-additional-notes"
              label="Additional notes"
              value={form.additionalNotes}
              onChange={(value) => updateField("additionalNotes", value)}
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
                        ] as AdultHygiene2026Form["psrPocketing"];
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

          <Section title="Caries Risk Assessment">
            <div className="grid gap-4 md:grid-cols-2">
              <FixedChoiceListbox
                id="adult-hygiene-caries-risk-level"
                label="Caries risk level"
                value={form.cariesRiskLevel}
                options={cariesRiskLevelOptions}
                onChange={(value) => updateField("cariesRiskLevel", value)}
              />
              <div className="md:col-span-2">
                <CatalogueMultiCombobox
                  id="adult-hygiene-caries-risk-factors"
                  label="Caries risk factors"
                  catalogueKey="clinical-exam.caries-risk-factors"
                  values={form.cariesRiskFactors}
                  onChange={(value) => updateField("cariesRiskFactors", value)}
                  roomySelectionActions
                />
              </div>
              <div className="border-l-4 border-sky-600 pl-4 md:col-span-2">
                <h3 className="font-semibold">Suggested caries risk level</h3>
                <p className="mt-1 text-sm">
                  {cariesRiskSuggestion.level || "Not available"}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Based only on the risk factors documented above. The selected
                  risk level is not changed automatically.
                </p>
                {cariesRiskSuggestion.reasons.length ? (
                  <details className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    <summary className="cursor-pointer font-medium text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100">
                      Why this was suggested
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {cariesRiskSuggestion.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                {cariesRiskSuggestion.warnings.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {cariesRiskSuggestion.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : null}
                {cariesRiskSuggestion.level &&
                form.cariesRiskLevel !== cariesRiskSuggestion.level ? (
                  <button
                    type="button"
                    className={`${buttonClass} mt-3 bg-sky-700 text-white hover:bg-sky-800`}
                    onClick={() =>
                      updateField("cariesRiskLevel", cariesRiskSuggestion.level)
                    }
                  >
                    Apply caries risk suggestion
                  </button>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  id="adult-hygiene-caries-risk-notes"
                  label="Caries risk notes"
                  placeholder="Document rationale for the caries risk selection."
                  value={form.cariesRiskNotes}
                  onChange={(value) => updateField("cariesRiskNotes", value)}
                />
              </div>
            </div>
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
            <OheEducationControl
              value={form}
              standardStatement={standardOheStatement}
              standardGoal={standardHygieneGoal}
              topicChoices={oheTopicChoices}
              topicChoiceGroups={oheTopicChoiceGroups}
              onChange={(key, value) => {
                setForm((current) => {
                  const next = { ...current, [key]: value };
                  return {
                    ...next,
                    treatmentCompleted: syncDerivedOheTreatmentDetails(
                      next.treatmentCompleted,
                      buildOheTreatmentRecap(next),
                    ),
                  };
                });
                setCopyMessage("");
              }}
            />
          </Section>

          <Section title="Treatment plan">
            <TreatmentEntryList
              id="adult-hygiene-treatment-options"
              label="Dental treatment options discussed"
              addLabel="Add treatment option"
              entries={form.treatmentOptions}
              onAdd={() =>
                updateField("treatmentOptions", [
                  ...form.treatmentOptions,
                  createTreatmentRecommendation("option", "restorative"),
                ])
              }
              onChange={(value) => updateField("treatmentOptions", value)}
            />
            <TreatmentEntryList
              id="adult-hygiene-hygiene-treatment-options"
              label="Hygiene treatment options discussed"
              addLabel="Add hygiene treatment option"
              catalogueKey="hygiene-treatment.items"
              entries={form.hygieneTreatmentOptions}
              onAdd={() =>
                updateField("hygieneTreatmentOptions", [
                  ...form.hygieneTreatmentOptions,
                  createTreatmentRecommendation("option", "preventive"),
                ])
              }
              onChange={(value) =>
                updateField("hygieneTreatmentOptions", value)
              }
            />
            <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Order preventive and restorative care in the intended sequence.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`${buttonClass} bg-sky-700 text-white hover:bg-sky-800`}
                  onClick={() =>
                    updateField("treatmentPlan", [
                      ...form.treatmentPlan,
                      {
                        ...createTreatmentRecommendation("plan", "preventive"),
                        treatmentType: "Hygiene maintenance",
                        toothArea: "full mouth",
                      },
                    ])
                  }
                >
                  Add hygiene maintenance
                </button>
                <button
                  type="button"
                  className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
                  disabled={
                    ![
                      ...form.treatmentOptions,
                      ...form.hygieneTreatmentOptions,
                    ].some((entry) => Boolean(entry.treatmentType.trim()))
                  }
                  onClick={addDiscussedOptionsToCombinedPlan}
                >
                  Add options above to combined treatment plan
                </button>
              </div>
              <TreatmentEntryList
                id="adult-hygiene-treatment-plan"
                label="Combined treatment plan"
                addLabel="Add recommendation"
                entries={form.treatmentPlan}
                onAdd={() =>
                  updateField("treatmentPlan", [
                    ...form.treatmentPlan,
                    createTreatmentRecommendation("plan"),
                  ])
                }
                onChange={(value) => updateField("treatmentPlan", value)}
                showCareType
              />
            </div>
          </Section>

          <Section title="Treatment completed today">
            <StructuredTreatmentCompletedList
              entries={form.treatmentCompleted}
              oheRecap={buildOheTreatmentRecap(form)}
              onApplyStandard={applyStandardTreatment}
              onApplyRecare={applyRecareExam}
              radiographsHref="#adult-hygiene-radiographs"
              onChange={(value) => updateField("treatmentCompleted", value)}
              showHeading={false}
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
          </Section>

          {isAdolescent ? (
            <Section title="Communication with Parent or Legal Guardian">
              <div className="grid gap-4 md:grid-cols-2">
                <FixedChoiceListbox
                  id="adolescent-hygiene-2026-guardian-communication"
                  label="Information relayed"
                  value={
                    form.guardianCommunicationStatus ?? "not-documented"
                  }
                  options={documentationStatusOptions}
                  onChange={(value) =>
                    updateField("guardianCommunicationStatus", value)
                  }
                />
                {form.guardianCommunicationStatus === "yes" ? (
                  <TextField
                    id="adolescent-hygiene-2026-guardian-communication-details"
                    label="Communication details"
                    value={form.guardianCommunicationDetails ?? ""}
                    onChange={(value) =>
                      updateField("guardianCommunicationDetails", value)
                    }
                  />
                ) : null}
              </div>
            </Section>
          ) : null}

          <Section title="Intervals and Follow-up">
            <div className="grid gap-3 md:grid-cols-2">
              <CatalogueCombobox
                id="adult-hygiene-recall-interval"
                label="Recommended recare interval"
                catalogueKey="scheduling.recall-interval"
                value={form.recallInterval}
                onChange={(value) => updateField("recallInterval", value)}
              />
              <TextField
                id="adult-hygiene-recall-interval-comments"
                label="Recommended recare interval comments"
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
                label="Next hygiene visit"
                catalogueKey="scheduling.hygiene-next-visit"
                value={form.nextVisit}
                onChange={(value) => updateField("nextVisit", value)}
              />
              <TextField
                id="adult-hygiene-date-booked"
                label="Hygiene date booked"
                value={form.dateBooked}
                onChange={(value) => updateField("dateBooked", value)}
                type="date"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="adult-hygiene-dental-next-visit"
                label="Next dental visit"
                catalogueKey="scheduling.dentist-next-visit"
                value={form.dentalNextVisit}
                onChange={(value) => updateField("dentalNextVisit", value)}
              />
              <TextField
                id="adult-hygiene-dental-date-booked"
                label="Dental date booked"
                value={form.dentalDateBooked}
                onChange={(value) => updateField("dentalDateBooked", value)}
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
            <fieldset className="mt-4 space-y-2">
              <legend className="text-sm font-semibold">Note output</legend>
              <div className="grid grid-cols-3 gap-2">
                {outputChoices.map(([value, label]) => (
                  <NativeChoiceControl
                    key={value}
                    type="radio"
                    name={`${templateId}-note-output`}
                    checked={outputMode === value}
                    className="px-2"
                    onChange={() => {
                      setOutputMode(value);
                      setCopyMessage("");
                    }}
                  >
                    {label}
                  </NativeChoiceControl>
                ))}
              </div>
            </fieldset>
            <label className="sr-only" htmlFor="adult-hygiene-summary">
              Generated 2026 {selectedOutputLabel.toLowerCase()} note
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
                Copy {selectedOutputLabel.toLowerCase()} note
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
