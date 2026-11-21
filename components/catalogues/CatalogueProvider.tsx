"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  useMemo,
  useState,
} from "react";
import {
  CatalogueImportPreview,
  CatalogueItem,
  CatalogueItemMetadata,
  CatalogueKey,
  CatalogueOwner,
  StoredCatalogueStateV1,
  createEmptyCatalogueState,
  deleteUserCatalogueItem,
  favoriteAndUnhideCatalogueItem,
  findEquivalentCatalogueItem,
  listCatalogueItems,
  mergeCatalogueStates,
  moveCatalogueItem,
  parseCatalogueState,
  previewCatalogueImport,
  rememberCatalogueValue,
  setCatalogueItemFavorite,
  setCatalogueItemHidden,
  updateUserCatalogueItem,
} from "@/lib/catalogues/catalogue";
import {
  ProviderCatalogueKey,
  StoredProviderDefaultsV1,
  clearProviderDefault as clearStoredProviderDefault,
  createEmptyProviderDefaults,
  getProviderDefaultItem,
  reconcileProviderDefaults,
  setProviderDefault as setStoredProviderDefault,
} from "@/lib/catalogues/providerDefaults";

import { createCatalogueStore, type StorageStatus } from "@/lib/catalogues/catalogueStore";

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
    metadata?: CatalogueItemMetadata,
  ) => "added" | "existing" | "reactivated";
  rememberAndSetProviderDefault: (
    catalogueKey: ProviderCatalogueKey,
    label: string,
  ) => "added" | "existing" | "reactivated";
  updateItem: (
    itemId: string,
    label: string,
    metadata?: CatalogueItemMetadata,
  ) => void;
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

export function CatalogueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(createCatalogueStore);
  const {
    state,
    storageStatus,
    providerDefaults,
    providerDefaultsStorageStatus,
    error,
  } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const { commit, commitProviderDefaults, clearError } = store;

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
    (
      catalogueKey: CatalogueKey,
      label: string,
      metadata?: CatalogueItemMetadata,
    ) => {
      const result = rememberCatalogueValue(state, catalogueKey, label, {
        metadata,
      });
      if (result.state !== state) {
        commit(result.state);
      }
      return result.status;
    },
    [commit, state],
  );

  const rememberAndSetProviderDefault = useCallback(
    (catalogueKey: ProviderCatalogueKey, label: string) => {
      const result = rememberCatalogueValue(state, catalogueKey, label);
      if (result.state !== state) {
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
    (itemId: string, label: string, metadata?: CatalogueItemMetadata) => {
      commit(updateUserCatalogueItem(state, itemId, label, new Date(), metadata));
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
