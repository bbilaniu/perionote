import {
  readInteractiveDraftSummaries,
  type InteractiveDraftStorage,
  type InteractiveDraftSummary,
} from "@/lib/templates/localDrafts";

type DraftSummarySnapshot = {
  summaries: InteractiveDraftSummary[];
  loaded: boolean;
  unavailable: boolean;
};

const serverSnapshot: DraftSummarySnapshot = {
  summaries: [],
  loaded: false,
  unavailable: false,
};

export function getServerDraftSummarySnapshot(): DraftSummarySnapshot {
  return serverSnapshot;
}

export function createDraftSummarySnapshotReader(
  getStorage: () => InteractiveDraftStorage,
): () => DraftSummarySnapshot {
  let snapshot = serverSnapshot;
  let previousContents = "";

  return () => {
    let summaries: InteractiveDraftSummary[] = [];
    let unavailable = false;
    try {
      summaries = readInteractiveDraftSummaries(getStorage());
    } catch {
      unavailable = true;
    }

    // React requires a stable snapshot identity until displayed data changes.
    // Cache metadata only; full form contents never enter this snapshot.
    const contents = JSON.stringify([summaries, unavailable]);
    if (contents !== previousContents) {
      previousContents = contents;
      snapshot = { summaries, loaded: true, unavailable };
    }
    return snapshot;
  };
}
