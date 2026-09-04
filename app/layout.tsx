import type { Metadata } from "next";
import Link from "next/link";
import { PrimaryNavigation } from "@/components/PrimaryNavigation";
import ThemeToggle from "@/components/ThemeToggle";
import { CatalogueProvider } from "@/components/catalogues/CatalogueProvider";
import packageInfo from "@/package.json";
import "./globals.css";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const repoBasePath = isGithubActions && repositoryName ? `/${repositoryName}` : "";
const appVersion = packageInfo.version;

export const metadata: Metadata = {
  title: "HygieneNote",
  description: "Periodontal chart notes",
  manifest: `${repoBasePath}/manifest.webmanifest`,
  icons: {
    icon: [
      {
        url: `${repoBasePath}/favicon.ico`,
        sizes: "any",
      },
      {
        url: `${repoBasePath}/favicon.svg`,
        type: "image/svg+xml",
      },
      {
        url: `${repoBasePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: `${repoBasePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: `${repoBasePath}/favicon.ico`,
    apple: [
      {
        url: `${repoBasePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
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
    var storedTheme = localStorage.getItem("hygienenote-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var useDark = storedTheme === "dark" || (storedTheme !== "light" && prefersDark);
    document.documentElement.classList.toggle("dark", useDark);
  } catch (e) {}
})();`,
          }}
        />
        <CatalogueProvider>
          <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mx-auto flex max-w-[112rem] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:flex-nowrap sm:px-6">
              <Link
                href="/"
                className="rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                HygieneNote
              </Link>
              <PrimaryNavigation />
              <ThemeToggle />
            </div>
          </header>
          <main className="mx-auto w-full max-w-[112rem] flex-1 px-6 py-10">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mx-auto flex max-w-[112rem] items-center justify-between gap-4 px-6 py-4">
              <span className="text-sm font-semibold tracking-tight">
                HygieneNote
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Version {appVersion}
              </span>
            </div>
          </footer>
          </div>
        </CatalogueProvider>
      </body>
    </html>
  );
}
