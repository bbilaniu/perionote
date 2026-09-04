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
import { GeneratedNotePanel } from "@/components/templates/shared/GeneratedNotePanel";
import {
  interactiveTemplateClearFormWarning,
  InteractiveTemplateWorkspace,
} from "@/components/templates/shared/InteractiveTemplateWorkspace";
import { LocalAnesthesiaControl } from "@/components/templates/shared/LocalAnesthesiaControl";
import { PediatricCambra123Control } from "@/components/templates/shared/PediatricCambra123Control";
import { TreatmentCompletedList } from "@/components/templates/shared/TreatmentCompletedList";
import { useLocalInteractiveDraft } from "@/components/templates/shared/useLocalInteractiveDraft";
import { isDesensitizingRemineralizingProductMetadata } from "@/lib/catalogues/catalogue";
import type {
  ChildDocumentationStatus,
  ChildExamStatus,
  ChildOcclusionAssessment,
  ChildRecareHygieneForm,
  ChildRecareHygieneOutput,
} from "@/lib/templates/childRecareHygiene";
import {
  createEmptyChildRecareHygieneForm,
  hasRequiredChildRecareHygieneFields,
} from "@/lib/templates/childRecareHygiene";
import { matchesDraftShape } from "@/lib/templates/localDrafts";
import {
  createTemplateSectionNavigation,
  getTemplateSectionId,
} from "@/lib/templates/sectionNavigation";
import {
  createTreatmentEntryFromCatalogueItem,
  recareExamTreatmentPreset,
  treatmentCompletedEntryIdentity,
  type AdultHygieneTreatmentCompletedEntry,
} from "@/lib/templates/adultHygieneTreatment";
import { buildChildRecareHygieneSummary } from "@/lib/templates/summary/buildChildRecareHygieneSummary";
import { formatRecareExamLocalTimestamp } from "@/lib/templates/summary/buildRecareExamSummary";
import type { InteractiveTemplateProps } from "@/lib/templates/types";
import {
  copyCambra123SixAdultAssessment,
  copyCambra123ZeroToSixAssessment,
} from "@/lib/templates/cambra123";

const templateId = "child-recare-exam-hygiene-notes";
const emptyForm = createEmptyChildRecareHygieneForm();
const emptySerializedForm = JSON.stringify(emptyForm);
const childDraftArrayItemShapes = {
  "cambra123ZeroToSixAssessment.yesItemIds": "",
  "cambra123SixAdultAssessment.yesItemIds": "",
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
} as const;
const controlClass = formControlClass();
const checkboxClass = "mt-1 h-4 w-4 accent-sky-700";

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

const occlusionAssessmentOptions: Array<{
  value: ChildOcclusionAssessment;
  label: string;
}> = [
  { value: "terminal-plane", label: "Terminal plane (primary dentition)" },
  {
    value: "molar-classification",
    label: "Molar classification (permanent first molars)",
  },
];

const childRecareHygieneSections = createTemplateSectionNavigation([
  "Patient and Visit Context",
  "Visit Team",
  "Consent, Medical History, and Sterilization",
  "Records and dental exam",
  "Caries Risk Assessment",
  "Hygiene assessment and treatment",
  "Communication and follow-up",
]);

export function isValidChildRecareHygieneForm(
  value: unknown,
): value is ChildRecareHygieneForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return matchesDraftShape(
    { ...emptyForm, ...(value as Record<string, unknown>) },
    emptyForm,
    childDraftArrayItemShapes,
  );
}

function isEmptyForm(value: ChildRecareHygieneForm): boolean {
  return (
    JSON.stringify({
      ...value,
      dentist: "",
      rdh: "",
      rda: "",
      class5IndicatorStatus: "not-documented",
      ppeStatementApplies: false,
    }) === emptySerializedForm
  );
}

