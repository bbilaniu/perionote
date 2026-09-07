import { describe, expect, it, vi } from "vitest";
import {
  deleteAllInteractiveDrafts,
  INTERACTIVE_DRAFT_RETENTION_MS,
  INTERACTIVE_DRAFT_STORAGE_PREFIX,
  interactiveDraftStorageKey,
  listInteractiveDraftSummaries,
  listInteractiveDrafts,
  matchesDraftShape,
  pruneInteractiveDrafts,
  readInteractiveDraft,
  readInteractiveDraftSummaries,
  writeInteractiveDraft,
} from "@/lib/templates/localDrafts";
import {
  createDraftSummarySnapshotReader,
  getServerDraftSummarySnapshot,
} from "@/lib/templates/localDraftSummaryStore";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

type ExampleForm = { patientId: string; selected: string[] };
const emptyForm: ExampleForm = { patientId: "", selected: [] };
const isExampleForm = (value: unknown): value is ExampleForm =>
  matchesDraftShape(value, emptyForm, { selected: "" });

describe("interactive local drafts", () => {
  it("reads valid summaries without deleting expired, malformed, or mismatched records", () => {
    const storage = new MemoryStorage();
    const now = Date.parse("2026-08-05T17:00:00.000Z");
    for (const [draftId, savedAt] of [
      ["retained", now],
      ["expired", now - INTERACTIVE_DRAFT_RETENTION_MS - 1],
    ] as const) {
      writeInteractiveDraft(storage, {
        templateId: "synthetic-template",
        draftId,
        form: emptyForm,
        startedAt: new Date(savedAt),
        now: new Date(savedAt),
      });
    }
    storage.setItem(`${INTERACTIVE_DRAFT_STORAGE_PREFIX}broken`, "not-json");
    storage.setItem(
      interactiveDraftStorageKey("synthetic-template", "mismatched"),
      storage.getItem(interactiveDraftStorageKey("synthetic-template", "retained"))!,
    );
    storage.setItem("unrelated", "retained");
    const removeItem = vi.spyOn(storage, "removeItem");
    const setItem = vi.spyOn(storage, "setItem");

    expect(readInteractiveDraftSummaries(storage, now).map(({ draftId }) => draftId)).toEqual(["retained"]);
    expect(removeItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(storage.length).toBe(5);

    expect(listInteractiveDraftSummaries(storage, now).map(({ draftId }) => draftId)).toEqual(["retained"]);
    expect(storage.length).toBe(2);
    expect(storage.getItem("unrelated")).toBe("retained");
  });

  it("round-trips versioned form state and sorts recoverable drafts", () => {
    const storage = new MemoryStorage();
    const older = writeInteractiveDraft(storage, {
      templateId: "synthetic-template",
      draftId: "older-tab",
      form: { patientId: "Synthetic A", selected: ["4 BW"] },
      startedAt: new Date("2026-08-05T15:00:00.000Z"),
      now: new Date("2026-08-05T15:01:00.000Z"),
    });
    writeInteractiveDraft(storage, {
      templateId: "synthetic-template",
      draftId: "newer-tab",
      form: { patientId: "Synthetic B", selected: ["2 PA"] },
      startedAt: new Date("2026-08-05T16:00:00.000Z"),
      now: new Date("2026-08-05T16:01:00.000Z"),
    });

    expect(
      readInteractiveDraft(
        storage,
        "synthetic-template",
        "older-tab",
        isExampleForm,
      ),
    ).toEqual(older);
    expect(
      listInteractiveDrafts(
        storage,
        "synthetic-template",
        isExampleForm,
        Date.parse("2026-08-05T17:00:00.000Z"),
      ).map((draft) => draft.draftId),
    ).toEqual(["newer-tab", "older-tab"]);
  });

  it("lists identifying metadata without exposing other form contents", () => {
    const storage = new MemoryStorage();
    writeInteractiveDraft(storage, {
      templateId: "adult-hygiene-2021",
      draftId: "adult-tab",
      form: {
        patientId: " Synthetic private patient ",
        dentist: "Synthetic Dentist",
        rda: "",
        rdh: "Synthetic RDH",
        selected: ["4 BW"],
      },
      startedAt: new Date("2026-08-05T15:00:00.000Z"),
      now: new Date("2026-08-05T15:01:00.000Z"),
    });
    writeInteractiveDraft(storage, {
      templateId: "recare-exam",
      draftId: "recare-tab",
      form: {
        patientId: "Synthetic other patient",
        dentist: "",
        rda: "Synthetic RDA",
        rdh: "",
        selected: ["2 PA"],
      },
      startedAt: new Date("2026-08-05T16:00:00.000Z"),
      now: new Date("2026-08-05T16:01:00.000Z"),
    });

    const summaries = listInteractiveDraftSummaries(
      storage,
      Date.parse("2026-08-05T17:00:00.000Z"),
    );

    expect(summaries).toEqual([
      {
        templateId: "recare-exam",
        draftId: "recare-tab",
        savedAt: "2026-08-05T16:01:00.000Z",
        startedAt: "2026-08-05T16:00:00.000Z",
        patientId: "Synthetic other patient",
        professionals: [{ role: "RDA", name: "Synthetic RDA" }],
        availableProfessionalRoles: ["Dentist", "RDH", "RDA"],
      },
      {
        templateId: "adult-hygiene-2021",
        draftId: "adult-tab",
        savedAt: "2026-08-05T15:01:00.000Z",
        startedAt: "2026-08-05T15:00:00.000Z",
        patientId: " Synthetic private patient ",
        professionals: [
          { role: "Dentist", name: "Synthetic Dentist" },
          { role: "RDH", name: "Synthetic RDH" },
        ],
        availableProfessionalRoles: ["Dentist", "RDH", "RDA"],
      },
    ]);
    expect(JSON.stringify(summaries)).not.toContain("4 BW");
    expect(JSON.stringify(summaries)).not.toContain("2 PA");
  });

  it("does not infer professional roles for an unavailable legacy template", () => {
    const storage = new MemoryStorage();
    const key = interactiveDraftStorageKey("legacy-template", "legacy-tab");
    const raw = JSON.stringify({
      kind: "hygienenote.interactive-draft",
      schemaVersion: 1,
      templateId: "legacy-template",
      draftId: "legacy-tab",
      savedAt: "2026-08-05T16:01:00.000Z",
      startedAt: "2026-08-05T16:00:00.000Z",
      form: {
        patientId: "LEGACY-001",
        dentist: "Name must not be guessed",
        assistant: "Generic assistant",
        rda: "Role must not be guessed",
      },
    });
    storage.setItem(key, raw);

    expect(
      listInteractiveDraftSummaries(
        storage,
        Date.parse("2026-08-05T17:00:00.000Z"),
      ),
    ).toEqual([
      expect.objectContaining({
        draftId: "legacy-tab",
        patientId: "LEGACY-001",
        professionals: [],
        availableProfessionalRoles: [],
      }),
    ]);
    expect(storage.getItem(key)).toBe(raw);
  });

  it("does not classify a generic assistant as an RDA", () => {
    const storage = new MemoryStorage();
    writeInteractiveDraft(storage, {
      templateId: "recare-exam",
      draftId: "assistant-tab",
      form: {
        patientId: "SYNTHETIC-ASSISTANT",
        dentist: "",
        rdh: "",
        rda: "",
        assistant: "Generic assistant",
      },
      startedAt: new Date("2026-08-05T16:00:00.000Z"),
      now: new Date("2026-08-05T16:01:00.000Z"),
    });

    expect(
      listInteractiveDraftSummaries(
        storage,
        Date.parse("2026-08-05T17:00:00.000Z"),
      )[0],
    ).toMatchObject({
      professionals: [],
      availableProfessionalRoles: ["Dentist", "RDH", "RDA"],
    });
  });

  it("deletes drafts older than seven days and malformed owned values", () => {
    const storage = new MemoryStorage();
    const now = Date.parse("2026-08-05T17:00:00.000Z");
    writeInteractiveDraft(storage, {
      templateId: "synthetic-template",
      draftId: "expired",
      form: emptyForm,
      startedAt: new Date(now - INTERACTIVE_DRAFT_RETENTION_MS - 2_000),
      now: new Date(now - INTERACTIVE_DRAFT_RETENTION_MS - 1),
    });
    writeInteractiveDraft(storage, {
      templateId: "synthetic-template",
      draftId: "retained",
      form: emptyForm,
      startedAt: new Date(now - INTERACTIVE_DRAFT_RETENTION_MS),
      now: new Date(now - INTERACTIVE_DRAFT_RETENTION_MS),
    });
    storage.setItem(`${INTERACTIVE_DRAFT_STORAGE_PREFIX}broken`, "not-json");
    storage.setItem("unrelated", "not-json");

    pruneInteractiveDrafts(storage, now);

    expect(
      storage.getItem(
        interactiveDraftStorageKey("synthetic-template", "expired"),
      ),
    ).toBeNull();
    expect(
      storage.getItem(
        interactiveDraftStorageKey("synthetic-template", "retained"),
      ),
    ).not.toBeNull();
    expect(
      storage.getItem(`${INTERACTIVE_DRAFT_STORAGE_PREFIX}broken`),
    ).toBeNull();
    expect(storage.getItem("unrelated")).toBe("not-json");
  });

  it("deletes every owned draft while preserving unrelated browser data", () => {
    const storage = new MemoryStorage();
    writeInteractiveDraft(storage, {
      templateId: "adult-hygiene-2021",
      draftId: "adult-tab",
      form: emptyForm,
      startedAt: new Date("2026-08-05T15:00:00.000Z"),
      now: new Date("2026-08-05T15:01:00.000Z"),
    });
    writeInteractiveDraft(storage, {
      templateId: "recare-exam",
      draftId: "recare-tab",
      form: emptyForm,
      startedAt: new Date("2026-08-05T16:00:00.000Z"),
      now: new Date("2026-08-05T16:01:00.000Z"),
    });
    storage.setItem("unrelated", "retained");

    expect(deleteAllInteractiveDrafts(storage)).toBe(2);
    expect(storage.getItem("unrelated")).toBe("retained");
    expect(
      [...Array(storage.length).keys()]
        .map((index) => storage.key(index))
        .some((key) => key?.startsWith(INTERACTIVE_DRAFT_STORAGE_PREFIX)),
    ).toBe(false);
  });

  it("rejects malformed form state before restoration", () => {
    const storage = new MemoryStorage();
    const key = interactiveDraftStorageKey("synthetic-template", "bad-form");
    storage.setItem(
      key,
      JSON.stringify({
        kind: "hygienenote.interactive-draft",
        schemaVersion: 1,
        templateId: "synthetic-template",
        draftId: "bad-form",
        savedAt: "2026-08-05T17:00:00.000Z",
        startedAt: "2026-08-05T16:00:00.000Z",
        form: { patientId: false, selected: [] },
      }),
    );

    expect(
      readInteractiveDraft(
        storage,
        "synthetic-template",
        "bad-form",
        isExampleForm,
      ),
    ).toBeUndefined();
  });

  it("requires explicit item shapes for arrays with empty defaults", () => {
    expect(matchesDraftShape({ selected: [] }, { selected: [] })).toBe(true);
    expect(matchesDraftShape({ selected: ["4 BW"] }, { selected: [] })).toBe(
      false,
    );
    expect(
      matchesDraftShape(
        { treatmentOptions: [{ id: "one", treatmentType: "Exam" }] },
        { treatmentOptions: [] },
        {
          treatmentOptions: { id: "", treatmentType: "", toothArea: "" },
        },
      ),
    ).toBe(false);
    expect(
      matchesDraftShape(
        {
          treatmentOptions: [
            { id: "one", treatmentType: "Exam", toothArea: "full mouth" },
          ],
        },
        { treatmentOptions: [] },
        {
          treatmentOptions: { id: "", treatmentType: "", toothArea: "" },
        },
      ),
    ).toBe(true);
    expect(
      matchesDraftShape(
        { treatmentOptions: [null] },
        { treatmentOptions: [] },
        {
          treatmentOptions: { id: "", treatmentType: "", toothArea: "" },
        },
      ),
    ).toBe(false);
  });

  it("does not delete a recent unsupported future schema", () => {
    const storage = new MemoryStorage();
    const key = interactiveDraftStorageKey("synthetic-template", "future");
    storage.setItem(
      key,
      JSON.stringify({
        kind: "hygienenote.interactive-draft",
        schemaVersion: 2,
        templateId: "synthetic-template",
        draftId: "future",
        savedAt: "2026-08-05T17:00:00.000Z",
        startedAt: "2026-08-05T16:00:00.000Z",
        form: emptyForm,
      }),
    );

    expect(
      listInteractiveDrafts(
        storage,
        "synthetic-template",
        isExampleForm,
        Date.parse("2026-08-05T18:00:00.000Z"),
      ),
    ).toEqual([]);
    expect(storage.getItem(key)).not.toBeNull();
    expect(
      listInteractiveDraftSummaries(
        storage,
        Date.parse("2026-08-05T18:00:00.000Z"),
      ),
    ).toEqual([]);
    expect(storage.getItem(key)).not.toBeNull();
  });
});

describe("draft summary snapshots", () => {
  it("keeps snapshots stable until displayed metadata changes", () => {
    const storage = new MemoryStorage();
    const now = new Date();
    const save = (patientId: string, selected: string[]) => writeInteractiveDraft(storage, {
      templateId: "adult-hygiene-2021",
      draftId: "snapshot",
      form: { patientId, selected },
      startedAt: now,
      now,
    });
    const getSnapshot = createDraftSummarySnapshotReader(() => storage);
    const empty = getSnapshot();
    expect(empty).toEqual({ summaries: [], loaded: true, unavailable: false });
    expect(getSnapshot()).toBe(empty);

    save("Synthetic A", ["clinical detail"]);
    const saved = getSnapshot();
    expect(saved).not.toBe(empty);
    expect(getSnapshot()).toBe(saved);
    expect(saved.summaries[0].patientId).toBe("Synthetic A");
    expect(JSON.stringify(saved)).not.toContain("clinical detail");
    save("Synthetic A", ["changed clinical detail"]);
    storage.setItem("unrelated", "changed");
    expect(getSnapshot()).toBe(saved);

    save("Synthetic B", []);
    const updated = getSnapshot();
    expect(updated).not.toBe(saved);
    expect(updated.summaries[0].patientId).toBe("Synthetic B");
    expect(saved.summaries[0].patientId).toBe("Synthetic A");
    storage.clear();
    expect(getSnapshot().summaries).toEqual([]);
  });

  it("reports blocked storage and recovers with a fresh snapshot", () => {
    const storage = new MemoryStorage();
    let blocked = false;
    const getSnapshot = createDraftSummarySnapshotReader(() => {
      if (blocked) throw new Error("Storage access denied");
      return storage;
    });
    const available = getSnapshot();
    blocked = true;
    const unavailable = getSnapshot();
    expect(unavailable).toEqual({ summaries: [], loaded: true, unavailable: true });
    expect(getSnapshot()).toBe(unavailable);
    blocked = false;
    expect(getSnapshot()).toEqual(available);
    expect(getSnapshot()).not.toBe(unavailable);
  });

  it("provides a stable hydration snapshot without opening browser storage", () => {
    const getStorage = vi.fn(() => new MemoryStorage());
    const getSnapshot = createDraftSummarySnapshotReader(getStorage);
    const server = getServerDraftSummarySnapshot();
    expect(server).toEqual({ summaries: [], loaded: false, unavailable: false });
    expect(getServerDraftSummarySnapshot()).toBe(server);
    expect(getStorage).not.toHaveBeenCalled();
    expect(getSnapshot().loaded).toBe(true);
    expect(getStorage).toHaveBeenCalledOnce();
    expect(getServerDraftSummarySnapshot()).toBe(server);
    expect(server.loaded).toBe(false);
  });
});
