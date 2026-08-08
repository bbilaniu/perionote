import { describe, expect, it } from "vitest";
import { getClinicConversionBySourceSlug } from "@/components/clinic-templates/conversionRegistry";
import { getClinicTemplateBySlug } from "@/lib/clinic-templates/registry";
import { createEmptyAdultHygiene2021Form } from "@/lib/templates/adultHygiene2021";
import { createEmptyAdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import { adultHygiene2021Fixture } from "@/lib/templates/fixtures/adultHygiene2021.fixture";
import { adultHygiene2026Fixture } from "@/lib/templates/fixtures/adultHygiene2026.fixture";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";

describe("2026 Adult Hygiene copy", () => {
  it("starts with the same source, form, fixture, and output as 2021", () => {
    expect(getClinicTemplateBySlug("adult-hygiene-2026")?.content).toBe(
      getClinicTemplateBySlug("adult-hygiene-2021")?.content,
    );
    expect(createEmptyAdultHygiene2026Form()).toEqual(
      createEmptyAdultHygiene2021Form(),
    );
    expect(adultHygiene2026Fixture).toEqual(adultHygiene2021Fixture);
    expect(buildAdultHygiene2026Summary(adultHygiene2026Fixture)).toBe(
      buildAdultHygiene2021Summary(adultHygiene2021Fixture),
    );
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
