"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  DropdownChevron,
  formControlClass,
  SelectedIndicator,
  trailingControlButtonClass,
} from "@/components/forms/controlStyles";

export type EditableComboboxSuggestion = {
  id: string;
  label: string;
};

export function EditableCombobox<
  TSuggestion extends EditableComboboxSuggestion,
>({
  id,
  label,
  value,
  suggestions,
  onValueChange,
  onSelectSuggestion,
  renderSuggestion,
  suggestionAction,
  selectedContent,
  actions,
  helpText,
  statusMessage = "",
  emptyMessage = "No matching suggestions.",
  placeholder,
  onEnterWithoutSuggestion,
  closeSignal,
  error,
  inputRef,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  suggestions: TSuggestion[];
  onValueChange: (value: string) => void;
  onSelectSuggestion: (suggestion: TSuggestion) => void;
  renderSuggestion?: (suggestion: TSuggestion) => ReactNode;
  suggestionAction?: {
    label: (suggestion: TSuggestion) => string;
    icon: ReactNode;
    onAction: (suggestion: TSuggestion) => void;
    disabled?: boolean;
  };
  selectedContent?: ReactNode;
  actions?: ReactNode;
  helpText?: ReactNode;
  statusMessage?: string;
  emptyMessage?: string;
  placeholder?: string;
  onEnterWithoutSuggestion?: () => void;
  closeSignal?: number;
  error?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-suggestions`;
  const helpId = `${id}-${generatedId}-help`;
  const errorId = `${id}-error`;
  const statusId = `${id}-${generatedId}-status`;
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectionMessage, setSelectionMessage] = useState("");

  useEffect(() => {
    setActiveIndex((index) =>
      index >= suggestions.length ? suggestions.length - 1 : index,
    );
  }, [suggestions.length]);

  useEffect(() => {
    if (closeSignal !== undefined) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }, [closeSignal]);

  const describedBy = [
    helpText ? helpId : null,
    error ? errorId : null,
    statusId,
  ]
    .filter(Boolean)
    .join(" ");

  function closeList() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function selectSuggestion(index: number) {
    const suggestion = suggestions[index];
    if (!suggestion) {
      return;
    }
    onSelectSuggestion(suggestion);
    setSelectionMessage(`${suggestion.label} selected.`);
    closeList();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        suggestions.length ? Math.min(index + 1, suggestions.length - 1) : -1,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        suggestions.length
          ? index <= 0
            ? suggestions.length - 1
            : index - 1
          : -1,
      );
    } else if (event.key === "Enter") {
      if (open && activeIndex >= 0) {
        event.preventDefault();
        selectSuggestion(activeIndex);
      } else if (onEnterWithoutSuggestion) {
        event.preventDefault();
        onEnterWithoutSuggestion();
      }
    } else if (event.key === "Escape") {
      closeList();
    }
  }

  function toggleList() {
    if (disabled) {
      return;
    }
    setOpen((current) => !current);
    setActiveIndex(-1);
    requestAnimationFrame(() => internalInputRef.current?.focus());
  }

  return (
    <div
      className="relative"
      data-editable-combobox
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          const control = event.currentTarget;
          setTimeout(() => {
            if (!control.contains(document.activeElement)) {
              closeList();
            }
          }, 0);
        }
      }}
    >
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>

      {selectedContent}

      <div className="relative mt-1">
        <input
          ref={(node) => {
            internalInputRef.current = node;
            if (inputRef) {
              inputRef.current = node;
            }
          }}
          id={id}
          data-list-control="editable-combobox"
          className={formControlClass({
            opensList: true,
            invalid: Boolean(error),
          })}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
            setSelectionMessage("");
          }}
          onFocus={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          data-dropdown-trigger
          className={trailingControlButtonClass}
          aria-label={`${open ? "Hide" : "Show"} ${label} suggestions`}
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={toggleList}
        >
          <DropdownChevron open={open} />
        </button>
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="relative z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-300 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-950"
        >
          {suggestions.length ? (
            suggestions.map((suggestion, index) => {
              const selected = suggestion.label === value;
              const actionLabel = suggestionAction?.label(suggestion);
              return (
                <li
                  key={suggestion.id}
                  role="none"
                  className={`flex items-start gap-1 rounded-lg text-sm ${
                    activeIndex === index
                      ? "bg-sky-100 text-sky-950 dark:bg-sky-900 dark:text-sky-50"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  onPointerEnter={() => setActiveIndex(index)}
                >
                  <div
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={selected}
                    className="flex min-w-0 flex-1 cursor-pointer items-start justify-between gap-3 px-3 py-2"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(index)}
                  >
                    <span className="min-w-0">
                      {renderSuggestion
                        ? renderSuggestion(suggestion)
                        : suggestion.label}
                    </span>
                    {selected ? (
                      <SelectedIndicator>
                        <span className="sr-only">Selected</span>
                      </SelectedIndicator>
                    ) : null}
                  </div>
                  {suggestionAction && actionLabel ? (
                    <button
                      type="button"
                      className="m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                      aria-label={actionLabel}
                      title={actionLabel}
                      disabled={suggestionAction.disabled}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        suggestionAction.onAction(suggestion);
                        requestAnimationFrame(() =>
                          internalInputRef.current?.focus(),
                        );
                      }}
                    >
                      {suggestionAction.icon}
                    </button>
                  ) : null}
                </li>
              );
            })
          ) : (
            <li
              className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400"
              data-empty-suggestions
            >
              {emptyMessage}
            </li>
          )}
        </ul>
      ) : null}

      {actions || helpText ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {actions}
          {helpText ? (
            <span
              id={helpId}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              {helpText}
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <p id={statusId} className="sr-only" aria-live="polite">
        {open
          ? `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"} available. `
          : ""}
        {statusMessage || selectionMessage}
      </p>
    </div>
  );
}
