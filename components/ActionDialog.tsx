"use client";

import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

export function ActionDialog({
  open,
  title,
  description,
  children,
  onDismiss,
  restoreFocusOnClose = true,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  children: ReactNode;
  onDismiss: () => void;
  restoreFocusOnClose?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
      window.requestAnimationFrame(() => {
        dialog
          .querySelector<HTMLElement>("[data-dialog-initial-focus]")
          ?.focus();
      });
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-[2px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-drag-scroll-disabled
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClose={() => {
        onDismiss();
        if (restoreFocusOnClose) {
          window.requestAnimationFrame(() => returnFocusRef.current?.focus());
        }
      }}
      onMouseDown={(event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <div className="p-5 sm:p-6">
        <h2
          id={titleId}
          className="text-xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        <div
          id={descriptionId}
          className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300"
        >
          {description}
        </div>
        {children}
      </div>
    </dialog>
  );
}
