"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  DropdownChevron,
  formControlClass,
  SelectedIndicator,
} from "@/components/forms/controlStyles";

export function FixedChoiceListbox<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  error,
  compact = false,
}: {
  id: string;
  label: string;
  value: TValue;
  options: ReadonlyArray<{ value: TValue; label: string }>;
  onChange: (value: TValue) => void;
  disabled?: boolean;
  error?: string;
  compact?: boolean;
}) {
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-options`;
  const errorId = `${id}-error`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0,
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const activeOption = listboxRef.current?.children[activeIndex];
    if (activeOption instanceof HTMLElement) {
      activeOption.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

  function openList(preferredIndex = selectedIndex) {
    if (disabled || !options.length) {
      return;
    }
    setActiveIndex(preferredIndex >= 0 ? preferredIndex : 0);
    setOpen(true);
    requestAnimationFrame(() => listboxRef.current?.focus());
  }

  function closeList({ restoreFocus = false } = {}) {
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function selectOption(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }
    onChange(option.value);
    closeList({ restoreFocus: true });
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openList(selectedIndex >= 0 ? selectedIndex : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openList(selectedIndex >= 0 ? selectedIndex : options.length - 1);
    } else if (event.key === "Escape") {
      closeList();
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeList({ restoreFocus: true });
    } else if (event.key === "Tab") {
      closeList();
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${
        compact ? "flex items-center gap-2" : ""
      } ${open ? "z-40" : ""}`}
      data-fixed-listbox
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeList();
        }
      }}
    >
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className={`relative ${compact ? "" : "mt-1"}`}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          data-list-control="fixed-listbox"
          data-value={value}
          className={`${formControlClass({
            opensList: true,
            invalid: Boolean(error),
            compact,
          })} ${compact ? "py-1.5" : "py-2"} text-left`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          onClick={() => {
            if (open) {
              closeList({ restoreFocus: true });
            } else {
              openList();
            }
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className="block truncate">
            {selectedOption?.label ?? "Select an option"}
          </span>
          <span
            className={`pointer-events-none absolute inset-y-0 flex items-center ${
              compact ? "right-2.5" : "right-3"
            }`}
          >
            <DropdownChevron open={open} />
          </span>
        </button>

        {open ? (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={`${label} options`}
            aria-activedescendant={`${listboxId}-option-${activeIndex}`}
            className={`absolute top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-300 bg-white p-1 shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 ${
              compact
                ? "right-0 w-max min-w-full max-w-[calc(100vw-2rem)]"
                : "left-0 right-0"
            }`}
            onKeyDown={handleListboxKeyDown}
          >
            {options.map((option, index) => {
              const selected = option.value === value;
              return (
                <li
                  id={`${listboxId}-option-${index}`}
                  key={option.value}
                  role="option"
                  aria-selected={selected}
                  data-value={option.value}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                    activeIndex === index
                      ? "bg-sky-100 text-sky-950 dark:bg-sky-900 dark:text-sky-50"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  onPointerDown={(event) => {
                    if (!event.isPrimary || event.button !== 0) return;
                    event.preventDefault();
                    selectOption(index);
                  }}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={(event) => {
                    if (event.detail === 0) selectOption(index);
                  }}
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <SelectedIndicator>
                      <span className="sr-only">Selected</span>
                    </SelectedIndicator>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
