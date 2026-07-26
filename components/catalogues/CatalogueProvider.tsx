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

type StorageStatus = "loading" | "ready" | "unavailable" | "invalid";

type CatalogueContextValue = {
  state: StoredCatalogueStateV1;
  storageStatus: StorageStatus;
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

    function handleStorage(event: StorageEvent) {
      if (event.key !== CATALOGUE_STORAGE_KEY) {
        return;
      }
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

  const updateItem = useCallback(
    (itemId: string, label: string) => {
      commit(updateUserCatalogueItem(state, itemId, label));
    },
    [commit, state],
  );

  const setHidden = useCallback(
    (itemId: string, owner: CatalogueOwner, hidden: boolean) => {
      commit(setCatalogueItemHidden(state, itemId, owner, hidden));
    },
    [commit, state],
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
    },
    [commit, state],
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
  }, [commit]);

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
      commit(
        mode === "merge"
          ? mergeCatalogueStates(state, validatedImport)
          : validatedImport,
        { permitRecovery: true },
      );
    },
    [commit, state],
  );

  const value = useMemo<CatalogueContextValue>(
    () => ({
      state,
      storageStatus,
      error,
      clearError,
      getItems,
      findEquivalent,
      rememberValue,
      updateItem,
      setHidden,
      setFavorite,
      deleteItem,
      moveItem,
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
      moveItem,
      previewImport,
      rememberValue,
      resetCatalogues,
      setFavorite,
      setHidden,
      state,
      storageStatus,
      updateItem,
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
