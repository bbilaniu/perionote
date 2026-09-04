import { expect, test, type Page } from "@playwright/test";
import {
  openFormActionDialog,
  openGeneratedNote,
  saveDraftAndStartNew,
} from "./helpers/interactiveTemplate";

const adultHygieneUrl = "/templates/clinic/adult-hygiene-2021/interactive";

async function reloadDiscardingForm(page: Page) {
  const dialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page.reload();
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
  await reloadPromise;
}

test("clinic lifecycle badges expose their registry lifecycle", async ({ page }) => {
  await page.goto("/templates/clinic");
  const lifecycleBadges = page.locator("[data-template-lifecycle-badge]");
  const badgeCount = await lifecycleBadges.count();
  expect(badgeCount).toBeGreaterThan(0);

  for (let index = 0; index < badgeCount; index += 1) {
    const badge = lifecycleBadges.nth(index);
    const lifecycle = await badge.getAttribute("data-template-lifecycle-badge");
    expect(["draft", "pilot", "ready"]).toContain(lifecycle);
    await expect(badge).toHaveText(`Interactive · ${lifecycle}`);
  }
});

test("interactive Generated Note cards match the form card background", async ({
  page,
}) => {
  for (const url of [
    adultHygieneUrl,
    "/templates/clinic/recare-exam/interactive",
  ]) {
    await page.goto(url);
    await openGeneratedNote(page);
    const generatedNoteCard = page
      .getByRole("heading", { name: "Generated Note", exact: true })
      .locator("xpath=ancestor::section[1]");
    await expect(generatedNoteCard).toHaveClass(/bg-white/);
    await expect(generatedNoteCard).toHaveClass(/dark:bg-slate-900/);
  }
});

test("interactive workspace emphasizes copying over utility actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(adultHygieneUrl);

  const copyNote = page.getByRole("button", { name: "Copy note" });
  const loadDemo = page.getByRole("button", { name: "Load synthetic demo" });
  const newOrClear = page.getByRole("button", { name: "New / clear form" });

  await expect(copyNote).toHaveClass(/bg-sky-700/);
  await expect(copyNote).toHaveClass(/min-h-11/);
  await expect(newOrClear).toHaveClass(/border-slate-300/);
  await expect(loadDemo).toHaveClass(/border-transparent/);
  await expect(loadDemo).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  const [copyBox, loadDemoBox, newOrClearBox] = await Promise.all([
    copyNote.boundingBox(),
    loadDemo.boundingBox(),
    newOrClear.boundingBox(),
  ]);
  expect(copyBox).not.toBeNull();
  expect(loadDemoBox).not.toBeNull();
  expect(newOrClearBox).not.toBeNull();
  expect(copyBox!.height).toBeGreaterThanOrEqual(44);
  expect(loadDemoBox!.height).toBe(copyBox!.height);
  expect(newOrClearBox!.height).toBe(copyBox!.height);
});

test("interactive forms keep navigation on the right with a persistent note preview", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const url of [
    adultHygieneUrl,
    "/templates/clinic/recare-exam/interactive",
  ]) {
    await page.goto(url);
    const navigation = page.getByRole("navigation", {
      name: "Form sections",
    });
    const firstSection = page
      .getByRole("heading", { name: "Patient and Visit Context", exact: true })
      .locator("xpath=ancestor::section[1]");
    const [navigationBox, firstSectionBox] = await Promise.all([
      navigation.boundingBox(),
      firstSection.boundingBox(),
    ]);

    expect(navigationBox).not.toBeNull();
    expect(firstSectionBox).not.toBeNull();
    expect(firstSectionBox!.x + firstSectionBox!.width).toBeLessThan(
      navigationBox!.x,
    );

    const drawer = page.getByRole("complementary", {
      name: "Generated note preview",
    });
    await expect(drawer).toBeVisible();
    const reviewNote = navigation.locator("[data-review-note-trigger]");
    await expect(reviewNote).toBeHidden();
    const workspaceHeader = page
      .locator("h1")
      .locator("xpath=ancestor::header[1]");
    const [resizedSectionBox, workspaceHeaderBox, drawerBox] =
      await Promise.all([
        firstSection.boundingBox(),
        workspaceHeader.boundingBox(),
        drawer.boundingBox(),
      ]);
    expect(resizedSectionBox).not.toBeNull();
    expect(workspaceHeaderBox).not.toBeNull();
    expect(drawerBox).not.toBeNull();
    expect(resizedSectionBox!.x + resizedSectionBox!.width).toBeLessThan(
      navigationBox!.x,
    );
    expect(navigationBox!.x + navigationBox!.width).toBeLessThan(
      drawerBox!.x,
    );
    expect(workspaceHeaderBox!.x + workspaceHeaderBox!.width).toBeLessThan(
      drawerBox!.x,
    );
  }
});

test("the desktop utility rail opens the note drawer below the docked breakpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto(adultHygieneUrl);

  const navigation = page.getByRole("navigation", { name: "Form sections" });
  const firstSection = page
    .getByRole("heading", { name: "Patient and Visit Context", exact: true })
    .locator("xpath=ancestor::section[1]");
  const [navigationBox, firstSectionBox] = await Promise.all([
    navigation.boundingBox(),
    firstSection.boundingBox(),
  ]);
  expect(navigationBox).not.toBeNull();
  expect(firstSectionBox).not.toBeNull();
  expect(firstSectionBox!.x + firstSectionBox!.width).toBeLessThan(
    navigationBox!.x,
  );

  const drawer = page.getByRole("complementary", {
    name: "Generated note preview",
  });
  await expect(drawer).not.toBeVisible();
  const reviewNote = navigation.getByRole("button", { name: "Review note" });
  await reviewNote.click();
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCSS("position", "fixed");
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(reviewNote).toBeFocused();
});

test("desktop users can drag workspace backgrounds to scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 600 });
  await page.goto(adultHygieneUrl);

  const form = page.locator("form");
  await page.evaluate(() => window.scrollTo(0, 600));
  const initialScrollY = await page.evaluate(() => window.scrollY);

  await form.dispatchEvent("pointerdown", {
    pointerId: 1,
    pointerType: "mouse",
    button: 0,
    clientY: 300,
  });
  await form.dispatchEvent("pointermove", {
    pointerId: 1,
    pointerType: "mouse",
    clientY: 180,
  });
  await form.dispatchEvent("pointerup", {
    pointerId: 1,
    pointerType: "mouse",
    clientY: 180,
  });

  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(initialScrollY + 120);

  const scrollBeforeInputDrag = await page.evaluate(() => window.scrollY);
  const input = page.locator("input").first();
  await input.dispatchEvent("pointerdown", {
    pointerId: 2,
    pointerType: "mouse",
    button: 0,
    clientY: 300,
  });
  await input.dispatchEvent("pointermove", {
    pointerId: 2,
    pointerType: "mouse",
    clientY: 180,
  });
  await input.dispatchEvent("pointerup", {
    pointerId: 2,
    pointerType: "mouse",
    clientY: 180,
  });
  expect(await page.evaluate(() => window.scrollY)).toBe(
    scrollBeforeInputDrag,
  );
});

