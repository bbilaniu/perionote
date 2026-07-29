import { expect, test, type Locator, type Page } from "@playwright/test";

const recareExamUrl = "/templates/clinic/recare-exam/interactive";

function multiControl(page: Page, label: string): Locator {
  return page
    .getByRole("combobox", { name: label, exact: true })
    .locator("xpath=ancestor::*[@data-editable-combobox][1]");
}

test("Recare Exam radiographs use the reviewed catalogue and ordered note values", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const radiographs = page.getByRole("combobox", {
    name: "Radiographs",
    exact: true,
  });
  await radiographs.focus();
  for (const label of [
    "PAN",
    "1 BW",
    "2 BW",
    "3 BW",
    "4 BW",
    "5 BW",
    "6 BW",
    "1 PA",
    "2 PA",
  ]) {
    await expect(
      page.getByRole("option", {
        name: `${label} Starter`,
        exact: true,
      }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", {
      name: "Hide 2 PA from suggestions",
      exact: true,
    })
    .click();
  await expect(radiographs).toBeFocused();
  await expect(radiographs).toHaveValue("");
  await expect(
    page.getByRole("option", { name: "2 PA Starter", exact: true }),
  ).toHaveCount(0);

  await page.getByRole("option", { name: "4 BW Starter", exact: true }).click();
  await multiControl(page, "Radiographs")
    .getByRole("button", { name: "Show Radiographs suggestions" })
    .click();
  await expect(
    page.getByRole("option", { name: "4 BW Starter", exact: true }),
  ).toBeVisible();
  await page.getByRole("option", { name: "4 BW Starter", exact: true }).click();
  await radiographs.fill("Synthetic supplemental view");
  await multiControl(page, "Radiographs")
    .getByRole("button", { name: "Remember and add" })
    .click();
  await page
    .getByRole("button", {
      name: "Move Synthetic supplemental view earlier",
    })
    .click();
  await page
    .getByRole("button", {
      name: "Move Synthetic supplemental view earlier",
    })
    .click();

  await expect(page.locator("#recare-summary")).toHaveValue(
    /Radiographs: Synthetic supplemental view; 4 BW; 4 BW/,
  );
  const selectedRadiographs = page.getByRole("list", {
    name: "Radiographs selected values",
  });
  await expect(selectedRadiographs.locator(":scope > li")).toHaveCount(3);
  const selectedRadiographRow = selectedRadiographs
    .locator(":scope > li")
    .first();
  await expect(
    selectedRadiographRow.getByRole("button", {
      name: "Move Synthetic supplemental view earlier",
    }),
  ).toHaveClass(/py-2/);
  const removeSelectedRadiograph = selectedRadiographRow.getByRole("button", {
    name: "Remove Synthetic supplemental view",
  });
  await expect(removeSelectedRadiograph).toHaveClass(/border-red-300/);
  await removeSelectedRadiograph.focus();
  await expect(
    selectedRadiographRow.getByRole("tooltip").filter({
      hasText: "Remove this value from the note.",
    }),
  ).toBeVisible();
  await selectedRadiographs
    .getByRole("button", { name: "Remove 4 BW" })
    .first()
    .click();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Radiographs: Synthetic supplemental view; 4 BW/,
  );
});

test("Recare Exam documents CPAP ownership and conditional use", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const hasCpap = page.getByRole("button", {
    name: "Has a CPAP?",
    exact: true,
  });
  await expect(
    page.getByRole("button", { name: "Uses the CPAP?", exact: true }),
  ).toHaveCount(0);

  await hasCpap.click();
  await page.getByRole("option", { name: "Yes", exact: true }).click();
  const usesCpap = page.getByRole("button", {
    name: "Uses the CPAP?",
    exact: true,
  });
  await usesCpap.click();
  await page.getByRole("option", { name: "No", exact: true }).click();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /CPAP: Yes; does not use\./,
  );

  await hasCpap.click();
  await page.getByRole("option", { name: "No", exact: true }).click();
  await expect(usesCpap).toHaveCount(0);
  await expect(page.locator("#recare-summary")).toHaveValue(/CPAP: No\./);
});

test("Recare Exam places the Intraoral status inside structured observations", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const structuredIntraoral = page.getByRole("group", {
    name: "Structured intraoral observations",
    exact: true,
  });
  const intraoralStatus = structuredIntraoral.getByRole("button", {
    name: "Intraoral",
    exact: true,
  });

  await expect(intraoralStatus).toBeVisible();
  await expect(
    structuredIntraoral.getByRole("textbox", {
      name: "Intraoral findings",
      exact: true,
    }),
  ).toHaveCount(0);

  await intraoralStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();
  await expect(
    structuredIntraoral.getByRole("textbox", {
      name: "Intraoral findings",
      exact: true,
    }),
  ).toBeVisible();
});

