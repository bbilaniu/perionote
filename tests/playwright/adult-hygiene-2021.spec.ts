import { expect, test, type Page } from "@playwright/test";

const adultHygieneUrl = "/templates/clinic/adult-hygiene-2021/interactive";

async function reloadDiscardingForm(page: Page) {
  const dialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page.reload();
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
  await reloadPromise;
}

test("Adult Hygiene pilot pill matches the amber pilot notice", async ({
  page,
}) => {
  await page.goto("/templates/clinic");
  const pilotPills = page.getByText("Interactive · pilot", { exact: true });
  await expect(pilotPills).toHaveCount(2);
  await expect(pilotPills.first()).toHaveClass(/bg-amber-100/);
  await expect(pilotPills.first()).toHaveClass(/text-amber-900/);
});

test("interactive Generated Note cards match the form card background", async ({
  page,
}) => {
  for (const url of [
    adultHygieneUrl,
    "/templates/clinic/recare-exam/interactive",
  ]) {
    await page.goto(url);
    const generatedNoteCard = page
      .getByRole("heading", { name: "Generated Note", exact: true })
      .locator("xpath=ancestor::section[1]");
    await expect(generatedNoteCard).toHaveClass(/bg-white/);
    await expect(generatedNoteCard).toHaveClass(/dark:bg-slate-900/);
  }
});

test("date and time fields stay inside cards on narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const url of [
    adultHygieneUrl,
    "/templates/clinic/recare-exam/interactive",
    "/templates/dental-hygiene-note-webform",
  ]) {
    await page.goto(url);

    const temporalFields = page.locator(
      'input[type="date"], input[type="datetime-local"], input[type="month"], input[type="time"], input[type="week"]'
    );
    expect(await temporalFields.count()).toBeGreaterThan(0);

    for (const field of await temporalFields.all()) {
      await expect(field).toHaveCSS("min-width", "0px");
      await expect(field).toHaveCSS("max-width", "100%");

      if (!(await field.isVisible())) {
        continue;
      }

      const [fieldBox, parentBox] = await Promise.all([
        field.boundingBox(),
        field.locator("..").boundingBox(),
      ]);
      expect(fieldBox).not.toBeNull();
      expect(parentBox).not.toBeNull();
      expect(fieldBox!.x).toBeGreaterThanOrEqual(parentBox!.x);
      expect(fieldBox!.x + fieldBox!.width).toBeLessThanOrEqual(
        parentBox!.x + parentBox!.width + 1
      );
    }
  }
});

test("Adult Hygiene date fields match the text-field box on narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(adultHygieneUrl);

  const referenceBox = await page
    .locator("#adult-hygiene-note-started")
    .boundingBox();
  expect(referenceBox).not.toBeNull();

  for (const selector of [
    "#adult-hygiene-last-recall-date",
    "#adult-hygiene-date-booked",
  ]) {
    const dateDisplay = page.locator(selector);
    await dateDisplay.fill("20260728");
    await expect(dateDisplay).toHaveValue("2026-07-28");
    await expect(
      dateDisplay.locator(
        "xpath=following-sibling::button[@data-date-picker-trigger]"
      )
    ).toBeEnabled();

    const displayBox = await dateDisplay.boundingBox();
    expect(displayBox).not.toBeNull();
    expect(displayBox!.width).toBeCloseTo(referenceBox!.width, 0);
    expect(displayBox!.height).toBeCloseTo(referenceBox!.height, 0);
  }
});

