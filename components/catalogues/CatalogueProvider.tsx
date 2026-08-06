"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CATALOGUE_STORAGE_KEY,
  CatalogueImportPreview,
  CatalogueItem,
  CatalogueKey,
  CatalogueOwner,
  CatalogueValidationError,
  StoredCatalogueStateV1,
  createEmptyCatalogueState,
  deleteUserCatalogueItem,
  favoriteAndUnhideCatalogueItem,
  findEquivalentCatalogueItem,
  listCatalogueItems,
  mergeCatalogueStates,
  moveCatalogueItem,
  parseCatalogueState,
  parseStoredCatalogueJson,
  previewCatalogueImport,
  readCatalogueState,
  rememberCatalogueValue,
  setCatalogueItemFavorite,
  setCatalogueItemHidden,
  updateUserCatalogueItem,
  writeCatalogueState,
} from "@/lib/catalogues/catalogue";
import {
  PROVIDER_DEFAULTS_STORAGE_KEY,
  ProviderCatalogueKey,
  ProviderDefaultsValidationError,
  StoredProviderDefaultsV1,
  clearProviderDefault as clearStoredProviderDefault,
  createEmptyProviderDefaults,
  getProviderDefaultItem,
  parseStoredProviderDefaultsJson,
  readProviderDefaults,
  reconcileProviderDefaults,
  setProviderDefault as setStoredProviderDefault,
  writeProviderDefaults,
} from "@/lib/catalogues/providerDefaults";

type StorageStatus = "loading" | "ready" | "unavailable" | "invalid";

type CatalogueContextValue = {
  state: StoredCatalogueStateV1;
  storageStatus: StorageStatus;
  providerDefaults: StoredProviderDefaultsV1;
  providerDefaultsStorageStatus: StorageStatus;
  error: string | null;
  clearError: () => void;
  getItems: (
    catalogueKey: CatalogueKey,
    options?: { includeHidden?: boolean },
  ) => CatalogueItem[];
  findEquivalent: (
    catalogueKey: CatalogueKey,
    label: string,
  ) => CatalogueItem | undefined;
  rememberValue: (
    catalogueKey: CatalogueKey,
    label: string,
  ) => "added" | "existing" | "reactivated";
  rememberAndSetProviderDefault: (
    catalogueKey: ProviderCatalogueKey,
    label: string,
  ) => "added" | "existing" | "reactivated";
  updateItem: (itemId: string, label: string) => void;
  setHidden: (
    itemId: string,
    owner: CatalogueOwner,
    hidden: boolean,
  ) => void;
  setFavorite: (
    itemId: string,
    owner: CatalogueOwner,
    favorite: boolean,
  ) => void;
  deleteItem: (itemId: string) => void;
  moveItem: (
    catalogueKey: CatalogueKey,
    itemId: string,
    direction: "up" | "down",
  ) => void;
  getProviderDefault: (
    catalogueKey: ProviderCatalogueKey,
  ) => CatalogueItem | undefined;
  setProviderDefault: (
    catalogueKey: ProviderCatalogueKey,
    itemId: string,
  ) => void;
  clearProviderDefault: (catalogueKey: ProviderCatalogueKey) => void;
  resetCatalogues: () => void;
  previewImport: (
    importedState: StoredCatalogueStateV1,
  ) => CatalogueImportPreview;
  applyImport: (
    importedState: StoredCatalogueStateV1,
    mode: "merge" | "replace",
  ) => void;
};

const CatalogueContext = createContext<CatalogueContextValue | null>(null);

function describeError(error: unknown): string {
  if (error instanceof CatalogueValidationError || error instanceof Error) {
    return error.message;
  }
  return "The local catalogue could not be updated.";
}

