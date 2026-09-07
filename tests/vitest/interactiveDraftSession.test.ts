import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInteractiveDraftSession,
  selectInteractiveDraftForCurrentTab,
  type InteractiveDraftRuntime,
} from "@/lib/templates/interactiveDraftSession";
import {
  interactiveDraftStorageKey,
  interactiveDraftTabStorageKey,
  matchesDraftShape,
  readInteractiveDraft,
  writeInteractiveDraft,
} from "@/lib/templates/localDrafts";

function makeStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
  };
}

type Form = { patientId: string };
const templateId = "synthetic-template";
const isValidForm = (value: unknown): value is Form => matchesDraftShape(value, { patientId: "" });
function runtime(patientId = ""): InteractiveDraftRuntime<Form> {
  return {
    form: { patientId },
    startedAt: new Date(),
    isEmpty: (form) => !form.patientId,
    isValidForm,
    onRestore: vi.fn(),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", Object.assign(new EventTarget(), {
    name: "",
    localStorage: makeStorage(),
    sessionStorage: makeStorage(),
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
  }));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("interactive draft sessions", () => {
  it("keeps render reads inert and restores only when subscribed", () => {
    const draft = writeInteractiveDraft(window.localStorage, {
      templateId, draftId: "saved", form: { patientId: "Saved patient" }, startedAt: new Date(),
    });
    selectInteractiveDraftForCurrentTab(templateId, draft.draftId);
    const getItem = vi.spyOn(window.localStorage, "getItem");
    const session = createInteractiveDraftSession<Form>(templateId);
    const current = runtime();
    session.updateRuntime(current);
    const server = session.getServerSnapshot();
    expect(session.getSnapshot()).toBe(server);
    expect(getItem).not.toHaveBeenCalled();
    expect(current.onRestore).not.toHaveBeenCalled();
    const stop = session.subscribe(vi.fn());
    expect(current.onRestore).toHaveBeenCalledExactlyOnceWith(draft);
    const restored = session.getSnapshot();
    expect(restored).toMatchObject({ hydrated: true, currentDraftId: "saved" });
    expect(session.getSnapshot()).toBe(restored);
    expect(session.getServerSnapshot()).toBe(server);
    expect(server.hydrated).toBe(false);

    // React Strict Mode can clean up before the restored form is committed.
    stop();
    expect(readInteractiveDraft(window.localStorage, templateId, "saved", isValidForm)?.form).toEqual(draft.form);
    const stopAgain = session.subscribe(vi.fn());
    expect(current.onRestore).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(1);
    stopAgain();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("autosaves and checkpoints the latest committed form, then removes listeners", () => {
    const session = createInteractiveDraftSession<Form>(templateId);
    session.updateRuntime(runtime("First edit"));
    const stop = session.subscribe(vi.fn());
    const draftId = session.getSnapshot().currentDraftId;
    session.updateRuntime(runtime("Latest edit"));
    vi.advanceTimersByTime(10_000);
    expect(readInteractiveDraft(window.localStorage, templateId, draftId, isValidForm)?.form.patientId).toBe("Latest edit");
    session.updateRuntime(runtime("Navigation edit"));
    stop();
    expect(readInteractiveDraft(window.localStorage, templateId, draftId, isValidForm)?.form.patientId).toBe("Navigation edit");
    expect(vi.getTimerCount()).toBe(0);
    const write = vi.spyOn(window.localStorage, "setItem");
    window.dispatchEvent(new Event("pagehide"));
    expect(write).not.toHaveBeenCalled();
  });

  it("preserves the snapshot when autosaving an unchanged empty form", () => {
    const session = createInteractiveDraftSession<Form>(templateId);
    session.updateRuntime(runtime());
    const stop = session.subscribe(vi.fn());
    const initialized = session.getSnapshot();

    vi.advanceTimersByTime(30_000);

    expect(session.getSnapshot()).toBe(initialized);
    stop();
  });

  it("preserves current identity and form when saving before a reset or restore fails", () => {
    const session = createInteractiveDraftSession<Form>(templateId);
    const current = runtime("Unsaved edit");
    session.updateRuntime(current);
    const stop = session.subscribe(vi.fn());
    const draftId = session.getSnapshot().currentDraftId;
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
    expect(session.beginNewDraft()).toBe("failed");
    session.restoreDraft("another-draft");
    expect(session.getSnapshot().currentDraftId).toBe(draftId);
    expect(current.onRestore).not.toHaveBeenCalled();
    expect(session.getSnapshot().storageError).toContain("current draft could not be saved");
    stop();
  });

  it("keeps the selected draft's data when checkpointing immediately after an explicit restore", () => {
    writeInteractiveDraft(window.localStorage, {
      templateId, draftId: "other", form: { patientId: "Other patient" }, startedAt: new Date(),
    });
    const session = createInteractiveDraftSession<Form>(templateId);
    session.updateRuntime(runtime("Current patient"));
    const stop = session.subscribe(vi.fn());
    const previousId = session.getSnapshot().currentDraftId;
    session.restoreDraft("other");
    window.dispatchEvent(new Event("pagehide"));
    expect(readInteractiveDraft(window.localStorage, templateId, previousId, isValidForm)?.form.patientId).toBe("Current patient");
    expect(readInteractiveDraft(window.localStorage, templateId, "other", isValidForm)?.form.patientId).toBe("Other patient");
    stop();
  });

  it("rejects inherited tab selection and refreshes recoverable drafts on storage events", () => {
    selectInteractiveDraftForCurrentTab(templateId, "inherited");
    window.name = "";
    const session = createInteractiveDraftSession<Form>(templateId);
    session.updateRuntime(runtime());
    const stop = session.subscribe(vi.fn());
    expect(session.getSnapshot().currentDraftId).not.toBe("inherited");
    expect(window.sessionStorage.getItem(interactiveDraftTabStorageKey(templateId))).toBe(session.getSnapshot().currentDraftId);
    writeInteractiveDraft(window.localStorage, {
      templateId, draftId: "another-tab", form: { patientId: "Other tab" }, startedAt: new Date(),
    });
    window.dispatchEvent(Object.assign(new Event("storage"), { key: interactiveDraftStorageKey(templateId, "another-tab") }));
    expect(session.getSnapshot().recoverableDrafts.map(({ draftId }) => draftId)).toEqual(["another-tab"]);
    stop();
  });

  it("finishes initialization with a visible error when storage is blocked", () => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage blocked"); } });
    const session = createInteractiveDraftSession<Form>(templateId);
    session.updateRuntime(runtime("Current patient"));
    const stop = session.subscribe(vi.fn());
    expect(session.getSnapshot().hydrated).toBe(true);
    expect(session.getSnapshot().storageError).toContain("storage is unavailable");
    expect(session.saveNow()).toBe("skipped");
    stop();
    expect(vi.getTimerCount()).toBe(0);
  });
});
