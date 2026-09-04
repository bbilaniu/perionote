import type { InteractiveDraft } from "@/lib/templates/localDrafts";
import type { LocalDraftSaveResult } from "@/components/templates/shared/useLocalInteractiveDraft";

export type LocalDraftWorkspaceState = {
  templateId: string;
  templateName: string;
  currentDraftId: string;
  drafts: readonly InteractiveDraft<unknown>[];
  lastSavedAt: Date | null;
  restoredAt: Date | null;
  storageError: string;
  onRestore: (draftId: string) => void;
  onSaveCurrent: () => LocalDraftSaveResult;
};
