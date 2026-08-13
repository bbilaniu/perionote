import { expect, test } from "@playwright/test";

const sourceUrl = "/templates/clinic/child-recare-exam-hygiene-notes";
const interactiveUrl = `${sourceUrl}/interactive`;

test("child recare draft is discoverable from its source template", async ({
  page,
}) => {
  await page.goto(sourceUrl);

  const interactiveLink = page.getByRole("link", {
    name: "Open interactive version · draft",
  });
  await expect(interactiveLink).toHaveAttribute("href", `${interactiveUrl}/`);
  await interactiveLink.click();

  await expect(page).toHaveURL(new RegExp(`${interactiveUrl}/?$`));
  await expect(
    page.getByRole("heading", {
      name: "Child Recare Exam & Hygiene Notes",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('header[data-template-lifecycle="draft"]')).toContainText(
    "Draft interactive conversion",
  );
});

test("child recare demo generates audience-specific notes", async ({ page }) => {
  await page.goto(interactiveUrl);
  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  await expect(page.locator("#child-recare-patient-id")).toHaveValue(
    "TEST-CHILD-1001",
  );
  const preview = page.locator("#child-recare-summary");
  await expect(preview).toHaveValue(/DENTAL EXAM[\s\S]*HYGIENE/);
  await expect(preview).toHaveValue(/Overjet: 2 mm\./);
  await expect(preview).toHaveValue(/Scaling: Yes — 0\.5 units\./);
  await expect(preview).toHaveValue(
    /Polish: Yes — Enamel Pro® Prophy Paste with Fluoride \(Strawberry\)\./,
  );
  await expect(preview).toHaveValue(
    /Fluoride: Yes — Oral Science Inc\. FluoriMax 2\.5% NaF Varnish\./,
  );
  await expect(page.getByLabel("Scaling units", { exact: true })).toHaveValue(
    "0.5",
  );
  await expect(
    page.getByRole("combobox", { name: "Polishing material", exact: true }),
  ).toHaveValue("Enamel Pro® Prophy Paste with Fluoride (Strawberry)");
  await expect(
    page.getByRole("combobox", { name: "Fluoride applied", exact: true }),
  ).toHaveValue("Oral Science Inc. FluoriMax 2.5% NaF Varnish");

  await page.getByRole("radio", { name: "Dentist", exact: true }).check();
  await expect(preview).toHaveValue(/DENTAL EXAM/);
  await expect(preview).not.toHaveValue(/HYGIENE/);
  await expect(preview).toHaveValue(/Recall interval: 6-month recall\./);
  await expect(preview).not.toHaveValue(/Hygiene interval:/);

  await page.getByRole("radio", { name: "Hygienist", exact: true }).check();
  await expect(preview).toHaveValue(/HYGIENE/);
  await expect(preview).not.toHaveValue(/DENTAL EXAM/);
  await expect(preview).toHaveValue(/Hygiene interval: 6-month scale\./);
  await expect(preview).not.toHaveValue(/Recall interval:/);
});

test("child recare desktop layout keeps context cards in the form column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(interactiveUrl);

  await expect(page.locator("main h2")).toHaveText([
    "Patient and Visit Context",
    "Visit Team",
    "Consent, Medical History, and Sterilization",
    "Records and dental exam",
    "Hygiene assessment and treatment",
    "Communication and follow-up",
    "Generated note",
  ]);

  const dimensions = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(
      "header[data-template-lifecycle]",
    );
    const recovery = document.querySelector<HTMLElement>(
      '[aria-label="Local draft recovery"]',
    );
    const form = document.querySelector<HTMLElement>("main form");
    const date = document.querySelector<HTMLElement>("#child-recare-booked");
    const dateButton = document.querySelector<HTMLElement>(
      '[aria-label="Choose Booked date"]',
    );
    if (!header || !recovery || !form || !date || !dateButton) {
      throw new Error("Expected pediatric form controls were not rendered.");
    }
    return {
      formWidth: form.getBoundingClientRect().width,
      headerWidth: header.getBoundingClientRect().width,
      recoveryWidth: recovery.getBoundingClientRect().width,
      dateHeight: date.getBoundingClientRect().height,
      dateButtonHeight: dateButton.getBoundingClientRect().height,
    };
  });

  expect(dimensions.headerWidth).toBeLessThan(dimensions.formWidth * 0.75);
  expect(dimensions.recoveryWidth).toBeLessThan(dimensions.formWidth * 0.75);
  expect(dimensions.dateButtonHeight).toBe(dimensions.dateHeight);
  await expect(page.getByLabel("Booked date", { exact: true })).toBeVisible();
});
