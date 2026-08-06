import { describe, expect, it } from "vitest";
import {
  filterDraftListMetadata,
  normalizeDraftListMetadata,
  sortDraftListMetadata,
  type DraftListMetadata,
  type DraftSortKey,
  type SortDirection,
} from "@/lib/templates/draftList";
import type { InteractiveDraftSummary } from "@/lib/templates/localDrafts";

function summary(
  overrides: Partial<InteractiveDraftSummary> & Pick<InteractiveDraftSummary, "draftId">,
): InteractiveDraftSummary {
  return {
    templateId: "adult-hygiene-2021",
    savedAt: "2026-08-05T16:00:00.000Z",
    startedAt: "2026-08-05T15:30:00.000Z",
    patientId: "",
    professionals: [],
    availableProfessionalRoles: ["Dentist", "RDH", "RDA"],
    ...overrides,
  };
}

function metadata(
  draftId: string,
  overrides: Partial<DraftListMetadata> = {},
): DraftListMetadata {
  return {
    draftId,
    templateId: "adult-hygiene-2021",
    templateName: "2021 Adult Hygiene",
    professionals: { dentist: [], rdh: [], rda: [] },
    professionalRoleAvailability: { dentist: true, rdh: true, rda: true },
    startedAt: "2026-08-05T15:30:00.000Z",
    lastSavedAt: "2026-08-05T16:00:00.000Z",
    expiresAt: "2026-08-12T16:00:00.000Z",
    ...overrides,
  };
}

function ids(
  drafts: readonly DraftListMetadata[],
  key: DraftSortKey,
  direction: SortDirection,
) {
  return sortDraftListMetadata(drafts, key, direction).map((draft) => draft.draftId);
}

describe("saved draft list metadata", () => {
  it("normalizes supported role metadata, preserves patient ID display, and derives expiration", () => {
    const draft = normalizeDraftListMetadata(
      summary({
        draftId: "normalized",
        patientId: " 0010-A ",
        professionals: [
          { role: "Dentist", name: "  Synthetic   Dentist " },
          { role: "RDH", name: "First RDH" },
          { role: "RDH", name: "Second RDH" },
        ],
      }),
    );

    expect(draft.patientId).toBe(" 0010-A ");
    expect(draft.professionals).toEqual({
      dentist: ["Synthetic Dentist"],
      rdh: ["First RDH", "Second RDH"],
      rda: [],
    });
    expect(draft.professionalRoleAvailability).toEqual({
      dentist: true,
      rdh: true,
      rda: true,
    });
    expect(draft.expiresAt).toBe("2026-08-12T16:00:00.000Z");
  });

  it("marks role metadata unavailable for an unknown legacy template", () => {
    const draft = normalizeDraftListMetadata(
      summary({
        draftId: "legacy",
        templateId: "legacy-template",
        availableProfessionalRoles: [],
      }),
    );

    expect(draft.templateName).toBe("Unavailable interactive template");
    expect(draft.professionalRoleAvailability).toEqual({
      dentist: false,
      rdh: false,
      rda: false,
    });
  });
});