test("Recare Exam treatment rows allow duplicate types, note-only areas, inline edits, and independent plan copies", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const optionList = page.getByRole("list", {
    name: "Treatment Options entries",
  });
  const optionRows = optionList.locator(":scope > li");
  const addOption = page.getByRole("button", {
    name: "Add Treatment Option",
    exact: true,
  });
  await expect(addOption).toHaveClass(/rounded-xl/);
  await expect(addOption).toHaveClass(/py-2/);
  await expect(addOption).toHaveClass(/text-sm/);

  await addOption.click();
  const firstOptionType = optionRows
    .nth(0)
    .getByRole("combobox", { name: "Treatment type", exact: true });
  await firstOptionType.focus();
  await expect(
    page.getByRole("option", {
      name: "Hygiene maintenance Starter",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("option", {
      name: "Hygiene maintenance Starter",
      exact: true,
    })
    .click();

  await addOption.click();
  const secondOption = optionRows.nth(1);
  await secondOption
    .getByRole("combobox", { name: "Treatment type", exact: true })
    .fill("Fillings");
  await secondOption
    .getByRole("textbox", { name: "Tooth/area", exact: true })
    .fill("teeth 14, 15");
  await expect(
    secondOption.getByText("Not saved. This value stays in this note.", {
      exact: true,
    }),
  ).toBeVisible();

  const [typeBox, areaBox, controlsBox, optionListBox, addOptionBox] =
    await Promise.all([
      secondOption
        .getByRole("combobox", { name: "Treatment type", exact: true })
        .boundingBox(),
      secondOption
        .getByRole("textbox", { name: "Tooth/area", exact: true })
        .boundingBox(),
      secondOption
        .getByRole("button", {
          name: "Move Treatment Options item 2 earlier",
          exact: true,
        })
        .boundingBox(),
      optionList.boundingBox(),
      addOption.boundingBox(),
    ]);
  expect(typeBox).not.toBeNull();
  expect(areaBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();
  expect(optionListBox).not.toBeNull();
  expect(addOptionBox).not.toBeNull();
  expect(Math.abs((typeBox?.y ?? 0) - (areaBox?.y ?? 0))).toBeLessThan(3);
  expect(Math.abs((typeBox?.y ?? 0) - (controlsBox?.y ?? 0))).toBeLessThan(8);
  expect(addOptionBox?.y ?? 0).toBeGreaterThanOrEqual(
    (optionListBox?.y ?? 0) + (optionListBox?.height ?? 0),
  );
  const earlierButton = secondOption.getByRole("button", {
    name: "Move Treatment Options item 2 earlier",
    exact: true,
  });
  const removeButton = secondOption.getByRole("button", {
    name: "Remove Treatment Options item 2",
    exact: true,
  });
  await expect(earlierButton).toHaveClass(/rounded-xl/);
  await expect(earlierButton).toHaveClass(/py-2/);
  await expect(earlierButton).toHaveClass(/text-sm/);
  await expect(removeButton).toHaveClass(/border-red-300/);
  await expect(removeButton).toHaveClass(/text-red-800/);
  await earlierButton.hover();
  await expect(
    secondOption.getByRole("tooltip").filter({
      hasText: "Move this treatment line earlier in the note.",
    }),
  ).toBeVisible();
  await removeButton.focus();
  await expect(
    secondOption.getByRole("tooltip").filter({
      hasText: "Remove this treatment line from the note.",
    }),
  ).toBeVisible();

  const rememberTreatmentType = secondOption.getByRole("button", {
    name: "Remember treatment type",
    exact: true,
  });
  await expect(rememberTreatmentType).toHaveClass(/rounded-xl/);
  await expect(rememberTreatmentType).toHaveClass(/py-2/);
  await expect(rememberTreatmentType).toHaveClass(/text-sm/);
  await rememberTreatmentType.click();
  const savedCatalogueData = await page.evaluate(() =>
    Object.values(window.localStorage).join("\n"),
  );
  expect(savedCatalogueData).toContain("Fillings");
  expect(savedCatalogueData).not.toContain("teeth 14, 15");

  await addOption.click();
  const thirdOption = optionRows.nth(2);
  const thirdOptionType = thirdOption.getByRole("combobox", {
    name: "Treatment type",
    exact: true,
  });
  await thirdOptionType.focus();
  await expect(
    page.getByRole("option", { name: "Fillings Local", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option", { name: /14, 15/ })).toHaveCount(0);
  await page
    .getByRole("option", { name: "Fillings Local", exact: true })
    .click();
  await thirdOption
    .getByRole("textbox", { name: "Tooth/area", exact: true })
    .fill("tooth 36");
  await thirdOption
    .getByRole("button", {
      name: "Move Treatment Options item 3 earlier",
      exact: true,
    })
    .click();

  const copyButton = page.getByRole("button", {
    name: "Copy Treatment Options to Treatment Plan",
    exact: true,
  });
  await expect(copyButton).toBeEnabled();
  await copyButton.click();
  await expect(copyButton).toHaveCount(0);

  const planList = page.getByRole("list", {
    name: "Treatment Plan entries",
  });
  const planRows = planList.locator(":scope > li");
  await expect(planRows).toHaveCount(3);
  const addPlanItem = page.getByRole("button", {
    name: "Add Treatment Plan Item",
    exact: true,
  });
  await expect(addPlanItem).toHaveClass(/rounded-xl/);
  await expect(addPlanItem).toHaveClass(/py-2/);
  await expect(addPlanItem).toHaveClass(/text-sm/);
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Treatment Options:\n  1\. Hygiene maintenance\n  2\. Fillings — tooth 36\n  3\. Fillings — teeth 14, 15\n\nTreatment Plan:\n  1\. Hygiene maintenance\n  2\. Fillings — tooth 36\n  3\. Fillings — teeth 14, 15/,
  );
  const listTreatmentOptions = page.getByLabel(
    "List each treatment option on a separate line in the note",
  );
  const listTreatmentPlan = page.getByLabel(
    "List each treatment plan item on a separate line in the note",
  );
  await expect(listTreatmentOptions).toBeChecked();
  await expect(listTreatmentPlan).toBeChecked();
  await listTreatmentOptions.uncheck();
  await listTreatmentPlan.uncheck();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Treatment Options: Hygiene maintenance; Fillings — tooth 36; Fillings — teeth 14, 15\n\nTreatment Plan: Hygiene maintenance; Fillings — tooth 36; Fillings — teeth 14, 15/,
  );
  await listTreatmentOptions.check();
  await listTreatmentPlan.check();

  await optionRows
    .nth(1)
    .getByRole("combobox", { name: "Treatment type", exact: true })
    .fill("Composite fillings");
  await expect(
    planRows
      .nth(1)
      .getByRole("combobox", { name: "Treatment type", exact: true }),
  ).toHaveValue("Fillings");

  await planRows
    .nth(1)
    .getByRole("button", {
      name: "Remove Treatment Plan item 2",
      exact: true,
    })
    .click();
  await expect(
    optionRows
      .nth(1)
      .getByRole("combobox", { name: "Treatment type", exact: true }),
  ).toHaveValue("Composite fillings");
  await expect(planRows).toHaveCount(2);
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Treatment Options:\n  1\. Hygiene maintenance\n  2\. Composite fillings — tooth 36\n  3\. Fillings — teeth 14, 15\n\nTreatment Plan:\n  1\. Hygiene maintenance\n  2\. Fillings — teeth 14, 15/,
  );

  await addOption.click();
  const fourthOption = optionRows.nth(3);
  const fourthOptionType = fourthOption.getByRole("combobox", {
    name: "Treatment type",
    exact: true,
  });
  await fourthOptionType.focus();
  await fourthOption
    .getByRole("button", {
      name: "Hide Fillings from suggestions",
      exact: true,
    })
    .click();

  await expect(fourthOptionType).toBeFocused();
  await expect(fourthOptionType).toHaveValue("");
  await expect(
    page.getByRole("option", { name: "Fillings Local", exact: true }),
  ).toHaveCount(0);
  await expect(
    optionRows
      .nth(2)
      .getByRole("combobox", { name: "Treatment type", exact: true }),
  ).toHaveValue("Fillings");
  await expect(
    fourthOption.getByText(
      "Fillings hidden from suggestions. You can unhide it in Manage Catalogues.",
    ),
  ).toBeAttached();
  const fillingsIsHidden = await page.evaluate(() => {
    const stored = window.localStorage.getItem("hygienenote.catalogues.v1");
    if (!stored) return false;
    const state = JSON.parse(stored) as {
      userItems?: Array<{ label?: string; hidden?: boolean }>;
    };
    return state.userItems?.find((item) => item.label === "Fillings")?.hidden;
  });
  expect(fillingsIsHidden).toBe(true);
});
