"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/templates/clinic",
    label: "Clinical templates",
    compact: false,
  },
  {
    href: "/templates/interactive",
    label: "Standalone forms",
    compact: true,
  },
  { href: "/drafts", label: "Saved drafts", compact: false },
  { href: "/catalogues", label: "Catalogues", compact: false },
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
          <Link
            key={item.href}
            className={`border-b-2 px-0.5 py-2 text-sm font-medium transition focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              item.compact ? "hidden sm:inline-flex" : "inline-flex"
            } ${
              active
                ? "border-sky-700 text-sky-950 dark:border-sky-400 dark:text-sky-100"
                : "border-transparent text-chart-accent hover:border-sky-300 hover:text-sky-950 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:text-sky-100"
            }`}
            href={item.href}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
