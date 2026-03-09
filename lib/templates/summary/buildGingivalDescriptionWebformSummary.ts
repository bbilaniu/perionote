import type { GingivalDescriptionWebformFixture } from "@/lib/templates/fixtures/gingivalDescriptionWebform.fixture";

export function buildGingivalDescriptionWebformSummary(
  fixture: GingivalDescriptionWebformFixture
): string {
  const lines: string[] = [];

  if (fixture.date) {
    lines.push(`Date: ${fixture.date}`);
  }

  fixture.findings.forEach((item) => {
    const parts: string[] = [
      `${item.section} - ${item.finding}`,
      item.extent === "generalized" ? "GEN" : "LOC"
    ];

    if (item.toothNumbers.trim()) {
      parts.push(`Teeth: ${item.toothNumbers.trim()}`);
    }

    if (item.locations.length) {
      parts.push(`Location: ${item.locations.join(", ")}`);
    }

    if (item.distributions.length) {
      parts.push(`Distribution: ${item.distributions.join(", ")}`);
    }

    if (item.notes.trim()) {
      parts.push(`Notes: ${item.notes.trim()}`);
    }

    lines.push(parts.join(" | "));
  });

  if (fixture.dentalHygieneDiagnosis.trim()) {
    lines.push(`Dental Hygiene Diagnosis: ${fixture.dentalHygieneDiagnosis.trim()}`);
  }

  return lines.join("\n");
}
