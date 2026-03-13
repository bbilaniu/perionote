import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerioNote",
  description: "Clinical template workspace for periodontal and hygiene notes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
  try {
    var storedTheme = localStorage.getItem("perionote-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var useDark = storedTheme === "dark" || (storedTheme !== "light" && prefersDark);
    document.documentElement.classList.toggle("dark", useDark);
  } catch (e) {}
})();`,
          }}
        />
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-4 px-6 py-4">
              <span className="text-lg font-semibold tracking-tight">
                PerioNote
              </span>
              <ThemeToggle />
              <Link
                className="text-sm font-medium text-chart-accent hover:underline dark:text-sky-300 dark:hover:text-sky-200"
                href="/templates"
              >
                Browse Templates
              </Link>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[96rem] px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