test("Adult Hygiene enforces copy requirements and supports independent consent sources", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.install({ time: new Date(2026, 6, 25, 9, 10) });
  await page.goto(adultHygieneUrl);

  await expect(
    page.getByRole("link", {
      name: "Original 2021 Adult Hygiene template",
    })
  ).toHaveAttribute("href", "/templates/clinic/adult-hygiene-2021/");
  await expect(
    page.getByText("Pilot interactive conversion", { exact: true })
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-note-started")).toHaveValue(
    "2026-07-25 09:10"
  );
  const consentHistorySection = page
    .getByRole("heading", {
      name: "Consent, Medical History, and Sterilization",
      exact: true,
    })
    .locator("xpath=ancestor::section[1]");
  await expect(
    consentHistorySection
      .locator('input, button[data-list-control="fixed-listbox"]')
      .evaluateAll((controls) => controls.map((control) => control.id))
  ).resolves.toEqual([
    "adult-hygiene-class5",
    "adult-hygiene-miele-codes",
    "adult-hygiene-consent-patient",
    "adult-hygiene-consent-parent",
    "adult-hygiene-consent-guardian",
    "adult-hygiene-medical-history",
    "adult-hygiene-premedication",
  ]);

  await page.evaluate(() => navigator.clipboard.writeText("sentinel"));
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Enter a Patient ID.")).toBeVisible();
  await expect(
    page.getByText("Enter at least one of Dentist, RDH, or RDA.")
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-patient-id")).toBeFocused();

  await page.locator("#adult-hygiene-patient-id").fill("TEST-AH-3003");
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.locator("#adult-hygiene-dentist")).toBeFocused();
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.toBe("sentinel");

  await page.locator("#adult-hygiene-rdh").fill("Example RDH");
  await page.getByLabel("Patient", { exact: true }).check();
  await page.getByLabel("Parent", { exact: true }).check();
  await page.locator("#adult-hygiene-plaque-choice").click();
  const plaqueOptions = page.getByRole("dialog", {
    name: "Plaque options",
    exact: true,
  });
  const plaqueExtent = plaqueOptions.getByRole("group", {
    name: "Extent Plaque choices",
    exact: true,
  });
  await plaqueExtent.getByText("Generalized", { exact: true }).click();
  await plaqueExtent.getByText("Localized", { exact: true }).click();
  await expect(
    plaqueExtent.getByRole("checkbox", {
      name: "Generalized",
      exact: true,
    })
  ).not.toBeChecked();
  await expect(
    plaqueExtent.getByRole("checkbox", {
      name: "Localized",
      exact: true,
    })
  ).toBeChecked();
  await plaqueOptions
    .getByRole("group", {
      name: "Intensity Plaque choices",
      exact: true,
    })
    .getByText("moderate", { exact: true })
    .click();
  await plaqueOptions
    .getByRole("group", {
      name: "Location Plaque choices",
      exact: true,
    })
    .getByText("interproximal", { exact: true })
    .click();
  await plaqueOptions
    .getByRole("button", { name: "Done", exact: true })
    .click();
  await page
    .getByLabel("Plaque comment", { exact: true })
    .fill("Most notable posteriorly");
  await page
    .getByLabel("Calculus comment", { exact: true })
    .fill("Imported calculus comment");
  const ohiAids = page.locator("#adult-hygiene-ohi-aids");
  await ohiAids.fill("Synthetic interdental aid");
  await ohiAids.press("Enter");
  await page
    .getByRole("button", {
      name: "Additional OHE topics reviewed",
      exact: true,
    })
    .click();
  const oheTopicsDialog = page.getByRole("dialog", {
    name: "Additional OHE topics reviewed options",
  });
  const diseaseAndRiskTopics = oheTopicsDialog.getByRole("group", {
    name: "Disease and risk Additional OHE topics reviewed choices",
  });
  await diseaseAndRiskTopics
    .getByText("Caries theory", { exact: true })
    .click();
  await diseaseAndRiskTopics
    .getByText("Caries risk factors", { exact: true })
    .click();
  await oheTopicsDialog
    .getByRole("button", { name: "Done", exact: true })
    .click();
  await page
    .locator("#adult-hygiene-ohe-notes")
    .fill("Demonstrated brushing modifications");
  const flossingFrequency = page.getByRole("combobox", {
    name: "Flossing frequency",
  });
  const brushingFrequency = page.getByRole("combobox", {
    name: "Brushing frequency",
  });
  await flossingFrequency.fill("Uses floss picks most evenings");
  await brushingFrequency.fill("Brushes after each meal");
  await expect(
    page.getByLabel("Other flossing frequency", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Other brushing frequency", { exact: true })
  ).toHaveCount(0);

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Informed verbal consent given by PATIENT and PARENT for treatment today\./
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Plaque: Localized moderate interproximal; Most notable posteriorly\.[\s\S]*Calculus comment: Imported calculus comment\./
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /OH Aids Reviewed\/Recommended: Synthetic interdental aid/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /OHE: Caries theory and risk factors\.\nOHE notes: Demonstrated brushing modifications\./
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient is currently: Uses floss picks most evenings; Brushes after each meal\./
  );

  const preview = await page.locator("#adult-hygiene-summary").inputValue();
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.toBe(preview);
});

