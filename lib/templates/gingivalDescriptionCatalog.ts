import catalogue from "@/lib/templates/catalogues/gingival-ioe.catalog.json";

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
  customFindings?: string;
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
  return { status: "not_assessed", findings: [], customFindings: "" };
}

function createGingivalDescriptionPresetAssessment(
  status: GingivalDescriptionStatus
): GingivalDescriptionAssessment {
  return {
    status,
    customFindings: "",
    findings: gingivalDescriptionCatalog.wnlPreset.selectedOptionIds.map(
      (optionId) => ({
        optionId,
        extent: "generalized",
        locations: [],
        measurement: "",
        comment: "",
      })
    ),
  };
}

export function createGingivalDescriptionWnlAssessment(): GingivalDescriptionAssessment {
  return createGingivalDescriptionPresetAssessment("wnl");
}

export const gingivitisObservationPresetOptionIds = [
  "gingiva.color.marginal_redness",
  "gingiva.contour.rolled_margins",
  "gingiva.consistency.spongy",
  "gingiva.surface.smooth_attached",
] as const;

const gingivitisObservationConflictOptionIds = new Set([
  "gingiva.color.coral_pink",
  "gingiva.color.red_erythematous",
  "gingiva.color.marginal_redness",
  "gingiva.color.bright_red",
  "gingiva.color.bluish_red",
  "gingiva.color.pale_pink",
  "gingiva.contour.knife_edged_margins",
  "gingiva.contour.rounded_margins",
  "gingiva.contour.rolled_margins",
  "gingiva.contour.bulbous_margins",
  "gingiva.consistency.firm",
  "gingiva.consistency.soft",
  "gingiva.consistency.spongy",
  "gingiva.consistency.fibrotic",
  "gingiva.consistency.edematous",
  "gingiva.surface.stippled_attached",
  "gingiva.surface.smooth_attached",
  "gingiva.surface.loss_of_stippling",
  "gingiva.surface.excessive_stippling_fibrotic",
]);

export function hasConflictingGingivitisPresetObservations(
  assessment: GingivalDescriptionAssessment,
): boolean {
  if (assessment.status === "wnl") return true;
  const presetIds = new Set<string>(gingivitisObservationPresetOptionIds);
  return assessment.findings.some(
    (finding) => {
      if (!gingivitisObservationConflictOptionIds.has(finding.optionId)) {
        return false;
      }
      if (!presetIds.has(finding.optionId)) return true;
      return (
        finding.extent !== "generalized" ||
        finding.locations.length > 0 ||
        Boolean(finding.measurement.trim())
      );
    },
  );
}

export function applyGingivitisObservationPreset(
  assessment: GingivalDescriptionAssessment,
): GingivalDescriptionAssessment {
  const sourceFindings =
    assessment.status === "wnl" ? [] : assessment.findings;
  const existingById = new Map(
    sourceFindings.map((finding) => [finding.optionId, finding]),
  );
  return {
    ...assessment,
    status: "findings",
    findings: [
      ...sourceFindings.filter(
        (finding) =>
          !gingivitisObservationConflictOptionIds.has(finding.optionId),
      ),
      ...gingivitisObservationPresetOptionIds.map((optionId) => ({
        ...(existingById.get(optionId) ?? {
          optionId,
          locations: [],
          measurement: "",
          comment: "",
        }),
        extent: "generalized" as const,
        locations: [],
        measurement: "",
      })),
    ],
  };
}

export function copyGingivalDescriptionAssessment(
  assessment: GingivalDescriptionAssessment | undefined
): GingivalDescriptionAssessment {
  if (!assessment) return createEmptyGingivalDescriptionAssessment();
  return {
    status: assessment.status,
    customFindings: assessment.customFindings ?? "",
    findings: assessment.findings.map((finding) => ({
      ...finding,
      locations: [...finding.locations],
    })),
  };
}
