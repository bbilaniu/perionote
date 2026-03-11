import type { HygieneNoteFixture } from "@/lib/templates/fixtures/hygieneNote.fixture";

export function buildHygieneNoteSummary(fixture: HygieneNoteFixture): string {
  return [
    "Visit Details:",
    `  Date: ${fixture.visitDate}`,
    "Clinical Findings:",
    `  Plaque: ${fixture.plaqueLevel}.`,
    `  Calculus: ${fixture.calculusLevel}.`,
    "Home Care:",
    `  Current routine: ${fixture.homeCare}.`,
    "Recommendations:",
    ...fixture.recommendations.map((item) => `  - ${item}`)
  ].join("\n");
}
