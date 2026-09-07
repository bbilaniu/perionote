import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCatalogueStore } from "@/lib/catalogues/catalogueStore";
import {
  CATALOGUE_STORAGE_KEY,
  createEmptyCatalogueState,
  rememberCatalogueValue,
} from "@/lib/catalogues/catalogue";
import {
  PROVIDER_DEFAULTS_STORAGE_KEY,
  createEmptyProviderDefaults,
  setProviderDefault,
} from "@/lib/catalogues/providerDefaults";

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

function storageEvent(key: string | null) {
  window.dispatchEvent(Object.assign(new Event("storage"), { key }));
}

beforeEach(() => vi.stubGlobal("window", new EventTarget()));
afterEach(() => vi.unstubAllGlobals());

describe("catalogue storage subscriptions", () => {
  it("does not read storage during rendering and keeps snapshots stable", () => {
    const getStorage = vi.fn(makeStorage);
    const store = createCatalogueStore(getStorage);
    const server = store.getServerSnapshot();
    expect(store.getSnapshot()).toBe(server);
    expect(store.getSnapshot().storageStatus).toBe("loading");
    expect(getStorage).not.toHaveBeenCalled();
    const stop = store.subscribe(vi.fn());
    const loaded = store.getSnapshot();
    expect(loaded.storageStatus).toBe("ready");
    expect(loaded.providerDefaultsStorageStatus).toBe("ready");
    expect(store.getSnapshot()).toBe(loaded);
    expect(store.getServerSnapshot()).toBe(server);
    expect(server.storageStatus).toBe("loading");
    stop();
  });

  it("publishes same-tab saves and refreshes catalogue/default removal from another tab", () => {
    const storage = makeStorage();
    const store = createCatalogueStore(() => storage);
    const listener = vi.fn();
    const stop = store.subscribe(listener);
    const added = rememberCatalogueValue(createEmptyCatalogueState(), "visit-team.dentist", "Synthetic Dentist");
    store.commit(added.state);
    store.commitProviderDefaults(setProviderDefault(
      createEmptyProviderDefaults(), added.state, "visit-team.dentist", added.item.id,
    ));
    expect(store.getSnapshot().state).toEqual(added.state);
    expect(JSON.parse(storage.getItem(PROVIDER_DEFAULTS_STORAGE_KEY)!)).toEqual(store.getSnapshot().providerDefaults);
    expect(listener).toHaveBeenCalledTimes(3);
    storage.clear();
    storageEvent(null);
    expect(store.getSnapshot().state).toEqual(createEmptyCatalogueState());
    expect(store.getSnapshot().providerDefaults).toEqual(createEmptyProviderDefaults());
    const cleared = store.getSnapshot();
    stop();
    storageEvent(CATALOGUE_STORAGE_KEY);
    expect(store.getSnapshot()).toBe(cleared);
  });

  it("preserves valid data on malformed updates and permits explicit recovery", () => {
    const storage = makeStorage();
    const store = createCatalogueStore(() => storage);
    const stop = store.subscribe(vi.fn());
    const added = rememberCatalogueValue(createEmptyCatalogueState(), "visit-team.rdh", "Synthetic RDH");
    store.commit(added.state);
    const valid = store.getSnapshot().state;
    storage.setItem(CATALOGUE_STORAGE_KEY, "not-json");
    storageEvent(CATALOGUE_STORAGE_KEY);
    expect(store.getSnapshot().storageStatus).toBe("invalid");
    expect(store.getSnapshot().state).toBe(valid);
    expect(() => store.commit(added.state)).toThrow("stored catalogue is invalid");
    expect(storage.getItem(CATALOGUE_STORAGE_KEY)).toBe("not-json");
    store.clearError();
    expect(store.getSnapshot().error).toBeNull();
    expect(store.getSnapshot().storageStatus).toBe("invalid");
    store.commit(createEmptyCatalogueState(), { permitRecovery: true });
    expect(store.getSnapshot().storageStatus).toBe("ready");
    stop();
  });

  it("reports blocked storage and does not publish failed writes as saved data", () => {
    const storage = makeStorage();
    let blocked = true;
    const store = createCatalogueStore(() => {
      if (blocked) throw new Error("Storage blocked");
      return storage;
    });
    const stop = store.subscribe(vi.fn());
    expect(store.getSnapshot()).toMatchObject({ storageStatus: "unavailable", providerDefaultsStorageStatus: "unavailable" });
    blocked = false;
    storageEvent(null);
    const previous = store.getSnapshot().state;
    const added = rememberCatalogueValue(previous, "visit-team.rdh", "Unsaved RDH");
    vi.spyOn(storage, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
    expect(() => store.commit(added.state)).toThrow("Quota exceeded");
    expect(store.getSnapshot().state).toBe(previous);
    expect(store.getSnapshot()).toMatchObject({ storageStatus: "unavailable", error: "Quota exceeded" });
    stop();
  });

  it("reports invalid provider defaults independently of the catalogue", () => {
    const storage = makeStorage();
    storage.setItem(PROVIDER_DEFAULTS_STORAGE_KEY, "not-json");
    const store = createCatalogueStore(() => storage);
    const stop = store.subscribe(vi.fn());
    expect(store.getSnapshot()).toMatchObject({ storageStatus: "ready", providerDefaultsStorageStatus: "invalid" });
    expect(() => store.commitProviderDefaults(createEmptyProviderDefaults())).toThrow("stored provider defaults are invalid");
    store.commitProviderDefaults(createEmptyProviderDefaults(), { permitRecovery: true });
    expect(store.getSnapshot().providerDefaultsStorageStatus).toBe("ready");
    stop();
  });
});
