import { expect, test } from "@playwright/test";
import { CATALOGUE_STORAGE_KEY } from "@/lib/catalogues/catalogue";

const adultHygieneUrl =
  "/templates/clinic/adult-hygiene-2021/interactive";
const recareExamUrl = "/templates/clinic/recare-exam/interactive";

test("clinic interactive list controls use one closed-state affordance without changing static-field persistence", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const fixedListboxes = page.locator(
    'button[data-list-control="fixed-listbox"]',
  );
  expect(await fixedListboxes.count()).toBeGreaterThan(0);
  await expect(
    page.locator('select[data-list-control="fixed-select"]'),
  ).toHaveCount(0);
  for (const trigger of await fixedListboxes.all()) {
    await expect(trigger.locator("[data-dropdown-affordance]")).toHaveCount(1);
  }

  const editableComboboxes = page.locator(
    'input[data-list-control="editable-combobox"]',
  );
  expect(await editableComboboxes.count()).toBeGreaterThan(0);
  for (const input of await editableComboboxes.all()) {
    const control = input.locator(
      "xpath=ancestor::*[@data-editable-combobox][1]",
    );
    await expect(control.locator("[data-dropdown-trigger]")).toHaveCount(1);
    await expect(control.locator("[data-dropdown-affordance]")).toHaveCount(1);
  }

  await expect(
    page
      .locator("#adult-hygiene-patient-id")
      .locator("xpath=..")
      .locator("[data-dropdown-affordance]"),
  ).toHaveCount(0);

  await page.locator("#adult-hygiene-rdh").fill("Unsaved example RDH");
  const patientConsent = page.getByLabel("Patient", { exact: true });
  await patientConsent.check();
  await expect(patientConsent).toBeChecked();

  expect(
    await page.evaluate(
      (storageKey) => localStorage.getItem(storageKey),
      CATALOGUE_STORAGE_KEY,
    ),
  ).toBeNull();

  const chiefConcern = page.getByRole("combobox", {
    name: "Patient chief concern",
  });
  await chiefConcern.focus();
  await chiefConcern.press("ArrowDown");
  await chiefConcern.press("Enter");
  const selectedChiefConcerns = page.getByRole("list", {
    name: "Patient chief concern selected values",
  });
  await expect(selectedChiefConcerns).toContainText("Nothing");

  await chiefConcern.fill("Custom concern");
  await expect(page.locator("[data-empty-suggestions]")).toContainText(
    "No matching catalogue suggestions",
  );
  await chiefConcern.press("Enter");
  await expect(selectedChiefConcerns).not.toContainText("Nothing");
  await expect(selectedChiefConcerns).toContainText("Custom concern");

  await chiefConcern.focus();
  await chiefConcern.press("ArrowDown");
  await chiefConcern.press("Enter");
  await expect(selectedChiefConcerns).toContainText("Nothing");
  await expect(selectedChiefConcerns).not.toContainText("Custom concern");

  await chiefConcern.fill("Custom concern");
  await chiefConcern.press("Enter");
  await expect(selectedChiefConcerns).not.toContainText("Nothing");
  await expect(selectedChiefConcerns).toContainText("Custom concern");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Patient Chief Concern: Custom concern\./,
  );
  expect(
    await page.evaluate(
      (storageKey) => localStorage.getItem(storageKey),
      CATALOGUE_STORAGE_KEY,
    ),
  ).toBeNull();
});

test("Recare and Adult Hygiene share the chief concern catalogue and Nothing rule", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const recareChiefConcern = page.getByRole("combobox", {
    name: "Patient's chief concern",
  });
  await recareChiefConcern.focus();
  await page
    .getByRole("option", {
      name: /Food catches between teeth Starter/,
    })
    .click();

  const selectedRecareConcerns = page.getByRole("list", {
    name: "Patient's chief concern selected values",
  });
  await expect(selectedRecareConcerns).toContainText(
    "Food catches between teeth",
  );

  await recareChiefConcern.focus();
  await page
    .getByRole("option", {
      name: /Nothing Starter/,
    })
    .click();
  await expect(selectedRecareConcerns).toContainText("Nothing");
  await expect(selectedRecareConcerns).not.toContainText(
    "Food catches between teeth",
  );

  await recareChiefConcern.fill("Shared custom concern");
  await page.getByRole("button", { name: "Remember and add" }).click();
  await expect(selectedRecareConcerns).not.toContainText("Nothing");
  await expect(selectedRecareConcerns).toContainText("Shared custom concern");

  const adultPage = await page.context().newPage();
  await adultPage.goto(adultHygieneUrl);
  const adultChiefConcern = adultPage.getByRole("combobox", {
    name: "Patient chief concern",
  });
  await adultChiefConcern.focus();
  await expect(
    adultPage.getByRole("option", {
      name: /Shared custom concern Local/,
    }),
  ).toBeVisible();
  await adultPage.close();
});