test("loading demo data warns before replacing a modified form", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const patientId = page.locator("#adult-hygiene-patient-id");
  const loadDemo = page.getByRole("button", { name: "Load synthetic demo" });
  const formActions = page.getByRole("button", {
    name: "New / clear form",
  });
  await expect(formActions).toBeVisible();

  await patientId.fill("KEEP-MY-CHANGES");

  await loadDemo.click();
  const demoDialog = page.getByRole("dialog", {
    name: "Replace current form with synthetic demo?",
  });
  await expect(demoDialog).toBeVisible();
  await expect(demoDialog).toContainText(
    "This replaces the entries in the current form.",
  );
  await demoDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(patientId).toHaveValue("KEEP-MY-CHANGES");
  await expect(loadDemo).toBeFocused();

  await loadDemo.click();
  await demoDialog.getByRole("button", { name: "Replace form" }).click();
  await expect(patientId).toHaveValue("TEST-AH-1001");

  await patientId.fill("RESET-THIS-CHANGE");
  let formDialog = await openFormActionDialog(page);
  await expect(formDialog).toContainText(
    "Keep this work as a local draft before opening a blank form",
  );
  await page.keyboard.press("Escape");
  await expect(formDialog).toBeHidden();
  await expect(patientId).toHaveValue("RESET-THIS-CHANGE");
  await expect(formActions).toBeFocused();

  formDialog = await openFormActionDialog(page);
  await formDialog
    .getByRole("button", { name: "Save draft & start new" })
    .click();
  await expect(patientId).toHaveValue("");

  // A successful reset establishes the new clean baseline, so this is immediate.
  await loadDemo.click();
  await expect(patientId).toHaveValue("TEST-AH-1001");
});

test("mobile section navigation stays compact and opens as a side sheet", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(adultHygieneUrl);

  const sectionButton = page.getByRole("button", {
    name: /Open form sections\. Current section:/,
  });
  await expect(sectionButton).toContainText("1 of 10");
  await sectionButton.click();

  const sectionDialog = page.getByRole("dialog", { name: "On this form" });
  await expect(sectionDialog).toBeVisible();
  await sectionDialog.getByRole("link", { name: "Visit Team" }).click();
  await expect(sectionDialog).not.toBeVisible();
  await expect(page).toHaveURL(/#template-section-visit-team$/);
  await expect(sectionButton).toContainText("2 of 10");
});

test("generated note opens as a full-width mobile drawer and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(adultHygieneUrl);

  await page.evaluate(() => window.scrollTo(0, 1200));

  const reviewNote = page.getByRole("button", { name: "Review note" });
  await expect(reviewNote).toBeVisible();
  await reviewNote.click();
  const drawer = page.getByRole("complementary", {
    name: "Generated note preview",
  });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCSS("position", "fixed");
  await expect(drawer.getByText("Note preview", { exact: true })).toHaveCount(
    0,
  );
  const generatedNoteHeader = drawer
    .getByRole("heading", { name: "Generated Note", exact: true })
    .locator("..");
  await expect(
    generatedNoteHeader.getByRole("button", { name: "Close" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(reviewNote).toBeFocused();
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
  await expect(page.locator("header[data-template-lifecycle]")).toBeVisible();
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
    "adult-hygiene-ppe",
    "adult-hygiene-miele-codes",
    "adult-hygiene-consent-patient",
    "adult-hygiene-consent-parent",
    "adult-hygiene-consent-guardian",
    "adult-hygiene-medical-history",
    "adult-hygiene-premedication",
  ]);
  await expect(
    consentHistorySection.getByRole("checkbox", {
      name: "Class 5 indicators checked",
      exact: true,
    })
  ).toBeChecked();
  await expect(
    consentHistorySection.getByRole("checkbox", {
      name: "Standard PPE statement applies",
      exact: true,
    })
  ).toBeChecked();
  await expect(
    consentHistorySection.getByRole("textbox", {
      name: "Sterilization codes",
      exact: true,
    })
  ).toBeVisible();

  await page.evaluate(() => navigator.clipboard.writeText("sentinel"));
  await openGeneratedNote(page);
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Enter a Patient ID.")).toBeVisible();
  await expect(
    page.getByText("Enter at least one of Dentist, RDH, or RDA.")
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-patient-id")).toBeFocused();

  await page.locator("#adult-hygiene-patient-id").fill("TEST-AH-3003");
  await openGeneratedNote(page);
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
  await openGeneratedNote(page);
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.toBe(preview);
});

test("Adult Hygiene demo output survives reload and reset preserves its draft", async ({
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
    /Treatment completed today: Synthetic scaling — Q2, Q3, teeth 14–16; Synthetic polishing — maxilla/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Recommended Recare Interval: 6-month recall\./
  );
  await expect(
    page.getByRole("heading", { name: "Caries Risk Assessment", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Caries risk level", exact: true })
  ).toHaveAttribute("data-value", "Moderate");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Periodontal status comment: Synthetic periodontal status comment\.\n\nCaries risk: Moderate caries risk due to high frequency of sugar intake, insufficient exposure to fluoride and history of active decay in the last 36 months\. Synthetic diet and home-care factors reviewed\.\n\nOral hygiene compliance: Good\./
  );

  await reloadDiscardingForm(page);
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue(
    "TEST-AH-1001",
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Treatment completed today: Synthetic scaling — Q2, Q3, teeth 14–16; Synthetic polishing — maxilla/
  );
  await expect(page.getByText(/Restored the draft saved/)).toBeVisible();

  await page.clock.setSystemTime(new Date(2026, 6, 25, 10, 25));
  await saveDraftAndStartNew(page);
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-note-started")).toHaveValue(
    "2026-07-25 10:25"
  );
});

test("Adult Hygiene expands populated structured observations", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const structuredPeriodontalObservations = page.getByRole("button", {
    name: /Structured periodontal observations/,
  });
  const structuredGingivalObservations = page.getByRole("button", {
    name: /Structured gingival observations/,
  });

  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "id",
    "adult-hygiene-structured-periodontal-observations"
  );
  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-controls",
    "adult-hygiene-structured-periodontal-observations-content"
  );
  await expect(structuredGingivalObservations).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await page.getByRole("button", { name: "Load synthetic demo" }).click();
  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await expect(
    page.locator("#adult-hygiene-structured-periodontal-observations-content")
  ).toBeVisible();
  await expect(structuredPeriodontalObservations).toContainText(
    "14 observations documented"
  );
  await expect(structuredGingivalObservations).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await expect(structuredGingivalObservations).toContainText(
    "2 observations documented"
  );
});

test("Adult Hygiene keeps WNL gingival observations collapsed", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const structuredGingival = page.getByRole("group", {
    name: "Structured gingival observations",
    exact: true,
  });
  const structuredGingivalDisclosure = structuredGingival.getByRole("button", {
    name: /Structured gingival observations/,
  });
  const gingivalStatus = page.getByRole("button", {
    name: "Gingival Description",
    exact: true,
  });

  await expect(structuredGingivalDisclosure).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await gingivalStatus.click();
  await page.getByRole("option", { name: "WNL", exact: true }).click();

  await expect(gingivalStatus).toContainText("WNL");
  await expect(structuredGingivalDisclosure).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(structuredGingivalDisclosure).toContainText(
    "10 observations documented"
  );
  await expect(
    structuredGingival.getByRole("button", {
      name: "Color observations",
      exact: true,
    })
  ).toHaveCount(0);

  await structuredGingivalDisclosure.click();
  const colorObservations = structuredGingival.getByRole("button", {
    name: "Color observations",
    exact: true,
  });
  await expect(colorObservations).toContainText("Coral pink");
  await colorObservations.click();
  await expect(
    structuredGingival
      .getByRole("dialog", { name: "Color observations options" })
      .getByLabel("Coral pink", { exact: true })
  ).toBeChecked();
});

