import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/playwright",
  // Keep concurrent browser workloads within local and CI resource limits.
  workers: process.env.CI ? 2 : 6,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: !!process.env.CI,
  globalTimeout: 10 * 60_000,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    // CI builds once, tests this export, then uploads the same out/ directory.
    command: process.env.PLAYWRIGHT_SKIP_BUILD === "1"
      ? "node scripts/serve-export.mjs"
      : "npm run build && node scripts/serve-export.mjs",
    url: "http://localhost:3100/templates/clinic/recare-exam/interactive/",
    reuseExistingServer: false,
    timeout: 300_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