export function CatalogueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<StoredCatalogueStateV1>(
    createEmptyCatalogueState,
  );
  const [storageStatus, setStorageStatus] =
    useState<StorageStatus>("loading");
  const [providerDefaults, setProviderDefaults] =
    useState<StoredProviderDefaultsV1>(createEmptyProviderDefaults);
  const [providerDefaultsStorageStatus, setProviderDefaultsStorageStatus] =
    useState<StorageStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setState(readCatalogueState(window.localStorage));
      setStorageStatus("ready");
    } catch (loadError) {
      setStorageStatus(
        loadError instanceof CatalogueValidationError
          ? "invalid"
          : "unavailable",
      );
      setError(describeError(loadError));
    }

    try {
      setProviderDefaults(readProviderDefaults(window.localStorage));
      setProviderDefaultsStorageStatus("ready");
    } catch (loadError) {
      setProviderDefaultsStorageStatus(
        loadError instanceof ProviderDefaultsValidationError
          ? "invalid"
          : "unavailable",
      );
      setError(describeError(loadError));
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === CATALOGUE_STORAGE_KEY) {
        try {
          setState(
            event.newValue
              ? parseStoredCatalogueJson(event.newValue)
              : createEmptyCatalogueState(),
          );
          setStorageStatus("ready");
          setError(null);
        } catch (storageError) {
          setStorageStatus("invalid");
          setError(describeError(storageError));
        }
      }
      if (event.key === PROVIDER_DEFAULTS_STORAGE_KEY) {
        try {
          setProviderDefaults(
            event.newValue
              ? parseStoredProviderDefaultsJson(event.newValue)
              : createEmptyProviderDefaults(),
          );
          setProviderDefaultsStorageStatus("ready");
          setError(null);
        } catch (storageError) {
          setProviderDefaultsStorageStatus("invalid");
          setError(describeError(storageError));
        }
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const commit = useCallback(
    (
      nextState: StoredCatalogueStateV1,
      options: { permitRecovery?: boolean } = {},
    ) => {
      if (
        storageStatus !== "ready" &&
        !options.permitRecovery
      ) {
        const message =
          storageStatus === "invalid"
            ? "The stored catalogue is invalid. Reset or import a valid catalogue before saving values."
            : "Browser-local catalogue storage is unavailable.";
        setError(message);
        throw new CatalogueValidationError(message);
      }
      try {
        const validatedState = parseCatalogueState(nextState);
        writeCatalogueState(window.localStorage, validatedState);
        setState(validatedState);
        setStorageStatus("ready");
        setError(null);
      } catch (saveError) {
        setError(describeError(saveError));
        if (!(saveError instanceof CatalogueValidationError)) {
          setStorageStatus("unavailable");
        }
        throw saveError;
      }
    },
    [storageStatus],
  );

  const commitProviderDefaults = useCallback(
    (
      nextState: StoredProviderDefaultsV1,
      options: { permitRecovery?: boolean } = {},
    ) => {
      if (
        providerDefaultsStorageStatus !== "ready" &&
        !options.permitRecovery
      ) {
        const message =
          providerDefaultsStorageStatus === "invalid"
            ? "The stored provider defaults are invalid. Reset the local catalogues before saving defaults."
            : "Browser-local provider-default storage is unavailable.";
        setError(message);
        throw new ProviderDefaultsValidationError(message);
      }
      try {
        const validatedState = parseStoredProviderDefaultsJson(
          JSON.stringify(nextState),
        );
        writeProviderDefaults(window.localStorage, validatedState);
        setProviderDefaults(validatedState);
        setProviderDefaultsStorageStatus("ready");
        setError(null);
      } catch (saveError) {
        setError(describeError(saveError));
        if (!(saveError instanceof ProviderDefaultsValidationError)) {
          setProviderDefaultsStorageStatus("unavailable");
        }
        throw saveError;
      }
    },
    [providerDefaultsStorageStatus],
  );

  const getItems = useCallback(
    (
      catalogueKey: CatalogueKey,
      options: { includeHidden?: boolean } = {},
    ) => listCatalogueItems(state, catalogueKey, options),
    [state],
  );

  const findEquivalent = useCallback(
    (catalogueKey: CatalogueKey, label: string) =>
      findEquivalentCatalogueItem(state, catalogueKey, label),
    [state],
  );

  const rememberValue = useCallback(
    (catalogueKey: CatalogueKey, label: string) => {
      const result = rememberCatalogueValue(state, catalogueKey, label);
      if (result.status !== "existing") {
        commit(result.state);
      }
      return result.status;
    },
    [commit, state],
  );

  const rememberAndSetProviderDefault = useCallback(
    (catalogueKey: ProviderCatalogueKey, label: string) => {
      const result = rememberCatalogueValue(state, catalogueKey, label);
      if (result.status !== "existing") {
        commit(result.state);
      }
      commitProviderDefaults(
        setStoredProviderDefault(
          providerDefaults,
          result.state,
          catalogueKey,
          result.item.id,
        ),
      );
      return result.status;
    },
    [commit, commitProviderDefaults, providerDefaults, state],
  );

  const updateItem = useCallback(
    (itemId: string, label: string) => {
      commit(updateUserCatalogueItem(state, itemId, label));
    },
    [commit, state],
  );

  const setHidden = useCallback(
    (itemId: string, owner: CatalogueOwner, hidden: boolean) => {
      commit(setCatalogueItemHidden(state, itemId, owner, hidden));
      if (hidden) {
        const matchingDefault = Object.entries(
          providerDefaults.defaults,
        ).find(([, defaultItemId]) => defaultItemId === itemId);
        if (matchingDefault) {
          commitProviderDefaults(
            clearStoredProviderDefault(
              providerDefaults,
              matchingDefault[0] as ProviderCatalogueKey,
            ),
          );
        }
      }
    },
    [commit, commitProviderDefaults, providerDefaults, state],
  );

  const setFavorite = useCallback(
    (itemId: string, owner: CatalogueOwner, favorite: boolean) => {
      commit(
        favorite
          ? favoriteAndUnhideCatalogueItem(state, itemId, owner)
          : setCatalogueItemFavorite(state, itemId, owner, false),
      );
    },
    [commit, state],
  );

  const deleteItem = useCallback(
    (itemId: string) => {
      commit(deleteUserCatalogueItem(state, itemId));
      const matchingDefault = Object.entries(providerDefaults.defaults).find(
        ([, defaultItemId]) => defaultItemId === itemId,
      );
      if (matchingDefault) {
        commitProviderDefaults(
          clearStoredProviderDefault(
            providerDefaults,
            matchingDefault[0] as ProviderCatalogueKey,
          ),
        );
      }
    },
    [commit, commitProviderDefaults, providerDefaults, state],
  );

  const moveItem = useCallback(
    (
      catalogueKey: CatalogueKey,
      itemId: string,
      direction: "up" | "down",
    ) => {
      commit(moveCatalogueItem(state, catalogueKey, itemId, direction));
    },
    [commit, state],
  );

  const resetCatalogues = useCallback(() => {
    commit(createEmptyCatalogueState(), { permitRecovery: true });
    commitProviderDefaults(createEmptyProviderDefaults(), {
      permitRecovery: true,
    });
  }, [commit, commitProviderDefaults]);

  const getProviderDefault = useCallback(
    (catalogueKey: ProviderCatalogueKey) =>
      getProviderDefaultItem(providerDefaults, state, catalogueKey),
    [providerDefaults, state],
  );

  const setProviderDefault = useCallback(
    (catalogueKey: ProviderCatalogueKey, itemId: string) => {
      commitProviderDefaults(
        setStoredProviderDefault(
          providerDefaults,
          state,
          catalogueKey,
          itemId,
        ),
      );
    },
    [commitProviderDefaults, providerDefaults, state],
  );

  const clearProviderDefault = useCallback(
    (catalogueKey: ProviderCatalogueKey) => {
      commitProviderDefaults(
        clearStoredProviderDefault(providerDefaults, catalogueKey),
      );
    },
    [commitProviderDefaults, providerDefaults],
  );

  const previewImport = useCallback(
    (importedState: StoredCatalogueStateV1) =>
      previewCatalogueImport(state, importedState),
    [state],
  );

  const applyImport = useCallback(
    (
      importedState: StoredCatalogueStateV1,
      mode: "merge" | "replace",
    ) => {
      const validatedImport = parseCatalogueState(importedState);
      const nextState =
        mode === "merge"
          ? mergeCatalogueStates(state, validatedImport)
          : validatedImport;
      commit(nextState, { permitRecovery: true });
      commitProviderDefaults(
        reconcileProviderDefaults(providerDefaults, nextState),
        { permitRecovery: true },
      );
    },
    [commit, commitProviderDefaults, providerDefaults, state],
  );

  const value = useMemo<CatalogueContextValue>(
    () => ({
      state,
      storageStatus,
      providerDefaults,
      providerDefaultsStorageStatus,
      error,
      clearError,
      getItems,
      findEquivalent,
      rememberValue,
      rememberAndSetProviderDefault,
      updateItem,
      setHidden,
      setFavorite,
      deleteItem,
      moveItem,
      getProviderDefault,
      setProviderDefault,
      clearProviderDefault,
      resetCatalogues,
      previewImport,
      applyImport,
    }),
    [
      applyImport,
      clearError,
      deleteItem,
      error,
      findEquivalent,
      getItems,
      getProviderDefault,
      moveItem,
      previewImport,
      rememberAndSetProviderDefault,
      rememberValue,
      resetCatalogues,
      setFavorite,
      setHidden,
      setProviderDefault,
      state,
      storageStatus,
      providerDefaults,
      providerDefaultsStorageStatus,
      updateItem,
      clearProviderDefault,
    ],
  );

  return (
    <CatalogueContext.Provider value={value}>
      {children}
    </CatalogueContext.Provider>
  );
}

export function useCatalogues(): CatalogueContextValue {
  const context = useContext(CatalogueContext);
  if (!context) {
    throw new Error("useCatalogues must be used within CatalogueProvider.");
  }
  return context;
}
