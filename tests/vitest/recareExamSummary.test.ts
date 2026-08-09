import { describe, expect, it } from "vitest";
import { recareExamFixture } from "@/lib/templates/fixtures/recareExam.fixture";
import { isTemplateAvailableForBuild } from "@/lib/templates/lifecycle";
import {
  createEmptyRecareExamForm,
  hasRequiredRecareExamFields,
} from "@/lib/templates/recareExam";
import {
  createRecareNormalStructuredIntraoralFindings,
  recareIntraoralOptionById,
  recareIntraoralOptionConflicts,
  recareIntraoralQuickPresets,
  recareNormalStructuredObservationIds,
} from "@/lib/templates/recareIntraoralCatalog";
import {
  buildRecareExamSummary,
  formatNoteHeaderLocalTimestamp,
  formatRecareExamLocalTimestamp,
} from "@/lib/templates/summary/buildRecareExamSummary";
import { recareToothOptions } from "@/lib/templates/recareTeethCatalog";
import {
  createRecareExtraoralFinding,
  extraoralLateralityToSides,
  extraoralSidesToLaterality,
  recareExtraoralOptions,
} from "@/lib/templates/extraoralObservationsCatalog";

describe("buildRecareExamSummary", () => {
  it("maps independent side selections to and from bilateral laterality", () => {
    expect(extraoralSidesToLaterality(["Left"])).toBe("Left");
    expect(extraoralSidesToLaterality(["Right"])).toBe("Right");
    expect(extraoralSidesToLaterality(["Left", "Right"])).toBe("Bilateral");
    expect(extraoralLateralityToSides("Bilateral")).toEqual([
      "Left",
      "Right",
    ]);
  });

  it("allows separate entries for every repeatable tooth observation", () => {
    const repeatableOptionIds = [
      "ioe.teeth.caries",
      "ioe.teeth.initial_noncavitated_caries",
      "ioe.teeth.fracture",
      "ioe.teeth.discoloration",
      "ioe.teeth.mobility",
      "ioe.teeth.enamel_hypoplasia",
      "ioe.teeth.fluorosis",
    ];

    expect(
      recareToothOptions
        .filter((option) => option.allowMultipleInstances)
        .map((option) => option.id),
    ).toEqual(repeatableOptionIds);
  });

  it("defines bidirectional conflicts for normal and abnormal observations", () => {
    expect(
      recareIntraoralOptionConflicts
        .get("ioe.buccal_mucosa.ulcer")
        ?.has("ioe.buccal_mucosa.no_lesions")
    ).toBe(true);
    expect(
      recareIntraoralOptionConflicts
        .get("ioe.buccal_mucosa.no_lesions")
        ?.has("ioe.buccal_mucosa.ulcer")
    ).toBe(true);
    expect(
      recareIntraoralOptionConflicts
        .get("ioe.saliva.reduced_flow")
        ?.has("ioe.saliva.normal_flow")
    ).toBe(true);
    expect(
      recareIntraoralOptionConflicts
        .get("ioe.palate.torus_palatinus")
        ?.has("ioe.palate.no_abnormal_growths"),
    ).toBe(true);
  });

  it("defines the reviewed IOE quick presets and supplemental mandibular tori observation", () => {
    expect(recareIntraoralQuickPresets.map(({ label }) => label)).toEqual([
      "Coated tongue",
      "Fissured tongue",
      "Scalloped tongue",
      "Bilateral linea alba",
      "Palatine torus at midline",
      "Bilateral mandibular tori",
    ]);
    expect(
      recareIntraoralOptionById.get("ioe.floor_of_mouth.mandibular_tori"),
    ).toMatchObject({
      structure: { id: "ioe.floor_of_mouth" },
      option: {
        label: "Mandibular tori",
        supportsLaterality: true,
      },
    });
  });

  it("starts empty without inferring findings or treatment", () => {
    const emptyForm = createEmptyRecareExamForm();

    expect(buildRecareExamSummary(emptyForm)).toBe("");
    expect(hasRequiredRecareExamFields(emptyForm)).toBe(false);
  });

  it("builds the accepted output in mapped order with one blank line between groups", () => {
    const startedAt = new Date(2026, 6, 25, 13, 45, 12);
    const summary = buildRecareExamSummary(recareExamFixture, {
      startedAt,
    });

    expect(summary).toBe(`----- July 25, 2026 1:45:12 PM -----
PATIENT ID: TEST-1001
DENTIST: Dr. Example
RDA:
RDH: Example RDH

Informed verbal consent given by PATIENT for treatment today.
Medical history reviewed: Synthetic medication list reviewed.
Premedication required: No.
Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments.
Miele Sterilization codes scanned: SYNTH-001

Radiographs: 4 BW; 2 PA
Intraoral photos: No.

a) Patient's chief concern: Food catches between teeth; Synthetic concern for demonstration.

b) Extraoral: WNL.
Lymph nodes: WNL.

c) TMJ: Synthetic bilateral clicking without discomfort.
Masseter palpation: WNL.
TMJ loading test: WNL.

d) Intraoral:
  - Tongue: fissured (notes: Synthetic observation).
  - Saliva: normal flow.
Oral habits: Synthetic clenching history.
Molar occlusion—right: Synthetic Class I.
Molar occlusion—left: N/A.
Skeletal occlusion: N/A.
Overjet: 2 mm.
Overbite: 30%; 3 mm.
Additional occlusal findings: Crossbite (location: Posterior, Left).

CPAP: No.
Occlusal splint: Yes; uses.
Orthodontic history: Yes.
Retainers: Fixed.
Partial/complete removable dentures: No.

Patient-requested smile or dental improvements: Synthetic request to discuss whitening.
Additional comments: Synthetic demonstration data only.

ODONTOGRAM UP TO DATE

Treatment Options:
  1. Hygiene maintenance
  2. Synthetic restorative consultation — teeth 14, 15

Treatment Plan:
  1. Hygiene maintenance

Next Visit: Synthetic hygiene maintenance visit
Date Booked: 2026-08-15`);
    expect(summary).not.toContain("\n\n\n");
  });

  it("supports independent consent sources and catalogue-backed medical history text", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      consentPatient: true,
      consentParent: true,
      consentLegalGuardian: true,
      consentDetails: "Synthetic consent detail",
      medicalHistoryReview: "YES- NO CHANGES",
    };

    expect(buildRecareExamSummary(form)).toBe(
      `Informed verbal consent given by PATIENT, PARENT and LEGAL GUARDIAN for treatment today. Synthetic consent detail.
Medical history reviewed: YES- NO CHANGES.`
    );
  });

  it("can list chief concerns on separate note lines", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      chiefConcern: [
        "Food catches between teeth",
        "Sensitivity to hot and cold",
      ],
      listChiefConcerns: true,
    };

    expect(buildRecareExamSummary(form)).toBe(`a) Patient's chief concern:
  - Food catches between teeth
  - Sensitivity to hot and cold`);
  });

  it("renders only meaningful lettered examination sections in source order", () => {
    const summary = buildRecareExamSummary({
      ...createEmptyRecareExamForm(),
      chiefConcern: ["Food catches between teeth"],
      extraoralStatus: "wnl",
      tmjStatus: "wnl",
      masseterStatus: "wnl",
      tmjLoadStatus: "wnl",
      intraoralStatus: "wnl",
      treatmentOptions: [
        {
          id: "option-1",
          treatmentType: "Hygiene maintenance",
          toothArea: "",
        },
      ],
      treatmentPlan: [
        {
          id: "plan-1",
          treatmentType: "Hygiene maintenance",
          toothArea: "",
        },
      ],
      nextVisit: "Hygiene maintenance",
      dateBooked: "2026-08-15",
    });

    expect(summary).toBe(`a) Patient's chief concern: Food catches between teeth.

b) Extraoral: WNL.

c) TMJ: WNL.
Masseter palpation: WNL.
TMJ loading test: WNL.

d) Intraoral: WNL.

Treatment Options:
  1. Hygiene maintenance

Treatment Plan:
  1. Hygiene maintenance

Next Visit: Hygiene maintenance
Date Booked: 2026-08-15`);
    expect(summary.indexOf("a)")).toBeLessThan(summary.indexOf("b)"));
    expect(summary.indexOf("b)")).toBeLessThan(summary.indexOf("c)"));
    expect(summary.indexOf("c)")).toBeLessThan(summary.indexOf("d)"));
    expect(summary).not.toMatch(
      /[a-d]\) (Treatment Options|Treatment Plan|Next Visit|Date Booked)/,
    );

    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        masseterStatus: "wnl",
      }),
    ).toBe(`c) TMJ examination:
Masseter palpation: WNL.`);
  });

  it("renders intraoral photographs according to their documentation status", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralPhotosDetails: "Anterior",
      }),
    ).toBe("");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralPhotosStatus: "no",
        intraoralPhotosDetails: "ignored detail",
      }),
    ).toBe("Intraoral photos: No.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralPhotosStatus: "yes",
      }),
    ).toBe("Intraoral photos: Yes.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralPhotosStatus: "yes",
        intraoralPhotosDetails: "Anterior; right buccal; left buccal",
      }),
    ).toBe("Intraoral photos: Anterior; right buccal; left buccal.");
  });

  it("formats structured EOE findings in catalogue order", () => {
    expect(recareExtraoralOptions.map(({ label }) => label)).toEqual([
      "TMJ clicking",
      "Palpable",
    ]);
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        extraoralStatus: "findings",
        extraoralFindings: "Monitor at recare",
        structuredExtraoralFindings: [
          {
            optionId: "eoe.palpable_lymph_nodes",
            laterality: "Left",
            locations: ["Submandibular"],
            swelling: ["Slightly enlarged"],
          },
          {
            optionId: "eoe.tmj_clicking",
            laterality: "Bilateral",
            statuses: ["Asymptomatic"],
            phases: ["On open"],
          },
        ],
      }),
    ).toBe(`b) Extraoral:
  - TMJ clicking (laterality: Bilateral; status: Asymptomatic; phase: On open).
  - palpable lymph nodes (laterality: Left; location: Submandibular; swelling: Slightly enlarged).
  Observations: Monitor at recare.`);
  });

  it("formats lymph-node status and palpable details without rewriting legacy findings", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        lymphNodesStatus: "wnl",
      }),
    ).toBe(`b) Extraoral examination:
  Lymph nodes: WNL.`);

    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        extraoralStatus: "findings",
        lymphNodesStatus: "findings",
        lymphNodesFindings: "Tender on palpation",
        structuredExtraoralFindings: [
          {
            optionId: "eoe.palpable_lymph_nodes",
            laterality: "Right",
            locations: ["Submandibular"],
            swelling: ["Slightly enlarged"],
          },
        ],
      }),
    ).toBe(`b) Extraoral:
  - palpable lymph nodes (laterality: Right; location: Submandibular; swelling: Slightly enlarged).
  Lymph nodes: Tender on palpation.`);

    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        extraoralStatus: "findings",
        lymphNodesStatus: "wnl",
        structuredExtraoralFindings: [
          createRecareExtraoralFinding("eoe.palpable_lymph_nodes"),
        ],
      }),
    ).toBe(`b) Extraoral:
  - palpable lymph nodes.`);
  });

  it("renders patient-requested improvements and clinical comments conditionally", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        improvementRequest: "  ",
      }),
    ).toBe("");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        improvementRequest: "Discuss whitening",
        additionalComments: "Patient-specific observation",
      }),
    ).toBe(`Patient-requested smile or dental improvements: Discuss whitening.
Additional comments: Patient-specific observation.`);
  });

  it("preserves documented No answers and unknown editable values", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      patientId: " TEST-2002 ",
      rda: " Example RDA ",
      radiographs: ["Imported value ZX/7", "Imported value ZX/7"],
      cpapStatus: "yes" as const,
      cpapUseStatus: "no" as const,
      occlusalSplintStatus: "no" as const,
      retainerStatus: "none" as const,
      treatmentOptions: [
        {
          id: "option-1",
          treatmentType: "Second option",
          toothArea: "teeth 14, 15",
        },
        {
          id: "option-2",
          treatmentType: "First option",
          toothArea: "",
        },
      ],
      treatmentPlan: [
        {
          id: "plan-1",
          treatmentType: "First option",
          toothArea: "upper right",
        },
      ],
    };

    expect(hasRequiredRecareExamFields(form)).toBe(true);
    expect(buildRecareExamSummary(form)).toBe(`PATIENT ID: TEST-2002
DENTIST:
RDA: Example RDA
RDH:

Radiographs: Imported value ZX/7; Imported value ZX/7

CPAP: Yes; does not use.
Occlusal splint: No.
Retainers: None.

Treatment Options:
  1. Second option — teeth 14, 15
  2. First option

Treatment Plan:
  1. First option — upper right`);
  });

  it("can render treatment options and treatment plan inline independently", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      treatmentOptions: [
        {
          id: "option-1",
          treatmentType: "Hygiene maintenance",
          toothArea: "",
        },
        {
          id: "option-2",
          treatmentType: "Restorative consultation",
          toothArea: "tooth 36",
        },
      ],
      listTreatmentOptions: false,
      treatmentPlan: [
        {
          id: "plan-1",
          treatmentType: "Hygiene maintenance",
          toothArea: "",
        },
      ],
      listTreatmentPlan: false,
    };

    expect(buildRecareExamSummary(form))
      .toBe(`Treatment Options: Hygiene maintenance; Restorative consultation — tooth 36

Treatment Plan: Hygiene maintenance`);
  });

  it("documents odontogram status without inferring findings", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      odontogramUpToDate: true,
    };

    expect(buildRecareExamSummary(form)).toBe("ODONTOGRAM UP TO DATE");
  });

  it("formats approved repeatable tooth findings without inferring management", () => {
    const form = {
      ...createEmptyRecareExamForm(),
      teethStatus: "findings" as const,
      toothFindings: [
        {
          id: "c1",
          optionId: "ioe.teeth.caries",
          toothAreas: ["14"],
          surface: "DO",
        },
        {
          id: "c2",
          optionId: "ioe.teeth.caries",
          toothAreas: ["30"],
          surface: "O",
        },
        {
          id: "i1",
          optionId: "ioe.teeth.initial_noncavitated_caries",
          toothAreas: ["15"],
          surface: "O",
          activity: "inactive" as const,
        },
        {
          id: "f1",
          optionId: "ioe.teeth.fracture",
          toothAreas: ["11"],
        },
        {
          id: "f2",
          optionId: "ioe.teeth.fracture",
          toothAreas: ["21"],
        },
        {
          id: "m1",
          optionId: "ioe.teeth.mobility",
          toothAreas: ["31", "41"],
          millerGrade: "M2" as const,
        },
        { id: "retired", optionId: "ioe.teeth.retired", toothAreas: ["99"] },
      ],
      additionalToothFindings: "Synthetic observation",
      odontogramUpToDate: true,
    };
    expect(buildRecareExamSummary(form)).toBe(`Teeth:
  - Caries: 14 DO; 30 O.
  - Initial/noncavitated caries lesion: 15 O (inactive).
  - Fractures: 11; 21.
  - Mobility: 31, 41 (M2).
  Additional observations: Synthetic observation.
ODONTOGRAM UP TO DATE`);
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        teethStatus: "wnl",
      })
    ).toBe("Teeth intact, with no caries or mobility noted.");
  });

  it("omits empty abnormal tooth findings but retains meaningful selections", () => {
    const emptyFindings = [
      {
        id: "fracture-empty",
        optionId: "ioe.teeth.fracture",
        toothAreas: ["  "],
        comment: "   ",
      },
      {
        id: "hypoplasia-empty",
        optionId: "ioe.teeth.enamel_hypoplasia",
        toothAreas: [],
      },
      {
        id: "fluorosis-empty",
        optionId: "ioe.teeth.fluorosis",
        toothAreas: [],
      },
    ];

    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        teethStatus: "findings",
        toothFindings: emptyFindings,
      }),
    ).toBe("");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        teethStatus: "findings",
        toothFindings: [
          ...emptyFindings,
          {
            id: "intact",
            optionId: "ioe.teeth.intact",
            toothAreas: [],
          },
          {
            id: "caries",
            optionId: "ioe.teeth.caries",
            toothAreas: ["14"],
            surface: "B",
          },
        ],
      }),
    ).toBe(`Teeth:
  - Intact.
  - Caries: 14 B.`);
  });

  it("formats tooth findings compactly without changing tooth notation", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        teethStatus: "findings",
        toothFindings: [
          {
            id: "caries-1",
            optionId: "ioe.teeth.caries",
            toothAreas: ["14"],
            surface: "B",
          },
          {
            id: "caries-2",
            optionId: "ioe.teeth.caries",
            toothAreas: ["16"],
            surface: "MO",
          },
          {
            id: "initial-1",
            optionId: "ioe.teeth.initial_noncavitated_caries",
            toothAreas: ["14"],
            surface: "D",
            activity: "inactive",
          },
          {
            id: "initial-2",
            optionId: "ioe.teeth.initial_noncavitated_caries",
            toothAreas: ["15"],
            surface: "M",
          },
          {
            id: "discoloration",
            optionId: "ioe.teeth.discoloration",
            toothAreas: ["#1.4"],
            comment: "stains",
          },
        ],
      }),
    ).toBe(`Teeth:
  - Caries: 14 B; 16 MO.
  - Initial/noncavitated caries lesions: 14 D (inactive); 15 M.
  - Discoloration: #1.4 — stains.`);
  });

  it("uses browser-local timestamp components", () => {
    expect(formatRecareExamLocalTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
      "2026-01-02 03:04"
    );
    expect(formatNoteHeaderLocalTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
      "----- January 2, 2026 3:04:05 AM -----"
    );
    expect(
      formatNoteHeaderLocalTimestamp(new Date(2026, 6, 24, 10, 21, 44))
    ).toBe("----- July 24, 2026 10:21:44 AM -----");
  });

  it("preserves legacy intraoral output and formats Slice 2 findings safely", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        structuredIntraoralFindings: undefined,
        intraoralStatus: "wnl",
      })
    ).toBe("d) Intraoral: WNL.");
    const hiddenStructuredFinding = {
      optionId: "ioe.saliva.normal_flow",
      structureId: "ioe.saliva",
    };
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "not-assessed",
        structuredIntraoralFindings: [hiddenStructuredFinding],
      })
    ).toBe("");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "wnl",
        structuredIntraoralFindings: [hiddenStructuredFinding],
      })
    ).toBe("d) Intraoral: WNL.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        intraoralFindings: "Legacy observation",
      })
    ).toBe("d) Intraoral: Legacy observation.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        intraoralFindings: "Free text",
        structuredIntraoralFindings: [
          {
            optionId: "ioe.buccal_mucosa.ulcer",
            structureId: "ioe.buccal_mucosa",
            locations: ["Right posterior"],
            measurement: "4",
            measurementUnit: "mm",
            comment: "Synthetic note",
          },
          {
            optionId: "ioe.unknown.retired",
            structureId: "ioe.tongue",
            comment: "must be ignored",
          },
        ],
      })
    ).toBe(`d) Intraoral:
  - Buccal mucosa: ulcer (location: Right posterior; measurement: 4 mm; notes: Synthetic note).
  Observations: Free text.`);
  });

  it("applies the explicit reviewed normal observations with compact per-structure output", () => {
    expect(recareNormalStructuredObservationIds).toEqual([
      "ioe.buccal_mucosa.pink",
      "ioe.buccal_mucosa.moist",
      "ioe.buccal_mucosa.no_lesions",
      "ioe.buccal_mucosa.no_swelling",
      "ioe.tongue.pink",
      "ioe.tongue.moist",
      "ioe.tongue.symmetrical",
      "ioe.tongue.no_lesions",
      "ioe.floor_of_mouth.pink",
      "ioe.floor_of_mouth.smooth",
      "ioe.floor_of_mouth.no_swelling",
      "ioe.floor_of_mouth.no_discoloration",
      "ioe.palate.pink",
      "ioe.palate.intact",
      "ioe.palate.no_lesions",
      "ioe.palate.no_abnormal_growths",
      "ioe.oropharynx.uvula_midline",
      "ioe.oropharynx.no_redness",
      "ioe.oropharynx.no_swelling",
      "ioe.oropharynx.no_exudate",
      "ioe.saliva.clear",
      "ioe.saliva.normal_flow",
    ]);

    const structuredIntraoralFindings =
      createRecareNormalStructuredIntraoralFindings();
    expect(structuredIntraoralFindings).toHaveLength(22);
    expect(structuredIntraoralFindings.map(({ optionId }) => optionId)).toEqual(
      recareNormalStructuredObservationIds
    );
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        structuredIntraoralFindings,
      })
    ).toBe(`d) Intraoral:
  - Buccal mucosa: pink; moist; no lesions; no swelling.
  - Tongue: pink; moist; symmetrical; no lesions.
  - Floor of mouth: pink; smooth; no swelling; no discoloration.
  - Palate (hard/soft): pink; intact; no lesions; no abnormal growths.
  - Oropharynx: uvula midline; no redness; no swelling; no exudate.
  - Saliva: clear; normal flow.`);
  });

  it("groups structured observations in catalogue order regardless of selection order", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        structuredIntraoralFindings: [
          {
            optionId: "ioe.saliva.normal_flow",
            structureId: "ioe.saliva",
          },
          {
            optionId: "ioe.buccal_mucosa.ulcer",
            structureId: "ioe.buccal_mucosa",
            locations: ["Right"],
            comment: "monitor",
          },
          {
            optionId: "ioe.buccal_mucosa.pink",
            structureId: "ioe.buccal_mucosa",
          },
          {
            optionId: "ioe.tongue.fissured",
            structureId: "ioe.tongue",
          },
        ],
      })
    ).toBe(`d) Intraoral:
  - Buccal mucosa: pink; ulcer (location: Right; notes: monitor).
  - Tongue: fissured.
  - Saliva: normal flow.`);
  });

  it("formats all IOE quick presets through their structured sections", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        intraoralStatus: "findings",
        structuredIntraoralFindings: [
          {
            optionId: "ioe.tongue.coated",
            structureId: "ioe.tongue",
          },
          {
            optionId: "ioe.tongue.fissured",
            structureId: "ioe.tongue",
          },
          {
            optionId: "ioe.tongue.scalloped_edges",
            structureId: "ioe.tongue",
          },
          {
            optionId: "ioe.buccal_mucosa.linea_alba",
            structureId: "ioe.buccal_mucosa",
            laterality: "Bilateral",
          },
          {
            optionId: "ioe.palate.torus_palatinus",
            structureId: "ioe.palate",
            locations: ["Midline"],
          },
          {
            optionId: "ioe.floor_of_mouth.mandibular_tori",
            structureId: "ioe.floor_of_mouth",
            laterality: "Bilateral",
          },
        ],
      }),
    ).toBe(`d) Intraoral:
  - Buccal mucosa: linea alba (location: Bilateral).
  - Tongue: coated; fissured; scalloped lateral borders.
  - Floor of mouth: mandibular tori (location: Bilateral).
  - Palate (hard/soft): torus palatinus (location: Midline).`);
  });

  it("supports percent, millimetre, and dual overbite output", () => {
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        overbitePercent: "25",
      })
    ).toBe("Overbite: 25%.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        overbiteMm: "2",
      })
    ).toBe("Overbite: 2 mm.");
    expect(
      buildRecareExamSummary({
        ...createEmptyRecareExamForm(),
        overbitePercent: "25",
        overbiteMm: "2",
      })
    ).toBe("Overbite: 25%; 2 mm.");
  });
});

describe("interactive template lifecycle", () => {
  it("publishes pilots while excluding drafts from production", () => {
    expect(isTemplateAvailableForBuild("draft", "production")).toBe(false);
    expect(isTemplateAvailableForBuild("draft", "development")).toBe(true);
    expect(isTemplateAvailableForBuild("ready", "production")).toBe(true);
    expect(isTemplateAvailableForBuild("pilot", "production")).toBe(true);
  });
});