test("custom list controls support pointer, keyboard, selected, and closing states", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const rightMolar = page.getByRole("combobox", {
    name: "Right molar occlusion",
  });
  const control = rightMolar.locator(
    "xpath=ancestor::*[@data-editable-combobox][1]",
  );
  const trigger = control.getByRole("button", {
    name: "Show Right molar occlusion suggestions",
  });

  await trigger.click();
  await expect(rightMolar).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("option", { name: /Cl I Starter/ }).click();
  await expect(rightMolar).toHaveValue("Cl I");

  await control
    .getByRole("button", {
      name: "Show Right molar occlusion suggestions",
    })
    .click();
  await expect(control.locator("[data-selected-indicator]")).toHaveCount(1);

  await page
    .getByRole("heading", { name: "Clinical Exam", exact: true })
    .click();
  await expect(rightMolar).toHaveAttribute("aria-expanded", "false");

  await rightMolar.focus();
  await rightMolar.press("Escape");
  await expect(rightMolar).toHaveAttribute("aria-expanded", "false");

  const premedication = page.getByRole("button", {
    name: "Premedication",
  });
  await premedication.focus();
  await premedication.press("ArrowDown");
  const premedicationOptions = page.getByRole("listbox", {
    name: "Premedication options",
  });
  await expect(premedicationOptions).toBeFocused();
  await premedicationOptions.press("End");
  await premedicationOptions.press("Enter");
  await expect(premedication).toHaveAttribute("data-value", "required");
  await expect(premedication).toContainText("Required");
  await expect(premedication).toBeFocused();

  await premedication.click();
  await expect(
    page.getByRole("option", { name: "Required Selected", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("heading", { name: "Visit Team", exact: true })
    .click();
  await expect(premedication).toHaveAttribute("aria-expanded", "false");
});

test("fixed-choice keyboard navigation keeps the active option visible", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const plaque = page.getByRole("button", { name: "Plaque" });
  await plaque.focus();
  await plaque.press("ArrowDown");

  const options = page.getByRole("listbox", { name: "Plaque options" });
  await options.press("End");

  const activeOptionId = await options.getAttribute("aria-activedescendant");
  expect(activeOptionId).not.toBeNull();
  const activeOption = page.locator(`[id=${JSON.stringify(activeOptionId)}]`);
  await expect(activeOption).toBeInViewport();

  const optionBox = await activeOption.boundingBox();
  const listboxBox = await options.boundingBox();
  expect(optionBox).not.toBeNull();
  expect(listboxBox).not.toBeNull();
  expect(optionBox?.y ?? 0).toBeGreaterThanOrEqual(listboxBox?.y ?? 0);
  expect((optionBox?.y ?? 0) + (optionBox?.height ?? 0)).toBeLessThanOrEqual(
    (listboxBox?.y ?? 0) + (listboxBox?.height ?? 0) + 1,
  );
});

test("editable suggestion menus remain aligned and usable at a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(adultHygieneUrl);

  const medicalHistory = page.getByRole("combobox", {
    name: "Medical history reviewed",
  });
  const control = medicalHistory.locator(
    "xpath=ancestor::*[@data-editable-combobox][1]",
  );
  await control
    .getByRole("button", {
      name: "Show Medical history reviewed suggestions",
    })
    .click();

  const menu = page.getByRole("listbox", {
    name: "Medical history reviewed suggestions",
  });
  await expect(menu).toBeVisible();

  const inputBox = await medicalHistory.boundingBox();
  const menuBox = await menu.boundingBox();
  const triggerBox = await control.locator("[data-dropdown-trigger]").boundingBox();
  expect(inputBox).not.toBeNull();
  expect(menuBox).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  expect(Math.abs((inputBox?.width ?? 0) - (menuBox?.width ?? 0))).toBeLessThan(
    2,
  );
  expect(menuBox?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((menuBox?.x ?? 0) + (menuBox?.width ?? 0)).toBeLessThanOrEqual(375);
  expect((triggerBox?.x ?? 0) + (triggerBox?.width ?? 0)).toBeLessThanOrEqual(
    (inputBox?.x ?? 0) + (inputBox?.width ?? 0) + 1,
  );
});

test("paired recare controls stay aligned when a catalogue opens at tablet width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(recareExamUrl);

  const rightMolar = page.getByRole("combobox", {
    name: "Right molar occlusion",
  });
  const leftMolar = page.getByRole("combobox", {
    name: "Left molar occlusion",
  });
  await rightMolar
    .locator("xpath=ancestor::*[@data-editable-combobox][1]")
    .getByRole("button", {
      name: "Show Right molar occlusion suggestions",
    })
    .click();

  const rightBox = await rightMolar.boundingBox();
  const leftBox = await leftMolar.boundingBox();
  const rightNotApplicableBox = await page
    .locator("#recare-right-molar-na")
    .locator("xpath=..")
    .boundingBox();
  expect(rightBox).not.toBeNull();
  expect(leftBox).not.toBeNull();
  expect(rightNotApplicableBox).not.toBeNull();
  expect(Math.abs((rightBox?.y ?? 0) - (leftBox?.y ?? 0))).toBeLessThan(2);
  expect(
    Math.abs((rightBox?.y ?? 0) - (rightNotApplicableBox?.y ?? 0)),
  ).toBeLessThan(6);
});

test("editable combobox options remain tappable in a touch-oriented context", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(adultHygieneUrl);

  const chiefConcern = page.getByRole("combobox", {
    name: "Patient chief concern",
  });
  const control = chiefConcern.locator(
    "xpath=ancestor::*[@data-editable-combobox][1]",
  );
  await control
    .getByRole("button", {
      name: "Show Patient chief concern suggestions",
    })
    .tap();
  await page
    .getByRole("option", {
      name: /Sensitivity to hot and cold Starter/,
    })
    .tap();
  await expect(
    page.getByRole("list", {
      name: "Patient chief concern selected values",
    }),
  ).toContainText("Sensitivity to hot and cold");

  const nightGuard = page.getByRole("button", {
    name: "Has a night guard",
  });
  await nightGuard.tap();
  await page
    .getByRole("option", {
      name: "Yes",
      exact: true,
    })
    .tap();
  await expect(nightGuard).toHaveAttribute("data-value", "yes");

  await context.close();
});
