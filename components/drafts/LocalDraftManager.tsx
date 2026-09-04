"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { ActionDialog } from "@/components/ActionDialog";
import { selectInteractiveDraftForCurrentTab } from "@/components/templates/shared/useLocalInteractiveDraft";
import {
  filterDraftListMetadata,
  initialDraftSortDirection,
  normalizeDraftListMetadata,
  normalizeDraftListText,
  sortDraftListMetadata,
  type DraftListMetadata,
  type DraftProfessionalKey,
  type DraftSortKey,
  type SortDirection,
} from "@/lib/templates/draftList";
import {
  interactiveDraftTemplates,
  isInteractiveDraftTemplateId,
} from "@/lib/templates/interactiveDraftTemplates";
import {
  deleteAllInteractiveDrafts,
  deleteInteractiveDraft,
  listInteractiveDraftSummaries,
  type InteractiveDraftSummary,
} from "@/lib/templates/localDrafts";

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
  hourCycle: "h23",
});
const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeStyle: "short",
  hourCycle: "h23",
});
const expiryFormatter = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const sortOptions: { key: DraftSortKey; label: string }[] = [
  { key: "template", label: "Template" },
  { key: "patientId", label: "Patient ID" },
  { key: "lastSavedAt", label: "Last saved" },
  { key: "dentist", label: "Dentist" },
  { key: "rdh", label: "RDH" },
  { key: "rda", label: "RDA" },
];

const sortLabelByKey = Object.fromEntries(
  sortOptions.map(({ key, label }) => [key, label]),
) as Record<DraftSortKey, string>;

const inputClass =
  "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-900";
const selectClass =
  "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900";
const openButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:ring-offset-slate-900";
const deleteButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950 dark:focus-visible:ring-offset-slate-900";
const cancelButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900";

function formattedDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function formattedTime(value: string): string {
  return timeFormatter.format(new Date(value));
}

function formattedExpiry(value: string): string {
  return expiryFormatter.format(new Date(value));
}

function draftActionDescription(draft: DraftListMetadata): string {
  const patient = draft.patientId?.trim();
  return patient
    ? `${draft.templateName}, patient ID ${patient}`
    : `${draft.templateName}, patient ID not entered`;
}

function MissingValue({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <span>
      <span aria-hidden="true">—</span>
      <span className="sr-only">
        {unavailable
          ? "Role unavailable for this legacy draft"
          : "Not entered"}
      </span>
    </span>
  );
}

function TruncatedValue({ value, className = "" }: { value: string; className?: string }) {
  const tooltipId = useId();
  return (
    <span className={`group relative block min-w-0 ${className}`}>
      <span
        className="block truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        tabIndex={0}
        aria-describedby={tooltipId}
      >
        {value}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-max max-w-80 rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-within:block dark:bg-slate-100 dark:text-slate-950"
      >
        {value}
      </span>
    </span>
  );
}

function ProfessionalValue({
  draft,
  role,
}: {
  draft: DraftListMetadata;
  role: DraftProfessionalKey;
}) {
  const value = draft.professionals[role].join(", ");
  if (value) return <TruncatedValue value={value} />;
  return (
    <MissingValue unavailable={!draft.professionalRoleAvailability[role]} />
  );
}