test("Adult Hygiene progressively discloses stage and grade evidence", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const structuredPeriodontalObservations = page.getByRole("button", {
    name: /Structured periodontal observations/,
  });
  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "false"
  );

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", {
      name: "Periodontitis / history of periodontitis",
      exact: true,
    })
    .click();

  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(
    page.getByRole("button", { name: /Patient-specific stage evidence/ })
  ).toHaveCount(0);

  await structuredPeriodontalObservations.click();
  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  const stageEvidence = page.getByRole("button", {
    name: /Patient-specific stage evidence/,
  });
  const gradeEvidence = page.getByRole("button", {
    name: /Patient-specific grade evidence/,
  });
  await expect(stageEvidence).toHaveAttribute("aria-expanded", "false");
  await expect(stageEvidence).toContainText("Not assessed");
  await expect(
    page.locator("#adult-hygiene-stage-interdental-cal")
  ).toHaveCount(0);
  await expect(gradeEvidence).toHaveAttribute("aria-expanded", "false");
  await expect(gradeEvidence).toContainText("Not assessed");
  await expect(
    page.locator("#adult-hygiene-grade-bone-loss-age-ratio")
  ).toHaveCount(0);

  await stageEvidence.click();
  await expect(
    page.locator("#adult-hygiene-stage-interdental-cal")
  ).toBeVisible();
  await gradeEvidence.click();
  await expect(
    page.locator("#adult-hygiene-grade-bone-loss-age-ratio")
  ).toBeVisible();
  await page.locator("#adult-hygiene-stage-interdental-cal").fill("3");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient-specific stage evidence:\n  Severity evidence:\n    - interdental CAL 3 mm\./
  );
  await page
    .locator("#adult-hygiene-grade-bone-loss-age-ratio")
    .fill("0.72");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient-specific grade evidence:\n  Progression evidence:\n    - bone-loss\/age ratio 0\.72\./
  );
  await page.locator("#adult-hygiene-smoking-modifier").click();
  await page
    .getByRole("option", { name: "Smokes cigarettes", exact: true })
    .click();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient-specific grade evidence:[\s\S]*  Grade modifiers:\n    - Smoking: smokes cigarettes; cigarettes\/day not entered\./
  );
});

test("Adult Hygiene prevents conflicting gingival menu selections", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const structuredGingival = page.getByRole("group", {
    name: "Structured gingival observations",
    exact: true,
  });
  const structuredGingivalDisclosure = structuredGingival.getByRole("button", {
    name: /Structured gingival observations/,
  });
  await structuredGingivalDisclosure.click();

  const colorObservations = structuredGingival.getByRole("button", {
    name: "Color observations",
    exact: true,
  });
  await colorObservations.click();
  const colorOptions = structuredGingival.getByRole("dialog", {
    name: "Color observations options",
  });
  await colorOptions.getByText("Coral pink", { exact: true }).click();
  await colorOptions.getByText("Red / erythematous", { exact: true }).click();
  await expect(
    colorOptions.getByLabel("Coral pink", { exact: true })
  ).not.toBeChecked();
  await expect(
    colorOptions.getByLabel("Red / erythematous", { exact: true })
  ).toBeChecked();
  await colorObservations.click();

  const positionObservations = structuredGingival.getByRole("button", {
    name: "Position / Size observations",
    exact: true,
  });
  await positionObservations.click();
  const positionOptions = structuredGingival.getByRole("dialog", {
    name: "Position / Size observations options",
  });
  await positionOptions.getByText("No recession", { exact: true }).click();
  await positionOptions.getByText("Root exposure", { exact: true }).click();
  await expect(
    positionOptions.getByLabel("No recession", { exact: true })
  ).not.toBeChecked();
  await positionOptions
    .getByText("Gingival recession", { exact: true })
    .click();
  await expect(
    positionOptions.getByLabel("Root exposure", { exact: true })
  ).toBeChecked();
  await positionOptions.getByText("No recession", { exact: true }).click();
  await expect(
    positionOptions.getByLabel("Gingival recession", { exact: true })
  ).not.toBeChecked();
  await expect(
    positionOptions.getByLabel("Root exposure", { exact: true })
  ).not.toBeChecked();
  await expect(structuredGingivalDisclosure).toContainText(
    "2 observations documented"
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
  const structuredGingivalDisclosure = structuredGingival.getByRole("button", {
    name: /Structured gingival observations/,
  });
  await expect(gingivalStatus).toContainText("Not assessed");
  await expect(structuredGingivalDisclosure).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(structuredGingivalDisclosure).toContainText("Not assessed");
  await expect(
    structuredGingival.getByRole("button", {
      name: "Gingival Description",
      exact: true,
    })
  ).toHaveCount(0);
  await expect(
    structuredGingival.getByRole("button", {
      name: "Position / Size observations",
      exact: true,
    })
  ).toHaveCount(0);
  await structuredGingivalDisclosure.click();
  await expect(structuredGingivalDisclosure).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  const positionObservations = structuredGingival.getByRole("button", {
    name: "Position / Size observations",
    exact: true,
  });
  await positionObservations.click();
  await structuredGingival
    .getByRole("dialog", { name: "Position / Size observations options" })
    .getByText("Gingival recession", { exact: true })
    .click();
  await positionObservations.click();
  await expect(gingivalStatus).toContainText("Findings");
  await expect(structuredGingivalDisclosure).toContainText(
    "1 observation documented"
  );
  const recessionExtent = page.getByRole("button", {
    name: "Gingival recession extent",
    exact: true,
  });
  await recessionExtent.click();
  await page.getByRole("option", { name: "Localized", exact: true }).click();
  const recessionLocation = page.getByRole("button", {
    name: "Gingival recession location",
    exact: true,
  });
  const recessionMeasurement = page.getByLabel(
    "Gingival recession measurement (mm)",
    { exact: true },
  );
  const [recessionLocationBox, recessionMeasurementBox] = await Promise.all([
    recessionLocation
      .locator("xpath=ancestor::*[@data-fixed-multi-combobox][1]")
      .boundingBox(),
    recessionMeasurement.locator("xpath=parent::*").boundingBox(),
  ]);
  expect(recessionLocationBox).not.toBeNull();
  expect(recessionMeasurementBox).not.toBeNull();
  expect(recessionMeasurementBox!.y).toBeGreaterThan(
    recessionLocationBox!.y + recessionLocationBox!.height,
  );
  expect(
    Math.abs(recessionLocationBox!.x - recessionMeasurementBox!.x),
  ).toBeLessThan(2);
  expect(
    Math.abs(recessionLocationBox!.width - recessionMeasurementBox!.width),
  ).toBeLessThan(2);
  await recessionLocation.click();
  const recessionLocationOptions = page.getByRole("dialog", {
    name: "Gingival recession location options",
    exact: true,
  });
  await expect(
    recessionLocationOptions.getByRole("checkbox", {
      name: "full mouth",
      exact: true,
    })
  ).toHaveCount(0);
  await recessionLocationOptions.getByText("Q1", { exact: true }).click();
  await recessionLocationOptions
    .getByText("facial/buccal", { exact: true })
    .click();
  await recessionLocationOptions
    .getByRole("textbox", {
      name: "Search or add custom Gingival recession location",
      exact: true,
    })
    .fill("tooth 13");
  await recessionLocationOptions
    .getByRole("button", {
      name: "Add “tooth 13” to this note",
      exact: true,
    })
    .click();
  await recessionLocationOptions
    .getByRole("button", { name: "Done", exact: true })
    .click();
  await recessionMeasurement.fill("2");

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description:\n  - Position \/ Size: gingival recession \(extent: localized; location: Q1, facial\/buccal, tooth 13; measurement: 2 mm\)\./
  );

  await gingivalStatus.click();
  await page.getByRole("option", { name: "Not assessed", exact: true }).click();
  await expect(positionObservations).toContainText("Gingival recession");
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Gingival Description/
  );

  await gingivalStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();
  await expect(positionObservations).toContainText("Gingival recession");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear the documented Gingival Description findings and set this assessment to WNL?"
    );
    await dialog.accept();
  });
  await gingivalStatus.click();
  await page.getByRole("option", { name: "WNL", exact: true }).click();
  await expect(gingivalStatus).toContainText("WNL");
  await expect(positionObservations).not.toContainText("Gingival recession");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description: Generalized Gingiva coral pink,[\s\S]*Generalized appropriate stippling of attached gingiva, and no recession or overgrowth noted\./
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
  const colorObservations = structuredGingival.getByRole("button", {
    name: "Color observations",
    exact: true,
  });
  await expect(colorObservations).toContainText("Coral pink");
  await expect(positionObservations).toContainText("No overgrowth");
  for (const option of [
    "Coral pink",
    "Knife-edged margins",
    "Flat against the teeth",
    "Papillae fill embrasures",
    "Firm",
    "Resilient",
    "Stippled attached gingiva",
    "Smooth marginal gingiva",
    "No recession",
    "No overgrowth",
  ]) {
    await expect(
      structuredGingival.getByRole("button", {
        name: `${option} extent`,
        exact: true,
      }),
    ).toContainText("Generalized");
  }
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description: Generalized Gingiva coral pink, Generalized firm and resilient, Generalized with knife-edged margins, Generalized papillae filling the embrasures, Generalized appropriate stippling of attached gingiva, and no recession or overgrowth noted\./
  );

  await positionObservations.click();
  await structuredGingival
    .getByRole("dialog", { name: "Position / Size observations options" })
    .getByText("No overgrowth", { exact: true })
    .click();
  await positionObservations.click();
  await expect(gingivalStatus).toContainText("Findings");
  const customFindings = page.getByRole("textbox", {
    name: "Gingival Description findings",
    exact: true,
  });
  await expect(customFindings).toBeVisible();
  await customFindings.fill("Custom gingival observation");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Gingival Description:\n  - Color: coral pink \(extent: generalized\)\.[\s\S]*  - Position \/ Size: no recession \(extent: generalized\)\.\n  Observations: Custom gingival observation\./
  );
});

