import { test, expect } from "@playwright/test";

test("template index renders", async ({ page }) => {
  await page.goto("/templates");

  await expect(page.getByRole("heading", { name: "Template Browser" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Gingival Description/i })).toBeVisible();
});

test("template preview page renders summary panel", async ({ page }) => {
  await page.goto("/templates/gingival-description");

  await expect(page.getByRole("heading", { name: "Gingival Description" })).toBeVisible();
  await expect(page.getByText("Summary Preview")).toBeVisible();
});
