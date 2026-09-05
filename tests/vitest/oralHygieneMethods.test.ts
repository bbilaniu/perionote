import { clinicTemplateRegistry } from "@/lib/clinic-templates/registry";
import { describe, expect, it } from "vitest";
import { createEmptyAdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import { createEmptyAdultHygiene2021Form } from "@/lib/templates/adultHygiene2021";
import { createEmptyAdolescentHygieneForm } from "@/lib/templates/adolescentHygiene";
import { createEmptyRecareExamForm } from "@/lib/templates/recareExam";
import { createEmptyChildRecareHygieneForm } from "@/lib/templates/childRecareHygiene";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";
import { buildAdultHygiene2021Summary } from "@/lib/templates/summary/buildAdultHygiene2021Summary";
import { buildAdolescentHygieneSummary } from "@/lib/templates/summary/buildAdolescentHygieneSummary";
import { buildRecareExamSummary } from "@/lib/templates/summary/buildRecareExamSummary";
import { buildChildRecareHygieneSummary } from "@/lib/templates/summary/buildChildRecareHygieneSummary";
import {
  buildAdolescentHygiene2026Summary,
  createEmptyAdolescentHygiene2026Form,
} from "@/lib/templates/adolescentHygiene2026";
import {
  buildInitialForm,
  buildSummaryText,
} from "@/components/templates/imported/GingivalDescriptionWebformImportedTemplate";
import { isAdultHygieneDraftForm } from "@/components/templates/native/AdultHygiene2026Template";
import { isValidChildRecareHygieneForm } from "@/components/templates/native/ChildRecareHygieneTemplate";
import {
  createEmptyOralHygieneMethods,
  formatOralHygieneMethods,
  type OralHygieneMethods,
} from "@/lib/templates/oralHygieneMethods";

const methods: OralHygieneMethods = {
  toothbrushTypes: ["Electric", "Manual"],
  flossingTypes: ["String floss", "Water flosser", "Interdental picks"],
};
const expected = [
  "Toothbrush type used: Electric; Manual.",
  "Flossing type used: String floss; Water flosser; Interdental picks.",
];
const summaries: Array<[string, (value: OralHygieneMethods) => string]> = [
  [
    "Adult 2021",
    (value) =>
      buildAdultHygiene2021Summary({
        ...createEmptyAdultHygiene2021Form(),
        ...value,
      }),
  ],
  [
    "Adolescent",
    (value) =>
      buildAdolescentHygieneSummary({
        ...createEmptyAdolescentHygieneForm(),
        ...value,
      }),
  ],
  [
    "Recare",
    (value) =>
      buildRecareExamSummary({ ...createEmptyRecareExamForm(), ...value }),
  ],
  [
    "Full, short and very-short webforms",
    (value) =>
      buildSummaryText({ ...buildInitialForm(undefined), ...value }, []),
  ],
];
for (const output of ["complete", "hygiene", "recare"] as const) {
  summaries.push([
    `Adult 2026 ${output}`,
    (value) =>
      buildAdultHygiene2026Summary(
        { ...createEmptyAdultHygiene2026Form(), ...value },
        { output },
      ),
  ]);
  summaries.push([
    `Adolescent 2026 ${output}`,
    (value) =>
      buildAdolescentHygiene2026Summary(
        { ...createEmptyAdolescentHygiene2026Form(), ...value },
        { output },
      ),
  ]);
}
for (const output of ["combined", "dentist", "hygienist"] as const) {
  summaries.push([
    `Child ${output}`,
    (value) =>
      buildChildRecareHygieneSummary(
        { ...createEmptyChildRecareHygieneForm(), ...value },
        { output },
      ),
  ]);
}

describe("patient-reported oral hygiene methods", () => {
  it("includes the questions in every hygiene and recare source template", () => {
    const categories = ["adult-hygiene", "periodontal-maintenance", "child-adolescent-hygiene", "recare-periodic-exam"];
    const templates = clinicTemplateRegistry.filter((template) => categories.includes(template.category));
    expect(templates).toHaveLength(9);
    for (const template of templates) {
      expect(template.content).toContain("Type of toothbrush used (select all): [Electric] [Manual]");
      expect(template.content).toContain("Type of flossing used (select all): [String floss] [Water flosser] [Interdental picks]");
    }
  });

  it.each(summaries)(
    "%s includes every selected method once without inferring education or defaults",
    (_name, summary) => {
      const blank = summary(createEmptyOralHygieneMethods());
      expect(blank).not.toMatch(/Toothbrush type used:|Flossing type used:/);
      const selected = summary(methods);
      for (const line of expected) expect(selected.split(line)).toHaveLength(2);
      expect(selected).not.toMatch(
        /OHI Reviewed|OHI reviewed|OH Aids Reviewed\/Recommended|Recommendations:/,
      );
      expect(summary(createEmptyOralHygieneMethods())).toBe(blank);
    },
  );

  it("preserves unfamiliar restored wording and omits undocumented categories", () => {
    expect(formatOralHygieneMethods({})).toEqual([]);
    expect(
      formatOralHygieneMethods({
        toothbrushTypes: [" Manual ", "Manual", "Synthetic custom brush", ""],
      }),
    ).toEqual(["Toothbrush type used: Manual; Synthetic custom brush."]);
  });

  it("accepts old clinical drafts and new method arrays, and rejects malformed arrays", () => {
    for (const [createForm, validate] of [
      [createEmptyAdultHygiene2026Form, isAdultHygieneDraftForm],
      [createEmptyChildRecareHygieneForm, isValidChildRecareHygieneForm],
    ] as const) {
      const form = createForm();
      const legacy: Record<string, unknown> = { ...form };
      delete legacy.toothbrushTypes;
      delete legacy.flossingTypes;
      expect(validate(legacy)).toBe(true);
      expect(validate({ ...form, ...methods })).toBe(true);
      expect(validate({ ...form, toothbrushTypes: [3] })).toBe(false);
      expect(validate({ ...form, flossingTypes: "Water flosser" })).toBe(false);
    }
  });
});