function LastSavedValue({ draft }: { draft: DraftListMetadata }) {
  return (
    <div className="min-w-0">
      <time className="block font-medium" dateTime={draft.lastSavedAt}>
        {formattedDateTime(draft.lastSavedAt)}
      </time>
      {draft.startedAt || draft.expiresAt ? (
        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
          {draft.startedAt ? (
            <>
              Started <time dateTime={draft.startedAt}>{formattedTime(draft.startedAt)}</time>
            </>
          ) : null}
          {draft.startedAt && draft.expiresAt ? " · " : null}
          {draft.expiresAt ? (
            <>
              Deletes after{" "}
              <time dateTime={draft.expiresAt}>{formattedExpiry(draft.expiresAt)}</time>
            </>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

function ResultCount({ filtered, total, active }: { filtered: number; total: number; active: boolean }) {
  if (active) {
    return (
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {filtered} of {total} {total === 1 ? "draft" : "drafts"}
      </p>
    );
  }
  return (
    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
      {total} saved {total === 1 ? "draft" : "drafts"}
    </p>
  );
}

function directionLabel(key: DraftSortKey, direction: SortDirection): string {
  if (key === "lastSavedAt") {
    return direction === "descending" ? "Newest first" : "Oldest first";
  }
  return direction === "ascending" ? "A–Z" : "Z–A";
}

function SortableHeader({
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: {
  sortKey: DraftSortKey;
  activeKey: DraftSortKey;
  direction: SortDirection;
  onSort: (key: DraftSortKey) => void;
  className: string;
}) {
  const active = sortKey === activeKey;
  const nextDirection = active
    ? direction === "ascending"
      ? "descending"
      : "ascending"
    : initialDraftSortDirection(sortKey);
  return (
    <th
      scope="col"
      aria-sort={active ? direction : undefined}
      className={className}
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-1 rounded-md px-2 text-left font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-200 dark:hover:bg-slate-800"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${sortLabelByKey[sortKey]}, ${directionLabel(sortKey, nextDirection).toLowerCase()}`}
      >
        <span>{sortLabelByKey[sortKey]}</span>
        {active ? (
          <span aria-hidden="true" className="text-sky-700 dark:text-sky-300">
            {direction === "ascending" ? "▲" : "▼"}
          </span>
        ) : null}
        {active ? (
          <span className="sr-only">, sorted {direction}</span>
        ) : null}
      </button>
    </th>
  );
}

type DeleteButtonRefs = {
  desktop: Map<string, HTMLButtonElement>;
  mobile: Map<string, HTMLButtonElement>;
};

function DraftActions({
  draft,
  layout,
  refs,
  onOpen,
  onDelete,
}: {
  draft: DraftListMetadata;
  layout: keyof DeleteButtonRefs;
  refs: RefObject<DeleteButtonRefs>;
  onOpen: (draft: DraftListMetadata) => void;
  onDelete: (draft: DraftListMetadata) => void;
}) {
  const description = draftActionDescription(draft);
  const templateAvailable = isInteractiveDraftTemplateId(draft.templateId);
  return (
    <div className="flex flex-wrap gap-2">
      {templateAvailable ? (
        <button
          type="button"
          className={openButtonClass}
          aria-label={`Open draft: ${description}`}
          onClick={() => onOpen(draft)}
        >
          Open
        </button>
      ) : null}
      <button
        ref={(element) => {
          if (element) refs.current[layout].set(draft.draftId, element);
          else refs.current[layout].delete(draft.draftId);
        }}
        type="button"
        className={deleteButtonClass}
        aria-label={`Delete draft: ${description}`}
        onClick={() => onDelete(draft)}
      >
        Delete
      </button>
    </div>
  );
}

export function LocalDraftManager() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<InteractiveDraftSummary[]>([]);
  const [storageError, setStorageError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<DraftSortKey>("lastSavedAt");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("descending");
  const [pendingDeleteDraft, setPendingDeleteDraft] =
    useState<DraftListMetadata | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const deleteButtonRefs = useRef<DeleteButtonRefs>({
    desktop: new Map(),
    mobile: new Map(),
  });
  const pendingFocusDraftId = useRef<string | null | undefined>(undefined);

  const normalizedDrafts = useMemo(
    () => drafts.map(normalizeDraftListMetadata),
    [drafts],
  );
  const searchActive = Boolean(normalizeDraftListText(searchQuery));
  const visibleDrafts = useMemo(
    () =>
      sortDraftListMetadata(
        filterDraftListMetadata(normalizedDrafts, searchQuery),
        sortKey,
        sortDirection,
      ),
    [normalizedDrafts, searchQuery, sortDirection, sortKey],
  );

  const refreshDrafts = useCallback(() => {
    try {
      setDrafts(listInteractiveDraftSummaries(window.localStorage));
      setStorageError("");
    } catch {
      setStorageError(
        "Local draft storage is unavailable in this browser. Existing drafts cannot be listed here.",
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshDrafts();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("hygienenote.interactive-draft.")) {
        refreshDrafts();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshDrafts();
    };
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshDrafts]);

  useEffect(() => {
    if (pendingFocusDraftId.current === undefined) return;
    const targetId = pendingFocusDraftId.current;
    pendingFocusDraftId.current = undefined;
    window.requestAnimationFrame(() => {
      if (targetId) {
        const layout = window.matchMedia("(min-width: 1024px)").matches
          ? "desktop"
          : "mobile";
        const target = deleteButtonRefs.current[layout].get(targetId);
        if (target) {
          target.focus();
          return;
        }
      }
      headingRef.current?.focus();
    });
  }, [drafts]);

  const openDraft = (draft: DraftListMetadata) => {
    if (!isInteractiveDraftTemplateId(draft.templateId)) return;
    try {
      setActionMessage("");
      selectInteractiveDraftForCurrentTab(draft.templateId, draft.draftId);
      router.push(interactiveDraftTemplates[draft.templateId].href);
    } catch {
      setStorageError("The selected local draft could not be opened.");
    }
  };

  const confirmDeleteDraft = () => {
    const draft = pendingDeleteDraft;
    if (!draft) return;
    const rowIndex = visibleDrafts.findIndex(
      ({ draftId }) => draftId === draft.draftId,
    );
    pendingFocusDraftId.current =
      visibleDrafts[rowIndex + 1]?.draftId ??
      visibleDrafts[rowIndex - 1]?.draftId ??
      null;

    try {
      setPendingDeleteDraft(null);
      setActionMessage("");
      deleteInteractiveDraft(window.localStorage, draft.templateId, draft.draftId);
      refreshDrafts();
    } catch {
      pendingFocusDraftId.current = undefined;
      setStorageError(
        "The local draft could not be deleted. Clear this site's browser data to remove it.",
      );
    }
  };

  const confirmDeleteAllDrafts = () => {
    try {
      setDeleteAllDialogOpen(false);
      const deletedCount = deleteAllInteractiveDrafts(window.localStorage);
      refreshDrafts();
      setActionMessage(
        deletedCount === 1
          ? "Deleted 1 saved local draft."
          : `Deleted ${deletedCount} saved local drafts.`,
      );
    } catch {
      setStorageError(
        "The saved drafts could not all be deleted. Clear this site's browser data to remove them.",
      );
    }
  };

  const changeSortKey = (nextKey: DraftSortKey) => {
    if (nextKey === sortKey) return;
    setSortKey(nextKey);
    setSortDirection(initialDraftSortDirection(nextKey));
  };

  const activateDesktopSort = (nextKey: DraftSortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) =>
        current === "ascending" ? "descending" : "ascending",
      );
      return;
    }
    changeSortKey(nextKey);
  };

  const clearSearch = () => {
    setSearchQuery("");
    window.requestAnimationFrame(() => searchRef.current?.focus());
  };

  return (
    <section className="space-y-5">
      <header>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Saved local drafts
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          These recovery drafts are stored only in this browser profile. They
          are deleted seven days after their most recent save and are not the
          clinical record.
        </p>
        <p className="mt-1 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          Patient IDs and professional names are shown so drafts can be
          identified. Anyone with access to this browser profile may see them.
        </p>
      </header>

      {storageError ? (
        <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
          {storageError}
        </p>
      ) : null}

      {actionMessage ? (
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" role="status">
          {actionMessage}
        </p>
      ) : null}

      {drafts.length ? (
        <div className="space-y-3" aria-label="Saved draft controls">
          <div className="grid gap-3 lg:grid-cols-[minmax(18rem,36rem)_1fr] lg:items-end">
            <div>
              <label htmlFor="saved-draft-search" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Search saved drafts
              </label>
              <div className="relative">
                <input
                  ref={searchRef}
                  id="saved-draft-search"
                  type="search"
                  autoComplete="off"
                  spellCheck={false}
                  className={inputClass}
                  placeholder="Search by patient ID, template, or professional"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    className="absolute right-0 top-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-r-lg text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    aria-label="Clear search"
                    onClick={clearSearch}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:hidden">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Sort by
                <select
                  className={`${selectClass} mt-1`}
                  value={sortKey}
                  onChange={(event) => changeSortKey(event.target.value as DraftSortKey)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Direction
                <select
                  className={`${selectClass} mt-1`}
                  value={sortDirection}
                  onChange={(event) => setSortDirection(event.target.value as SortDirection)}
                >
                  <option value={sortKey === "lastSavedAt" ? "descending" : "ascending"}>
                    {sortKey === "lastSavedAt" ? "Newest first" : "A–Z"}
                  </option>
                  <option value={sortKey === "lastSavedAt" ? "ascending" : "descending"}>
                    {sortKey === "lastSavedAt" ? "Oldest first" : "Z–A"}
                  </option>
                </select>
              </label>
            </div>

            <div className="lg:flex lg:justify-end">
              <ResultCount filtered={visibleDrafts.length} total={drafts.length} active={searchActive} />
            </div>
          </div>
        </div>
      ) : null}

      {loaded && !drafts.length && !storageError ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">No saved drafts</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Drafts appear here after an interactive note is saved automatically or copied.
          </p>
        </div>
      ) : null}

      {drafts.length && !visibleDrafts.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">No saved drafts match your search.</h2>
          <button type="button" className={`${openButtonClass} mt-3`} onClick={clearSearch}>
            Clear search
          </button>
        </div>
      ) : null}

      {visibleDrafts.length ? (
        <>
          <div className="hidden overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm lg:block dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full table-fixed border-collapse text-sm">
              <caption className="sr-only">Saved local drafts</caption>
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
                <tr>
                  <SortableHeader sortKey="template" activeKey={sortKey} direction={sortDirection} onSort={activateDesktopSort} className="w-[17%] px-1" />
                  <SortableHeader sortKey="patientId" activeKey={sortKey} direction={sortDirection} onSort={activateDesktopSort} className="w-[13%] px-1" />
                  <SortableHeader sortKey="dentist" activeKey={sortKey} direction={sortDirection} onSort={activateDesktopSort} className="w-[10%] px-1" />
                  <SortableHeader sortKey="rdh" activeKey={sortKey} direction={sortDirection} onSort={activateDesktopSort} className="w-[10%] px-1" />
                  <SortableHeader sortKey="rda" activeKey={sortKey} direction={sortDirection} onSort={activateDesktopSort} className="w-[10%] px-1" />
                  <SortableHeader sortKey="lastSavedAt" activeKey={sortKey} direction={sortDirection} onSort={activateDesktopSort} className="w-[22%] px-1" />
                  <th scope="col" className="w-[18%] px-3 text-left font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {visibleDrafts.map((draft) => (
                  <tr key={draft.draftId} className="align-middle hover:bg-slate-50/80 dark:hover:bg-slate-950/40">
                    <th scope="row" className="min-w-0 px-3 py-2 text-left font-semibold">
                      <TruncatedValue value={draft.templateName} />
                      {!isInteractiveDraftTemplateId(draft.templateId) ? (
                        <span className="mt-0.5 block truncate text-xs font-normal text-amber-800 dark:text-amber-200">Cannot open in this app version</span>
                      ) : null}
                    </th>
                    <td className="min-w-0 px-3 py-2 font-semibold">
                      {draft.patientId ? <TruncatedValue value={draft.patientId} /> : <MissingValue />}
                    </td>
                    <td className="min-w-0 px-3 py-2 text-slate-700 dark:text-slate-300"><ProfessionalValue draft={draft} role="dentist" /></td>
                    <td className="min-w-0 px-3 py-2 text-slate-700 dark:text-slate-300"><ProfessionalValue draft={draft} role="rdh" /></td>
                    <td className="min-w-0 px-3 py-2 text-slate-700 dark:text-slate-300"><ProfessionalValue draft={draft} role="rda" /></td>
                    <td className="min-w-0 px-3 py-2 text-slate-700 dark:text-slate-300"><LastSavedValue draft={draft} /></td>
                    <td className="px-3 py-2">
                      <DraftActions draft={draft} layout="desktop" refs={deleteButtonRefs} onOpen={openDraft} onDelete={setPendingDeleteDraft} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900" aria-label="Saved local drafts">
            {visibleDrafts.map((draft) => {
              const enteredRoles = (["dentist", "rdh", "rda"] as const).filter(
                (role) => draft.professionals[role].length,
              );
              return (
                <li key={draft.draftId} className="min-w-0 p-4">
                  <div className="flex min-w-0 items-baseline justify-between gap-3">
                    <h2 className="min-w-0 flex-1 font-semibold"><TruncatedValue value={draft.templateName} /></h2>
                    <p className="max-w-[42%] truncate text-sm font-semibold">
                      <span className="sr-only">Patient ID: </span>
                      {draft.patientId ? <TruncatedValue value={draft.patientId} /> : <MissingValue />}
                    </p>
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400"><LastSavedValue draft={draft} /></div>
                  {enteredRoles.length ? (
                    <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {enteredRoles.map((role) => (
                        <div key={role} className="flex min-w-0 max-w-full gap-1">
                          <dt className="font-semibold">{sortLabelByKey[role]}:</dt>
                          <dd className="min-w-0"><TruncatedValue value={draft.professionals[role].join(", ")} /></dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  <span className="sr-only">
                    {(["dentist", "rdh", "rda"] as const)
                      .filter((role) => !draft.professionals[role].length)
                      .map((role) => `${sortLabelByKey[role]}: ${draft.professionalRoleAvailability[role] ? "Not entered" : "Role unavailable for this legacy draft"}.`)
                      .join(" ")}
                  </span>
                  {!isInteractiveDraftTemplateId(draft.templateId) ? (
                    <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">This app version cannot open the template that created this draft.</p>
                  ) : null}
                  <div className="mt-3">
                    <DraftActions draft={draft} layout="mobile" refs={deleteButtonRefs} onOpen={openDraft} onDelete={setPendingDeleteDraft} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <section className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Delete all saved drafts</h2>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-3xl text-sm text-red-800 dark:text-red-200">
            This permanently removes every local recovery draft from this browser profile and cannot be undone. Interactive forms open in other tabs may save a new draft again.
          </p>
          <button
            type="button"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-red-950"
            disabled={!drafts.length}
            onClick={() => setDeleteAllDialogOpen(true)}
          >
            Delete all drafts
          </button>
        </div>
      </section>

      <ActionDialog
        open={Boolean(pendingDeleteDraft)}
        title="Delete this saved draft?"
        description={
          <>
            This permanently removes the local recovery draft
            {pendingDeleteDraft?.patientId
              ? " for patient ID " + pendingDeleteDraft.patientId
              : ""}
            . This cannot be undone.
          </>
        }
        onDismiss={() => setPendingDeleteDraft(null)}
      >
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={cancelButtonClass}
            data-dialog-initial-focus
            onClick={() => setPendingDeleteDraft(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            onClick={confirmDeleteDraft}
          >
            Delete draft
          </button>
        </div>
      </ActionDialog>

      <ActionDialog
        open={deleteAllDialogOpen}
        title="Delete all saved drafts?"
        description={
          <>
            This permanently removes all {drafts.length}{" "}
            {drafts.length === 1 ? "draft" : "drafts"} from this browser
            profile and cannot be undone. Interactive forms open in other tabs
            may save a new draft again.
          </>
        }
        onDismiss={() => setDeleteAllDialogOpen(false)}
      >
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={cancelButtonClass}
            data-dialog-initial-focus
            onClick={() => setDeleteAllDialogOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            onClick={confirmDeleteAllDrafts}
          >
            Delete all drafts
          </button>
        </div>
      </ActionDialog>
    </section>
  );
}
