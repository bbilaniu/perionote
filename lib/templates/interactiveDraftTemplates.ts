export const interactiveDraftTemplates = {
  "adult-hygiene-2021": {
    label: "2021 Adult Hygiene",
    href: "/templates/clinic/adult-hygiene-2021/interactive",
  },
  "recare-exam": {
    label: "Recare Exam",
    href: "/templates/clinic/recare-exam/interactive",
  },
} as const;

export type InteractiveDraftTemplateId = keyof typeof interactiveDraftTemplates;

export function isInteractiveDraftTemplateId(
  value: string,
): value is InteractiveDraftTemplateId {
  return Object.prototype.hasOwnProperty.call(interactiveDraftTemplates, value);
}
