"use client";

import { OralHygieneMethodsControl } from "@/components/templates/shared/OralHygieneMethodsControl";
import type { ReactNode, RefObject } from "react";
import { useCatalogues } from "@/components/catalogues/CatalogueProvider";
import { CatalogueCombobox } from "@/components/catalogues/CatalogueCombobox";
import { ClinicalLocationMultiCombobox } from "@/components/forms/ClinicalLocationMultiCombobox";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { formControlClass } from "@/components/forms/controlStyles";
import {
  RapidChoice,
  RapidDisclosure,
  RapidMultiChoice,
  RapidStringChoice,
  RapidText,
  rapidActionClass,
} from "@/components/forms/RapidChoiceControls";
import type { CatalogueKey } from "@/lib/catalogues/catalogue";
import type { AdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import {
  brushingFrequencyChoices,
  flossingFrequencyChoices,
  homeCareOheTopicChoices,
  diseaseAndRiskOheTopicChoices,
} from "@/lib/templates/adultHygiene2026";
import { applyPatientChiefConcernSelectionRules } from "@/lib/templates/patientChiefConcern";
import {
  findingAmounts,
  formatRapidFinding,
  parseRapidFinding,
  type RapidFindingKind,
} from "@/lib/templates/rapidEntry";
import { getTemplateSectionId } from "@/lib/templates/sectionNavigation";
import type { ExamStatus } from "@/lib/templates/recareExam";

type UpdateField = <K extends keyof AdultHygiene2026Form>(
  key: K,
  value: AdultHygiene2026Form[K]
) => void;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      id={getTemplateSectionId(title)}
      aria-labelledby={`${getTemplateSectionId(title)}-heading`}
      className="scroll-mt-24 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700"
    >
      <h2
        id={`${getTemplateSectionId(title)}-heading`}
        className="text-lg font-semibold"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CatalogueChoices({
  catalogueKey,
  label,
  value,
  onChange,
}: {
  catalogueKey: CatalogueKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { getItems } = useCatalogues();
  return (
    <RapidStringChoice
      label={label}
      value={value}
      choices={getItems(catalogueKey)
        .slice(0, 6)
        .map((item) => item.label)}
      onChange={onChange}
    />
  );
}

function Finding({
  kind,
  form,
  onChange,
}: {
  kind: RapidFindingKind;
  form: AdultHygiene2026Form;
  onChange: UpdateField;
}) {
  const label = kind[0].toUpperCase() + kind.slice(1);
  const choice = form[`${kind}Choice`];
  const areas = form[`${kind}Areas`];
  const comment = form[`${kind}Comment`];
  const facets = parseRapidFinding(kind, choice);
  const updateChoice = (next: string) => {
    if (
      next === "None" &&
      (areas.length || comment.trim()) &&
      !window.confirm(
        `Set ${label} to None and clear its documented areas and comment?`
      )
    )
      return;
    onChange(`${kind}Choice`, next);
    if (next === "None") {
      onChange(`${kind}Areas`, []);
      onChange(`${kind}Comment`, "");
    }
  };
  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className="mb-3 font-semibold">{label}</legend>
      {facets ? (
        <>
          <RapidChoice
            label={`${label} amount`}
            value={facets.amount}
            options={[
              { value: "None", label: "None" },
              ...findingAmounts(kind).map((value) => ({
                value,
                label: value[0].toUpperCase() + value.slice(1),
              })),
              { value: "", label: "Not documented" },
            ]}
            onChange={(amount) =>
              updateChoice(formatRapidFinding({ ...facets, amount }))
            }
          />
          {facets.amount !== "None" &&
          (facets.amount || facets.distribution || facets.locations.length) ? (
            <>
              <RapidChoice
                label={`${label} distribution`}
                value={facets.distribution}
                options={[
                  { value: "Localized", label: "Localized" },
                  { value: "Generalized", label: "Generalized" },
                  { value: "", label: "Not specified" },
                ]}
                onChange={(distribution) =>
                  updateChoice(formatRapidFinding({ ...facets, distribution }))
                }
              />
              {kind === "plaque" || kind === "calculus" ? (
                <RapidMultiChoice
                  label={`${label} location`}
                  values={facets.locations}
                  choices={["marginal", "interproximal"]}
                  onChange={(locations) =>
                    updateChoice(formatRapidFinding({ ...facets, locations }))
                  }
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-sm">
            Custom {kind} wording: {choice}
          </p>
          <button
            type="button"
            className={rapidActionClass}
            onClick={() => {
              if (
                window.confirm(
                  `Replace custom ${kind} wording with direct choices? Areas and comments will be retained.`
                )
              )
                updateChoice("");
            }}
          >
            Use direct {kind} choices
          </button>
        </>
      )}
      {choice ? (
        <button
          type="button"
          className={rapidActionClass}
          onClick={() => updateChoice("")}
        >
          Clear {kind} selection
        </button>
      ) : null}
      {facets?.amount !== "None" || areas.length || comment ? (
        <RapidDisclosure
          label={`Add ${kind} location or detail`}
          documented={Boolean(areas.length || comment)}
        >
          <ClinicalLocationMultiCombobox
            id={`rapid-${kind}-areas`}
            label={`${label} areas`}
            preset="finding"
            values={areas}
            onChange={(value) => onChange(`${kind}Areas`, value)}
          />
          <RapidText
            label={`${label} comment`}
            value={comment}
            onChange={(value) => onChange(`${kind}Comment`, value)}
          />
        </RapidDisclosure>
      ) : null}
    </fieldset>
  );
}

export function AdultHygieneRapidEntry({
  form,
  onChange,
  patientIdRef,
  dentistRef,
  patientIdError,
  providerError,
  visitDetails,
  vitalsControls,
  gingivalControls,
  periodontalControls,
  extraoralControls,
  intraoralControls,
  recordsControls,
  educationControls,
  treatmentControls,
  cariesControls,
  onExtraoralStatusChange,
  onIntraoralStatusChange,
  onDetailed,
}: {
  form: AdultHygiene2026Form;
  onChange: UpdateField;
  patientIdRef: RefObject<HTMLInputElement | null>;
  dentistRef: RefObject<HTMLInputElement | null>;
  patientIdError: string;
  providerError: string;
  visitDetails: ReactNode;
  vitalsControls: ReactNode;
  gingivalControls: ReactNode;
  periodontalControls: ReactNode;
  extraoralControls: ReactNode;
  intraoralControls: ReactNode;
  recordsControls: ReactNode;
  educationControls: ReactNode;
  treatmentControls: ReactNode;
  cariesControls: ReactNode;
  onExtraoralStatusChange: (value: ExamStatus) => void;
  onIntraoralStatusChange: (value: ExamStatus) => void;
  onDetailed: () => void;
}) {
  const { getItems } = useCatalogues();
  const examOptions = [
    { value: "wnl", label: "WNL" },
    { value: "findings", label: "Findings" },
    { value: "not-assessed", label: "Not assessed" },
  ] as const;
  return (
    <div className="space-y-6" data-testid="rapid-entry">
      <Section title="Visit">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium">
            Patient ID
            <input
              ref={patientIdRef}
              className={`mt-1 ${formControlClass()}`}
              autoComplete="off"
              value={form.patientId}
              aria-invalid={Boolean(patientIdError)}
              aria-describedby={
                patientIdError ? "rapid-patient-error" : undefined
              }
              onChange={(event) => onChange("patientId", event.target.value)}
            />
          </label>
          <CatalogueCombobox
            id="rapid-dentist"
            label="Dentist"
            catalogueKey="visit-team.dentist"
            value={form.dentist}
            inputRef={dentistRef}
            onChange={(value) => onChange("dentist", value)}
          />
          <CatalogueCombobox
            id="rapid-rdh"
            label="RDH"
            catalogueKey="visit-team.rdh"
            value={form.rdh}
            onChange={(value) => onChange("rdh", value)}
          />
          <CatalogueCombobox
            id="rapid-rda"
            label="RDA"
            catalogueKey="visit-team.rda"
            value={form.rda}
            onChange={(value) => onChange("rda", value)}
          />
        </div>
        {patientIdError ? (
          <p id="rapid-patient-error" role="alert">
            {patientIdError}
          </p>
        ) : null}
        {providerError ? <p role="alert">{providerError}</p> : null}
        <RapidMultiChoice
          label="Consent given by"
          values={[
            ...(form.consentPatient ? ["Patient"] : []),
            ...(form.consentParent ? ["Parent"] : []),
            ...(form.consentLegalGuardian ? ["Legal guardian"] : []),
          ]}
          choices={["Patient", "Parent", "Legal guardian"]}
          onChange={(values) => {
            onChange("consentPatient", values.includes("Patient"));
            onChange("consentParent", values.includes("Parent"));
            onChange("consentLegalGuardian", values.includes("Legal guardian"));
          }}
        />
        <CatalogueChoices
          catalogueKey="medical-history.review"
          label="Medical history reviewed"
          value={form.medicalHistoryReview}
          onChange={(value) => onChange("medicalHistoryReview", value)}
        />
        <RapidMultiChoice
          label="Patient chief concern"
          values={form.patientChiefConcern}
          choices={getItems("patient.chief-concerns")
            .slice(0, 6)
            .map((item) => item.label)}
          onChange={(values) =>
            onChange(
              "patientChiefConcern",
              applyPatientChiefConcernSelectionRules(
                form.patientChiefConcern,
                values
              )
            )
          }
        />
        <RapidText
          label="Hygiene area of concern"
          value={form.hygieneAreaOfConcern}
          onChange={(value) => onChange("hygieneAreaOfConcern", value)}
        />
        <label className="block text-sm font-medium">
          Sterilization codes
          <input
            className={`mt-1 ${formControlClass()}`}
            value={form.mieleCodes}
            onChange={(event) => onChange("mieleCodes", event.target.value)}
          />
        </label>
        {vitalsControls}
        <RapidDisclosure label="More visit details">
          {visitDetails}
        </RapidDisclosure>
      </Section>
      <Section title="Oral Hygiene">
        <OralHygieneMethodsControl
          value={form}
          onChange={onChange}
          brushingFrequencyControl={
            <RapidStringChoice
              label="Brushing frequency"
              value={form.brushingFrequency}
              choices={brushingFrequencyChoices}
              onChange={(value) => onChange("brushingFrequency", value)}
            />
          }
          flossingFrequencyControl={
            <RapidStringChoice
              label="Flossing frequency"
              value={form.flossingFrequency}
              choices={flossingFrequencyChoices}
              onChange={(value) => onChange("flossingFrequency", value)}
            />
          }
        />
        <CatalogueChoices
          catalogueKey="oral-hygiene.compliance"
          label="Oral hygiene compliance"
          value={form.oralHygieneCompliance}
          onChange={(value) => onChange("oralHygieneCompliance", value)}
        />
        <RapidText
          label="Oral hygiene compliance comment"
          value={form.oralHygieneComplianceComment}
          onChange={(value) => onChange("oralHygieneComplianceComment", value)}
        />
      </Section>
      <Section title="Hygiene Findings">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 24rem), 1fr))",
          }}
        >
          {(["plaque", "calculus", "stain", "bleeding"] as const).map(
            (kind) => (
              <Finding key={kind} kind={kind} form={form} onChange={onChange} />
            )
          )}
        </div>
      </Section>
      <Section title="Gingiva and Periodontal Assessment">
        {gingivalControls}
        {periodontalControls}
        <CatalogueChoices
          catalogueKey="periodontal.fmp-done"
          label="FMP done"
          value={form.fmpDone}
          onChange={(value) => onChange("fmpDone", value)}
        />
        <RapidText
          label="Recession"
          value={form.recession}
          onChange={(value) => onChange("recession", value)}
        />
      </Section>
      <Section title="Examination and Records">
        <div className="grid gap-4 md:grid-cols-2">
          <RapidChoice
            label="EOE"
            value={form.extraoralStatus}
            options={examOptions}
            onChange={onExtraoralStatusChange}
          />
          <RapidChoice
            label="IOE"
            value={form.intraoralStatus}
            options={examOptions}
            onChange={onIntraoralStatusChange}
          />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          EOE and IOE are included in Complete and Recare notes.
        </p>
        <RapidDisclosure
          label="EOE structures and findings"
          documented={
            form.extraoralStatus === "findings" ||
            Boolean(
              form.structuredExtraoralFindings?.length || form.extraoralFindings
            )
          }
        >
          {extraoralControls}
        </RapidDisclosure>
        <RapidDisclosure
          label="IOE structures and findings"
          documented={
            form.intraoralStatus === "findings" ||
            Boolean(
              form.structuredIntraoralFindings?.length || form.intraoralFindings
            )
          }
        >
          {intraoralControls}
        </RapidDisclosure>
        {recordsControls}
        {cariesControls}
        <button type="button" className={rapidActionClass} onClick={onDetailed}>
          Tooth-specific findings and other examination details
        </button>
      </Section>
      <Section title="Education and Treatment">
        {form.standardOheStatementApplies ? (
          <p className="text-sm">
            Standard OHE is applied. Review or change it under More education.
          </p>
        ) : (
          <RapidMultiChoice
            label="OHE reviewed"
            values={form.oheTopicsReviewed}
            choices={[
              ...homeCareOheTopicChoices,
              ...diseaseAndRiskOheTopicChoices,
            ]}
            onChange={(value) => onChange("oheTopicsReviewed", value)}
          />
        )}
        <RapidDisclosure label="More education, aids and goals">
          {educationControls}
        </RapidDisclosure>
        {treatmentControls}
      </Section>
      <Section title="Recommendations">
        <NativeChoiceControl
          type="checkbox"
          checked={form.treatmentRecommendedHygieneMaintenance}
          onChange={(value) =>
            onChange("treatmentRecommendedHygieneMaintenance", value)
          }
          className="min-h-11"
        >
          Recommend hygiene maintenance
        </NativeChoiceControl>
        {form.treatmentPlan.length ? (
          <p className="text-sm">
            A combined treatment plan is documented in Detailed mode and takes
            precedence over this recommendation.
          </p>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          <CatalogueChoices
            catalogueKey="scheduling.hygiene-interval"
            label="Recommended hygiene interval"
            value={form.hygieneInterval}
            onChange={(value) => onChange("hygieneInterval", value)}
          />
          <CatalogueChoices
            catalogueKey="scheduling.recall-interval"
            label="Recommended recare interval"
            value={form.recallInterval}
            onChange={(value) => onChange("recallInterval", value)}
          />
          <CatalogueChoices
            catalogueKey="scheduling.hygiene-next-visit"
            label="Next hygiene visit"
            value={form.nextVisit}
            onChange={(value) => onChange("nextVisit", value)}
          />
          <CatalogueChoices
            catalogueKey="scheduling.dentist-next-visit"
            label="Next dental visit"
            value={form.dentalNextVisit}
            onChange={(value) => onChange("dentalNextVisit", value)}
          />
        </div>
        <RapidText
          label="Other treatment recommended"
          value={form.otherTreatmentRecommended}
          onChange={(value) => onChange("otherTreatmentRecommended", value)}
        />
        <RapidText
          label="Additional notes"
          value={form.additionalNotes}
          onChange={(value) => onChange("additionalNotes", value)}
        />
        <button type="button" className={rapidActionClass} onClick={onDetailed}>
          Open Detailed for additional findings and follow-up
        </button>
      </Section>
    </div>
  );
}
