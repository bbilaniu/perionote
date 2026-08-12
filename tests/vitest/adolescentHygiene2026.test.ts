import { describe, expect, it } from "vitest";
import { getClinicConversionBySourceSlug } from "@/components/clinic-templates/conversionRegistry";
import { getClinicTemplateBySlug } from "@/lib/clinic-templates/registry";
import {
  buildAdolescentHygiene2026Summary,
  createEmptyAdolescentHygiene2026Form,
} from "@/lib/templates/adolescentHygiene2026";
import { adolescentHygiene2026Fixture } from "@/lib/templates/fixtures/adolescentHygiene2026.fixture";
import { interactiveDraftTemplates } from "@/lib/templates/interactiveDraftTemplates";

describe("2026 adolescent hygiene", () => {
  it("keeps the original adolescent source and conversion separate", () => {
    const originalSource = getClinicTemplateBySlug("adolescent-hygiene");
    const source2026 = getClinicTemplateBySlug("adolescent-hygiene-2026");
    const originalConversion =
      getClinicConversionBySourceSlug("adolescent-hygiene");
    const conversion2026 = getClinicConversionBySourceSlug(
      "adolescent-hygiene-2026",
    );

    expect(originalSource?.sourceTitle).toBe("12-17YRS Old Hygiene Template");
    expect(originalSource?.content).not.toContain("ONE ENCOUNTER");
    expect(source2026?.content).toContain("ONE ENCOUNTER — THREE NOTE OUTPUTS");
    expect(conversion2026?.component).not.toBe(originalConversion?.component);
    expect(conversion2026?.slug).toBe("adolescent-hygiene-2026");
    expect(interactiveDraftTemplates["adolescent-hygiene-2026"]).toEqual({
      label: "2026 Adolescent Hygiene",
      href: "/templates/clinic/adolescent-hygiene-2026/interactive",
      professionalFields: interactiveDraftTemplates["adolescent-hygiene"]
        .professionalFields,
    });
  });

  it("builds combined, dentist, and hygienist notes from one form", () => {
    const combined = buildAdolescentHygiene2026Summary(
      adolescentHygiene2026Fixture,
      { output: "complete" },
    );
    const dentist = buildAdolescentHygiene2026Summary(
      adolescentHygiene2026Fixture,
      { output: "recare" },
    );
    const hygienist = buildAdolescentHygiene2026Summary(
      adolescentHygiene2026Fixture,
      { output: "hygiene" },
    );

    expect(combined).toContain("EOE:");
    expect(combined).toContain("Treatment completed today:");
    expect(combined).toContain(
      "Information relayed to parent or legal guardian: Yes",
    );

    expect(dentist).toContain("EOE:");
    expect(dentist).not.toContain("Treatment completed today:");
    expect(dentist).not.toContain("Information relayed to parent");

    expect(hygienist).not.toContain("EOE:");
    expect(hygienist).toContain("Treatment completed today:");
    expect(hygienist).toContain(
      "Information relayed to parent or legal guardian: Yes",
    );
  });

  it("starts with an empty adolescent encounter", () => {
    expect(createEmptyAdolescentHygiene2026Form()).toMatchObject({
      patientId: "",
      vitalsReadings: [],
      guardianCommunicationStatus: "not-documented",
      guardianCommunicationDetails: "",
    });
  });
});
