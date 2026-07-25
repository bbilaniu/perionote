export type DocumentationStatus = "not-documented" | "no" | "yes";

export type MedicalHistoryStatus =
  | "not-documented"
  | "reviewed-no-changes"
  | "reviewed-updated";

export type PremedicationStatus =
  | "not-documented"
  | "not-required"
  | "required";

export type ExamStatus = "not-assessed" | "wnl" | "findings";

export type RetainerStatus =
  | "not-documented"
  | "none"
  | "fixed"
  | "removable"
  | "fixed-and-removable";

export interface RecareExamForm {
  patientId: string;
  dentist: string;
  rda: string;
  rdh: string;
  consentObtained: boolean;
  consentDetails: string;
  medicalHistoryStatus: MedicalHistoryStatus;
  medicalHistoryDetails: string;
  premedicationStatus: PremedicationStatus;
  premedicationDetails: string;
  class5IndicatorsChecked: boolean;
  mieleCodes: string;
  radiographsStatus: DocumentationStatus;
  radiographsDetails: string;
  intraoralPhotosStatus: DocumentationStatus;
  intraoralPhotosDetails: string;
  chiefConcern: string;
  extraoralStatus: ExamStatus;
  extraoralFindings: string;
  tmjStatus: ExamStatus;
  tmjFindings: string;
  masseterStatus: ExamStatus;
  masseterFindings: string;
  tmjLoadStatus: ExamStatus;
  tmjLoadFindings: string;
  intraoralStatus: ExamStatus;
  intraoralFindings: string;
  oralHabits: string;
  rightMolarOcclusion: string;
  rightMolarOcclusionNotApplicable: boolean;
  leftMolarOcclusion: string;
  leftMolarOcclusionNotApplicable: boolean;
  skeletalOcclusion: string;
  skeletalOcclusionNotApplicable: boolean;
  overjetMm: string;
  overbitePercent: string;
  cpapStatus: DocumentationStatus;
  occlusalSplintStatus: DocumentationStatus;
  occlusalSplintUseStatus: DocumentationStatus;
  orthodonticHistoryStatus: DocumentationStatus;
  retainerStatus: RetainerStatus;
  removableDenturesStatus: DocumentationStatus;
  improvementRequest: string;
  additionalComments: string;
  treatmentOptionsHygieneMaintenance: boolean;
  otherTreatmentOptions: string;
  treatmentPlanHygieneMaintenance: boolean;
  otherTreatmentPlan: string;
  nextVisit: string;
  dateBooked: string;
}

export function createEmptyRecareExamForm(): RecareExamForm {
  return {
    patientId: "",
    dentist: "",
    rda: "",
    rdh: "",
    consentObtained: false,
    consentDetails: "",
    medicalHistoryStatus: "not-documented",
    medicalHistoryDetails: "",
    premedicationStatus: "not-documented",
    premedicationDetails: "",
    class5IndicatorsChecked: false,
    mieleCodes: "",
    radiographsStatus: "not-documented",
    radiographsDetails: "",
    intraoralPhotosStatus: "not-documented",
    intraoralPhotosDetails: "",
    chiefConcern: "",
    extraoralStatus: "not-assessed",
    extraoralFindings: "",
    tmjStatus: "not-assessed",
    tmjFindings: "",
    masseterStatus: "not-assessed",
    masseterFindings: "",
    tmjLoadStatus: "not-assessed",
    tmjLoadFindings: "",
    intraoralStatus: "not-assessed",
    intraoralFindings: "",
    oralHabits: "",
    rightMolarOcclusion: "",
    rightMolarOcclusionNotApplicable: false,
    leftMolarOcclusion: "",
    leftMolarOcclusionNotApplicable: false,
    skeletalOcclusion: "",
    skeletalOcclusionNotApplicable: false,
    overjetMm: "",
    overbitePercent: "",
    cpapStatus: "not-documented",
    occlusalSplintStatus: "not-documented",
    occlusalSplintUseStatus: "not-documented",
    orthodonticHistoryStatus: "not-documented",
    retainerStatus: "not-documented",
    removableDenturesStatus: "not-documented",
    improvementRequest: "",
    additionalComments: "",
    treatmentOptionsHygieneMaintenance: false,
    otherTreatmentOptions: "",
    treatmentPlanHygieneMaintenance: false,
    otherTreatmentPlan: "",
    nextVisit: "",
    dateBooked: "",
  };
}

export function hasRequiredRecareExamFields(form: RecareExamForm): boolean {
  return (
    Boolean(form.patientId.trim()) &&
    [form.dentist, form.rda, form.rdh].some((value) => Boolean(value.trim()))
  );
}
