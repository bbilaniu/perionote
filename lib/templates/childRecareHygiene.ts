export type ChildDocumentationStatus = "not-documented" | "yes" | "no";
export type ChildExamStatus = "not-assessed" | "wnl" | "findings";
export type ChildRecareHygieneOutput = "combined" | "dentist" | "hygienist";
export type ChildOcclusionAssessment =
  | "terminal-plane"
  | "molar-classification";

export interface ChildRecareHygieneForm {
  patientId: string;
  dentist: string;
  rda: string;
  rdh: string;
  /** @deprecated Retained so drafts created before structured consent still restore. */
  consentBy: string;
  consentPatient: boolean;
  consentParent: boolean;
  consentLegalGuardian: boolean;
  consentDetails: string;
  class5IndicatorStatus: ChildDocumentationStatus;
  ppeStatementApplies: boolean;
  mieleCodes: string;
  chiefConcern: string;
  medicalHistory: string;
  premedicationStatus: ChildDocumentationStatus;
  premedicationDetails: string;
  radiographs: string;
  intraoralPhotosStatus: ChildDocumentationStatus;
  intraoralPhotosDetails: string;
  extraoralStatus: ChildExamStatus;
  extraoralFindings: string;
  intraoralStatus: ChildExamStatus;
  intraoralFindings: string;
  oralHabitsStatus: ChildDocumentationStatus;
  oralHabitsDetails: string;
  tmjStatus: ChildExamStatus;
  tmjFindings: string;
  occlusionAssessment: ChildOcclusionAssessment;
  terminalPlane: string;
  molarOcclusion: string;
  skeletalClassification: string;
  overjetMm: string;
  overbitePercent: string;
  doctorComments: string;
  cariesStatus: ChildDocumentationStatus;
  cariesDetails: string;
  disclosedStatus: ChildDocumentationStatus;
  plaqueIndex: string;
  calculusStatus: ChildDocumentationStatus;
  calculusLocation: string;
  ohiReviewed: boolean;
  flossingTechnique: string;
  brushingTechnique: string;
  scalingStatus: ChildDocumentationStatus;
  scalingUnits: string;
  polishStatus: ChildDocumentationStatus;
  polishDetails: string;
  fluorideStatus: ChildDocumentationStatus;
  fluorideDetails: string;
  guardianCommunicationStatus: ChildDocumentationStatus;
  guardianCommunicationDetails: string;
  goalForNextVisit: string;
  clinicalComments: string;
  recallInterval: string;
  hygieneInterval: string;
  nextVisit: string;
  bookedDate: string;
}

export function createEmptyChildRecareHygieneForm(): ChildRecareHygieneForm {
  return {
    patientId: "",
    dentist: "",
    rda: "",
    rdh: "",
    consentBy: "",
    consentPatient: false,
    consentParent: false,
    consentLegalGuardian: false,
    consentDetails: "",
    class5IndicatorStatus: "not-documented",
    ppeStatementApplies: false,
    mieleCodes: "",
    chiefConcern: "",
    medicalHistory: "",
    premedicationStatus: "not-documented",
    premedicationDetails: "",
    radiographs: "",
    intraoralPhotosStatus: "not-documented",
    intraoralPhotosDetails: "",
    extraoralStatus: "not-assessed",
    extraoralFindings: "",
    intraoralStatus: "not-assessed",
    intraoralFindings: "",
    oralHabitsStatus: "not-documented",
    oralHabitsDetails: "",
    tmjStatus: "not-assessed",
    tmjFindings: "",
    occlusionAssessment: "terminal-plane",
    terminalPlane: "",
    molarOcclusion: "",
    skeletalClassification: "",
    overjetMm: "",
    overbitePercent: "",
    doctorComments: "",
    cariesStatus: "not-documented",
    cariesDetails: "",
    disclosedStatus: "not-documented",
    plaqueIndex: "",
    calculusStatus: "not-documented",
    calculusLocation: "",
    ohiReviewed: false,
    flossingTechnique: "",
    brushingTechnique: "",
    scalingStatus: "not-documented",
    scalingUnits: "",
    polishStatus: "not-documented",
    polishDetails: "",
    fluorideStatus: "not-documented",
    fluorideDetails: "",
    guardianCommunicationStatus: "not-documented",
    guardianCommunicationDetails: "",
    goalForNextVisit: "",
    clinicalComments: "",
    recallInterval: "",
    hygieneInterval: "",
    nextVisit: "",
    bookedDate: "",
  };
}

export function hasRequiredChildRecareHygieneFields(
  form: ChildRecareHygieneForm,
): boolean {
  return Boolean(
    form.patientId.trim() &&
      [form.dentist, form.rdh, form.rda].some((provider) => provider.trim()),
  );
}
