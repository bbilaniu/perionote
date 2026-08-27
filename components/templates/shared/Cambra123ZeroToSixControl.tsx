"use client";

import { useEffect, useState } from "react";
import { FixedChoiceListbox } from "@/components/forms/FixedChoiceListbox";
import {
  DropdownChevron,
  formControlClass,
} from "@/components/forms/controlStyles";
import { CollapsibleFieldset } from "@/components/templates/shared/CollapsibleFieldset";
import {
  assessCambra123ZeroToSix,
  cambra123ZeroToSixItems,
  createEmptyCambra123ZeroToSixAssessment,
  hasCambra123ZeroToSixContent,
  type Cambra123AssessmentPhase,
  type Cambra123ItemKind,
  type Cambra123ZeroToSixAssessment,
  type Cambra123ZeroToSixItemDefinition,
  type Cambra123ZeroToSixItemId,
  type Cambra123ZeroToSixRiskLevel,
} from "@/lib/templates/cambra123";

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const riskLevelOptions: Array<{
  value: Cambra123ZeroToSixRiskLevel;
  label: string;
}> = [
  { value: "", label: "None selected" },
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
  { value: "Very High", label: "Very High" },
];

const groupPresentation: Record<
  Cambra123ItemKind,
  { title: string; accent: string; scoreLabel: string }
> = {
  protective: {
    title: "Protective factors",
    accent:
      "border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30",
    scoreLabel: "−1 each",
  },
  risk: {
    title: "Biological or environmental risk factors",
    accent:
      "border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30",
    scoreLabel: "+2 each",
  },
  "disease-indicator": {
    title: "Disease indicators",
    accent:
      "border-red-300 bg-red-50/70 dark:border-red-800 dark:bg-red-950/30",
    scoreLabel: "+3 each",
  },
};

function assessmentItems(
  kind: Cambra123ItemKind,
  phase?: Cambra123AssessmentPhase,
): readonly Cambra123ZeroToSixItemDefinition[] {
  return cambra123ZeroToSixItems.filter(
    (item) => item.kind === kind && (!phase || item.phase === phase),
  );
}