test("Adult Hygiene demo output resets and does not survive reload", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(2026, 6, 25, 9, 10) });
  await page.goto(adultHygieneUrl);
  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue(
    "TEST-AH-1001"
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /PSR\/Pocketing: 1 2 2 \/ 2 1 2/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Treatment completed today: Synthetic scaling — full mouth; Synthetic polishing — maxilla/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Recommended Recall Interval: 6-month recall\./
  );

  await reloadDiscardingForm(page);
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /^----- July 25, 2026 9:10:00 AM -----\nPATIENT ID:\nDENTIST:\nRDA:\nRDH:$/
  );

  await page.getByRole("button", { name: "Load synthetic demo" }).click();
  await page.clock.setSystemTime(new Date(2026, 6, 25, 10, 25));
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear all entered 2021 Adult Hygiene values and start a new note?"
    );
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-note-started")).toHaveValue(
    "2026-07-25 10:25"
  );
});

test("Adult Hygiene adds explicit gingival findings and WNL", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const structuredGingival = page.getByRole("group", {
    name: "Structured gingival observations",
    exact: true,
  });
  const gingivalStatus = page.getByRole("button", {
    name: "Gingival Description",
    exact: true,
  });
  const recession = structuredGingival.getByLabel("Gingival recession", {
    exact: true,
  });

  await expect(gingivalStatus).toContainText("Not assessed");
  await expect(
    structuredGingival.getByRole("button", {
      name: "Gingival Description",
      exact: true,
    })
  ).toHaveCount(0);
  await expect(recession).toHaveCount(0);
  await gingivalStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();
  await recession.check();
  await page.getByRole("button", { name: "Gingival recession extent" }).click();
  await page.getByRole("option", { name: "Localized", exact: true }).click();
  await page.getByLabel("Gingival recession location").fill("tooth 13 facial");
  await page.getByLabel("Gingival recession measurement (mm)").fill("2");

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description:\n  - Position \/ Size: gingival recession \(extent: localized; location: tooth 13 facial; measurement: 2 mm\)\./
  );

  await gingivalStatus.click();
  await page
    .getByRole("option", { name: "Not assessed", exact: true })
    .click();
  await expect(recession).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Gingival Description/
  );

  await gingivalStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();
  await expect(recession).toBeChecked();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear the documented Gingival Description findings and set this assessment to WNL?"
    );
    await dialog.accept();
  });
  await gingivalStatus.click();
  await page.getByRole("option", { name: "WNL", exact: true }).click();
  await expect(gingivalStatus).toContainText("WNL");
  await expect(recession).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description: Gingiva coral pink,[\s\S]*no recession or overgrowth noted\./
  );

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear all documented Gingival Description observations and return this assessment to Not assessed?"
    );
    await dialog.accept();
  });
  await structuredGingival
    .getByRole("button", { name: "Clear gingival description", exact: true })
    .click();
  await expect(gingivalStatus).toContainText("Not assessed");

  await page
    .getByRole("button", {
      name: "Apply normal structured observations",
      exact: true,
    })
    .click();
  await expect(gingivalStatus).toContainText("WNL");
  await expect(
    structuredGingival.getByLabel("Coral pink", { exact: true })
  ).toBeChecked();
  const noOvergrowth = structuredGingival.getByLabel("No overgrowth", {
    exact: true,
  });
  await expect(noOvergrowth).toBeChecked();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description: Gingiva coral pink,[\s\S]*no recession or overgrowth noted\./
  );

  await noOvergrowth.uncheck();
  await expect(gingivalStatus).toContainText("Findings");
  const customFindings = page.getByRole("textbox", {
    name: "Gingival Description findings",
    exact: true,
  });
  await expect(customFindings).toBeVisible();
  await customFindings.fill("Custom gingival observation");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description:\n  - Color: coral pink\.[\s\S]*  - Position \/ Size: no recession\.\n  Observations: Custom gingival observation\./
  );
});

