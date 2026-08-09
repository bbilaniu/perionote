import { describe, expect, it } from "vitest";
import { getClinicConversionBySourceSlug } from "@/components/clinic-templates/conversionRegistry";
import { isAdultHygieneDraftForm } from "@/components/templates/native/AdultHygiene2026Template";
import { getClinicTemplateBySlug } from "@/lib/clinic-templates/registry";
import { createEmptyAdultHygiene2021Form } from "@/lib/templates/adultHygiene2021";
import { createEmptyAdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import { adultHygiene2021Fixture } from "@/lib/templates/fixtures/adultHygiene2021.fixture";
import { adultHygiene2026Fixture } from "@/lib/templates/fixtures/adultHygiene2026.fixture";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";

describe("2026 Adult Hygiene independence", () => {
  it("adds independent EOE and IOE source, form, fixture, and output state", () => {
    const source = getClinicTemplateBySlug("adult-hygiene-2026")?.content;
    const source2021 = getClinicTemplateBySlug("adult-hygiene-2021")?.content;
    expect(source).toContain("Last Recare Date: [AUTO: Last Recall Date]");
    expect(source).toContain("Recommended Recare Interval:");
    expect(source2021).toContain("Last Recare Date: [AUTO: Last Recall Date]");
    expect(source2021).toContain("Recommended Recare Interval:");
    expect(source).toContain("EOE:\nExtraoral: [SELECT/INSERT: EOE]");
    expect(source).toContain("IOE:\nIntraoral: [SELECT/INSERT: IOE]");
    expect(source2021).not.toContain(
      "Extraoral: [SELECT/INSERT: EOE]",
    );

    expect(createEmptyAdultHygiene2026Form()).toMatchObject({
      extraoralStatus: "not-assessed",
      structuredExtraoralFindings: [],
      tmjStatus: "not-assessed",
      lymphNodesStatus: "not-assessed",
      masseterStatus: "not-assessed",
      tmjLoadStatus: "not-assessed",
      intraoralStatus: "not-assessed",
      structuredIntraoralFindings: [],
    });

    const summary = buildAdultHygiene2026Summary(adultHygiene2026Fixture);
    expect(summary).toContain(`EOE:
  - TMJ clicking (laterality: Left; status: Asymptomatic; phase: On open).
  Observations: Synthetic extraoral observation.`);
    expect(summary).toContain("Masseter palpation: WNL.");
    expect(summary).toContain("Lymph nodes: WNL.");
    expect(summary).toContain("TMJ loading test: WNL.");
    expect(summary).toContain(`IOE:
  - Tongue: fissured.
  - Saliva: normal flow.
  Observations: Synthetic intraoral observation.`);
  });

  it("composes complete, hygiene, and recare notes from one encounter", () => {
    const complete = buildAdultHygiene2026Summary(adultHygiene2026Fixture, {
      output: "complete",
    });
    const hygiene = buildAdultHygiene2026Summary(adultHygiene2026Fixture, {
      output: "hygiene",
    });
    const recare = buildAdultHygiene2026Summary(adultHygiene2026Fixture, {
      output: "recare",
    });

    for (const summary of [complete, hygiene, recare]) {
      expect(summary).toContain("Last Recare Date: 2026-01-15");
      expect(summary).toContain("Coordinated Treatment Recommendations:");
      expect(summary).toContain("[Preventive] Hygiene maintenance — full mouth");
      expect(summary).toContain(
        "[Restorative] Synthetic restorative treatment — 14",
      );
    }

    expect(complete).toContain("EOE:");
    expect(complete).toContain("IOE:");
    expect(complete.slice(0, complete.indexOf("IOE:"))).toMatch(/\n\n$/);
    expect(complete).toContain("Radiographs: 2BW; 4PA");
    expect(complete).toContain("Teeth:");
    expect(complete).toContain("Molar occlusion—right: Class I.");
    expect(complete).toContain("CPAP: No.");
    expect(complete).toContain("Occlusal splint: Yes; uses.");
    expect(complete).toContain("Partial/complete removable dentures: No.");
    expect(complete).toContain(
      "Patient-requested smile or dental improvements: Synthetic request to discuss whitening.",
    );
    expect(complete).toContain("Treatment completed today:");
    expect(complete).toContain("Recommended Recare Interval: 6-month recall.");
    expect(complete).toContain("Next Dental Visit: Synthetic restorative treatment.");
    expect(complete).toContain("Next Hygiene Visit: Synthetic hygiene follow-up.");
    const orderedCompleteSections = [
      "Patient Chief Concern:",
      "EOE:",
      "IOE:",
      "Teeth:",
      "Oral habits:",
      "CPAP:",
      "Plaque:",
      "Moderate caries risk",
      "Oral hygiene compliance:",
      "Coordinated Treatment Recommendations:",
      "Treatment completed today:",
      "Recommended Recare Interval:",
      "Recommended Hygiene Interval:",
    ];
    orderedCompleteSections.reduce((previousIndex, section) => {
      const nextIndex = complete.indexOf(section);
      expect(nextIndex).toBeGreaterThan(previousIndex);
      return nextIndex;
    }, -1);

    expect(hygiene).not.toContain("EOE:");
    expect(hygiene).not.toContain("IOE:");
    expect(hygiene).not.toContain("Teeth:");
    expect(hygiene).not.toContain("Radiographs:");
    expect(hygiene).not.toContain("Molar occlusion—right:");
    expect(hygiene).toContain("Treatment completed today:");
    expect(hygiene).toContain("Next Hygiene Visit: Synthetic hygiene follow-up.");
    expect(hygiene).not.toContain("Recommended Recare Interval:");
    expect(hygiene).not.toContain("Next Dental Visit:");

    expect(recare).toContain("EOE:");
    expect(recare).toContain("IOE:");
    expect(recare.slice(0, recare.indexOf("IOE:"))).toMatch(/\n\n$/);
    expect(recare).toContain("Teeth:");
    expect(recare).toContain("Radiographs: 2BW; 4PA");
    expect(recare).toContain("Molar occlusion—right: Class I.");
    expect(recare).toContain("CPAP: No.");
    expect(recare).not.toContain("Treatment completed today:");
    expect(recare).toContain("Recommended Recare Interval: 6-month recall.");
    expect(recare).toContain("Next Dental Visit: Synthetic restorative treatment.");
    expect(recare).not.toContain("Next Hygiene Visit:");
  });

  it("accepts pre-unification 2026 drafts and rejects malformed new card state", () => {
    const legacyDraft = {
      ...createEmptyAdultHygiene2026Form(),
    } as Record<string, unknown>;
    for (const field of [
      "radiographs",
      "intraoralPhotosStatus",
      "intraoralPhotosDetails",
      "lymphNodesStatus",
      "lymphNodesFindings",
      "oralHabits",
      "additionalOcclusalFindings",
      "teethStatus",
      "toothFindings",
      "odontogramUpToDate",
      "treatmentOptions",
      "treatmentPlan",
      "cpapStatus",
      "occlusalSplintStatus",
      "removableDenturesStatus",
      "improvementRequest",
      "recareAdditionalComments",
      "dentalNextVisit",
      "dentalDateBooked",
    ]) {
      delete legacyDraft[field];
    }
    expect(isAdultHygieneDraftForm(legacyDraft)).toBe(true);
    expect(
      isAdultHygieneDraftForm({
        ...createEmptyAdultHygiene2026Form(),
        treatmentCompleted: [
          {
            id: "structured-scaling",
            treatmentType: "Scaling",
            toothAreas: ["full mouth"],
            procedureKind: "scaling",
            quantity: "2.5",
            instrumentation: ["hand"],
          },
        ],
      }),
    ).toBe(true);
    expect(
      isAdultHygieneDraftForm({
        ...legacyDraft,
        treatmentPlan: [{ id: 42, treatmentType: "Invalid", toothArea: "" }],
      }),
    ).toBe(false);
  });

  it("preserves legacy OHE fields and note wording in both hygiene templates", () => {
    const legacyOhe = {
      homeCareInstructionReviewed: true,
      ohiAidsReviewed: ["Interdental brush"],
      diseaseProcessReviewed: true,
      standardOheStatementApplies: true,
      oheTopicsReviewed: [
        "Bass brushing",
        "Sulcabrush and interdental brush technique",
      ],
    };
    const expected = `Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY
OH Aids Reviewed/Recommended: Interdental brush
REVIEWED DISEASE PROCESS WITH PATIENT TODAY
Patient's diagnoses and risk factors were explained to them. OHE on etiology of periodontitis and caries; and their risk factors. Demonstration of bass brushing, c-shape flossing technique. Reviewed benefits of Prevident 5000 or Opti-Rinse 0.05%.
OHE: Bass brushing; Sulcabrush and interdental brush technique.`;

    expect(
      buildAdultHygiene2021Summary({
        ...createEmptyAdultHygiene2021Form(),
        ...legacyOhe,
      }),
    ).toContain(expected);
    expect(
      buildAdultHygiene2026Summary({
        ...createEmptyAdultHygiene2026Form(),
        ...legacyOhe,
      }),
    ).toContain(expected);
  });

  it("uses independent model, fixture, summary, component, and draft identities", () => {
    const originalForm = createEmptyAdultHygiene2021Form();
    const copiedForm = createEmptyAdultHygiene2026Form();
    copiedForm.patientChiefConcern.push("2026-only concern");

    expect(originalForm.patientChiefConcern).toEqual([]);
    expect(adultHygiene2026Fixture).not.toBe(adultHygiene2021Fixture);
    expect(buildAdultHygiene2026Summary).not.toBe(
      buildAdultHygiene2021Summary,
    );

    const original = getClinicConversionBySourceSlug("adult-hygiene-2021");
    const copy = getClinicConversionBySourceSlug("adult-hygiene-2026");
    expect(copy?.component).not.toBe(original?.component);
    expect(copy?.slug).toBe("adult-hygiene-2026");
  });
});
