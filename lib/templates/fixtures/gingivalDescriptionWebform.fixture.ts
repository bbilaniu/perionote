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
  dentalHygieneDiagnosis: string;
  findings: GingivalFinding[];
}

export const gingivalDescriptionWebformFixture: GingivalDescriptionWebformFixture = {
  date: "2026-03-09",
  dentalHygieneDiagnosis: "Generalized mild plaque-induced gingival inflammation with localized bleeding on probing.",
  findings: [
    {
      section: "Color",
      finding: "Red",
      extent: "localized",
      toothNumbers: "#5, #6-8",
      locations: ["Facial", "Interproximal"],
      distributions: ["Marginal", "Papillary"],
      notes: "More pronounced in maxillary anterior region."
    },
    {
      section: "Bleeding & Exudate",
      finding: "BOP",
      extent: "generalized",
      toothNumbers: "",
      locations: ["Facial", "Lingual"],
      distributions: ["Marginal"],
      notes: "No exudate present."
    },
    {
      section: "Gingival Position",
      finding: "Recession",
      extent: "localized",
      toothNumbers: "#24, #25",
      locations: ["Facial"],
      distributions: ["Diffuse"],
      notes: "Consistent with traumatic brushing history."
    }
  ]
};