function createDefaultChildRecareHygieneForm(): ChildRecareHygieneForm {
  return {
    ...createEmptyChildRecareHygieneForm(),
    class5IndicatorStatus: "yes",
    ppeStatementApplies: true,
  };
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
        className={checkboxClass}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
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
  readOnly,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  suffix?: string;
  error?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  readOnly?: boolean;
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
          readOnly={readOnly}
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
  detailType = "text",
  detailSuffix,
  onStatusChange,
  onDetailChange,
}: {
  id: string;
  label: string;
  status: ChildDocumentationStatus;
  detail?: string;
  detailLabel?: string;
  detailType?: "text" | "number";
  detailSuffix?: string;
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
          type={detailType}
          suffix={detailSuffix}
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
    createDefaultChildRecareHygieneForm,
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
  const { providerDefaultsStorageStatus, getProviderDefault, getItems } =
    useCatalogues();

  const localDraft = useLocalInteractiveDraft({
    templateId,
    form,
    startedAt,
    isEmpty: isEmptyForm,
    isValidForm: isValidChildRecareHygieneForm,
    onRestore: (draft) => {
      const emptyForm = createEmptyChildRecareHygieneForm();
      const hasOcclusionAssessment = Object.prototype.hasOwnProperty.call(
        draft.form,
        "occlusionAssessment",
      );
      setForm({
        ...emptyForm,
        ...draft.form,
        cambra123ZeroToSixAssessment: copyCambra123ZeroToSixAssessment(
          draft.form.cambra123ZeroToSixAssessment ??
            emptyForm.cambra123ZeroToSixAssessment,
        ),
        cambra123SixAdultAssessment: copyCambra123SixAdultAssessment(
          draft.form.cambra123SixAdultAssessment ??
            emptyForm.cambra123SixAdultAssessment,
        ),
        ...(!hasOcclusionAssessment && draft.form.molarOcclusion.trim()
          ? { occlusionAssessment: "molar-classification" as const }
          : {}),
      });
      setStartedAt(new Date(draft.startedAt));
      setPatientIdError("");
      setProviderError("");
      setCopyMessage("");
    },
  });

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
      combined: buildChildRecareHygieneSummary(form, {
        output: "combined",
        ...(startedAt ? { startedAt } : {}),
      }),
      dentist: buildChildRecareHygieneSummary(form, {
        output: "dentist",
        ...(startedAt ? { startedAt } : {}),
      }),
      hygienist: buildChildRecareHygieneSummary(form, {
        output: "hygienist",
        ...(startedAt ? { startedAt } : {}),
      }),
    }),
    [form, startedAt],
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

  function nextTreatmentEntryId(): string {
    return `child-treatment-${Date.now()}-${
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(16).slice(2)
    }`;
  }

  function pediatricOheRecap(): string {
    return [
      form.ohiReviewed ? "OHI reviewed" : "",
      form.brushingTechnique.trim(),
      form.flossingTechnique.trim(),
    ]
      .filter(Boolean)
      .join("; ");
  }

  function applyPediatricStandardCare() {
    const standardIds = [
      "seed.hygiene-treatment.completed.scaling",
      "seed.hygiene-treatment.completed.selective-polish",
      "seed.hygiene-treatment.completed.ohe",
      "seed.hygiene-treatment.completed.fluoride-varnish-application",
    ];
    const itemsById = new Map(
      getItems("hygiene-treatment.completed").map((item) => [item.id, item]),
    );
    const existing = new Set(
      form.treatmentCompleted.map(treatmentCompletedEntryIdentity),
    );
    const additions = standardIds.flatMap((id) => {
      const item = itemsById.get(id);
      if (!item) return [];
      const entry = createTreatmentEntryFromCatalogueItem(
        item,
        nextTreatmentEntryId(),
        pediatricOheRecap(),
      );
      if (!entry || existing.has(treatmentCompletedEntryIdentity(entry))) {
        return [];
      }
      const adjusted: AdultHygieneTreatmentCompletedEntry = {
        ...entry,
        procedureSource:
          entry.procedureKind === "ohe" ? "ohe" : "standard-treatment",
        ...(entry.procedureKind === "scaling"
          ? { quantity: form.scalingUnits.trim() || "0.5" }
          : {}),
        ...(entry.procedureKind === "polish" && form.polishDetails.trim()
          ? { product: form.polishDetails.trim() }
          : {}),
        ...(entry.productApplicationType === "fluoride-varnish" &&
        form.fluorideDetails.trim()
          ? { product: form.fluorideDetails.trim() }
          : {}),
      };
      existing.add(treatmentCompletedEntryIdentity(adjusted));
      return [adjusted];
    });
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
    const entry: AdultHygieneTreatmentCompletedEntry = {
      id: nextTreatmentEntryId(),
      ...recareExamTreatmentPreset,
      toothAreas: [...recareExamTreatmentPreset.toothAreas],
    };
    updateField("treatmentCompleted", [entry, ...form.treatmentCompleted]);
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
      !window.confirm(interactiveTemplateClearFormWarning)
    ) {
      return false;
    }
    localDraft.beginNewDraft();
    setForm({
      ...createDefaultChildRecareHygieneForm(),
      dentist: getProviderDefault("visit-team.dentist")?.label ?? "",
      rdh: getProviderDefault("visit-team.rdh")?.label ?? "",
      rda: getProviderDefault("visit-team.rda")?.label ?? "",
    });
    setStartedAt(new Date());
    setPatientIdError("");
    setProviderError("");
    setCopyMessage("");
    return true;
  }

  return (
    <InteractiveTemplateWorkspace
      presentation={presentation}
      sections={childRecareHygieneSections}
      formRevision={JSON.stringify(form)}
      onSubmit={(event) => {
          event.preventDefault();
          void copyNote();
      }}
      onLoadDemo={() => {
        setForm({ ...fixture });
        setPatientIdError("");
        setProviderError("");
        setCopyMessage("Synthetic demo data loaded.");
      }}
      onReset={resetForm}
      draftRecovery={{
        templateId,
        templateName: presentation.title,
        currentDraftId: localDraft.currentDraftId,
        drafts: localDraft.recoverableDrafts,
        lastSavedAt: localDraft.lastSavedAt,
        restoredAt: localDraft.restoredAt,
        storageError: localDraft.storageError,
        onRestore: localDraft.restoreDraft,
        onSaveCurrent: localDraft.saveNow,
      }}
      generatedNote={(headerAction) => (
        <GeneratedNotePanel
          textareaId="child-recare-summary"
          accessibleLabel={`Generated ${outputLabel.toLowerCase()} note`}
          value={summary}
          copyLabel={`Copy ${outputLabel.toLowerCase()} note`}
          copyDisabled={!startedAt}
          statusMessage={copyMessage}
          description="Select the audience-specific view. The visible preview is copied unchanged."
          headerAction={headerAction}
          controls={
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
          }
        />
      )}
    >

          <Section
            title="Patient and Visit Context"
            description="Identify the patient and document the reason for today's pediatric visit."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="child-recare-patient-id"
                label="Patient ID"
                value={form.patientId}
                inputRef={patientIdRef}
                error={patientIdError}
                onChange={(value) => updateField("patientId", value)}
              />
              <TextField
                id="child-recare-note-started"
                label="Note started"
                value={
                  startedAt ? formatRecareExamLocalTimestamp(startedAt) : ""
                }
                readOnly
                onChange={() => undefined}
              />
            </div>
            <CatalogueCombobox
              id="child-recare-chief-concern"
              label="Patient's chief concern"
              catalogueKey="patient.chief-concerns"
              value={form.chiefConcern}
              onChange={(value) => updateField("chiefConcern", value)}
            />
          </Section>

          <Section
            title="Visit Team"
            description="At least one provider field is required before copying."
          >
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
          </Section>

          <Section title="Consent, Medical History, and Sterilization">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <CheckboxField
                  id="child-recare-class5"
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
                  id="child-recare-ppe"
                  label="Standard PPE statement applies"
                  checked={form.ppeStatementApplies}
                  onChange={(value) =>
                    updateField("ppeStatementApplies", value)
                  }
                />
              </div>
              <TextField
                id="child-recare-miele"
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
                {(
                  [
                    ["consentPatient", "patient", "Patient"],
                    ["consentParent", "parent", "Parent"],
                    ["consentLegalGuardian", "guardian", "Legal guardian"],
                  ] as const
                ).map(([key, idSuffix, label]) => (
                  <CheckboxField
                    key={key}
                    id={`child-recare-consent-${idSuffix}`}
                    label={label}
                    checked={form[key]}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        [key]: value,
                        consentBy: "",
                      }));
                      setCopyMessage("");
                    }}
                  />
                ))}
              </div>
              {form.consentPatient ||
              form.consentParent ||
              form.consentLegalGuardian ? (
                <TextField
                  id="child-recare-consent-details"
                  label="Consent details"
                  value={form.consentDetails}
                  onChange={(value) => updateField("consentDetails", value)}
                />
              ) : form.consentBy ? (
                <TextField
                  id="child-recare-legacy-consent"
                  label="Legacy consent source"
                  value={form.consentBy}
                  onChange={(value) => updateField("consentBy", value)}
                />
              ) : null}
            </fieldset>

            <CatalogueCombobox
              id="child-recare-medical-history"
              label="Medical history reviewed"
              catalogueKey="medical-history.review"
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
            <div className="space-y-4">
              <FixedChoiceListbox
                id="child-recare-occlusion-assessment"
                label="Occlusion assessment"
                value={form.occlusionAssessment}
                options={occlusionAssessmentOptions}
                onChange={(value) =>
                  updateField("occlusionAssessment", value)
                }
              />
              {form.occlusionAssessment === "terminal-plane" ? (
                <CatalogueCombobox
                  id="child-recare-terminal-plane"
                  label="Terminal plane"
                  catalogueKey="clinical-exam.terminal-plane"
                  value={form.terminalPlane}
                  onChange={(value) => updateField("terminalPlane", value)}
                />
              ) : (
                <CatalogueCombobox
                  id="child-recare-molar-occlusion"
                  label="Molar classification"
                  catalogueKey="clinical-exam.molar-occlusion"
                  value={form.molarOcclusion}
                  onChange={(value) => updateField("molarOcclusion", value)}
                />
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CatalogueCombobox
                id="child-recare-skeletal-classification"
                label="Skeletal classification"
                catalogueKey="clinical-exam.skeletal-occlusion"
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

          <Section
            title="Caries Risk Assessment"
            description="Select the CAMBRA123 age-band instrument used for this encounter."
          >
            <PediatricCambra123Control
              instrument={form.cambra123Instrument}
              zeroToSixAssessment={form.cambra123ZeroToSixAssessment}
              sixAdultAssessment={form.cambra123SixAdultAssessment}
              cariesStatus={form.cariesStatus}
              onInstrumentChange={(value) =>
                updateField("cambra123Instrument", value)
              }
              onZeroToSixChange={(value) =>
                updateField("cambra123ZeroToSixAssessment", value)
              }
              onSixAdultChange={(value) =>
                updateField("cambra123SixAdultAssessment", value)
              }
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
                detailType="number"
                detailSuffix="units"
                onStatusChange={(value) => updateField("scalingStatus", value)}
                onDetailChange={(value) => updateField("scalingUnits", value)}
              />
              <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <FixedChoiceListbox
                  id="child-recare-polish-status"
                  label="Polish completed"
                  value={form.polishStatus}
                  options={documentationOptions}
                  onChange={(value) => updateField("polishStatus", value)}
                />
                {form.polishStatus === "yes" ? (
                  <CatalogueCombobox
                    id="child-recare-polish-details"
                    label="Polishing material"
                    catalogueKey="hygiene-treatment.polishing-products"
                    value={form.polishDetails}
                    onChange={(value) => updateField("polishDetails", value)}
                    showAllSuggestionsWhenSelected
                  />
                ) : null}
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <FixedChoiceListbox
                  id="child-recare-fluoride-status"
                  label="Fluoride completed"
                  value={form.fluorideStatus}
                  options={documentationOptions}
                  onChange={(value) => updateField("fluorideStatus", value)}
                />
                {form.fluorideStatus === "yes" ? (
                  <CatalogueCombobox
                    id="child-recare-fluoride-details"
                    label="Fluoride applied"
                    catalogueKey="hygiene-treatment.desensitizer"
                    value={form.fluorideDetails}
                    rememberMetadata={{
                      kind: "desensitizing-remineralizing-product",
                      productType: "fluoride-varnish",
                    }}
                    suggestionFilter={(item) => {
                      const metadata = item.metadata;
                      return (
                        isDesensitizingRemineralizingProductMetadata(
                          metadata,
                        ) && metadata.productType === "fluoride-varnish"
                      );
                    }}
                    onChange={(value) => updateField("fluorideDetails", value)}
                    showAllSuggestionsWhenSelected
                  />
                ) : null}
              </div>
            </div>
            <TreatmentCompletedList
              entries={form.treatmentCompleted}
              oheRecap={pediatricOheRecap()}
              onApplyStandard={applyPediatricStandardCare}
              standardActionLabel="Apply standard pediatric care"
              onApplyRecare={applyRecareExam}
              onChange={(value) => updateField("treatmentCompleted", value)}
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
              <div className="self-start">
                <label
                  className="text-sm font-medium"
                  htmlFor="child-recare-booked"
                >
                  Booked date
                </label>
                <IsoDateInput
                  id="child-recare-booked"
                  label="Booked date"
                  value={form.bookedDate}
                  onChange={(value) => updateField("bookedDate", value)}
                />
              </div>
            </div>
          </Section>
    </InteractiveTemplateWorkspace>
  );
}
