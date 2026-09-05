import {
  createEmptyOralHygieneMethods,
  type OralHygieneMethods,
} from "@/lib/templates/oralHygieneMethods";
import type {
  DocumentationStatus,
  ExamStatus,
  PremedicationStatus,
  RecareExtraoralFinding,
  RecareIntraoralFinding,
  RecareOcclusalFinding,
  RecareToothFinding,
  RecareTreatmentEntry,
  RetainerStatus,
} from "@/lib/templates/recareExam";
import {
  createEmptyGingivalDescriptionAssessment,
  type GingivalDescriptionAssessment,
} from "@/lib/templates/gingivalDescriptionCatalog";
import {
  createEmptyPeriodontalClassification,
  type PeriodontalClassification,
} from "@/lib/templates/periodontalClassification";
import type { AdultHygieneTreatmentCompletedEntry } from "@/lib/templates/adultHygieneTreatment";
import {
  createEmptyLocalAnesthesiaValue,
  type LocalAnesthesiaEntry,
} from "@/lib/templates/localAnesthesia";
import type { VitalsReading } from "@/lib/templates/vitalsReadings";
import {
  createEmptyCambra123SixAdultAssessment,
  type Cambra123SixAdultAssessment,
} from "@/lib/templates/cambra123";

export {
  standardTreatmentCompletedPreset,
  type AdultHygieneTreatmentCompletedEntry,
} from "@/lib/templates/adultHygieneTreatment";

export function resolveOcclusalSplintState(
  form: Pick<
    AdultHygiene2026Form,
    | "occlusalSplintStatus"
    | "occlusalSplintUseStatus"
    | "nightGuardStatus"
    | "nightGuardUseStatus"
  >,
): {
  status: DocumentationStatus;
  useStatus: DocumentationStatus;
} {
  const canonicalStatus =
    form.occlusalSplintStatus ?? "not-documented";
  if (canonicalStatus !== "not-documented") {
    return {
      status: canonicalStatus,
      useStatus: form.occlusalSplintUseStatus ?? "not-documented",
    };
  }
  return {
    status: form.nightGuardStatus ?? "not-documented",
    useStatus: form.nightGuardUseStatus ?? "not-documented",
  };
}

export const plaqueChoices = [
  "None",
  "Localized mild interproximal",
  "Localized moderate interproximal",
  "Localized heavy interproximal",
  "Generalized mild interproximal",
  "Generalized moderate interproximal",
  "Generalized heavy interproximal",
  "Localized mild marginal",
  "Localized moderate marginal",
  "Localized heavy marginal",
] as const;

export const stainChoices = [
  "None",
  "Localized slight",
  "Localized moderate",
  "Localized heavy",
  "Generalized slight",
  "Generalized moderate",
  "Generalized heavy",
] as const;

export const calculusChoices = [
  "None",
  "Localized mild interproximal",
  "Localized moderate interproximal",
  "Localized heavy interproximal",
  "Localized mild marginal",
  "Localized moderate marginal",
  "Localized heavy marginal",
  "Generalized mild marginal/interproximal",
  "Generalized moderate marginal/interproximal",
  "Generalized heavy marginal/interproximal",
] as const;

export const bleedingChoices = [
  "None",
  "Localized mild",
  "Localized moderate",
  "Localized severe",
  "Generalized mild",
  "Generalized moderate",
  "Generalized severe",
] as const;

export const flossingFrequencyChoices = [
  "Flossing 1x/day",
  "Flossing 2x/day",
  "Flossing 3x/day",
  "Never flossing",
  "Flossing 1–2x/week",
  "Flossing 3x/week",
  "Seldom flossing",
] as const;

export const brushingFrequencyChoices = [
  "Brushing 1x/day",
  "Brushing 2x/day",
  "Brushing 3x/day",
  "Never brushing",
] as const;

export const homeCareOheTopicChoices = [
  "Bass brushing",
  "C-shape flossing technique",
  "Sulcabrush and interdental brush technique",
] as const;

export const diseaseAndRiskOheTopicChoices = [
  "Caries theory",
  "Caries risk factors",
  "Periodontitis theory",
  "Periodontitis risk factors",
] as const;

export const preventionAndMaintenanceOheTopicChoices = [
  "Review benefits of Prevident or Opti-Rinse",
  "Importance of maintaining the recommended hygiene interval",
  "Review of benefits of a bruxism guard, effects of clenching and grinding on hard and soft tissues",
  "Review of importance of maintaining a 4-month recall",
] as const;

export const oheTopicChoices = [
  ...homeCareOheTopicChoices,
  ...diseaseAndRiskOheTopicChoices,
  ...preventionAndMaintenanceOheTopicChoices,
] as const;

export const treatmentToothAreaChoices = [
  "full mouth",
  "maxilla",
  "mandible",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
] as const;

export function normalizeTreatmentToothArea(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-CA");
}

export function canonicalTreatmentToothArea(value: string) {
  const normalized = normalizeTreatmentToothArea(value);
  return treatmentToothAreaChoices.find(
    (choice) => normalizeTreatmentToothArea(choice) === normalized
  );
}

