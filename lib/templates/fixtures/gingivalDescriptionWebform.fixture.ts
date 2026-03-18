export type FindingExtent = "generalized" | "localized";

export interface GingivalFinding {
  section: string;
  finding: string;
  extent: FindingExtent;
  toothNumbers: string;
  locations: string[];
  distributions: string[];
  notes: string;
}

export interface GingivalDescriptionWebformFixture {
  date: string;
  findings: GingivalFinding[];
}

export const gingivalDescriptionWebformFixture: GingivalDescriptionWebformFixture = {
  date: "2026-03-09",
  findings: []
};
