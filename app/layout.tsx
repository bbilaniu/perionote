import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const repoBasePath = isGithubActions && repositoryName ? `/${repositoryName}` : "";

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
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mx-auto flex max-w-[112rem] items-center justify-between gap-4 px-6 py-4">
              <span className="text-lg font-semibold tracking-tight">
                HygieneNote
              </span>
              <ThemeToggle />
              <Link
                className="text-sm font-medium text-chart-accent hover:underline dark:text-sky-300 dark:hover:text-sky-200"
                href="/templates"
                target="_blank"
                rel="noopener noreferrer"
              >
                Browse Templates
              </Link>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[112rem] px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
