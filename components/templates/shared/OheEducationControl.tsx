"use client";

import { CatalogueMultiCombobox } from "@/components/catalogues/CatalogueMultiCombobox";
import {
  FixedChoiceMultiCombobox,
  type FixedChoiceMultiComboboxGroup,
} from "@/components/forms/FixedChoiceMultiCombobox";
import { formControlClass } from "@/components/forms/controlStyles";

export interface OheEducationValue {
  homeCareInstructionReviewed: boolean;
  ohiAidsReviewed: string[];
  diseaseProcessReviewed: boolean;
  standardOheStatementApplies: boolean;
  oheTopicsReviewed: string[];
  oheNotes: string;
  hygieneGoal: string;
}

const standardCoveredTopics = new Set([
  "Bass brushing",
  "C-shape flossing technique",
  "Caries theory",
  "Caries risk factors",
  "Periodontitis theory",
  "Periodontitis risk factors",
  "Review benefits of Prevident or Opti-Rinse",
]);

const standardIncludedConcepts = [
  "Diagnosis and risk-factor explanation",
  "Periodontitis and caries etiology",
  "Bass brushing demonstration",
  "C-shape flossing demonstration",
  "Prevident or Opti-Rinse benefits",
] as const;

const buttonClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const inputClass = `mt-1 ${formControlClass()}`;

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

function TextareaField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
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

export function OheEducationControl<TValue extends OheEducationValue>({
  value,
  standardStatement,
  topicChoices,
  topicChoiceGroups,
  onChange,
}: {
  value: TValue;
  standardStatement: string;
  topicChoices: readonly string[];
  topicChoiceGroups: readonly FixedChoiceMultiComboboxGroup[];
  onChange: <TKey extends keyof OheEducationValue>(
    key: TKey,
    nextValue: TValue[TKey],
  ) => void;
}) {
  const overlappingTopics = value.oheTopicsReviewed.filter((topic) =>
    standardCoveredTopics.has(topic),
  );
  const hasCoveredLegacySelections =
    value.standardOheStatementApplies &&
    (value.diseaseProcessReviewed || overlappingTopics.length > 0);
  const visibleTopicChoices = value.standardOheStatementApplies
    ? topicChoices.filter(
        (topic) =>
          !standardCoveredTopics.has(topic) ||
          value.oheTopicsReviewed.includes(topic),
      )
    : [...topicChoices];
  const visibleTopicGroups = topicChoiceGroups
    .map((group) => ({
      ...group,
      choices: group.choices.filter((topic) =>
        visibleTopicChoices.includes(topic),
      ),
    }))
    .filter((group) => group.choices.length > 0);

  function clearCoveredLegacySelections() {
    if (
      !window.confirm(
        "Remove the separately selected disease-process and OHE topics already covered by Standard OHE? Other education selections will be preserved.",
      )
    ) {
      return;
    }
    onChange("diseaseProcessReviewed", false);
    onChange(
      "oheTopicsReviewed",
      value.oheTopicsReviewed.filter(
        (topic) => !standardCoveredTopics.has(topic),
      ),
    );
  }

  return (
    <fieldset
      className="space-y-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-label="Education provided today"
    >
      <legend className="px-1 font-semibold">Education provided today</legend>

      <section className="space-y-3" aria-labelledby="standard-ohe-heading">
        <div>
          <h3 id="standard-ohe-heading" className="font-semibold">
            Standard OHE
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {standardStatement}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${buttonClass} bg-sky-700 text-white hover:bg-sky-800`}
            disabled={value.standardOheStatementApplies}
            onClick={() => onChange("standardOheStatementApplies", true)}
          >
            {value.standardOheStatementApplies
              ? "Standard OHE applied"
              : "Apply standard OHE"}
          </button>
          {value.standardOheStatementApplies ? (
            <button
              type="button"
              className={`${buttonClass} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`}
              onClick={() => onChange("standardOheStatementApplies", false)}
            >
              Clear standard OHE
            </button>
          ) : null}
        </div>
        {value.standardOheStatementApplies ? (
          <div className="rounded-lg bg-sky-50 p-3 text-sm text-sky-950 dark:bg-sky-950/40 dark:text-sky-100">
            <p className="font-medium">Included in Standard OHE</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {standardIncludedConcepts.map((concept) => (
                <li key={concept}>{concept}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {hasCoveredLegacySelections ? (
        <div
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <p>
            This draft also documents education separately that is covered by
            Standard OHE. It is preserved for compatibility and may repeat in
            the note.
          </p>
          <button
            type="button"
            className={`${buttonClass} mt-2 border border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50`}
            onClick={clearCoveredLegacySelections}
          >
            Remove covered selections
          </button>
        </div>
      ) : null}

      <section className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <h3 className="font-semibold">Home-care coaching</h3>
        <CheckboxField
          id="adult-hygiene-home-care-reviewed"
          label="Reviewed brushing and flossing frequency recommendations"
          checked={value.homeCareInstructionReviewed}
          onChange={(nextValue) =>
            onChange("homeCareInstructionReviewed", nextValue)
          }
        />
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <h3 className="font-semibold">Additional education</h3>
        {!value.standardOheStatementApplies || value.diseaseProcessReviewed ? (
          <CheckboxField
            id="adult-hygiene-disease-process-reviewed"
            label={
              value.standardOheStatementApplies
                ? "Disease process also documented separately"
                : "Disease process reviewed with patient today"
            }
            checked={value.diseaseProcessReviewed}
            onChange={(nextValue) =>
              onChange("diseaseProcessReviewed", nextValue)
            }
          />
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Disease and risk education is included in Standard OHE.
          </p>
        )}
        <FixedChoiceMultiCombobox
          id="adult-hygiene-ohe-topics"
          label="Additional OHE topics reviewed"
          choices={visibleTopicChoices}
          choiceGroups={visibleTopicGroups}
          values={value.oheTopicsReviewed}
          onChange={(nextValue) => onChange("oheTopicsReviewed", nextValue)}
          customPlaceholder="Search OHE topics"
          customHelpText=""
          showSelectedChips={false}
          allowCustomValues={false}
        />
      </section>

      <section className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <h3 className="font-semibold">Aids and products</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Use this for devices or products reviewed or recommended. Document
          brushing and flossing techniques under Additional education.
        </p>
        <CatalogueMultiCombobox
          id="adult-hygiene-ohi-aids"
          label="OH aids reviewed/recommended"
          catalogueKey="oral-hygiene.aids-reviewed"
          values={value.ohiAidsReviewed}
          onChange={(nextValue) => onChange("ohiAidsReviewed", nextValue)}
          roomySelectionActions
        />
      </section>

      <div className="grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-700 md:grid-cols-2">
        <TextareaField
          id="adult-hygiene-ohe-notes"
          label="OHE notes"
          value={value.oheNotes}
          onChange={(nextValue) => onChange("oheNotes", nextValue)}
          placeholder="Optional OHE details discussed today"
        />
        <TextareaField
          id="adult-hygiene-goal"
          label="Hygiene goal"
          value={value.hygieneGoal}
          onChange={(nextValue) => onChange("hygieneGoal", nextValue)}
        />
      </div>
    </fieldset>
  );
}
