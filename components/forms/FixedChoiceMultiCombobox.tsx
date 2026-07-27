"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  DropdownChevron,
  formControlClass,
  SelectedIndicator,
} from "@/components/forms/controlStyles";

function normalizeValue(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-CA");
}

function orderValues(values: string[], choices: readonly string[]) {
  const normalizedValues = new Set(values.map(normalizeValue));
  const fixedValues = choices.filter((choice) =>
    normalizedValues.has(normalizeValue(choice)),
  );
  const seen = new Set(fixedValues.map(normalizeValue));
  const customValues = values
    .map((value) => value.trim())
    .filter((value) => {
      const normalized = normalizeValue(value);
      if (
        !normalized ||
        choices.some((choice) => normalizeValue(choice) === normalized) ||
        seen.has(normalized)
      ) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  return [...fixedValues, ...customValues];
}

export type FixedChoiceMultiComboboxGroup = {
  label?: string;
  choices: readonly string[];
  columns?: 1 | 2 | 3;
};

export function FixedChoiceMultiCombobox({
  id,
  label,
  choices,
  choiceGroups,
  values,
  onChange,
  customPlaceholder = "Search or add a value",
  customHelpText = "Custom entries apply to this note only.",
  showSelectedChips = true,
}: {
  id: string;
  label: string;
  choices: readonly string[];
  choiceGroups?: readonly FixedChoiceMultiComboboxGroup[];
  values: string[];
  onChange: (values: string[]) => void;
  customPlaceholder?: string;
  customHelpText?: string;
  showSelectedChips?: boolean;
}) {
  const generatedId = useId();
  const menuId = `${id}-${generatedId}-menu`;
  const statusId = `${id}-${generatedId}-status`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const selectedValues = useMemo(
    () => orderValues(values, choices),
    [choices, values],
  );
  const selectedLabels = useMemo(
    () => new Set(selectedValues.map(normalizeValue)),
    [selectedValues],
  );
  const normalizedDraft = normalizeValue(draft);
  const visualChoiceGroups = choiceGroups?.length
    ? choiceGroups
    : [{ choices, columns: 1 as const }];
  const matchingChoiceGroups = visualChoiceGroups
    .map((group) => ({
      ...group,
      choices: group.choices.filter(
        (choice) =>
          !normalizedDraft || normalizeValue(choice).includes(normalizedDraft),
      ),
    }))
    .filter((group) => group.choices.length);
  const normalizedChoices = new Set(choices.map(normalizeValue));
  const matchingCustomValues = selectedValues.filter(
    (value) =>
      !normalizedChoices.has(normalizeValue(value)) &&
      (!normalizedDraft || normalizeValue(value).includes(normalizedDraft)),
  );
  const canonicalDraftChoice = choices.find(
    (choice) => normalizeValue(choice) === normalizedDraft,
  );
  const draftAlreadySelected =
    Boolean(normalizedDraft) && selectedLabels.has(normalizedDraft);
  const canAddCustom =
    Boolean(normalizedDraft) && !canonicalDraftChoice && !draftAlreadySelected;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setDraft("");
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const triggerText = selectedValues.length
    ? selectedValues.join(", ")
    : `Select ${label}`;

  function openMenu() {
    setOpen(true);
    setStatusMessage("");
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  function closeMenu({ restoreFocus = false } = {}) {
    setOpen(false);
    setDraft("");
    setStatusMessage("");
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function toggleChoice(choice: string) {
    const normalizedChoice = normalizeValue(choice);
    const isSelected = selectedLabels.has(normalizedChoice);
    const nextValues = isSelected
      ? selectedValues.filter(
          (value) => normalizeValue(value) !== normalizedChoice,
        )
      : [...selectedValues, choice];
    onChange(orderValues(nextValues, choices));
    setStatusMessage(
      isSelected
        ? `${choice} removed from this note.`
        : `${choice} added to this note.`,
    );
  }

  function addDraft() {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft) return;

    if (draftAlreadySelected) {
      setStatusMessage(`${canonicalDraftChoice ?? trimmedDraft} is already selected.`);
      return;
    }

    const valueToAdd = canonicalDraftChoice ?? trimmedDraft;
    onChange(orderValues([...selectedValues, valueToAdd], choices));
    setDraft("");
    setStatusMessage(`${valueToAdd} added to this note.`);
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  function removeValue(value: string) {
    const normalized = normalizeValue(value);
    onChange(
      selectedValues.filter(
        (candidate) => normalizeValue(candidate) !== normalized,
      ),
    );
    setStatusMessage(`${value} removed from this note.`);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addDraft();
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative min-w-0 ${open ? "z-40" : ""}`}
      data-fixed-multi-combobox
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          closeMenu();
        }
      }}
    >
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-1">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className={`${formControlClass({ opensList: true })} py-2 text-left`}
          title={selectedValues.join(", ")}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={menuId}
          aria-describedby={statusId}
          onClick={() => (open ? closeMenu({ restoreFocus: true }) : openMenu())}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              openMenu();
            } else if (event.key === "Escape") {
              closeMenu();
            }
          }}
        >
          <span className="block whitespace-normal pr-1">{triggerText}</span>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <DropdownChevron open={open} />
          </span>
        </button>

        {open ? (
          <div
            id={menuId}
            role="dialog"
            aria-label={`${label} options`}
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-950"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeMenu({ restoreFocus: true });
              }
            }}
          >
            <div className="border-b border-slate-200 p-2 dark:border-slate-800">
              <label className="sr-only" htmlFor={`${id}-search`}>
                Search or add custom {label}
              </label>
              <input
                ref={searchRef}
                id={`${id}-search`}
                className={formControlClass()}
                value={draft}
                maxLength={200}
                autoComplete="off"
                placeholder={customPlaceholder}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setStatusMessage("");
                }}
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            <div className="max-h-64 overflow-y-auto p-1">
              <div role="group" aria-label={`Standard ${label} choices`}>
                {matchingChoiceGroups.length ? (
                  matchingChoiceGroups.map((group, groupIndex) => {
                    const columns = group.columns ?? 1;
                    const gridClass =
                      columns === 3
                        ? "grid-cols-3"
                        : columns === 2
                          ? "grid-cols-2"
                          : "grid-cols-1";
                    return (
                      <div
                        key={`${group.label ?? "choices"}-${groupIndex}`}
                        className={
                          groupIndex
                            ? "mt-1 border-t border-slate-200 pt-1 dark:border-slate-800"
                            : ""
                        }
                        role="group"
                        aria-label={
                          group.label
                            ? `${group.label} ${label} choices`
                            : `General ${label} choices`
                        }
                      >
                        {group.label ? (
                          <p className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {group.label}
                          </p>
                        ) : null}
                        <div className={`grid gap-1 ${gridClass}`}>
                          {group.choices.map((choice) => {
                            const checked = selectedLabels.has(
                              normalizeValue(choice),
                            );
                            return (
                              <label
                                key={choice}
                                className="flex min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-sky-100 hover:text-sky-950 focus-within:bg-sky-100 focus-within:text-sky-950 dark:hover:bg-sky-900 dark:hover:text-sky-50 dark:focus-within:bg-sky-900 dark:focus-within:text-sky-50"
                                onPointerDown={(event) =>
                                  event.preventDefault()
                                }
                                onClick={(event) => {
                                  event.preventDefault();
                                  toggleChoice(choice);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  onChange={() => undefined}
                                />
                                <span className="min-w-0">{choice}</span>
                                <span
                                  aria-hidden="true"
                                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                                >
                                  {checked ? <SelectedIndicator /> : null}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    No standard choices match.
                  </p>
                )}
              </div>

              {matchingCustomValues.length ? (
                <div
                  className="mt-1 border-t border-slate-200 pt-1 dark:border-slate-800"
                  role="group"
                  aria-label={`Custom ${label} selections`}
                >
                  {matchingCustomValues.map((value) => (
                    <label
                      key={normalizeValue(value)}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sky-100 hover:text-sky-950 focus-within:bg-sky-100 focus-within:text-sky-950 dark:hover:bg-sky-900 dark:hover:text-sky-50 dark:focus-within:bg-sky-900 dark:focus-within:text-sky-50"
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={(event) => {
                        event.preventDefault();
                        removeValue(value);
                      }}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked
                        onChange={() => undefined}
                      />
                      <span className="flex min-w-0 flex-1 items-baseline gap-2">
                        <span className="min-w-0">{value}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Custom
                        </span>
                      </span>
                      <span aria-hidden="true">
                        <SelectedIndicator />
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}

              {normalizedDraft && !canonicalDraftChoice ? (
                <button
                  type="button"
                  className="mt-1 flex w-full items-start rounded-lg border-t border-slate-200 px-3 py-2 text-left text-sm hover:bg-sky-100 hover:text-sky-950 disabled:cursor-default disabled:opacity-60 dark:border-slate-800 dark:hover:bg-sky-900 dark:hover:text-sky-50"
                  disabled={!canAddCustom}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={addDraft}
                >
                  {draftAlreadySelected ? (
                    <span>Already selected</span>
                  ) : (
                    <span>
                      Add <span className="font-semibold">“{draft.trim()}”</span>{" "}
                      to this note
                    </span>
                  )}
                </button>
              ) : null}
            </div>
            <div className="flex justify-end border-t border-slate-200 p-2 dark:border-slate-800">
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-300 dark:hover:bg-sky-950"
                onClick={() => closeMenu({ restoreFocus: true })}
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {showSelectedChips && selectedValues.length ? (
        <ul
          className="mt-2 flex flex-wrap gap-1.5"
          aria-label={`${label} selected values`}
        >
          {selectedValues.map((value) => (
            <li
              key={normalizeValue(value)}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 py-1 pl-2.5 pr-1 text-xs font-medium text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100"
            >
              <span>{value}</span>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-sm hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:hover:bg-emerald-900"
                aria-label={`Remove ${value} from ${label}`}
                onClick={() => removeValue(value)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {customHelpText}
      </p>
      <p id={statusId} className="sr-only" aria-live="polite">
        {statusMessage}
      </p>
    </div>
  );
}