test("Adult Hygiene calculates and confirms ClearDent-style Health/Gingivitis output", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await expect(page.locator("#adult-hygiene-health-gingivitis")).toHaveCount(0);
  const structuredObservations = page.getByRole("group", {
    name: "Structured gingival observations",
    exact: true,
  });
  const diagnosis = page.locator("#adult-hygiene-periodontal-diagnosis");
  const structuredBox = await structuredObservations.boundingBox();
  const diagnosisBox = await diagnosis.boundingBox();
  expect(structuredBox).not.toBeNull();
  expect(diagnosisBox).not.toBeNull();
  expect(structuredBox!.y).toBeLessThan(diagnosisBox!.y);

  await diagnosis.click();
  await page
    .getByRole("option", { name: "Periodontal health", exact: true })
    .click();
  await page.locator("#adult-hygiene-periodontium").click();
  await page
    .getByRole("option", { name: "Intact periodontium", exact: true })
    .click();
  await page.locator("#adult-hygiene-bop-percent").fill("6");
  await page.locator("#adult-hygiene-maximum-ppd").fill("3");
  await page.locator("#adult-hygiene-attachment-loss").click();
  await page.getByRole("option", { name: "Absent", exact: true }).click();
  await page.locator("#adult-hygiene-radiographic-bone-loss").click();
  await page.getByRole("option", { name: "Absent", exact: true }).click();

  await expect(
    page.getByText("HEALTH - INTACT PERIODONTIUM", { exact: true })
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Health\/Gingivitis:/
  );

  await page.getByRole("button", { name: "Use candidate", exact: true }).click();
  await page
    .getByLabel("Confirm selected Health/Gingivitis classification")
    .check();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Health\/Gingivitis: HEALTH - INTACT PERIODONTIUM\n- NO PROBING ATTACHMENT LOSS\n- PPD <=3 MM\n- BOP <10%\n- NO RADIOGRAPHIC BONE LOSS/
  );

  await page.locator("#adult-hygiene-bop-percent").fill("12");
  await expect(
    page.getByLabel("Confirm selected Health/Gingivitis classification")
  ).not.toBeChecked();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Health\/Gingivitis:/
  );
});

test("Adult Hygiene composes hygiene findings from grouped facets", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await page.locator("#adult-hygiene-stain-choice").click();
  const stainOptions = page.getByRole("dialog", {
    name: "Stain options",
    exact: true,
  });
  await stainOptions.getByText("None", { exact: true }).click();
  await stainOptions
    .getByRole("group", { name: "Extent Stain choices", exact: true })
    .getByText("Localized", { exact: true })
    .click();
  await expect(
    stainOptions.getByRole("checkbox", { name: "None", exact: true })
  ).not.toBeChecked();
  await stainOptions
    .getByRole("group", { name: "Intensity Stain choices", exact: true })
    .getByText("slight", { exact: true })
    .click();
  await stainOptions.getByRole("button", { name: "Done", exact: true }).click();

  await page.locator("#adult-hygiene-calculus-choice").click();
  const calculusOptions = page.getByRole("dialog", {
    name: "Calculus options",
    exact: true,
  });
  await calculusOptions
    .getByRole("group", { name: "Extent Calculus choices", exact: true })
    .getByText("Generalized", { exact: true })
    .click();
  await calculusOptions
    .getByRole("group", { name: "Intensity Calculus choices", exact: true })
    .getByText("moderate", { exact: true })
    .click();
  const calculusLocation = calculusOptions.getByRole("group", {
    name: "Location Calculus choices",
    exact: true,
  });
  await calculusLocation.getByText("marginal", { exact: true }).click();
  await calculusLocation.getByText("interproximal", { exact: true }).click();
  await expect(
    calculusLocation.getByRole("checkbox", {
      name: "marginal",
      exact: true,
    })
  ).toBeChecked();
  await expect(
    calculusLocation.getByRole("checkbox", {
      name: "interproximal",
      exact: true,
    })
  ).toBeChecked();
  await calculusOptions
    .getByRole("button", { name: "Done", exact: true })
    .click();

  await page.locator("#adult-hygiene-bleeding-choice").click();
  const bleedingOptions = page.getByRole("dialog", {
    name: "Bleeding options",
    exact: true,
  });
  await bleedingOptions
    .getByRole("group", { name: "Extent Bleeding choices", exact: true })
    .getByText("Generalized", { exact: true })
    .click();
  await bleedingOptions
    .getByRole("group", { name: "Severity Bleeding choices", exact: true })
    .getByText("severe", { exact: true })
    .click();
  await bleedingOptions
    .getByRole("button", { name: "Done", exact: true })
    .click();

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Stain: Localized slight\.[\s\S]*Calculus: Generalized moderate marginal\/interproximal\.[\s\S]*Bleeding: Generalized severe\./
  );
});

