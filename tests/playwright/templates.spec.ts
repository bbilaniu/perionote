import { test, expect } from "@playwright/test";
import { getCurrentTimeString, getTodayDateString } from "@/lib/templates/date";

test("template index renders", async ({ page }) => {
  await page.goto("/templates");

  await expect(
    page.getByRole("heading", { name: "Template Browser" }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/dental-hygiene-note-webform/"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/short-dental-hygien-note/"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/very-short-template/"]'),
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

test("BP time can be reset to the current time with one click", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await page.locator("#blood-pressure-time").fill("00:00");
  await expect(page.locator("#blood-pressure-time")).toHaveValue("00:00");

  await page.getByRole("button", { name: "Set to now" }).click();
  await expect(page.locator("#blood-pressure-time")).not.toHaveValue("00:00");
  await expect(page.locator("#blood-pressure-time")).toHaveValue(/\d{2}:\d{2}/);
});

test("imported webform summary uses preview a formatting", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");
  await page.getByRole("button", { name: "Load demo" }).click();

  const summary = await page.locator("textarea[readonly]").inputValue();

  expect(summary).toContain(
    "Patient concerns: Sensitivity around lower anterior and occasional bleeding while flossing.",
  );
  expect(summary).toContain(
    "Medical history update:\nMed/dent history updated. No new contraindications reported.\nBP: 118/76 mmHg\nHR: 72 bpm\nTaken at 9:15 AM",
  );
  expect(summary).toContain(
    "EOE: bilateral TMJ click on opening - asymptomatic, baseline monitoring only",
  );
  expect(summary).toContain(
    "IOE: coated tongue, scalloped tongue, bilateral linea alba, slight palatine torus at midline, slight bilateral mandibular tori, mild soft tissue variations noted",
  );
  expect(summary).toContain(
    "Gingival Description: localized marginal papillary redness on #5, #6-8",
  );
  expect(summary).toContain(
    "OHE: Caries theory and risk factors, bass brushing, c-shaped flossing, sulcabrush and interdental brush technique, review benefits of Prevident or Opti-Rinse, periodontitis theory and risk factors, importance of maintaining a 4-month hygiene interval",
  );
  expect(summary).toContain(
    "Treatments completed today: Med/dent history update, EOE/IOE, Gingival assessments, Calculus index, Caries risk, Nutrition score, Periodontal risk assessment, Spot probing, Full mouth probing, Hand and power instrumentation, Ipana 5% NaF varnish application",
  );
  expect(summary).not.toContain("Visit Details:");
  expect(summary).not.toContain("Other clinical findings:");
});

test("periodontal stage and grade only show for periodontitis", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await expect(page.getByText("Stage", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Grade", { exact: true })).toHaveCount(0);

  await page.selectOption(
    'select:has(option[value="Gingivitis"])',
    "Gingivitis",
  );
  await expect(page.getByText("Stage", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Grade", { exact: true })).toHaveCount(0);

  await page.selectOption(
    'select:has(option[value="Periodontitis"])',
    "Periodontitis",
  );
  await expect(page.getByText("Stage", { exact: true })).toBeVisible();
  await expect(page.getByText("Grade", { exact: true })).toBeVisible();
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

test("short dental hygien note slug renders the copied template", async ({
  page,
}) => {
  await page.goto("/templates/short-dental-hygien-note");

  await expect(
    page.getByRole("heading", { name: "Short Dental Hygien Note" }),
  ).toBeVisible();
  await expect(page.locator("#exam-date")).toBeVisible();
});

test("very short template slug renders the sticky-summary variant", async ({
  page,
}) => {
  await page.goto("/templates/very-short-template");

  await expect(
    page.getByRole("heading", { name: "Very short template" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Expand all sections" })).toBeVisible();
  await expect(page.getByText("Structured Summary")).toBeVisible();
  await expect(page.locator("#exam-date")).toBeVisible();
});

test("imported template date inputs default to today's date and prefill BP time for both slugs", async ({
  page,
}) => {
  const today = getTodayDateString();
  const currentTime = getCurrentTimeString();

  await page.goto("/templates/gingival-description");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#blood-pressure-time")).toHaveValue(currentTime);

  await page.goto("/templates/dental-hygiene-note-webform");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#blood-pressure-time")).toHaveValue(currentTime);

  await page.goto("/templates/short-dental-hygien-note");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#blood-pressure-time")).toHaveValue(currentTime);

  await page.goto("/templates/very-short-template");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#blood-pressure-time")).toHaveValue(currentTime);
});
