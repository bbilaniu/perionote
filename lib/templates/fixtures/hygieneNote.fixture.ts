export interface HygieneNoteFixture {
  visitDate: string;
  plaqueLevel: string;
  calculusLevel: string;
  homeCare: string;
  recommendations: string[];
}

export const hygieneNoteFixture: HygieneNoteFixture = {
  visitDate: "2026-03-08",
  plaqueLevel: "Light generalized plaque",
  calculusLevel: "Localized lower anterior calculus",
  homeCare: "Brushes twice daily; intermittent flossing",
  recommendations: [
    "Daily flossing with posterior focus",
    "Power brush pressure reduction",
    "Reinforce 4-month recare interval"
  ]
};
