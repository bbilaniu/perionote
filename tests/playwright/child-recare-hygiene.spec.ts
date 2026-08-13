import { expect, test } from "@playwright/test";

const sourceUrl = "/templates/clinic/child-recare-exam-hygiene-notes";
const interactiveUrl = `${sourceUrl}/interactive`;

test("child recare pilot is discoverable from its source template", async ({
  page,
}) => {
  await page.goto(sourceUrl);

  const interactiveLink = page.getByRole("link", {
    name: "Open interactive version · pilot",
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
  await expect(page.locator('header[data-template-lifecycle="pilot"]')).toContainText(
    "Pilot interactive conversion",
  );
});

test("child recare demo generates audience-specific notes", async ({ page }) => {
  await page.goto(interactiveUrl);
  await expect(page.getByLabel("Note started", { exact: true })).toHaveValue(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
  );
  await expect(page.getByLabel("Note started", { exact: true })).toHaveAttribute(
    "readonly",
    "",
  );
  await expect(
    page.getByRole("combobox", {
      name: "Medical history reviewed",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  await expect(page.locator("#child-recare-patient-id")).toHaveValue(
    "TEST-CHILD-1001",
  );
  await expect(page.getByLabel("Parent", { exact: true })).toBeChecked();
  await expect(
    page.getByRole("combobox", {
      name: "Medical history reviewed",
      exact: true,
    }),
  ).toHaveValue("Reviewed; no changes reported");
  await expect(
    page.getByLabel("Standard PPE statement applies", { exact: true }),
  ).toBeChecked();
  const preview = page.locator("#child-recare-summary");
  await expect(preview).toHaveValue(/DENTAL EXAM[\s\S]*HYGIENE/);
  await expect(preview).toHaveValue(/Overjet: 2 mm\./);
  await expect(preview).toHaveValue(/Terminal plane: Flush terminal plane\./);
  await expect(
    page.getByRole("combobox", { name: "Terminal plane", exact: true }),
  ).toHaveValue("Flush terminal plane");
  await expect(preview).toHaveValue(/Scaling: Yes — 0\.5 units\./);
  await expect(preview).toHaveValue(
    /Polish: Yes — Enamel Pro® Prophy Paste with Fluoride \(Strawberry\)\./,
  );
  await expect(preview).toHaveValue(
    /Fluoride: Yes — Oral Science Inc\. FluoriMax 2\.5% NaF Varnish\./,
  );
  await expect(preview).toHaveValue(
    /Informed verbal consent for treatment today given by: Parent\./,
  );
  await expect(preview).toHaveValue(
    /Medical history reviewed: Reviewed; no changes reported\./,
  );
  await expect(preview).toHaveValue(
    /ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES/,
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
  await expect(
    page.getByRole("combobox", {
      name: "Skeletal classification",
      exact: true,
    }),
  ).toHaveValue("Class I");

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

test("child recare defaults to terminal plane and can use molar classification", async ({
  page,
}) => {
  await page.goto(interactiveUrl);

  const assessment = page.getByRole("button", {
    name: "Occlusion assessment",
    exact: true,
  });
  await expect(assessment).toContainText("Terminal plane (primary dentition)");
  await page
    .getByRole("combobox", { name: "Terminal plane", exact: true })
    .fill("Mesial step");
  await expect(page.locator("#child-recare-summary")).toHaveValue(
    /Terminal plane: Mesial step\./,
  );

  await assessment.click();
  await page
    .getByRole("option", {
      name: "Molar classification (permanent first molars)",
      exact: true,
    })
    .click();
  await page
    .getByRole("combobox", { name: "Molar classification", exact: true })
    .fill("Cl I");

  await expect(page.locator("#child-recare-summary")).toHaveValue(
    /Molar classification: Cl I\./,
  );
  await expect(page.locator("#child-recare-summary")).not.toHaveValue(
    /Terminal plane:/,
  );
});

test("child recare uses the 2026 sterilization safeguards", async ({ page }) => {
  await page.goto(interactiveUrl);

  const class5 = page.getByLabel("Class 5 indicators checked", {
    exact: true,
  });
  const ppe = page.getByLabel("Standard PPE statement applies", {
    exact: true,
  });
  await expect(class5).toBeChecked();
  await expect(ppe).toBeChecked();

  await class5.uncheck();
  await ppe.uncheck();
  await page.getByLabel("Sterilization codes", { exact: true }).fill("PED-1");

  await expect(class5).toBeChecked();
  await expect(ppe).toBeChecked();
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