function ItemGroup({
  kind,
  phase,
  value,
  onToggle,
}: {
  kind: Cambra123ItemKind;
  phase?: Cambra123AssessmentPhase;
  value: Cambra123ZeroToSixAssessment;
  onToggle: (id: Cambra123ZeroToSixItemId, checked: boolean) => void;
}) {
  const presentation = groupPresentation[kind];
  const items = assessmentItems(kind, phase);
  const phaseLabel =
    kind === "risk" && phase
      ? phase === "question"
        ? " — patient/guardian questions"
        : " — clinical exam"
      : "";

  return (
    <fieldset
      className={`space-y-3 rounded-xl border p-4 ${presentation.accent}`}
    >
      <legend className="px-1 font-semibold">
        {presentation.title}
        {phaseLabel}
      </legend>
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>Check if Yes</span>
        <span>{presentation.scoreLabel}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-white/70 px-3 py-2 text-sm hover:border-slate-300 dark:bg-slate-950/50 dark:hover:border-slate-700"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-sky-700"
              checked={value.yesItemIds.includes(item.id)}
              onChange={(event) => onToggle(item.id, event.target.checked)}
            />
            <span className="grow">{item.label}</span>
            <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {item.score > 0 ? `+${item.score}` : item.score}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Cambra123ZeroToSixControl({
  value,
  onChange,
}: {
  value: Cambra123ZeroToSixAssessment;
  onChange: (value: Cambra123ZeroToSixAssessment) => void;
}) {
  const result = assessCambra123ZeroToSix(value);
  const hasAssessment = hasCambra123ZeroToSixContent(value);
  const [factorsOpen, setFactorsOpen] = useState(hasAssessment);
  const yesCount =
    result.protectiveYesCount +
    result.riskYesCount +
    result.diseaseIndicatorYesCount;
  const signedScore =
    result.totalScore > 0 ? `+${result.totalScore}` : String(result.totalScore);
  const factorsSummary = hasAssessment
    ? `${yesCount} Yes · Score ${signedScore} · ${
        value.finalRiskLevel
          ? value.finalRiskLevel
          : `${result.suggestedLevel} (Suggested)`
      }`
    : "Not calculated";

  useEffect(() => {
    if (hasAssessment) setFactorsOpen(true);
  }, [hasAssessment]);

  function withStartedStatus(
    patch: Partial<Cambra123ZeroToSixAssessment>,
  ): Cambra123ZeroToSixAssessment {
    return {
      ...value,
      completionStatus:
        value.completionStatus === "not-started"
          ? "in-progress"
          : value.completionStatus,
      ...patch,
    };
  }

  function toggleItem(id: Cambra123ZeroToSixItemId, checked: boolean) {
    const selected = new Set(value.yesItemIds);
    if (checked) selected.add(id);
    else selected.delete(id);
    const yesItemIds = cambra123ZeroToSixItems
      .map((item) => item.id)
      .filter((itemId) => selected.has(itemId));
    onChange({
      ...value,
      completionStatus: "complete",
      yesItemIds,
    });
  }

  function resetAssessment() {
    if (
      hasAssessment &&
      !window.confirm(
        "Clear the CAMBRA123 ages 0–6 assessment entered in this note?",
      )
    ) {
      return;
    }
    onChange(createEmptyCambra123ZeroToSixAssessment());
    setFactorsOpen(false);
  }

  return (
    <div className="space-y-5">
      <CollapsibleFieldset
        id="child-recare-cambra-zero-to-six-assessment-factors"
        label="CAMBRA123 assessment factors"
        summary={factorsSummary}
        open={factorsOpen}
        onToggle={() => setFactorsOpen((open) => !open)}
      >
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">CAMBRA123 (2021), ages 0–6</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Check or uncheck Yes responses to recalculate immediately, then
                record the clinician&apos;s final category.
              </p>
            </div>
            <span className="rounded-full border border-sky-300 px-3 py-1 text-xs font-semibold text-sky-900 dark:border-sky-700 dark:text-sky-100">
              {value.completionStatus === "complete"
                ? "Calculated"
                : value.completionStatus === "in-progress"
                  ? "Started"
                  : "Not started"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ItemGroup kind="protective" value={value} onToggle={toggleItem} />
          <div className="space-y-4">
            <ItemGroup
              kind="risk"
              phase="question"
              value={value}
              onToggle={toggleItem}
            />
            <ItemGroup
              kind="risk"
              phase="clinical-exam"
              value={value}
              onToggle={toggleItem}
            />
          </div>
          <div className="space-y-3 xl:col-span-2">
            <ItemGroup
              kind="disease-indicator"
              value={value}
              onToggle={toggleItem}
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-red-300 bg-red-50/70 p-4 text-sm dark:border-red-800 dark:bg-red-950/30">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-sky-700"
                checked={value.severeOrExtensiveRecentDecay}
                onChange={(event) =>
                  onChange({
                    ...value,
                    completionStatus: "complete",
                    severeOrExtensiveRecentDecay: event.target.checked,
                  })
                }
              />
              <span>
                <span className="font-medium">
                  High risk plus extensive or severe recent/existing decay
                </span>
                <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">
                  Clinical modifier for Very High guidance; it does not add
                  score points.
                </span>
              </span>
            </label>
          </div>
        </div>
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-t border-slate-200 pt-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
          onClick={() => setFactorsOpen(false)}
        >
          Collapse assessment
          <DropdownChevron open />
        </button>
      </CollapsibleFieldset>

      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="font-semibold">CAMBRA123 quantitative aid</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
            <p className="text-xs font-medium">Column 1 · Protective</p>
            <p className="mt-1 text-lg font-semibold">
              {result.protectiveYesCount} Yes · {result.column1Score}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
            <p className="text-xs font-medium">Column 2 · Risk</p>
            <p className="mt-1 text-lg font-semibold">
              {result.riskYesCount} Yes · +{result.column2Score}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
            <p className="text-xs font-medium">Column 3 · Disease</p>
            <p className="mt-1 text-lg font-semibold">
              {result.diseaseIndicatorYesCount} Yes · +{result.column3Score}
            </p>
          </div>
          <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-950/30">
            <p className="text-xs font-medium">Total score</p>
            <p className="mt-1 text-lg font-semibold">{result.totalScore}</p>
          </div>
        </div>

        <div className="mt-4 border-l-4 border-sky-600 pl-4" aria-live="polite">
          <h3 className="font-semibold">Suggested CAMBRA123 category</h3>
          <p className="mt-1 text-sm font-semibold">
            {hasAssessment ? result.suggestedLevel : "Not calculated"}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Quantitative score band: {result.scoreLevel}. The selected final
            category is never changed automatically.
          </p>
          <details className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            <summary className="cursor-pointer font-medium text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100">
              Calculation and clinical guidance
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </details>
          {hasAssessment &&
          result.suggestedLevel &&
          value.finalRiskLevel !== result.suggestedLevel ? (
            <button
              type="button"
              className={`${buttonClass} mt-3 bg-sky-700 text-white hover:bg-sky-800`}
              onClick={() =>
                onChange({ ...value, finalRiskLevel: result.suggestedLevel })
              }
            >
              Apply CAMBRA123 suggestion
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FixedChoiceListbox
          id="child-recare-cambra-zero-to-six-final-risk-level"
          label="Final clinician caries-risk category"
          value={value.finalRiskLevel}
          options={riskLevelOptions}
          onChange={(finalRiskLevel) =>
            onChange(withStartedStatus({ finalRiskLevel }))
          }
        />
        {value.completionStatus === "complete" && !value.finalRiskLevel ? (
          <p className="self-end text-sm font-medium text-amber-800 dark:text-amber-200">
            Select the clinician&apos;s final category before treating this as a
            completed clinical record.
          </p>
        ) : null}
        <div className="md:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor="child-recare-cambra-zero-to-six-notes"
          >
            CAMBRA123 notes
          </label>
          <textarea
            id="child-recare-cambra-zero-to-six-notes"
            className={`${formControlClass()} mt-1 min-h-24 resize-y`}
            value={value.notes}
            placeholder="Document clinical judgment, counseling, or management rationale."
            onChange={(event) =>
              onChange(withStartedStatus({ notes: event.target.value }))
            }
          />
        </div>
      </div>

      {hasAssessment ? (
        <button
          type="button"
          className={`${buttonClass} border border-red-300 text-red-800 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950`}
          onClick={resetAssessment}
        >
          Clear CAMBRA123 assessment
        </button>
      ) : null}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        CAMBRA® © The Regents of the University of California. This electronic
        implementation uses the January 2021 ages 0–6 assessment and keeps the
        final determination with the clinician.
      </p>
    </div>
  );
}