test("Adult Hygiene catalogue values persist while encounter selections do not", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const medicalHistory = page.getByRole("combobox", {
    name: "Medical history reviewed",
  });
  await medicalHistory.focus();
  for (const label of [
    "YES- NO CHANGES",
    "YES- NP- CLEARED, NO CONTRAINDICATIONS TO TX",
    "YES- UPDATED, BUT NO CONTRAINDICATIONS TO TX",
    "YES- UPDATED MEDS",
  ]) {
    await expect(
      page.getByRole("option", {
        name: `${label} Starter`,
        exact: true,
      })
    ).toBeVisible();
  }

  for (const [controlId, starter] of [
    ["#adult-hygiene-fmp-done", "YES, ALL FINDINGS DISCUSSED WITH PATIENT"],
    ["#adult-hygiene-compliance", "Good"],
    ["#adult-hygiene-ohi-aids", "SULCABRUSH"],
    ["#adult-hygiene-desensitizer", "PREVIDENT FL"],
    ["#adult-hygiene-recall-interval", "6-month recall"],
    ["#adult-hygiene-hygiene-interval", "4-month scale"],
    ["#adult-hygiene-next-visit", "FOLLOW-UP HYGIENE"],
  ]) {
    await page.locator(controlId).focus();
    await expect(
      page.getByRole("option", {
        name: `${starter} Starter`,
        exact: true,
      })
    ).toBeVisible();
  }

  await page
    .getByRole("button", { name: "Add treatment completed", exact: true })
    .click();
  const completedValues = page.getByRole("list", {
    name: "Treatment completed today entries",
  });
  const completedRow = completedValues.locator(":scope > li").first();
  const treatmentCompleted = completedRow.getByRole("combobox", {
    name: "Treatment type",
    exact: true,
  });
  await treatmentCompleted.focus();
  await page
    .getByRole("option", {
      name: "1U scale (cavitron and hand scaling) Starter",
      exact: true,
    })
    .click();

  await completedRow.getByText("Select Tooth/area", { exact: true }).click();
  const toothAreaOptions = completedRow.getByRole("group", {
    name: "Standard Tooth/area choices",
    exact: true,
  });
  await expect(toothAreaOptions.getByRole("checkbox")).toHaveCount(13);
  const quadrantChoices = toothAreaOptions.getByRole("group", {
    name: "Quadrants Tooth/area choices",
    exact: true,
  });
  await expect(quadrantChoices.locator(":scope > div")).toHaveClass(
    /grid-cols-2/
  );
  await expect(quadrantChoices.locator("label")).toHaveText([
    "Q1",
    "Q2",
    "Q4",
    "Q3",
  ]);
  const sextantChoices = toothAreaOptions.getByRole("group", {
    name: "Sextants Tooth/area choices",
    exact: true,
  });
  await expect(sextantChoices.locator(":scope > div")).toHaveClass(
    /grid-cols-3/
  );
  await expect(sextantChoices.locator("label")).toHaveText([
    "S1",
    "S2",
    "S3",
    "S6",
    "S5",
    "S4",
  ]);
  const q3ToothArea = toothAreaOptions.getByRole("checkbox", {
    name: "Q3",
    exact: true,
  });
  const q2ToothArea = toothAreaOptions.getByRole("checkbox", {
    name: "Q2",
    exact: true,
  });
  await toothAreaOptions.getByText("Q3", { exact: true }).click();
  await expect(q3ToothArea).toBeChecked();
  await expect(toothAreaOptions).toBeVisible();
  await toothAreaOptions.getByText("Q2", { exact: true }).click();
  await expect(q2ToothArea).toBeChecked();
  await expect(
    toothAreaOptions.locator("[data-selected-indicator]")
  ).toHaveCount(2);
  await completedRow
    .getByRole("textbox", {
      name: "Search or add custom Tooth/area",
      exact: true,
    })
    .fill("teeth 14–16");
  await completedRow
    .getByRole("button", {
      name: "Add “teeth 14–16” to this note",
      exact: true,
    })
    .click();
  await expect(toothAreaOptions).toBeVisible();

  await expect(
    completedRow.getByRole("checkbox", {
      name: "teeth 14–16 Custom",
      exact: true,
    })
  ).toBeChecked();
  await expect(
    completedRow
      .getByRole("dialog", { name: "Tooth/area options", exact: true })
      .locator("[data-selected-indicator]")
  ).toHaveCount(3);
  await expect(
    completedRow.getByRole("button", {
      name: "Q2, Q3, teeth 14–16",
      exact: true,
    })
  ).toBeVisible();
  await expect(
    completedRow.getByRole("list", {
      name: "Tooth/area selected values",
      exact: true,
    })
  ).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Treatment completed today: 1U scale \(cavitron and hand scaling\) — Q2, Q3, teeth 14–16/
  );
  await completedRow.getByRole("button", { name: "Done", exact: true }).click();
  await expect(toothAreaOptions).toBeHidden();
  await expect(
    completedRow.getByRole("button", {
      name: "Move treatment completed item 1 earlier",
    })
  ).toHaveClass(/py-2/);
  const removeCompleted = completedRow.getByRole("button", {
    name: "Remove treatment completed item 1",
  });
  await expect(removeCompleted).toHaveClass(/border-red-300/);
  await expect(removeCompleted).toHaveClass(/text-red-800/);
  await removeCompleted.hover();
  await expect(
    completedRow.getByRole("tooltip").filter({
      hasText: "Remove this treatment line from the note.",
    })
  ).toBeVisible();

  const anesthetic = page.locator("#adult-hygiene-anesthetic");
  await anesthetic.focus();
  await expect(anesthetic).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("No catalogue suggestions saved yet.", { exact: true })
  ).toBeVisible();

  await medicalHistory.fill("Synthetic reusable history phrase");
  await page.getByRole("button", { name: "Remember this value" }).click();

  const compliance = page.locator("#adult-hygiene-compliance");
  await compliance.fill("Synthetic reusable compliance");
  await compliance
    .locator("xpath=../..")
    .getByRole("button", { name: "Remember this value" })
    .click();

  const ohiAids = page.locator("#adult-hygiene-ohi-aids");
  const ohiControl = ohiAids.locator("xpath=../..");
  await ohiAids.fill("Synthetic reusable OHI aid");
  await ohiControl.getByRole("button", { name: "Remember and add" }).click();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /OH Aids Reviewed\/Recommended: Synthetic reusable OHI aid/
  );
  const ohiAidRow = page
    .getByRole("list", {
      name: "OH aids reviewed/recommended selected values",
    })
    .locator(":scope > li")
    .first();
  await expect(
    ohiAidRow.getByRole("button", {
      name: "Move Synthetic reusable OHI aid earlier",
    })
  ).toHaveClass(/py-2/);
  const removeOhiAid = ohiAidRow.getByRole("button", {
    name: "Remove Synthetic reusable OHI aid",
  });
  await expect(removeOhiAid).toHaveClass(/border-red-300/);
  await removeOhiAid.hover();
  await expect(
    ohiAidRow.getByRole("tooltip").filter({
      hasText: "Remove this value from the note.",
    })
  ).toBeVisible();

  await reloadDiscardingForm(page);
  await expect(medicalHistory).toHaveValue("");
  await medicalHistory.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable history phrase Local/,
    })
  ).toBeVisible();

  await compliance.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable compliance Local/,
    })
  ).toBeVisible();

  await expect(
    page.getByText("Synthetic reusable OHI aid", { exact: true })
  ).toHaveCount(0);
  await ohiAids.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable OHI aid Local/,
    })
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Synthetic reusable/
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /teeth 14–16/
  );
});

