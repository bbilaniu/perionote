import type { GingivalDescriptionFixture } from "@/lib/templates/fixtures/gingivalDescription.fixture";

export function buildGingivalDescriptionSummary(fixture: GingivalDescriptionFixture): string {
  return [
    "Visit Details:",
    `  Date: ${fixture.visitDate}`,
    "History and Exam:",
    `  Patient concerns: ${fixture.patientConcerns}`,
    "Gingival Description:",
    `  Color: ${fixture.color} (${fixture.distribution}; teeth ${fixture.teeth.join(", ")}; location ${fixture.location}; ${fixture.severity}).`,
    "Next Appointment:",
    `  Planned care: ${fixture.plannedCare}.`,
    `  Recall frequency: ${fixture.recallFrequency}.`
  ].join("\n");
}
