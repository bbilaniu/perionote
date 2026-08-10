export const interactiveDraftTemplates = {
  "adolescent-hygiene": {
    label: "12–17 Years Old Hygiene Template",
    href: "/templates/clinic/adolescent-hygiene/interactive",
    professionalFields: [
      { role: "Dentist", field: "dentist" },
      { role: "RDH", field: "rdh" },
      { role: "RDA", field: "rda" },
    ],
  },
  "adult-hygiene-2021": {
    label: "2021 Adult Hygiene",
    href: "/templates/clinic/adult-hygiene-2021/interactive",
    professionalFields: [
      { role: "Dentist", field: "dentist" },
      { role: "RDH", field: "rdh" },
      { role: "RDA", field: "rda" },
    ],
  },
  "adult-hygiene-2026": {
    label: "2026 Adult Hygiene",
    href: "/templates/clinic/adult-hygiene-2026/interactive",
    professionalFields: [
      { role: "Dentist", field: "dentist" },
      { role: "RDH", field: "rdh" },
      { role: "RDA", field: "rda" },
    ],
  },
  "recare-exam": {
    label: "Recare Exam",
    href: "/templates/clinic/recare-exam/interactive",
    professionalFields: [
      { role: "Dentist", field: "dentist" },
      { role: "RDH", field: "rdh" },
      { role: "RDA", field: "rda" },
    ],
  },
} as const;

export type InteractiveDraftTemplateId = keyof typeof interactiveDraftTemplates;

export function isInteractiveDraftTemplateId(
  value: string,
): value is InteractiveDraftTemplateId {
  return Object.prototype.hasOwnProperty.call(interactiveDraftTemplates, value);
}
