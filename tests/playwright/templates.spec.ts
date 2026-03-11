import { test, expect } from "@playwright/test";

test("template index renders", async ({ page }) => {
  await page.goto("/templates");

  await expect(
    page.getByRole("heading", { name: "Template Browser" }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/dental-hygiene-note-webform/"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/gingival-description/"]'),
  ).toHaveCount(0);
});

test("imported webform preview renders summary panel and updated EOE/IOE sections", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await expect(
    page.getByRole("heading", { name: "Dental Hygiene Note Webform Template" }),
  ).toBeVisible();
  await expect(page.getByText("Structured Summary")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "EOE Within Normal Limits" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "IOE Within Normal Limits" }),
  ).toBeVisible();
  await expect(page.getByText("EOE observations")).toBeVisible();
  await expect(page.getByText("IOE observations")).toBeVisible();
});

test("imported webform summary uses preview a formatting", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");
  await page.getByRole("button", { name: "Load demo" }).click();

  const summary = await page.locator("textarea[readonly]").inputValue();

  expect(summary).toContain(
    "Visit Details:\n  Date: 2026-03-09\n\nHistory and Exam:",
  );
  expect(summary).toContain("EOE/IOE:\n  EOE: WNL");
  expect(summary).toContain(
    "    Findings:\n      - Asymptomatic click on opening/closing (Bilateral)",
  );
  expect(summary).toContain("\n\n  IOE: WNL");
  expect(summary).toContain(
    "Gingival Description:\n  Color: Red\n    Extent: localized",
  );
  expect(summary).toContain(
    "Oral Health Education:\n  Topics reviewed:\n    - Caries theory",
  );
});

test("legacy gingival-description slug reuses the imported template", async ({
  page,
}) => {
  await page.goto("/templates/gingival-description");

  await expect(
    page.getByRole("heading", { name: "Dental Hygiene Note Webform Template" }),
  ).toBeVisible();
  await expect(page.locator("#exam-date")).toBeVisible();
});

test("imported template date inputs default to today's date for both slugs", async ({
  page,
}) => {
  const today = new Date().toISOString().slice(0, 10);

  await page.goto("/templates/gingival-description");
  await expect(page.locator("#exam-date")).toHaveValue(today);

  await page.goto("/templates/dental-hygiene-note-webform");
  await expect(page.locator("#exam-date")).toHaveValue(today);
});
