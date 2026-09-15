import { expect, test } from "@playwright/test";
import { openGeneratedNote } from "./helpers/interactiveTemplate";

const sourceUrl = "/templates/clinic/child-recare-exam-hygiene-notes";
const interactiveUrl = `${sourceUrl}/interactive`;

for (const width of [1600, 390]) {
  test(`child radiographs update completed care and note outputs at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(interactiveUrl);
    const radiographs = page.getByRole("group", { name: "Radiographs taken today", exact: true });
    const preview = page.locator("#child-recare-summary");
    const care = page.getByRole("list", { name: "Treatment completed today entries", exact: true });
    await expect(radiographs.getByRole("checkbox", { name: "Bitewings (BW)", exact: true })).not.toBeChecked();
    await expect(preview).not.toHaveValue(/Radiographs:|Treatment completed today:/);
    await radiographs.getByText("Bitewings (BW)", { exact: true }).click();
    await page.locator("#child-recare-radiographs-bw-quantity").fill("2");
    await radiographs.getByText("Periapicals (PA)", { exact: true }).click();
    await radiographs.getByText("Panoramic (PAN)", { exact: true }).click();
    await radiographs.getByLabel("Type name", { exact: true }).fill("Synthetic occlusal view");
    await radiographs.getByLabel("Short code", { exact: true }).fill("OCC");
    await radiographs.getByLabel("Default images", { exact: true }).fill("1");
    await radiographs.getByRole("button", { name: "Add for this encounter", exact: true }).click();
    await expect(preview).toHaveValue(/Radiographs: 2 BW; 3 PA; PAN; 1 OCC\./);
    await expect(preview).toHaveValue(/Treatment completed today: 2 BW; 3 PA; PAN; 1 OCC/);
    await expect(care.locator(":scope > li")).toHaveCount(4);
    await radiographs.screenshot({ path: testInfo.outputPath(`child-radiographs-${width}.png`) });
    await page.getByRole("button", { name: "Apply standard pediatric care", exact: true }).click();
    await expect(care.locator(":scope > li")).toHaveCount(8);
    const editLink = care.getByRole("link", { name: "Edit radiographs", exact: true }).first();
    await expect(editLink).toHaveAttribute("href", "#child-recare-radiographs");
    await editLink.click();
    await expect(radiographs).toBeInViewport();
    await radiographs.getByRole("button", { name: "Increase BW images", exact: true }).click();
    await radiographs.getByText("Periapicals (PA)", { exact: true }).click();
    await expect(preview).toHaveValue(/Treatment completed today: 3 BW; PAN; 1 OCC;/);
    await expect(preview).not.toHaveValue(/3 PA/);
    await expect(care.locator(":scope > li")).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await openGeneratedNote(page);
    await page.getByRole("radio", { name: "Dentist", exact: true }).check();
    await expect(preview).toHaveValue(/Radiographs: 3 BW; PAN; 1 OCC\./);
    await expect(preview).not.toHaveValue(/Treatment completed today:/);
    await page.getByRole("radio", { name: "Hygienist", exact: true }).check();
    await expect(preview).toHaveValue(/Treatment completed today: 3 BW; PAN; 1 OCC;/);
    await expect(preview).not.toHaveValue(/DENTAL EXAM/);
  });
}

test("child radiograph selections and linked care restore together", async ({ page }) => {
  await page.clock.install();
  await page.goto(interactiveUrl);
  await page.locator("#child-recare-patient-id").fill("SYNTHETIC-CHILD-XRAYS");
  const radiographs = page.getByRole("group", { name: "Radiographs taken today", exact: true });
  await radiographs.getByText("Bitewings (BW)", { exact: true }).click();
  await page.locator("#child-recare-radiographs-bw-quantity").fill("2");
  await page.clock.runFor(10_000);
  await page.reload();
  await expect(page.locator("#child-recare-radiographs-bw-quantity")).toHaveValue("2");
  await expect(page.locator("#child-recare-summary")).toHaveValue(/Treatment completed today: 2 BW/);
  await expect(page.getByRole("list", { name: "Treatment completed today entries", exact: true })
    .locator(":scope > li")).toHaveCount(1);
  await radiographs.getByText("Bitewings (BW)", { exact: true }).click();
  await expect(page.locator("#child-recare-summary")).not.toHaveValue(/Radiographs:|Treatment completed today:/);
});

test("child legacy radiograph text restores without creating completed X-rays", async ({ page }) => {
  await page.clock.install();
  await page.goto(interactiveUrl);
  await page.locator("#child-recare-patient-id").fill("SYNTHETIC-CHILD-LEGACY-XRAYS");
  await page.clock.runFor(10_000);
  // Emulate a pre-upgrade draft after the outgoing page has checkpointed it.
  await page.addInitScript(() => {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("hygienenote.interactive-draft.v1.child-recare-exam-hygiene-notes.")) continue;
      const draft = JSON.parse(localStorage.getItem(key)!);
      if (draft.form.patientId !== "SYNTHETIC-CHILD-LEGACY-XRAYS") continue;
      delete draft.form.radiographsTaken;
      draft.form.radiographs = "Prior bitewings reviewed; none taken today";
      localStorage.setItem(key, JSON.stringify(draft));
    }
  });
  await page.reload();
  await expect(page.getByLabel("Previous radiograph documentation", { exact: true }))
    .toHaveValue("Prior bitewings reviewed; none taken today");
  await expect(page.locator("#child-recare-summary")).toHaveValue(/Radiographs: Prior bitewings reviewed; none taken today\./);
  await expect(page.locator("#child-recare-summary")).not.toHaveValue(/Treatment completed today:/);
  const radiographs = page.getByRole("group", { name: "Radiographs taken today", exact: true });
  await expect(radiographs.getByRole("checkbox", { name: "Bitewings (BW)", exact: true })).not.toBeChecked();
});

test("ready child recare conversion is discoverable from its source template", async ({
  page,
}) => {
  await page.goto(sourceUrl);

  const interactiveLink = page.getByRole("link", {
    name: "Open interactive version · ready",
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
  await expect(page.locator('header[data-template-lifecycle="ready"]')).toContainText(
    "Ready interactive conversion",
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

  await openGeneratedNote(page);
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

test("child standard pediatric care keeps the recare exam separate", async ({
  page,
}) => {
  await page.goto(interactiveUrl);

  const preview = page.locator("#child-recare-summary");
  const completedCare = page.getByRole("list", {
    name: "Treatment completed today entries",
  });

  await page
    .getByRole("button", { name: "Apply standard pediatric care", exact: true })
    .click();

  await expect(preview).toHaveValue(/Treatment completed today:/);
  await expect(preview).not.toHaveValue(/Dentist Recare Exam/);
  await expect(completedCare.locator(":scope > li")).toHaveCount(4);

  const applyRecare = page.getByRole("button", {
    name: "Recare exam",
    exact: true,
  });
  await applyRecare.click();
  await applyRecare.click();

  await expect(preview).toHaveValue(
    /Treatment completed today: Dentist Recare Exam/,
  );
  await expect(completedCare.locator(":scope > li")).toHaveCount(5);
});

test("child recare selects, calculates, and preserves pediatric CAMBRA instruments", async ({
  page,
}) => {
  await page.goto(interactiveUrl);

  await expect(
    page.getByText("Select an age-band instrument to display its assessment factors."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /CAMBRA123 assessment factors/ }),
  ).toHaveCount(0);

  await page.getByRole("radio", { name: "Ages 0–6", exact: true }).check();
  const factors = page.getByRole("button", {
    name: /CAMBRA123 assessment factors/,
  });
  await expect(factors).toHaveAttribute("aria-expanded", "false");
  await factors.click();

  const finalRiskLevel = page.getByRole("button", {
    name: "Final clinician caries-risk category",
    exact: true,
  });
  await finalRiskLevel.click();
  await page.getByRole("option", { name: "Low", exact: true }).click();
  await expect(page.locator("#child-recare-summary")).toHaveValue(
    /Caries risk assessment \(CAMBRA123 2021, ages 0–6\): Complete[\s\S]*CAMBRA123 score: 0[\s\S]*Final clinician caries-risk category: Low\./,
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Clear CAMBRA123 assessment" })
    .click();
  await factors.click();

  const cariesDetected = page.getByRole("button", {
    name: "Caries detected",
    exact: true,
  });
  await cariesDetected.click();
  await page.getByRole("option", { name: "Yes", exact: true }).click();
  await page
    .getByRole("button", { name: "Use caries finding in CAMBRA" })
    .click();

  await expect(factors).toContainText("1 Yes · Score +3 · High (Suggested)");
  await page.getByRole("button", { name: "Apply CAMBRA123 suggestion" }).click();
  await expect(factors).toContainText("1 Yes · Score +3 · High");
  await expect(page.locator("#child-recare-summary")).toHaveValue(
    /CAMBRA123 2021, ages 0–6[\s\S]*Disease indicators — Yes: Evident tooth decay or white spot lesions[\s\S]*Final clinician caries-risk category: High\./,
  );

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Existing answers will be retained but excluded from this note",
    );
    await dialog.accept();
  });
  await page
    .getByRole("radio", { name: "Ages 6–adult", exact: true })
    .check();
  await expect(factors).toContainText("Not calculated");
  await expect(page.locator("#child-recare-summary")).not.toHaveValue(
    /CAMBRA123 2021, ages 0–6/,
  );

  await page.getByRole("radio", { name: "Ages 0–6", exact: true }).check();
  await expect(factors).toContainText("1 Yes · Score +3 · High");
});

test("child recare desktop layout aligns its header and recovery strip with the form column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(interactiveUrl);

  await expect(page.locator("main h2:visible")).toHaveText([
    "Patient and Visit Context",
    "Visit Team",
    "Consent, Medical History, and Sterilization",
    "Records and dental exam",
    "Caries Risk Assessment",
    "Hygiene assessment and treatment",
    "Communication and follow-up",
    "Generated Note",
  ]);

  const dimensions = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(
      "header[data-template-lifecycle]",
    );
    const recovery = document.querySelector<HTMLElement>(
      '[aria-label="Local draft recovery"]',
    );
    const formColumn = header?.parentElement;
    const note = document.querySelector<HTMLElement>("#generated-note-drawer");
    const date = document.querySelector<HTMLElement>("#child-recare-booked");
    const dateButton = document.querySelector<HTMLElement>(
      '[aria-label="Choose Booked date"]',
    );
    if (!header || !recovery || !formColumn || !note || !date || !dateButton) {
      throw new Error("Expected pediatric form controls were not rendered.");
    }
    return {
      formColumnWidth: formColumn.getBoundingClientRect().width,
      formColumnRight: formColumn.getBoundingClientRect().right,
      noteLeft: note.getBoundingClientRect().left,
      headerWidth: header.getBoundingClientRect().width,
      recoveryWidth: recovery.getBoundingClientRect().width,
      dateHeight: date.getBoundingClientRect().height,
      dateButtonHeight: dateButton.getBoundingClientRect().height,
    };
  });

  expect(Math.abs(dimensions.headerWidth - dimensions.formColumnWidth)).toBeLessThan(2);
  expect(Math.abs(dimensions.recoveryWidth - dimensions.formColumnWidth)).toBeLessThan(2);
  expect(dimensions.noteLeft).toBeGreaterThan(dimensions.formColumnRight);
  expect(dimensions.dateButtonHeight).toBe(dimensions.dateHeight);
  await expect(page.getByLabel("Booked date", { exact: true })).toBeVisible();
});
