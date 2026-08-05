import { describe, expect, it } from "vitest";
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
  writeInteractiveDraft,
} from "@/lib/templates/localDrafts";

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
  matchesDraftShape(value, emptyForm);

describe("interactive local drafts", () => {
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
      },
      {
        templateId: "adult-hygiene-2021",
        draftId: "adult-tab",
        savedAt: "2026-08-05T15:01:00.000Z",
        startedAt: "2026-08-05T15:00:00.000Z",
        patientId: "Synthetic private patient",
        professionals: [
          { role: "Dentist", name: "Synthetic Dentist" },
          { role: "RDH", name: "Synthetic RDH" },
        ],
      },
    ]);
    expect(JSON.stringify(summaries)).not.toContain("4 BW");
    expect(JSON.stringify(summaries)).not.toContain("2 PA");
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
