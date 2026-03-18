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

test("vitals reading time can be reset to the current time with one click", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await page.locator("#vitals-time-0").fill("00:00");
  await expect(page.locator("#vitals-time-0")).toHaveValue("00:00");

  await page.getByRole("button", { name: "Set to now" }).click();
  await expect(page.locator("#vitals-time-0")).not.toHaveValue("00:00");
  await expect(page.locator("#vitals-time-0")).toHaveValue(/\d{2}:\d{2}/);
});

test("last vitals reading can be removed and re-added", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await expect(page.getByText("Vitals Entry 1")).toBeVisible();
  await expect(page.locator("#vitals-systolic-0")).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.locator("#vitals-systolic-0")).toHaveCount(0);

  await page.getByRole("button", { name: "Add reading" }).click();
  await expect(page.getByText("Vitals Entry 1")).toBeVisible();
  await expect(page.locator("#vitals-systolic-0")).toBeVisible();
});

test("local anesthesia entry time can be cleared and reset", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await page.getByRole("button", { name: "No C/I to LA" }).click();
  await page.getByRole("button", { name: "Add injection entry" }).click();

  const entry = page.locator("#local-anesthesia-entry-0");
  const timeInput = page.locator("#local-anesthesia-time-0");

  await expect(timeInput).toHaveValue(/\d{2}:\d{2}/);
  await timeInput.fill("00:00");
  await expect(timeInput).toHaveValue("00:00");

  await entry.getByRole("button", { name: "Clear time" }).click();
  await expect(timeInput).toHaveValue("");

  await entry.getByRole("button", { name: "Set to now" }).click();
  await expect(timeInput).toHaveValue(/\d{2}:\d{2}/);
});

test("imported webform summary uses preview a formatting", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Load demo" }).click();
  await expect(page.locator("#periodontal-status-notes")).toHaveValue(
    "Reinforced 4-month hygiene interval and home-care compliance.",
  );

  const summary = await page.locator("textarea[readonly]").inputValue();

  expect(summary).toContain(
    "Patient concerns: Sensitivity around lower anterior and occasional bleeding while flossing.",
  );
  expect(summary).toContain(
    "Medical history update:\n   Med/dent history updated. No new contraindications reported.\n   BP: 118/76 mmHg, HR: 72 bpm (at 9:15 AM)",
  );
  expect(summary).toContain("Date: 2026-03-09");
  expect(summary).toContain("Provider: Dr. Example");
  expect(summary).toContain(
    "EOE: bilateral tmj clicking (asymptomatic, on open), baseline monitoring only",
  );
  expect(summary).toContain(
    "IOE: coated tongue, scalloped tongue, bilateral linea alba, slight palatine torus at midline, slight bilateral mandibular tori, mild soft tissue variations noted",
  );
  expect(summary).toContain(
    "Gingival Description: localized marginal papillary redness on #5, #6-8",
  );
  expect(summary).toContain(
    "Periodontal diagnosis: Active Moderate Periodontitis Stage II Grade B moderate rate of progression. Reinforced 4-month hygiene interval and home-care compliance.",
  );
  expect(summary).toContain(
    "Caries risk: Moderate caries risk due to high frequency of sugar intake, insufficient exposure to fluoride, history of active decay in the last 36 months. Diet and home-care factors reviewed.",
  );
  expect(summary).toContain(
    "OHE: Caries theory and risk factors, bass brushing, c-shaped flossing, sulcabrush and interdental brush technique, review benefits of Prevident or Opti-Rinse, periodontitis theory and risk factors, importance of maintaining a 4-month hygiene interval",
  );
  expect(summary).toContain(
    "Treatments completed today: Med/dent history update, EOE/IOE, OHE reinforced, Reviewed homecare, Gingival assessments, Calculus index, Caries risk, Nutrition score, Periodontal risk assessment, Spot probing, Full mouth probing, Q1, Q2, Q3, Q4, Full mouth, Maxilla, Mandible Hand and Power Instrumentation (Piezo), Ipana 5% NaF varnish application",
  );
  expect(summary).not.toContain("Visit Details:");
  expect(summary).not.toContain("Other clinical findings:");
});

test("instrumentation controls split hand and power selections", async ({
  page,
}) => {
  await page.goto("/templates/very-short-template");

  await page.getByRole("button", { name: "Hand instrumentation" }).click();
  await expect(
    page.getByText("Instrumentation area (today)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Power instrumentation device (today)", { exact: true }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Power instrumentation" }).click();
  await expect(
    page.getByText("Power instrumentation device (today)", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Piezo" }).click();
  await page.getByRole("button", { name: "Q1" }).click();

  const summary = await page.locator("textarea[readonly]").inputValue();
  expect(summary).toContain("Hand instrumentation - Q1");
  expect(summary).toContain("Power instrumentation (Piezo) - Q1");
});

test("short and very short templates include Full mouth instrumentation area", async ({
  page,
}) => {
  await page.goto("/templates/short-dental-hygien-note");
  await page.getByRole("button", { name: "Hand instrumentation" }).click();
  await expect(page.getByRole("button", { name: "Full mouth" })).toBeVisible();

  await page.goto("/templates/very-short-template");
  await page.getByRole("button", { name: "Hand instrumentation" }).click();
  await expect(page.getByRole("button", { name: "Full mouth" })).toBeVisible();
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
  await expect(
    page.getByRole("heading", { name: "Structured Summary" }),
  ).toBeVisible();
  await expect(page.locator("#exam-date")).toBeVisible();
});

test("very short template desktop shell does not leave trailing space after the summary column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1664, height: 900 });
  await page.goto("/templates/very-short-template");

  const layoutMetrics = await page.locator("main > div.min-h-screen > div").evaluate((root) => {
    const children = Array.from(root.children);
    const summary = children[1];
    const rootRect = root.getBoundingClientRect();
    const summaryRect = summary?.getBoundingClientRect();

    return {
      trailingGap: summaryRect ? rootRect.right - summaryRect.right : null,
    };
  });

  expect(layoutMetrics.trailingGap).not.toBeNull();
  expect(layoutMetrics.trailingGap ?? Number.POSITIVE_INFINITY).toBeLessThan(2);
});

test("imported template date inputs default to today's date and prefill vitals time for both slugs", async ({
  page,
}) => {
  const today = getTodayDateString();
  const currentTime = getCurrentTimeString();

  await page.goto("/templates/gingival-description");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);

  await page.goto("/templates/dental-hygiene-note-webform");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);

  await page.goto("/templates/short-dental-hygien-note");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);

  await page.goto("/templates/very-short-template");
  await expect(page.locator("#exam-date")).toHaveValue(today);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);
});
