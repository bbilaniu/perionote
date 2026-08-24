import type { AdultHygieneTreatmentCompletedEntry } from "@/lib/templates/adultHygiene2021";
import {
  createEmptyLocalAnesthesiaValue,
  type LocalAnesthesiaEntry,
} from "@/lib/templates/localAnesthesia";
import {
  createEmptyPeriodontalClassification,
  type PeriodontalClassification,
} from "@/lib/templates/periodontalClassification";

export type AdolescentDocumentationStatus = "not-documented" | "no" | "yes";

export type AdolescentPremedicationStatus =
  | "not-documented"
  | "not-required"
  | "required";

export type AdolescentRetainerStatus =
  | "not-documented"
  | "none"
  | "fixed"
  | "removable"
  | "fixed-and-removable";

export interface AdolescentHygieneForm {
  patientId: string;
  dentist: string;
  rdh: string;
  rda: string;
  consentPatient: boolean;
  consentParent: boolean;
  consentLegalGuardian: boolean;
  consentDetails: string;
  medicalHistoryReview: string;
  premedicationStatus: AdolescentPremedicationStatus;
  premedicationDetails: string;
  class5IndicatorsChecked: boolean;
  mieleCodes: string;
  periodontalClassification: PeriodontalClassification;
  plaqueChoice: string;
  plaqueAreas: string[];
  plaqueComment: string;
  calculusChoice: string;
  calculusAreas: string[];
  calculusComment: string;
  intraoralImagesStatus: AdolescentDocumentationStatus;
  intraoralImagesDetails: string;
  ohiTechniques: string[];
  oheNotes: string;
  flossingFrequency: string;
  brushingFrequency: string;
  nightGuardStatus: AdolescentDocumentationStatus;
  nightGuardDetails: string;
  orthodonticHistoryStatus: AdolescentDocumentationStatus;
  orthodonticHistoryDetails: string;
  retainerStatus: AdolescentRetainerStatus;
  retainerDetails: string;
  scalingStatus: AdolescentDocumentationStatus;
  scalingUnits: string;
  polishStatus: AdolescentDocumentationStatus;
  polishDetails: string;
  treatmentCompleted: AdultHygieneTreatmentCompletedEntry[];
  localAnesthesiaNoContraindication: boolean;
  localAnesthesiaEntries: LocalAnesthesiaEntry[];
  localAnesthesiaNoAdverseReactions: boolean;
  localAnesthesiaAdequateAchieved: boolean;
  localAnesthesiaNotes: string;
  fluorideStatus: AdolescentDocumentationStatus;
  fluorideDetails: string;
  informationRelayedStatus: AdolescentDocumentationStatus;
  informationRelayedDetails: string;
  nextVisitGoal: string;
  comments: string;
  properPpeWorn: boolean;
  recallInterval: string;
  hygieneInterval: string;
  nextVisit: string;
  dateBooked: string;
}

export function createEmptyAdolescentHygieneForm(): AdolescentHygieneForm {
  const localAnesthesia = createEmptyLocalAnesthesiaValue();
  return {
    patientId: "",
    dentist: "",
    rdh: "",
    rda: "",
    consentPatient: false,
    consentParent: false,
    consentLegalGuardian: false,
    consentDetails: "",
    medicalHistoryReview: "",
    premedicationStatus: "not-documented",
    premedicationDetails: "",
    class5IndicatorsChecked: false,
    mieleCodes: "",
    periodontalClassification: createEmptyPeriodontalClassification(),
    plaqueChoice: "",
    plaqueAreas: [],
    plaqueComment: "",
    calculusChoice: "",
    calculusAreas: [],
    calculusComment: "",
    intraoralImagesStatus: "not-documented",
    intraoralImagesDetails: "",
    ohiTechniques: [],
    oheNotes: "",
    flossingFrequency: "",
    brushingFrequency: "",
    nightGuardStatus: "not-documented",
    nightGuardDetails: "",
    orthodonticHistoryStatus: "not-documented",
    orthodonticHistoryDetails: "",
    retainerStatus: "not-documented",
    retainerDetails: "",
    scalingStatus: "not-documented",
    scalingUnits: "",
    polishStatus: "not-documented",
    polishDetails: "",
    treatmentCompleted: [],
    ...localAnesthesia,
    fluorideStatus: "not-documented",
    fluorideDetails: "",
    informationRelayedStatus: "not-documented",
    informationRelayedDetails: "",
    nextVisitGoal: "",
    comments: "",
    properPpeWorn: false,
    recallInterval: "",
    hygieneInterval: "",
    nextVisit: "",
    dateBooked: "",
  };
}

export function hasRequiredAdolescentHygieneFields(
  form: AdolescentHygieneForm,
): boolean {
  return (
    Boolean(form.patientId.trim()) &&
    [form.dentist, form.rdh, form.rda].some((value) => Boolean(value.trim()))
  );
}