test("Adult Hygiene calculates and confirms ClearDent-style Health/Gingivitis output", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const structuredPeriodontalObservations = page.getByRole("button", {
    name: /Structured periodontal observations/,
  });
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

  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(structuredPeriodontalObservations).toContainText("Not assessed");
  await expect(page.locator("#adult-hygiene-periodontium")).toHaveCount(0);
  const periodontalObservationsBox =
    await structuredPeriodontalObservations.boundingBox();
  expect(periodontalObservationsBox).not.toBeNull();
  expect(periodontalObservationsBox!.y).toBeLessThan(diagnosisBox!.y);

  await structuredPeriodontalObservations.click();
  await expect(
    page.getByText("Periodontal assessment findings", { exact: true })
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-periodontium")).toBeVisible();
  const periodontalSupportBox = await page
    .locator('[data-candidate-field="periodontal-support"]')
    .boundingBox();
  const progressiveDestructionBox = await page
    .locator('[data-candidate-field="progressive-destruction"]')
    .boundingBox();
  expect(periodontalSupportBox).not.toBeNull();
  expect(progressiveDestructionBox).not.toBeNull();
  expect(periodontalSupportBox!.y).toBeGreaterThan(
    progressiveDestructionBox!.y
  );
  const stageEvidence = page.getByRole("button", {
    name: /Patient-specific stage evidence/,
  });
  const gradeEvidence = page.getByRole("button", {
    name: /Patient-specific grade evidence/,
  });
  await expect(stageEvidence).toHaveAttribute("aria-expanded", "false");
  await expect(gradeEvidence).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.locator("#adult-hygiene-stage-interdental-cal")
  ).toHaveCount(0);
  await expect(
    page.locator("#adult-hygiene-grade-bone-loss-age-ratio")
  ).toHaveCount(0);
  await stageEvidence.click();
  await gradeEvidence.click();
  await expect(
    page.locator("#adult-hygiene-stage-interdental-cal")
  ).toBeVisible();
  await expect(
    page.locator("#adult-hygiene-grade-bone-loss-age-ratio")
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Severity evidence", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Complexity evidence", exact: true })
  ).toBeVisible();
  await page.locator("#adult-hygiene-periodontium").click();
  await page
    .getByRole("option", { name: "Intact periodontal support", exact: true })
    .click();
  await page.locator("#adult-hygiene-bop-percent").fill("6");
  await page.locator("#adult-hygiene-maximum-ppd").fill("3");
  await expect(page.locator("#adult-hygiene-stage-maximum-ppd")).toHaveValue(
    "3"
  );
  await page.locator("#adult-hygiene-stage-maximum-ppd").fill("2");
  await expect(page.locator("#adult-hygiene-maximum-ppd")).toHaveValue("2");
  await page.locator("#adult-hygiene-maximum-ppd").fill("3");
  await page.locator("#adult-hygiene-attachment-loss").click();
  await page.getByRole("option", { name: "Absent", exact: true }).click();
  await page.locator("#adult-hygiene-radiographic-bone-loss").click();
  await page.getByRole("option", { name: "Absent", exact: true }).click();
  await expect(structuredPeriodontalObservations).toContainText(
    "5 observations documented"
  );
  await expect(stageEvidence).toContainText("1 observation documented");
  await expect(gradeEvidence).toContainText("Not assessed");

  await expect(
    page.getByText("HEALTH - INTACT PERIODONTIUM", { exact: true })
  ).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Health\/Gingivitis:/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Periodontal assessment findings:\n  - Periodontal support: Intact periodontal support\.\n  - Bleeding on probing \(BOP\): 6%\.\n  - Maximum PPD: 3 mm\.\n  - Probing attachment loss: Absent\.\n  - Radiographic bone loss \(RBL\): Absent\./
  );

  await diagnosis.click();
  await page
    .getByRole("option", { name: "Periodontal health", exact: true })
    .click();

  await expect(
    page.getByText("HEALTH - INTACT PERIODONTIUM", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Recommended current condition",
      exact: true,
    })
  ).toBeVisible();
  const currentClinicalCondition = page.getByRole("region", {
    name: "Current clinical condition",
  });
  await expect(
    currentClinicalCondition.getByRole("heading", {
      name: "Current clinical condition",
      exact: true,
    })
  ).toBeVisible();
  await expect(
    currentClinicalCondition.getByLabel("Health/Gingivitis classification")
  ).toBeVisible();
  await expect(
    page.getByLabel("Confirm selected Health/Gingivitis classification")
  ).toHaveCount(0);
  await structuredPeriodontalObservations.click();
  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(page.locator("#adult-hygiene-periodontium")).toHaveCount(0);
  await expect(
    page.getByText("HEALTH - INTACT PERIODONTIUM", { exact: true })
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Health\/Gingivitis:/
  );

  await page
    .getByRole("button", { name: "Apply suggestion", exact: true })
    .click();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Health\/Gingivitis: HEALTH - INTACT PERIODONTIUM/
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /- (NO PROBING ATTACHMENT LOSS|MAXIMUM PPD:|BOP:|NO RADIOGRAPHIC BONE LOSS)/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Periodontal assessment findings:[\s\S]*Bleeding on probing \(BOP\): 6%\./
  );

  await structuredPeriodontalObservations.click();
  await page.locator("#adult-hygiene-bop-percent").fill("12");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Health\/Gingivitis: HEALTH - INTACT PERIODONTIUM/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Periodontal assessment findings:[\s\S]*Bleeding on probing \(BOP\): 12%\./
  );
});