describe("saved draft sorting", () => {
  const sortingDrafts = [
    metadata("older-recare", {
      templateName: "Recare Exam",
      patientId: "A-10",
      professionals: { dentist: ["Zed Dentist"], rdh: [], rda: ["A RDA"] },
      lastSavedAt: "2026-08-05T14:00:00.000Z",
    }),
    metadata("newer-adult", {
      patientId: "A-2",
      professionals: { dentist: ["Able Dentist"], rdh: ["Zed RDH"], rda: [] },
      lastSavedAt: "2026-08-05T17:00:00.000Z",
    }),
    metadata("middle-adult", {
      patientId: "10",
      professionals: { dentist: [], rdh: ["Able RDH"], rda: ["Zed RDA"] },
      lastSavedAt: "2026-08-05T16:00:00.000Z",
    }),
  ];

  it("defaults cleanly to raw last-saved timestamps in both directions", () => {
    expect(ids(sortingDrafts, "lastSavedAt", "descending")).toEqual([
      "newer-adult",
      "middle-adult",
      "older-recare",
    ]);
    expect(ids(sortingDrafts, "lastSavedAt", "ascending")).toEqual([
      "older-recare",
      "middle-adult",
      "newer-adult",
    ]);
  });

  it.each([
    ["template", "ascending", ["newer-adult", "middle-adult", "older-recare"]],
    ["template", "descending", ["older-recare", "newer-adult", "middle-adult"]],
    ["dentist", "ascending", ["newer-adult", "older-recare", "middle-adult"]],
    ["dentist", "descending", ["older-recare", "newer-adult", "middle-adult"]],
    ["rdh", "ascending", ["middle-adult", "newer-adult", "older-recare"]],
    ["rdh", "descending", ["newer-adult", "middle-adult", "older-recare"]],
    ["rda", "ascending", ["older-recare", "middle-adult", "newer-adult"]],
    ["rda", "descending", ["middle-adult", "older-recare", "newer-adult"]],
  ] as const)("sorts %s %s with missing values last", (key, direction, expected) => {
    expect(ids(sortingDrafts, key, direction)).toEqual(expected);
  });

  it("sorts patient IDs naturally without changing their displayed values", () => {
    const patientIds = ["9", "10", "100", "0010", "A-2", "A-10"];
    const drafts = patientIds.map((patientId, index) =>
      metadata(`${index}-${patientId}`, {
        patientId,
        lastSavedAt: `2026-08-05T1${index}:00:00.000Z`,
      }),
    );

    const ascending = sortDraftListMetadata(drafts, "patientId", "ascending");
    expect(ascending.map((draft) => draft.patientId)).toEqual([
      "9",
      "0010",
      "10",
      "100",
      "A-2",
      "A-10",
    ]);
    expect(sortDraftListMetadata(drafts, "patientId", "descending").map((draft) => draft.patientId)).toEqual([
      "A-10",
      "A-2",
      "100",
      "10",
      "0010",
      "9",
    ]);
    expect(drafts.map((draft) => draft.patientId)).toEqual(patientIds);
  });

  it("preserves multiple-professional order and uses deterministic tie-breakers", () => {
    const drafts = [
      metadata("b", {
        templateName: "Same",
        professionals: { dentist: ["Beta", "Alpha"], rdh: [], rda: [] },
      }),
      metadata("a", {
        templateName: "Same",
        professionals: { dentist: ["Alpha", "Beta"], rdh: [], rda: [] },
      }),
      metadata("c", {
        templateName: "Same",
        professionals: { dentist: ["Alpha", "Beta"], rdh: [], rda: [] },
      }),
    ];

    expect(ids(drafts, "dentist", "ascending")).toEqual(["a", "c", "b"]);
    expect(drafts[0].professionals.dentist).toEqual(["Beta", "Alpha"]);
  });

  it("does not mutate the source array", () => {
    const source = [...sortingDrafts];
    sortDraftListMetadata(source, "template", "ascending");
    expect(source).toEqual(sortingDrafts);
  });
});

describe("saved draft search", () => {
  const drafts = [
    metadata("smith-00123", {
      templateName: "2021 Adult Hygiene",
      patientId: "00123-A",
      professionals: {
        dentist: ["Synthetic Dentist"],
        rdh: ["Jane Smith"],
        rda: ["Alex Assistant"],
      },
    }),
    metadata("recare-900", {
      templateName: "Recare Exam",
      patientId: "ZX-900",
      professionals: {
        dentist: ["Morgan Lee"],
        rdh: [],
        rda: ["Taylor RDA"],
      },
    }),
  ];

  it.each([
    ["00123-A", ["smith-00123"]],
    ["123", ["smith-00123"]],
    ["zx-9", ["recare-900"]],
    ["adult", ["smith-00123"]],
    ["dentist", ["smith-00123"]],
    ["SMITH", ["smith-00123"]],
    ["taylor", ["recare-900"]],
    ["  jane    00123  ", ["smith-00123"]],
    ["smith adult", ["smith-00123"]],
    ["smith 900", []],
  ] as const)("filters %j across only normalized identification fields", (query, expected) => {
    expect(filterDraftListMetadata(drafts, query).map((draft) => draft.draftId)).toEqual(expected);
  });

  it("treats whitespace-only search as inactive and excludes hidden clinical content", () => {
    const draftWithHiddenData = {
      ...drafts[0],
      generatedNote: "SECRET-FINDING",
      clinicalAnswer: "hidden value",
    } as DraftListMetadata;
    expect(filterDraftListMetadata([draftWithHiddenData], "   ")).toEqual([
      draftWithHiddenData,
    ]);
    expect(filterDraftListMetadata([draftWithHiddenData], "SECRET-FINDING")).toEqual([]);
    expect(filterDraftListMetadata([draftWithHiddenData], "hidden value")).toEqual([]);
  });

  it("filters before sorting while leaving sort choice independent", () => {
    const filtered = filterDraftListMetadata(drafts, "a");
    expect(ids(filtered, "patientId", "descending")).toEqual([
      "recare-900",
      "smith-00123",
    ]);
    expect(filterDraftListMetadata(drafts, "")).toHaveLength(2);
  });
});
