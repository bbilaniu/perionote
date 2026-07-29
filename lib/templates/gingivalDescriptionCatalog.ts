import catalogue from "@/docs/requests/2026-07-28_gingival-description-and-ioe/hygienenote-gingival-ioe.catalog.json";

export type GingivalDescriptionStatus = "not_assessed" | "wnl" | "findings";
export type GingivalFindingExtent = "generalized" | "localized" | "";

export type GingivalDescriptionFinding = {
  optionId: string;
  extent: GingivalFindingExtent;
  locations: string[];
  measurement: string;
  comment: string;
};

export type GingivalDescriptionAssessment = {
  status: GingivalDescriptionStatus;
  findings: GingivalDescriptionFinding[];
};

export const gingivalDescriptionCatalog =
  catalogue.normalizedSections.gingivalDescription;

export type GingivalCatalogDimension =
  (typeof gingivalDescriptionCatalog.dimensions)[number];
export type GingivalCatalogOption = GingivalCatalogDimension["options"][number];

export const gingivalCatalogOptions =
  gingivalDescriptionCatalog.dimensions.flatMap((dimension) =>
    dimension.options.map((option) => ({ dimension, option }))
  );

export function createEmptyGingivalDescriptionAssessment(): GingivalDescriptionAssessment {
  return { status: "not_assessed", findings: [] };
}

export function createGingivalDescriptionWnlAssessment(): GingivalDescriptionAssessment {
  return {
    status: "wnl",
    findings: gingivalDescriptionCatalog.wnlPreset.selectedOptionIds.map(
      (optionId) => ({
        optionId,
        extent: "",
        locations: [],
        measurement: "",
        comment: "",
      })
    ),
  };
}

export function copyGingivalDescriptionAssessment(
  assessment: GingivalDescriptionAssessment | undefined
): GingivalDescriptionAssessment {
  if (!assessment) return createEmptyGingivalDescriptionAssessment();
  return {
    status: assessment.status,
    findings: assessment.findings.map((finding) => ({
      ...finding,
      locations: [...finding.locations],
    })),
  };
}
