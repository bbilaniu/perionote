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
  gingivalHealth: string;
  plaqueIndex: string;
  calculusStatus: AdolescentDocumentationStatus;
  calculusDetails: string;
  intraoralImagesStatus: AdolescentDocumentationStatus;
  intraoralImagesDetails: string;
  flossingTechnique: string;
  brushingTechnique: string;
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
  treatmentCompletedToday: string;
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
    gingivalHealth: "",
    plaqueIndex: "",
    calculusStatus: "not-documented",
    calculusDetails: "",
    intraoralImagesStatus: "not-documented",
    intraoralImagesDetails: "",
    flossingTechnique: "",
    brushingTechnique: "",
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
    treatmentCompletedToday: "",
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