test("Adult Hygiene missing candidate items navigate to and highlight findings", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const structuredPeriodontalObservations = page.getByRole("button", {
    name: /Structured periodontal observations/,
  });
  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", { name: "Periodontal health", exact: true })
    .click();

  await expect(
    page.getByText("More information is needed to calculate a suggestion:", {
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Periodontium", exact: true })
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Periodontal support", exact: true })
    .click();

  await expect(structuredPeriodontalObservations).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await expect(page.locator("#adult-hygiene-periodontium")).toBeFocused();
  await expect(
    page.locator('[data-candidate-field="periodontal-support"]')
  ).toHaveAttribute("data-candidate-highlighted", "true");
});

test("Adult Hygiene shows treated-periodontitis context only with treated support", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await expect(
    page.getByLabel("Current periodontal status", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Periodontal status comment", { exact: true })
  ).toHaveCount(0);

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", {
      name: "Periodontitis / history of periodontitis",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Recommended stage and grade",
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Recommended current condition",
      exact: true,
    })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Treated-periodontitis context", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Current periodontal status", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByLabel("Periodontal status comment", { exact: true })
  ).toBeVisible();
  const periodontitisClassificationHeading = page.locator(
    "#periodontal-stage-grade-heading"
  );
  const currentClinicalConditionHeading = page.locator(
    "#periodontal-current-condition-heading"
  );
  await expect(currentClinicalConditionHeading).toBeVisible();
  expect(
    await periodontitisClassificationHeading.evaluate(
      (classificationHeading, currentConditionHeadingId) => {
        const currentConditionHeading = document.getElementById(
          currentConditionHeadingId
        );
        return Boolean(
          currentConditionHeading &&
            (classificationHeading.compareDocumentPosition(
              currentConditionHeading
            ) &
              Node.DOCUMENT_POSITION_FOLLOWING)
        );
      },
      "periodontal-current-condition-heading"
    )
  ).toBe(true);
  const currentClinicalConditionSection = currentClinicalConditionHeading.locator(
    "xpath=ancestor::section[1]"
  );
  await expect(
    currentClinicalConditionSection.getByLabel("Current periodontal status", {
      exact: true,
    })
  ).toBeVisible();
  await expect(
    currentClinicalConditionSection.getByLabel("Periodontal status comment", {
      exact: true,
    })
  ).toBeVisible();

  await page
    .getByRole("button", { name: /Structured periodontal observations/ })
    .click();
  await page
    .getByRole("button", { name: /Patient-specific stage evidence/ })
    .click();
  await page.locator("#adult-hygiene-periodontium").click();
  await page
    .getByRole("option", {
      name: "Reduced support (with a history of treated periodontitis)",
      exact: true,
    })
    .click();
  await page.locator("#adult-hygiene-bop-percent").fill("5");
  await page.locator("#adult-hygiene-maximum-ppd").fill("4");
  await expect(page.locator("#adult-hygiene-stage-maximum-ppd")).toHaveValue(
    "4"
  );
  await page.locator("#adult-hygiene-attachment-loss").click();
  await page.getByRole("option", { name: "Present", exact: true }).click();
  await page.locator("#adult-hygiene-radiographic-bone-loss").click();
  await page.getByRole("option", { name: "Present", exact: true }).click();
  await page.locator("#adult-hygiene-stage-ppd4-bop").click();
  await page.getByRole("option", { name: "None", exact: true }).click();
  await expect(page.locator("#adult-hygiene-ppd4-bop")).toHaveAttribute(
    "data-value",
    "no"
  );
  await page.locator("#adult-hygiene-progressive-destruction").click();
  await page.getByRole("option", { name: "No", exact: true }).click();

  await expect(
    page.getByRole("heading", {
      name: "Recommended current condition",
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByLabel("Treated-periodontitis context", { exact: true })
  ).toBeVisible();
  await page.locator("#adult-hygiene-periodontal-status").click();
  await page
    .getByRole("option", {
      name: "Unstable/recurrent periodontitis",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Apply suggestion", exact: true })
    .click();
  await expect(
    page.locator("#adult-hygiene-periodontal-status")
  ).toHaveAttribute("data-value", "");
  await page.locator("#adult-hygiene-periodontal-status").click();
  await expect(
    page.getByRole("option", {
      name: "Unstable/recurrent periodontitis",
      exact: true,
    })
  ).toHaveCount(0);
  await page
    .getByRole("option", {
      name: "Periodontal disease stability",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Periodontal status comment")
    .fill("Stable on current maintenance interval");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Current periodontal condition: HEALTH - SUCCESSFULLY TREATED, STABLE PERIODONTITIS PATIENT[\s\S]*Periodontal status: Periodontal disease stability\.[\s\S]*Periodontal status comment: Stable on current maintenance interval\./
  );

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", { name: "Periodontal health", exact: true })
    .click();
  await expect(
    page.getByLabel("Current periodontal status", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Periodontal status comment", { exact: true })
  ).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Periodontal status:/
  );
  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", { name: "Gingivitis", exact: true })
    .click();
  await expect(
    page.getByLabel("Current periodontal status", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Periodontal status comment", { exact: true })
  ).toHaveCount(0);
  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", { name: "Other periodontal condition", exact: true })
    .click();
  await expect(
    page.getByLabel("Current periodontal status", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Periodontal status comment", { exact: true })
  ).toHaveCount(0);
  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", { name: "Not assessed", exact: true })
    .click();
  await expect(
    page.getByLabel("Current periodontal status", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Periodontal status comment", { exact: true })
  ).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Periodontal status:/
  );
  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", {
      name: "Periodontitis / history of periodontitis",
      exact: true,
    })
    .click();

  await page.locator("#adult-hygiene-periodontium").click();
  await page
    .getByRole("option", { name: "Intact periodontal support", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Recommended current condition",
      exact: true,
    })
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Treated-periodontitis context", { exact: true })
  ).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Health\/Gingivitis:/
  );
});

test("Adult Hygiene composes hygiene findings from grouped facets", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await page.locator("#adult-hygiene-plaque-choice").click();
  const plaqueOptions = page.getByRole("dialog", {
    name: "Plaque options",
    exact: true,
  });
  const plaqueFinding = plaqueOptions.getByRole("group", {
    name: "Finding Plaque choices",
    exact: true,
  });
  await plaqueFinding.getByText("None", { exact: true }).click();
  await expect(
    plaqueFinding.getByRole("checkbox", { name: "None", exact: true }),
  ).toBeChecked();
  await plaqueOptions
    .getByRole("group", { name: "Extent Plaque choices", exact: true })
    .getByText("Localized", { exact: true })
    .click();
  await expect(
    plaqueFinding.getByRole("checkbox", { name: "None", exact: true }),
  ).not.toBeChecked();
  await plaqueOptions
    .getByRole("group", { name: "Intensity Plaque choices", exact: true })
    .getByText("moderate", { exact: true })
    .click();
  const plaqueLocation = plaqueOptions.getByRole("group", {
    name: "Location Plaque choices",
    exact: true,
  });
  await plaqueLocation.getByText("marginal", { exact: true }).click();
  await plaqueLocation.getByText("interproximal", { exact: true }).click();
  await expect(
    plaqueLocation.getByRole("checkbox", {
      name: "marginal",
      exact: true,
    })
  ).toBeChecked();
  await expect(
    plaqueLocation.getByRole("checkbox", {
      name: "interproximal",
      exact: true,
    })
  ).toBeChecked();
  await plaqueOptions
    .getByRole("button", { name: "Done", exact: true })
    .click();

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
  const calculusFinding = calculusOptions.getByRole("group", {
    name: "Finding Calculus choices",
    exact: true,
  });
  await calculusFinding.getByText("None", { exact: true }).click();
  await expect(
    calculusFinding.getByRole("checkbox", { name: "None", exact: true }),
  ).toBeChecked();
  await calculusOptions
    .getByRole("group", { name: "Extent Calculus choices", exact: true })
    .getByText("Generalized", { exact: true })
    .click();
  await expect(
    calculusFinding.getByRole("checkbox", { name: "None", exact: true }),
  ).not.toBeChecked();
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
  const bleedingFinding = bleedingOptions.getByRole("group", {
    name: "Finding Bleeding choices",
    exact: true,
  });
  await bleedingFinding.getByText("None", { exact: true }).click();
  await expect(
    bleedingFinding.getByRole("checkbox", { name: "None", exact: true }),
  ).toBeChecked();
  await bleedingOptions
    .getByRole("group", { name: "Extent Bleeding choices", exact: true })
    .getByText("Generalized", { exact: true })
    .click();
  await expect(
    bleedingFinding.getByRole("checkbox", { name: "None", exact: true }),
  ).not.toBeChecked();
  await bleedingOptions
    .getByRole("group", { name: "Severity Bleeding choices", exact: true })
    .getByText("severe", { exact: true })
    .click();
  await bleedingOptions
    .getByRole("button", { name: "Done", exact: true })
    .click();

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Plaque: Localized moderate marginal\/interproximal\.[\s\S]*Stain: Localized slight\.[\s\S]*Calculus: Generalized moderate marginal\/interproximal\.[\s\S]*Bleeding: Generalized severe\./
  );
});

