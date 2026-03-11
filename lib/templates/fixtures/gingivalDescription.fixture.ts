export interface GingivalDescriptionFixture {
  visitDate: string;
  patientConcerns: string;
  color: string;
  distribution: string;
  severity: string;
  location: string;
  teeth: string[];
  plannedCare: string;
  recallFrequency: string;
}

export const gingivalDescriptionFixture: GingivalDescriptionFixture = {
  visitDate: "2026-03-08",
  patientConcerns: "Bleeding gums while flossing.",
  color: "Pink",
  distribution: "Generalized",
  severity: "Mild",
  location: "Facial marginal",
  teeth: ["#5", "#8", "#11", "#30"],
  plannedCare: "4 bitewings and re-evaluation",
  recallFrequency: "4 months"
};
