export function ReturnToTopLink() {
  return (
    <div className="mt-6 flex justify-end">
      <a
        href="#template-top"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-sky-400 dark:text-sky-200 dark:hover:bg-sky-950 dark:focus-visible:ring-offset-slate-950"
      >
        <span aria-hidden="true">↑</span>
        Return to top
      </a>
    </div>
  );
}