test("Adult Hygiene captures areas only for localized hygiene findings", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await page.locator("#adult-hygiene-plaque-choice").click();
  const plaqueOptions = page.getByRole("dialog", {
    name: "Plaque options",
    exact: true,
  });
  await plaqueOptions
    .getByRole("group", { name: "Extent Plaque choices", exact: true })
    .getByText("Localized", { exact: true })
    .click();
  await plaqueOptions
    .getByRole("group", { name: "Intensity Plaque choices", exact: true })
    .getByText("moderate", { exact: true })
    .click();
  await plaqueOptions.getByRole("button", { name: "Done", exact: true }).click();

  const plaqueAreas = page.getByRole("button", {
    name: "Plaque areas",
    exact: true,
  });
  await expect(plaqueAreas).toContainText("Select Plaque areas");
  await plaqueAreas.click();
  const areaOptions = page.getByRole("dialog", {
    name: "Plaque areas options",
    exact: true,
  });
  await areaOptions.getByText("Q1", { exact: true }).click();
  await areaOptions
    .getByRole("textbox", { name: "Search or add custom Plaque areas" })
    .fill("teeth 14–16");
  await areaOptions
    .getByRole("button", {
      name: "Add “teeth 14–16” to this note",
      exact: true,
    })
    .click();
  await areaOptions.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Plaque: Localized moderate — areas: Q1, teeth 14–16\./,
  );

  await page.locator("#adult-hygiene-plaque-choice").click();
  await plaqueOptions
    .getByRole("group", { name: "Extent Plaque choices", exact: true })
    .getByText("Generalized", { exact: true })
    .click();
  await plaqueOptions.getByRole("button", { name: "Done", exact: true }).click();
  await expect(plaqueAreas).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Plaque: Generalized moderate\./,
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /areas:/,
  );
});

test("Adult Hygiene applies the reviewed gingivitis observation preset", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  await page
    .getByRole("button", { name: /Structured gingival observations/ })
    .click();
  await page
    .getByRole("button", {
      name: "Apply gingivitis observations",
      exact: true,
    })
    .click();

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Color: marginal redness \(extent: generalized\)\.[\s\S]*Contour \/ Shape: rolled margins \(extent: generalized\)\.[\s\S]*Consistency: spongy \(extent: generalized\)\.[\s\S]*Surface \/ Texture: smooth attached gingiva \(extent: generalized\)\./,
  );
});

test("Adult Hygiene applies standard OHE and treatment presets without local anesthesia", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const ohiAids = page.locator("#adult-hygiene-ohi-aids");
  await ohiAids.focus();
  await expect(
    page.getByRole("option", {
      name: "BASS-BRUSHING TECHNIQUE Starter",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const oralHygieneSection = page
    .getByRole("heading", { name: "Oral Hygiene and Education", exact: true })
    .locator("xpath=ancestor::section[1]");
  await oralHygieneSection
    .getByRole("button", { name: "Apply standard OHE", exact: true })
    .click();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient's diagnoses and risk factors were explained to them\.[\s\S]*Reviewed benefits of Prevident 5000 or Opti-Rinse 0\.05%/,
  );

  await page
    .getByRole("button", { name: "Apply standard treatment", exact: true })
    .click();
  const completedRows = page
    .getByRole("list", { name: "Treatment completed today entries" })
    .locator(":scope > li");
  await expect(completedRows).toHaveCount(5);
  await page
    .getByRole("button", { name: "Apply standard treatment", exact: true })
    .click();
  await expect(completedRows).toHaveCount(5);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Treatment completed today: FMP — full mouth; Full mouth scaling with hand and Cavitron instrumentation \(3U Scale\); Selective polish with Enamel Pro® Prophy Paste with Fluoride \(Strawberry\) \(1U Polish\); OHE on proper home care \(Bass brushing; C-shape flossing technique; benefits of fluoride\); Oral Science Inc\. FluoriMax 2\.5% NaF Varnish application — full mouth/,
  );
});

test("Adult Hygiene preserves overlapping legacy OHE until explicit cleanup", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const education = page.getByRole("group", {
    name: "Education provided today",
    exact: true,
  });
  await education
    .getByRole("checkbox", {
      name: "Disease process reviewed with patient today",
      exact: true,
    })
    .check();
  await education
    .getByRole("button", {
      name: "Additional OHE topics reviewed",
      exact: true,
    })
    .click();
  const topics = page.getByRole("dialog", {
    name: "Additional OHE topics reviewed options",
    exact: true,
  });
  await topics.getByText("Bass brushing", { exact: true }).click();
  await topics
    .getByText("Sulcabrush and interdental brush technique", { exact: true })
    .click();
  await topics.getByRole("button", { name: "Done", exact: true }).click();

  await education
    .getByRole("button", { name: "Apply standard OHE", exact: true })
    .click();
  await expect(
    education.getByText("Included in Standard OHE", { exact: true }),
  ).toBeVisible();
  const compatibilityAlert = education.getByRole("alert");
  await expect(compatibilityAlert).toContainText(
    "preserved for compatibility",
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /REVIEWED DISEASE PROCESS WITH PATIENT TODAY[\s\S]*Patient's diagnoses and risk factors were explained to them\.[\s\S]*OHE: Bass brushing; Sulcabrush and interdental brush technique\./,
  );

  page.once("dialog", (dialog) => dialog.accept());
  await compatibilityAlert
    .getByRole("button", { name: "Remove covered selections", exact: true })
    .click();
  await expect(compatibilityAlert).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /REVIEWED DISEASE PROCESS|Bass brushing/,
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient's diagnoses and risk factors were explained to them\.[\s\S]*OHE: Sulcabrush and interdental brush technique\./,
  );

  await education
    .getByRole("button", {
      name: "Additional OHE topics reviewed",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("dialog", {
        name: "Additional OHE topics reviewed options",
        exact: true,
      })
      .getByText("Bass brushing", { exact: true }),
  ).toHaveCount(0);
});

