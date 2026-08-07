import type {
  DocumentationStatus,
  PremedicationStatus,
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

export type AdultHygieneTreatmentCompletedEntry = {
  id: string;
  treatmentType: string;
  toothAreas: string[];
  applicationTime?: string;
};

export type CariesRiskLevel = "" | "Low" | "Moderate" | "High";

export const standardOheStatement =
  "Patient's diagnoses and risk factors were explained to them. OHE on etiology of periodontitis and caries; and their risk factors. Demonstration of bass brushing, c-shape flossing technique. Reviewed benefits of Prevident 5000 or Opti-Rinse 0.05%";

export const dyclonineRinseTreatment = "Dyclonine 1% rinse 5 ml";

export function isDyclonineRinseTreatment(value: string): boolean {
  const normalized = value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-CA");
  return normalized.includes("dyclonine") && normalized.includes("rinse");
}

export const standardTreatmentCompletedPreset = [
  { treatmentType: "Dyclonine 1% rinse 5 ml", toothAreas: ["full mouth"]},
  { treatmentType: "FMP", toothAreas: ["full mouth"] },
  {
    treatmentType: "3U scale (Cavitron and hand instrumentation)",
    toothAreas: ["full mouth"],
  },
  {
    treatmentType:
      "1U polish - Selective polish of aesthetic zone as per patient's request",
    toothAreas: [],
  },
  {
    treatmentType: "FluoriMax 2.5% NaF Varnish application",
    toothAreas: ["full mouth"],
  },
  { treatmentType: "OHE", toothAreas: [] },
] as const;

export interface AdultHygiene2021Form {
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
  premedicationStatus: PremedicationStatus;
  premedicationDetails: string;
  patientChiefConcern: string[];
  listChiefConcerns: boolean;
  hygieneAreaOfConcern: string;
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
  treatmentCompleted: AdultHygieneTreatmentCompletedEntry[];
  anesthetic: string;
  desensitizer: string;
  nightGuardStatus: DocumentationStatus;
  nightGuardUseStatus: DocumentationStatus;
  orthodonticHistoryStatus: DocumentationStatus;
  retainerStatus: RetainerStatus;
  additionalNotes: string;
  ppeStatementApplies: boolean;
  recallInterval: string;
  recallIntervalComments: string;
  hygieneInterval: string;
  hygieneIntervalComments: string;
  nextVisit: string;
  dateBooked: string;
}

export function createEmptyAdultHygiene2021Form(): AdultHygiene2021Form {
  return {
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
    premedicationStatus: "not-documented",
    premedicationDetails: "",
    patientChiefConcern: [],
    listChiefConcerns: false,
    hygieneAreaOfConcern: "",
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
    treatmentCompleted: [],
    anesthetic: "",
    desensitizer: "",
    nightGuardStatus: "not-documented",
    nightGuardUseStatus: "not-documented",
    orthodonticHistoryStatus: "not-documented",
    retainerStatus: "not-documented",
    additionalNotes: "",
    ppeStatementApplies: false,
    recallInterval: "",
    recallIntervalComments: "",
    hygieneInterval: "",
    hygieneIntervalComments: "",
    nextVisit: "",
    dateBooked: "",
  };
}

export function hasRequiredAdultHygiene2021Fields(
  form: AdultHygiene2021Form
): boolean {
  return (
    Boolean(form.patientId.trim()) &&
    [form.dentist, form.rdh, form.rda].some((value) => Boolean(value.trim()))
  );
}
