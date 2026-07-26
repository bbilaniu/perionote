import type {
  DocumentationStatus,
  PremedicationStatus,
  RetainerStatus,
} from "@/lib/templates/recareExam";

export const patientChiefConcernChoices = [
  "Nothing",
  "Sensitivity",
] as const;

export const plaqueChoices = [
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
  "Localized mild",
  "Localized moderate",
  "Localized severe",
  "Generalized mild",
  "Generalized moderate",
  "Generalized severe",
] as const;

export const periodontitisStageChoices = [
  "Stage I (P1)",
  "Stage II (P2)",
  "Stage III (P3)",
  "Stage IV (P4)",
  "N/A",
] as const;

export const periodontitisGradeChoices = [
  "Grade A: slow rate",
  "Grade B: moderate rate",
  "Grade C: rapid rate",
  "N/A",
] as const;

export const oralHygieneComplianceChoices = [
  "Poor",
  "Fair",
  "Good",
  "Excellent",
  "Poor–fair",
  "Fair–good",
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

export const recallIntervalChoices = [
  "12-month recall",
  "6-month recall",
  "9-month recall",
] as const;

export const hygieneIntervalChoices = [
  "3-month scale",
  "4-month scale",
  "6-month scale",
  "N/A",
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
  patientChiefConcern: string;
  hygieneAreaOfConcern: string;
  plaqueChoice: string;
  plaqueOther: string;
  stainChoice: string;
  stainOther: string;
  calculusChoice: string;
  calculusOther: string;
  bleedingChoice: string;
  bleedingOther: string;
  psrPocketing: [string, string, string, string, string, string];
  recession: string;
  fmpDone: string;
  healthGingivitis: string;
  periodontitisStageChoice: string;
  periodontitisStageOther: string;
  periodontitisGradeChoice: string;
  periodontitisGradeOther: string;
  oralHygieneComplianceChoice: string;
  oralHygieneComplianceOther: string;
  homeCareInstructionReviewed: boolean;
  ohiAidsReviewed: string[];
  diseaseProcessReviewed: boolean;
  flossingFrequencyChoice: string;
  flossingFrequencyOther: string;
  brushingFrequencyChoice: string;
  brushingFrequencyOther: string;
  hygieneGoal: string;
  treatmentRecommendedHygieneMaintenance: boolean;
  otherTreatmentRecommended: string;
  treatmentCompleted: string[];
  anesthetic: string;
  desensitizer: string;
  nightGuardStatus: DocumentationStatus;
  nightGuardUseStatus: DocumentationStatus;
  orthodonticHistoryStatus: DocumentationStatus;
  retainerStatus: RetainerStatus;
  additionalNotes: string;
  ppeStatementApplies: boolean;
  recallIntervalChoice: string;
  recallIntervalOther: string;
  hygieneIntervalChoice: string;
  hygieneIntervalOther: string;
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
    patientChiefConcern: "",
    hygieneAreaOfConcern: "",
    plaqueChoice: "",
    plaqueOther: "",
    stainChoice: "",
    stainOther: "",
    calculusChoice: "",
    calculusOther: "",
    bleedingChoice: "",
    bleedingOther: "",
    psrPocketing: ["", "", "", "", "", ""],
    recession: "",
    fmpDone: "",
    healthGingivitis: "",
    periodontitisStageChoice: "",
    periodontitisStageOther: "",
    periodontitisGradeChoice: "",
    periodontitisGradeOther: "",
    oralHygieneComplianceChoice: "",
    oralHygieneComplianceOther: "",
    homeCareInstructionReviewed: false,
    ohiAidsReviewed: [],
    diseaseProcessReviewed: false,
    flossingFrequencyChoice: "",
    flossingFrequencyOther: "",
    brushingFrequencyChoice: "",
    brushingFrequencyOther: "",
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
    recallIntervalChoice: "",
    recallIntervalOther: "",
    hygieneIntervalChoice: "",
    hygieneIntervalOther: "",
    nextVisit: "",
    dateBooked: "",
  };
}

export function hasRequiredAdultHygiene2021Fields(
  form: AdultHygiene2021Form,
): boolean {
  return (
    Boolean(form.patientId.trim()) &&
    [form.dentist, form.rdh, form.rda].some((value) => Boolean(value.trim()))
  );
}