test("Adult Hygiene uses clockwise sextant labels and output", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const sextantInputs = page
    .getByRole("group", { name: "PSR/Pocketing" })
    .getByRole("textbox");
  await expect(sextantInputs).toHaveCount(6);
  await expect(
    sextantInputs.evaluateAll((inputs) =>
      inputs.map(
        (input) =>
          document.querySelector(`label[for="${input.id}"]`)?.textContent
      )
    )
  ).resolves.toEqual([
    "Sextant 1",
    "Sextant 2",
    "Sextant 3",
    "Sextant 6",
    "Sextant 5",
    "Sextant 4",
  ]);

  for (const sextant of [1, 2, 3, 6, 5, 4]) {
    await page
      .getByLabel(`Sextant ${sextant}`, { exact: true })
      .fill(`${sextant}`);
  }
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /PSR\/Pocketing: 1 2 3 \/ 6 5 4/
  );
});

test("Adult Hygiene requires confirmation for structured periodontal candidates", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", { name: "Periodontitis", exact: true })
    .click();
  await page.locator("#adult-hygiene-periodontal-extent").click();
  await page
    .getByRole("option", { name: "Generalized", exact: true })
    .click();
  await page.locator("#adult-hygiene-stage-interdental-cal").fill("5");
  await page.locator("#adult-hygiene-maximum-ppd").fill("6");
  await page.locator("#adult-hygiene-grade-bone-loss-age-ratio").fill("0.72");

  await expect(
    page.getByText("Stage III; Grade B.", { exact: false })
  ).toBeVisible();
  await expect(
    page.getByText(/Stage evidence: interdental CAL 5 mm; maximum PPD 6 mm\./)
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Stage III|Grade B/
  );

  await page.getByRole("button", { name: "Use candidates" }).click();
  await expect(
    page.locator("#adult-hygiene-periodontitis-stage")
  ).toHaveAttribute("data-value", "III");
  await expect(
    page.locator("#adult-hygiene-periodontitis-grade")
  ).toHaveAttribute("data-value", "B");
  await page.getByLabel("Confirm selected stage").check();
  await page.getByLabel("Confirm selected grade").check();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Periodontal diagnosis: Generalized periodontitis, Stage III, Grade B\.[\s\S]*Stage basis: interdental CAL 5 mm; maximum PPD 6 mm\.[\s\S]*Grade basis: bone-loss\/age ratio 0\.72\./
  );

  await page.locator("#adult-hygiene-periodontitis-stage").click();
  await page
    .getByRole("option", { name: "Stage IV (P4)", exact: true })
    .click();
  await expect(page.getByLabel("Confirm selected stage")).not.toBeChecked();
  await expect(page.getByLabel("Stage override reason")).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Stage IV|Stage basis:/
  );
});

test("Adult Hygiene keeps compliance and interval comments independent", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await page
    .getByLabel("Oral hygiene compliance comment", { exact: true })
    .fill("Synthetic compliance context");
  await page
    .getByLabel("Oral hygiene compliance", { exact: true })
    .fill("Good");
  await page
    .getByLabel("Recommended recall interval comments", { exact: true })
    .fill("Synthetic recall context");
  await page
    .getByLabel("Recommended recall interval", { exact: true })
    .fill("6-month recall");
  await page
    .getByLabel("Recommended hygiene interval comments", { exact: true })
    .fill("Synthetic hygiene context");
  await page
    .getByLabel("Recommended hygiene interval", { exact: true })
    .fill("4-month scale");

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Oral hygiene compliance: Good\.[\s\S]*Oral hygiene compliance comment: Synthetic compliance context\.[\s\S]*Recommended Recall Interval: 6-month recall\.[\s\S]*Recommended recall interval comments: Synthetic recall context\.[\s\S]*Recommended Hygiene Interval: 4-month scale\.[\s\S]*Recommended hygiene interval comments: Synthetic hygiene context\./
  );
});