export function orderTreatmentToothAreas(values: string[]) {
  const normalizedValues = new Set(values.map(normalizeTreatmentToothArea));
  const fixedValues = treatmentToothAreaChoices.filter((choice) =>
    normalizedValues.has(normalizeTreatmentToothArea(choice))
  );
  const seen = new Set(fixedValues.map(normalizeTreatmentToothArea));
  const customValues = values
    .map((value) => value.trim())
    .filter((value) => {
      const normalized = normalizeTreatmentToothArea(value);
      if (
        !normalized ||
        canonicalTreatmentToothArea(value) ||
        seen.has(normalized)
      ) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  return [...fixedValues, ...customValues];
}

export type CariesRiskLevel = "" | "Low" | "Moderate" | "High";

export type AdultHygiene2026Output = "complete" | "hygiene" | "recare";

export const standardOheStatement =
  "Patient's diagnoses and risk factors were explained to them. OHE on etiology of periodontitis and caries; and their risk factors. Demonstration of bass brushing, c-shape flossing technique. Reviewed benefits of Prevident 5000 or Opti-Rinse 0.05%";

export const standardHygieneGoal =
  "Pt will start flossing at least 1-2 times a week, implement bass brushing by the next hygiene appointment.";

export interface AdultHygiene2026Form extends OralHygieneMethods {
  patientId: string;
  noteLastRecallDate: string;
  dentist: string;
  rdh: string;
  rda: string;
  class5IndicatorStatus: DocumentationStatus;
  mieleCodes: string;
  consentPatient: boolean;
  consentParent: boolean;
  consentLegalGuardian: boolean;
  consentDetails: string;
  medicalHistoryReview: string;
  vitalsReadings: VitalsReading[];
  premedicationStatus: PremedicationStatus;
  premedicationDetails: string;
  patientChiefConcern: string[];
  listChiefConcerns: boolean;
  hygieneAreaOfConcern: string;
  radiographs: string[];
  intraoralPhotosStatus: DocumentationStatus;
  intraoralPhotosDetails: string;
  extraoralStatus: ExamStatus;
  extraoralFindings: string;
  structuredExtraoralFindings?: RecareExtraoralFinding[];
  tmjStatus: ExamStatus;
  tmjFindings: string;
  lymphNodesStatus: ExamStatus;
  lymphNodesFindings: string;
  masseterStatus: ExamStatus;
  masseterFindings: string;
  tmjLoadStatus: ExamStatus;
  tmjLoadFindings: string;
  intraoralStatus: ExamStatus;
  intraoralFindings: string;
  structuredIntraoralFindings?: RecareIntraoralFinding[];
  oralHabits: string;
  rightMolarOcclusion: string;
  rightMolarOcclusionNotApplicable: boolean;
  leftMolarOcclusion: string;
  leftMolarOcclusionNotApplicable: boolean;
  skeletalOcclusion: string;
  skeletalOcclusionNotApplicable: boolean;
  overjetMm: string;
  overbitePercent: string;
  overbiteMm?: string;
  additionalOcclusalFindings?: RecareOcclusalFinding[];
  listAdditionalOcclusalFindings: boolean;
  teethStatus?: ExamStatus;
  toothFindings?: RecareToothFinding[];
  additionalToothFindings?: string;
  odontogramUpToDate: boolean;
  plaqueChoice: string;
  plaqueAreas: string[];
  plaqueComment: string;
  stainChoice: string;
  stainAreas: string[];
  stainComment: string;
  calculusChoice: string;
  calculusAreas: string[];
  calculusComment: string;
  bleedingChoice: string;
  bleedingAreas: string[];
  bleedingComment: string;
  psrPocketing: [string, string, string, string, string, string];
  recession: string;
  fmpDone: string;
  gingivalDescription?: GingivalDescriptionAssessment;
  periodontalClassification: PeriodontalClassification;
  cariesRiskLevel: CariesRiskLevel;
  cariesRiskFactors: string[];
  cariesRiskNotes: string;
  cambra123Assessment: Cambra123SixAdultAssessment;
  oralHygieneCompliance: string;
  oralHygieneComplianceComment: string;
  homeCareInstructionReviewed: boolean;
  ohiAidsReviewed: string[];
  diseaseProcessReviewed: boolean;
  standardOheStatementApplies: boolean;
  oheTopicsReviewed: string[];
  oheNotes: string;
  flossingFrequency: string;
  brushingFrequency: string;
  hygieneGoal: string;
  treatmentRecommendedHygieneMaintenance: boolean;
  otherTreatmentRecommended: string;
  treatmentOptions: RecareTreatmentEntry[];
  hygieneTreatmentOptions: RecareTreatmentEntry[];
  treatmentPlan: RecareTreatmentEntry[];
  treatmentCompleted: AdultHygieneTreatmentCompletedEntry[];
  localAnesthesiaNoContraindication: boolean;
  localAnesthesiaEntries: LocalAnesthesiaEntry[];
  localAnesthesiaNoAdverseReactions: boolean;
  localAnesthesiaAdequateAchieved: boolean;
  localAnesthesiaNotes: string;
  desensitizer: string;
  nightGuardStatus: DocumentationStatus;
  nightGuardUseStatus: DocumentationStatus;
  cpapStatus: DocumentationStatus;
  cpapUseStatus: DocumentationStatus;
  occlusalSplintStatus: DocumentationStatus;
  occlusalSplintUseStatus: DocumentationStatus;
  orthodonticHistoryStatus: DocumentationStatus;
  retainerStatus: RetainerStatus;
  removableDenturesStatus: DocumentationStatus;
  removableDenturesComment: string;
  improvementRequest: string;
  recareAdditionalComments: string;
  additionalNotes: string;
  guardianCommunicationStatus?: DocumentationStatus;
  guardianCommunicationDetails?: string;
  ppeStatementApplies: boolean;
  recallInterval: string;
  recallIntervalComments: string;
  hygieneInterval: string;
  hygieneIntervalComments: string;
  nextVisit: string;
  dateBooked: string;
  dentalNextVisit: string;
  dentalDateBooked: string;
}

export function createEmptyAdultHygiene2026Form(): AdultHygiene2026Form {
  return {
    ...createEmptyOralHygieneMethods(),
    patientId: "",
    noteLastRecallDate: "",
    dentist: "",
    rdh: "",
    rda: "",
    class5IndicatorStatus: "not-documented",
    mieleCodes: "",
    consentPatient: false,
    consentParent: false,
    consentLegalGuardian: false,
    consentDetails: "",
    medicalHistoryReview: "",
    vitalsReadings: [],
    premedicationStatus: "not-documented",
    premedicationDetails: "",
    patientChiefConcern: [],
    listChiefConcerns: false,
    hygieneAreaOfConcern: "",
    radiographs: [],
    intraoralPhotosStatus: "not-documented",
    intraoralPhotosDetails: "",
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
    intraoralStatus: "not-assessed",
    intraoralFindings: "",
    structuredIntraoralFindings: [],
    oralHabits: "",
    rightMolarOcclusion: "",
    rightMolarOcclusionNotApplicable: false,
    leftMolarOcclusion: "",
    leftMolarOcclusionNotApplicable: false,
    skeletalOcclusion: "",
    skeletalOcclusionNotApplicable: false,
    overjetMm: "",
    overbitePercent: "",
    overbiteMm: "",
    additionalOcclusalFindings: [],
    listAdditionalOcclusalFindings: false,
    teethStatus: "not-assessed",
    toothFindings: [],
    additionalToothFindings: "",
    odontogramUpToDate: false,
    plaqueChoice: "",
    plaqueAreas: [],
    plaqueComment: "",
    stainChoice: "",
    stainAreas: [],
    stainComment: "",
    calculusChoice: "",
    calculusAreas: [],
    calculusComment: "",
    bleedingChoice: "",
    bleedingAreas: [],
    bleedingComment: "",
    psrPocketing: ["", "", "", "", "", ""],
    recession: "",
    fmpDone: "",
    gingivalDescription: createEmptyGingivalDescriptionAssessment(),
    periodontalClassification: createEmptyPeriodontalClassification(),
    cariesRiskLevel: "",
    cariesRiskFactors: [],
    cariesRiskNotes: "",
    cambra123Assessment: createEmptyCambra123SixAdultAssessment(),
    oralHygieneCompliance: "",
    oralHygieneComplianceComment: "",
    homeCareInstructionReviewed: false,
    ohiAidsReviewed: [],
    diseaseProcessReviewed: false,
    standardOheStatementApplies: false,
    oheTopicsReviewed: [],
    oheNotes: "",
    flossingFrequency: "",
    brushingFrequency: "",
    hygieneGoal: "",
    treatmentRecommendedHygieneMaintenance: false,
    otherTreatmentRecommended: "",
    treatmentOptions: [],
    hygieneTreatmentOptions: [],
    treatmentPlan: [],
    treatmentCompleted: [],
    ...createEmptyLocalAnesthesiaValue(),
    desensitizer: "",
    nightGuardStatus: "not-documented",
    nightGuardUseStatus: "not-documented",
    cpapStatus: "not-documented",
    cpapUseStatus: "not-documented",
    occlusalSplintStatus: "not-documented",
    occlusalSplintUseStatus: "not-documented",
    orthodonticHistoryStatus: "not-documented",
    retainerStatus: "not-documented",
    removableDenturesStatus: "not-documented",
    removableDenturesComment: "",
    improvementRequest: "",
    recareAdditionalComments: "",
    additionalNotes: "",
    guardianCommunicationStatus: "not-documented",
    guardianCommunicationDetails: "",
    ppeStatementApplies: false,
    recallInterval: "",
    recallIntervalComments: "",
    hygieneInterval: "",
    hygieneIntervalComments: "",
    nextVisit: "",
    dateBooked: "",
    dentalNextVisit: "",
    dentalDateBooked: "",
  };
}

export function hasRequiredAdultHygiene2026Fields(
  form: AdultHygiene2026Form
): boolean {
  return (
    Boolean(form.patientId.trim()) &&
    [form.dentist, form.rdh, form.rda].some((value) => Boolean(value.trim()))
  );
}
