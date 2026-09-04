"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/templates/clinic",
    label: "Clinical forms",
    compact: false,
    utility: false,
  },
  {
    href: "/templates/interactive",
    label: "Standalone forms",
    compact: true,
    utility: false,
  },
  {
    href: "/drafts",
    label: "Saved drafts",
    compact: false,
    utility: false,
  },
  { href: "/catalogues", label: "Settings", compact: false, utility: true },
] as const;

export function PrimaryNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="order-3 flex w-full items-center justify-between gap-3 sm:order-none sm:ml-auto sm:w-auto sm:justify-start sm:gap-4"
    >
      {navigationItems.map((item) => {
        const active = pathname.startsWith(item.href);

        return (
          <span
            key={item.href}
            className={`${item.compact ? "hidden sm:flex" : "flex"} ${
              item.utility
                ? "ml-1 border-l border-l-slate-200 pl-4 dark:border-l-slate-700"
                : ""
            }`}
          >
            <Link
              className={`relative inline-flex px-0.5 py-2 text-sm font-medium transition after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              active
                  ? "text-sky-950 after:bg-sky-700 dark:text-sky-100 dark:after:bg-sky-400"
                  : "text-chart-accent after:bg-transparent hover:text-sky-950 hover:after:bg-sky-300 dark:text-sky-300 dark:hover:text-sky-100 dark:hover:after:bg-sky-700"
              }`}
              href={item.href}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
