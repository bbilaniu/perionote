export type DocumentationStatus = "not-documented" | "no" | "yes";

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

export type RecareTreatmentEntry = {
  id: string;
  treatmentType: string;
  toothArea: string;
  careType?: "preventive" | "restorative" | "other";
};

export type RecareOcclusalFinding = {
  id: string;
  finding: string;
  locations: string[];
};

export type RecareToothFinding = {
  id: string;
  optionId: string;
  toothAreas: string[];
  surface?: string;
  activity?: "active" | "inactive";
  millerGrade?: "M1" | "M2" | "M3";
  comment?: string;
};

export type { RecareIntraoralFinding } from "@/lib/templates/recareIntraoralCatalog";
import type { RecareIntraoralFinding } from "@/lib/templates/recareIntraoralCatalog";
export type { RecareExtraoralFinding } from "@/lib/templates/extraoralObservationsCatalog";
import type { RecareExtraoralFinding } from "@/lib/templates/extraoralObservationsCatalog";

export interface RecareExamForm {
  patientId: string;
  dentist: string;
  rda: string;
  rdh: string;
  consentPatient: boolean;
  consentParent: boolean;
  consentLegalGuardian: boolean;
  consentDetails: string;
  medicalHistoryReview: string;
  premedicationStatus: PremedicationStatus;
  premedicationDetails: string;
  class5IndicatorsChecked: boolean;
  mieleCodes: string;
  radiographs: string[];
  intraoralPhotosStatus: DocumentationStatus;
  intraoralPhotosDetails: string;
  chiefConcern: string[];
  listChiefConcerns: boolean;
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
  cpapStatus: DocumentationStatus;
  cpapUseStatus: DocumentationStatus;
  occlusalSplintStatus: DocumentationStatus;
  occlusalSplintUseStatus: DocumentationStatus;
  orthodonticHistoryStatus: DocumentationStatus;
  retainerStatus: RetainerStatus;
  removableDenturesStatus: DocumentationStatus;
  improvementRequest: string;
  additionalComments: string;
  teethStatus?: ExamStatus;
  toothFindings?: RecareToothFinding[];
  additionalToothFindings?: string;
  odontogramUpToDate: boolean;
  treatmentOptions: RecareTreatmentEntry[];
  listTreatmentOptions: boolean;
  treatmentPlan: RecareTreatmentEntry[];
  listTreatmentPlan: boolean;
  nextVisit: string;
  dateBooked: string;
}

export function createEmptyRecareExamForm(): RecareExamForm {
  return {
    patientId: "",
    dentist: "",
    rda: "",
    rdh: "",
    consentPatient: false,
    consentParent: false,
    consentLegalGuardian: false,
    consentDetails: "",
    medicalHistoryReview: "",
    premedicationStatus: "not-documented",
    premedicationDetails: "",
    class5IndicatorsChecked: false,
    mieleCodes: "",
    radiographs: [],
    intraoralPhotosStatus: "not-documented",
    intraoralPhotosDetails: "",
    chiefConcern: [],
    listChiefConcerns: false,
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
    cpapStatus: "not-documented",
    cpapUseStatus: "not-documented",
    occlusalSplintStatus: "not-documented",
    occlusalSplintUseStatus: "not-documented",
    orthodonticHistoryStatus: "not-documented",
    retainerStatus: "not-documented",
    removableDenturesStatus: "not-documented",
    improvementRequest: "",
    additionalComments: "",
    teethStatus: "not-assessed",
    toothFindings: [],
    additionalToothFindings: "",
    odontogramUpToDate: false,
    treatmentOptions: [],
    listTreatmentOptions: true,
    treatmentPlan: [],
    listTreatmentPlan: true,
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