test("Adult Hygiene catalogue values and encounter recovery draft persist independently", async ({
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
    .getByRole("button", { name: "Add completed care", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Advantage Arrest® Silver Diamine Fluoride 38% application",
      exact: true,
    })
    .click();
  const completedValues = page.getByRole("list", {
    name: "Treatment completed today entries",
  });
  const completedRow = completedValues.locator(":scope > li").first();
  await expect(
    completedRow.getByRole("heading", {
      name: "Product applications",
      exact: true,
    }),
  ).toBeVisible();

  await completedRow.getByText("None selected", { exact: true }).click();
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
      name: "Tooth/area",
      exact: true,
    })
  ).toContainText("Q2, Q3, teeth 14–16");
  await expect(
    completedRow.getByRole("list", {
      name: "Tooth/area selected values",
      exact: true,
    })
  ).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Treatment completed today: Advantage Arrest® Silver Diamine Fluoride 38% application — Q2, Q3, teeth 14–16/
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
  await expect(medicalHistory).toHaveValue(
    "Synthetic reusable history phrase",
  );
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
    page.getByText("Synthetic reusable OHI aid", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("list", {
      name: "OH aids reviewed/recommended selected values",
    })
    .getByRole("button", {
      name: "Remove Synthetic reusable OHI aid",
    })
    .click();
  await ohiAids.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable OHI aid Local/,
    })
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Synthetic reusable/
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
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

test("Adult Hygiene charts selected periodontal classifications with optional override reasons", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const structuredPeriodontalObservations = page.getByRole("button", {
    name: /Structured periodontal observations/,
  });
  await expect(
    page.getByRole("heading", {
      name: "Recommended stage and grade",
      exact: true,
    })
  ).toHaveCount(0);
  await page.locator("#adult-hygiene-periodontal-extent").click();
  await page.getByRole("option", { name: "Generalized", exact: true }).click();
  await structuredPeriodontalObservations.click();
  await page
    .getByRole("button", { name: /Patient-specific stage evidence/ })
    .click();
  await page
    .getByRole("button", { name: /Patient-specific grade evidence/ })
    .click();
  await page.locator("#adult-hygiene-stage-interdental-cal").fill("5");
  await page.locator("#adult-hygiene-maximum-ppd").fill("6");
  await page.locator("#adult-hygiene-grade-bone-loss-age-ratio").fill("0.72");
  await expect(structuredPeriodontalObservations).toContainText(
    "3 observations documented"
  );
  await structuredPeriodontalObservations.click();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Periodontal diagnosis:|Stage III|Grade B/
  );

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", {
      name: "Periodontitis / history of periodontitis",
      exact: true,
    })
    .click();
  await expect(
    page.locator("#adult-hygiene-periodontal-extent")
  ).toHaveAttribute("data-value", "generalized");

  await expect(
    page.getByText("Stage III; Grade B.", { exact: false })
  ).toBeVisible();
  await page.getByText("Why this was suggested", { exact: true }).click();
  await expect(
    page.getByText(/Stage evidence: interdental CAL 5 mm; maximum PPD 6 mm\./)
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Stage III|Grade B/
  );

  await page.getByRole("button", { name: "Apply suggestions" }).click();
  await expect(
    page.locator("#adult-hygiene-periodontitis-stage")
  ).toHaveAttribute("data-value", "III");
  await expect(
    page.locator("#adult-hygiene-periodontitis-grade")
  ).toHaveAttribute("data-value", "B");
  await expect(page.getByLabel("Confirm selected stage")).toHaveCount(0);
  await expect(page.getByLabel("Confirm selected grade")).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient-specific stage evidence:[\s\S]*interdental CAL 5 mm\.[\s\S]*maximum PPD 6 mm\.[\s\S]*Patient-specific grade evidence:[\s\S]*bone-loss\/age ratio 0\.72\.[\s\S]*Periodontal diagnosis: GENERALIZED PERIODONTITIS, Stage III, Grade B\./
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /^(Stage basis|Grade basis|Grade modifiers):/m
  );

  await page.locator("#adult-hygiene-periodontitis-stage").click();
  await page
    .getByRole("option", { name: "Stage IV (P4)", exact: true })
    .click();
  await expect(page.getByLabel("Stage override reason")).toBeVisible();
  const [stageBox, gradeBox, statusBox, overrideBox, statusCommentBox] =
    await Promise.all([
    page.locator("#adult-hygiene-periodontitis-stage").boundingBox(),
    page.locator("#adult-hygiene-periodontitis-grade").boundingBox(),
    page.locator("#adult-hygiene-periodontal-status").boundingBox(),
    page.getByLabel("Stage override reason").boundingBox(),
      page.getByLabel("Periodontal status comment").boundingBox(),
    ]);
  expect(stageBox).not.toBeNull();
  expect(gradeBox).not.toBeNull();
  expect(statusBox).not.toBeNull();
  expect(overrideBox).not.toBeNull();
  expect(statusCommentBox).not.toBeNull();
  expect(stageBox!.y).toBeLessThan(gradeBox!.y);
  expect(gradeBox!.y).toBeLessThan(statusBox!.y);
  expect(overrideBox!.x).toBeGreaterThan(stageBox!.x);
  expect(Math.abs(overrideBox!.y - stageBox!.y)).toBeLessThan(2);
  expect(Math.abs(stageBox!.width - gradeBox!.width)).toBeLessThan(2);
  expect(Math.abs(gradeBox!.width - statusBox!.width)).toBeLessThan(2);
  expect(statusCommentBox!.x).toBeGreaterThan(statusBox!.x);
  expect(Math.abs(statusCommentBox!.y - statusBox!.y)).toBeLessThan(2);
  expect(Math.abs(statusCommentBox!.width - statusBox!.width)).toBeLessThan(2);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Stage IV/
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Stage override:/
  );
  await page
    .getByLabel("Stage override reason")
    .fill("Clinician-confirmed Stage IV complexity");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Stage IV[\s\S]*Stage override: Clinician-confirmed Stage IV complexity\./
  );
  await page.getByLabel("Stage override reason").fill("");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Stage IV/
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Stage override:/
  );
});

test("Adult Hygiene copies a manual grade selection without requiring an override reason", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(adultHygieneUrl);
  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  await page.locator("#adult-hygiene-periodontitis-grade").click();
  await page
    .getByRole("option", { name: "Grade C: rapid rate", exact: true })
    .click();
  const gradeOverrideReason = page.getByLabel("Grade override reason");
  await expect(gradeOverrideReason).toBeVisible();

  await openGeneratedNote(page);
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.toMatch(/Grade C/);
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.not.toMatch(/Grade override:/);

  await gradeOverrideReason.fill("Clinician-selected Grade C");
  await openGeneratedNote(page);
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.toMatch(
    /Grade C[\s\S]*Grade override: Clinician-selected Grade C\./
  );
});

