import { test, expect } from "@playwright/test";

test("template index renders", async ({ page }) => {
  await page.goto("/templates");

  await expect(page.getByRole("heading", { name: "Template Browser" })).toBeVisible();
  await expect(page.locator('a[href="/templates/gingival-description"]')).toBeVisible();
  await expect(page.locator('a[href="/templates/gingival-description-webform"]')).toBeVisible();
});

test("template preview page renders summary panel", async ({ page }) => {
  await page.goto("/templates/gingival-description");

  await expect(page.getByRole("heading", { name: "Gingival Description" })).toBeVisible();
  await expect(page.getByText("Summary Preview")).toBeVisible();
});

test("imported webform preview renders summary panel", async ({ page }) => {
  await page.goto("/templates/gingival-description-webform");

  await expect(page.getByRole("heading", { name: "Gingival Description Webform (Imported)" })).toBeVisible();
  await expect(page.getByText("Summary Preview")).toBeVisible();
});
