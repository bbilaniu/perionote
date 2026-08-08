import { describe, expect, it } from "vitest";
import { getClinicConversionBySourceSlug } from "@/components/clinic-templates/conversionRegistry";
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
    expect(source).toContain("EOE:\nExtraoral: [SELECT/INSERT: EOE]");
    expect(source).toContain("IOE:\nIntraoral: [SELECT/INSERT: IOE]");
    expect(getClinicTemplateBySlug("adult-hygiene-2021")?.content).not.toContain(
      "Extraoral: [SELECT/INSERT: EOE]",
    );

    expect(createEmptyAdultHygiene2026Form()).toMatchObject({
      extraoralStatus: "not-assessed",
      structuredExtraoralFindings: [],
      tmjStatus: "not-assessed",
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
    expect(summary).toContain("TMJ loading test: WNL.");
    expect(summary).toContain(`IOE:
  - Tongue: fissured.
  - Saliva: normal flow.
  Observations: Synthetic intraoral observation.`);
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