test("Adult Hygiene copies a manual Health/Gingivitis selection without requiring an override reason", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(adultHygieneUrl);
  await page.locator("#adult-hygiene-patient-id").fill("TEST-HG-OVERRIDE");
  await page.locator("#adult-hygiene-rdh").fill("Example RDH");

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", { name: "Periodontal health", exact: true })
    .click();
  await page.locator("#adult-hygiene-health-gingivitis-context").click();
  await page
    .getByRole("option", { name: "HEALTH - INTACT PERIODONTIUM", exact: true })
    .click();
  const overrideReason = page.getByLabel(
    "Health/Gingivitis classification override reason"
  );
  await expect(overrideReason).toBeVisible();

  await openGeneratedNote(page);
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.toContain(
    "Periodontal diagnosis: HEALTH - INTACT PERIODONTIUM"
  );
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.not.toContain("Health/Gingivitis override:");

  await overrideReason.fill("Clinician-selected health classification");
  await openGeneratedNote(page);
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => navigator.clipboard.readText())
  ).resolves.toMatch(
    /Periodontal diagnosis: HEALTH - INTACT PERIODONTIUM[\s\S]*Health\/Gingivitis override: Clinician-selected health classification\./
  );
});

test("Adult Hygiene accepts exact or categorical RBL stage evidence", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  await page
    .getByRole("button", { name: /Structured periodontal observations/ })
    .click();
  await page
    .getByRole("button", { name: /Patient-specific stage evidence/ })
    .click();

  const rblPercent = page.getByLabel("Radiographic bone loss (RBL) (%)", {
    exact: true,
  });
  const rblExtent = page.getByRole("button", {
    name: "Radiographic bone loss (RBL) extent",
    exact: true,
  });

  await expect(rblPercent).toHaveAttribute("min", "0");
  await expect(rblPercent).toHaveAttribute("max", "100");
  await expect(rblExtent).toContainText("Not assessed");
  await rblPercent.fill("20");

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", {
      name: "Periodontitis / history of periodontitis",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Stage II; Grade B/)).toBeVisible();

  await rblPercent.fill("");
  await rblExtent.click();
  await page
    .getByRole("option", { name: "Middle third or beyond", exact: true })
    .click();

  await expect(rblExtent).toContainText("Middle third or beyond");
  await expect(page.getByText(/Stage III; Grade B/)).toBeVisible();
  const classification = page
    .getByRole("heading", {
      name: "Periodontitis classification",
      exact: true,
    })
    .locator("xpath=ancestor::section[1]");
  await classification
    .getByText("Why this was suggested", { exact: true })
    .click();
  await expect(
    classification.getByText(
      /radiographic bone loss \(RBL\) extends to the middle third of the root or beyond/
    ),
  ).toBeVisible();
});

test("Adult Hygiene consolidates mutually exclusive complexity findings", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const structuredPeriodontalObservations = page.getByRole("button", {
    name: /Structured periodontal observations/,
  });
  await structuredPeriodontalObservations.click();
  await page
    .getByRole("button", { name: /Patient-specific stage evidence/ })
    .click();

  await expect(
    page.locator("#adult-hygiene-stage-furcation-class-ii")
  ).toHaveCount(0);
  await expect(
    page.locator("#adult-hygiene-stage-masticatory-dysfunction")
  ).toHaveCount(0);

  const boneLossPattern = page.getByRole("button", {
    name: "Bone-loss pattern",
    exact: true,
  });
  await expect(boneLossPattern).toContainText("Not assessed");
  await boneLossPattern.click();
  await page.getByRole("option", { name: "Vertical", exact: true }).click();
  await page
    .getByLabel("Vertical (angular) bone loss (mm)", { exact: true })
    .fill("3");
  await expect(structuredPeriodontalObservations).toContainText(
    "1 observation documented"
  );

  const furcation = page.getByRole("button", {
    name: "Highest furcation involvement",
    exact: true,
  });
  await furcation.click();
  await page.getByRole("option", { name: "Class II", exact: true }).click();
  await expect(structuredPeriodontalObservations).toContainText(
    "2 observations documented"
  );
  await furcation.click();
  await page.getByRole("option", { name: "Class III", exact: true }).click();
  await expect(structuredPeriodontalObservations).toContainText(
    "2 observations documented"
  );

  const ridgeDefect = page.getByRole("button", {
    name: "Worst ridge defect",
    exact: true,
  });
  await ridgeDefect.click();
  await page.getByRole("option", { name: "Moderate", exact: true }).click();
  await ridgeDefect.click();
  await page.getByRole("option", { name: "Severe", exact: true }).click();
  await expect(structuredPeriodontalObservations).toContainText(
    "3 observations documented"
  );

  const advancedComplexity = page.getByRole("button", {
    name: "Advanced functional complexity",
    exact: true,
  });
  await advancedComplexity.click();
  const complexityOptions = page.getByRole("dialog", {
    name: "Advanced functional complexity options",
  });
  await complexityOptions
    .getByText("Masticatory dysfunction", { exact: true })
    .click();
  await complexityOptions.getByText("Bite collapse", { exact: true }).click();
  await advancedComplexity.click();
  await expect(structuredPeriodontalObservations).toContainText(
    "5 observations documented"
  );

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", {
      name: "Periodontitis / history of periodontitis",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Stage IV; Grade B/)).toBeVisible();
  await page.getByText("Why this was suggested", { exact: true }).click();
  await expect(
    page.getByText(
      /severe ridge defects; masticatory dysfunction; bite collapse/
    )
  ).toBeVisible();
});

test("Adult Hygiene keeps grade phenotype evidence mutually exclusive", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const structuredPeriodontalObservations = page.getByRole("button", {
    name: /Structured periodontal observations/,
  });
  await structuredPeriodontalObservations.click();
  await page
    .getByRole("button", { name: /Patient-specific grade evidence/ })
    .click();

  const phenotype = page.getByRole("button", {
    name: "Destruction relative to biofilm",
    exact: true,
  });
  await expect(phenotype).toContainText("Not assessed");
  await expect(
    page.getByRole("checkbox", {
      name: "Destruction low relative to biofilm",
      exact: true,
    })
  ).toHaveCount(0);

  await phenotype.click();
  await page
    .getByRole("option", {
      name: "Destruction low relative to biofilm",
      exact: true,
    })
    .click();
  await expect(structuredPeriodontalObservations).toContainText(
    "1 observation documented"
  );

  await page.locator("#adult-hygiene-periodontal-diagnosis").click();
  await page
    .getByRole("option", {
      name: "Periodontitis / history of periodontitis",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Stage not available; Grade A/)).toBeVisible();

  await phenotype.click();
  await page
    .getByRole("option", {
      name: "Destruction exceeds expectations given biofilm",
      exact: true,
    })
    .click();
  await expect(phenotype).toContainText(
    "Destruction exceeds expectations given biofilm"
  );
  await expect(structuredPeriodontalObservations).toContainText(
    "1 observation documented"
  );
  await expect(page.getByText(/Stage not available; Grade C/)).toBeVisible();
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
    .getByLabel("Recommended recare interval comments", { exact: true })
    .fill("Synthetic recall context");
  await page
    .getByLabel("Recommended recare interval", { exact: true })
    .fill("6-month recall");
  await page
    .getByLabel("Recommended hygiene interval comments", { exact: true })
    .fill("Synthetic hygiene context");
  await page
    .getByLabel("Recommended hygiene interval", { exact: true })
    .fill("4-month scale");

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Oral hygiene compliance: Good\.[\s\S]*Oral hygiene compliance comment: Synthetic compliance context\.[\s\S]*Recommended Recare Interval: 6-month recall\.[\s\S]*Recommended recare interval comments: Synthetic recall context\.[\s\S]*Recommended Hygiene Interval: 4-month scale\.[\s\S]*Recommended hygiene interval comments: Synthetic hygiene context\./
  );
});
