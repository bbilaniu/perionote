import {
  CATALOGUE_STORAGE_KEY,
  CatalogueValidationError,
  createEmptyCatalogueState,
  parseCatalogueState,
  readCatalogueState,
  writeCatalogueState,
  type StoredCatalogueStateV1,
} from "@/lib/catalogues/catalogue";
import {
  PROVIDER_DEFAULTS_STORAGE_KEY,
  ProviderDefaultsValidationError,
  createEmptyProviderDefaults,
  parseStoredProviderDefaultsJson,
  readProviderDefaults,
  writeProviderDefaults,
  type StoredProviderDefaultsV1,
} from "@/lib/catalogues/providerDefaults";

export type StorageStatus = "loading" | "ready" | "unavailable" | "invalid";
type Snapshot = {
  state: StoredCatalogueStateV1;
  storageStatus: StorageStatus;
  providerDefaults: StoredProviderDefaultsV1;
  providerDefaultsStorageStatus: StorageStatus;
  error: string | null;
};

function describeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The local catalogue could not be updated.";
}

export function createCatalogueStore(
  getStorage: () => Storage = () => window.localStorage,
) {
  const serverSnapshot: Snapshot = {
    state: createEmptyCatalogueState(),
    storageStatus: "loading",
    providerDefaults: createEmptyProviderDefaults(),
    providerDefaultsStorageStatus: "loading",
    error: null,
  };
  let snapshot = serverSnapshot;
  const listeners = new Set<() => void>();
  function publish(patch: Partial<Snapshot>) {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  }

  function refresh() {
    const next: Snapshot = { ...snapshot, error: null };
    try {
      next.state = readCatalogueState(getStorage());
      next.storageStatus = "ready";
    } catch (error) {
      next.storageStatus = error instanceof CatalogueValidationError
        ? "invalid" : "unavailable";
      next.error = describeError(error);
    }
    try {
      next.providerDefaults = readProviderDefaults(getStorage());
      next.providerDefaultsStorageStatus = "ready";
    } catch (error) {
      next.providerDefaultsStorageStatus = error instanceof ProviderDefaultsValidationError
        ? "invalid" : "unavailable";
      next.error = describeError(error);
    }
    publish(next);
  }

  function handleStorage(event: StorageEvent) {
    if (
      event.key === null ||
      event.key === CATALOGUE_STORAGE_KEY ||
      event.key === PROVIDER_DEFAULTS_STORAGE_KEY
    ) refresh();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
      window.addEventListener("storage", handleStorage);
      refresh();
    }
    return () => {
      listeners.delete(listener);
      if (!listeners.size) window.removeEventListener("storage", handleStorage);
    };
  }

  function commit(
    nextState: StoredCatalogueStateV1,
    options: { permitRecovery?: boolean } = {},
  ) {
    if (snapshot.storageStatus !== "ready" && !options.permitRecovery) {
      const message = snapshot.storageStatus === "invalid"
        ? "The stored catalogue is invalid. Reset or import a valid catalogue before saving values."
        : "Browser-local catalogue storage is unavailable.";
      publish({ error: message });
      throw new CatalogueValidationError(message);
    }
    try {
      const state = parseCatalogueState(nextState);
      writeCatalogueState(getStorage(), state);
      publish({ state, storageStatus: "ready", error: null });
    } catch (error) {
      publish({
        error: describeError(error),
        ...(error instanceof CatalogueValidationError ? {} : { storageStatus: "unavailable" }),
      });
      throw error;
    }
  }

  function commitProviderDefaults(
    nextState: StoredProviderDefaultsV1,
    options: { permitRecovery?: boolean } = {},
  ) {
    if (snapshot.providerDefaultsStorageStatus !== "ready" && !options.permitRecovery) {
      const message = snapshot.providerDefaultsStorageStatus === "invalid"
        ? "The stored provider defaults are invalid. Reset the local catalogues before saving defaults."
        : "Browser-local provider-default storage is unavailable.";
      publish({ error: message });
      throw new ProviderDefaultsValidationError(message);
    }
    try {
      const providerDefaults = parseStoredProviderDefaultsJson(JSON.stringify(nextState));
      writeProviderDefaults(getStorage(), providerDefaults);
      publish({ providerDefaults, providerDefaultsStorageStatus: "ready", error: null });
    } catch (error) {
      publish({
        error: describeError(error),
        ...(error instanceof ProviderDefaultsValidationError
          ? {} : { providerDefaultsStorageStatus: "unavailable" }),
      });
      throw error;
    }
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe,
    commit,
    commitProviderDefaults,
    clearError: () => publish({ error: null }),
  };
}
