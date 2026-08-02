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

test("Recare Exam aligns Intraoral with the primary exam and conditionally shows structured details", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const structuredIntraoral = page.getByRole("group", {
    name: "Structured intraoral observations",
    exact: true,
  });
  const intraoralStatus = page.getByRole("button", {
    name: "Intraoral",
    exact: true,
  });
  const freeText = page.getByRole("textbox", {
    name: "Intraoral findings",
    exact: true,
  });
  const normalFlow = structuredIntraoral.getByRole("checkbox", {
    name: "Normal flow",
    exact: true,
  });

  await expect(intraoralStatus).toBeVisible();
  await expect(
    structuredIntraoral.getByRole("button", {
      name: "Intraoral",
      exact: true,
    })
  ).toHaveCount(0);
  await expect(normalFlow).toHaveCount(0);
  await expect(freeText).toHaveCount(0);

  await intraoralStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();
  await expect(freeText).toBeVisible();
  await expect(normalFlow).toBeVisible();
  await normalFlow.check();

  await intraoralStatus.click();
  await page
    .getByRole("option", { name: "Not assessed", exact: true })
    .click();
  await expect(normalFlow).toHaveCount(0);
  await expect(page.locator("#recare-summary")).toHaveValue("");

  await intraoralStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();
  await expect(normalFlow).toBeChecked();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Mark Intraoral WNL and clear all entered intraoral findings?"
    );
    await dialog.accept();
  });
  await intraoralStatus.click();
  await page.getByRole("option", { name: "WNL", exact: true }).click();
  await expect(normalFlow).toHaveCount(0);
  await expect(page.locator("#recare-summary")).toHaveValue("Intraoral: WNL.");
});

test("Recare Exam applies reviewed normal intraoral observations with compact output", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const structuredIntraoral = page.getByRole("group", {
    name: "Structured intraoral observations",
    exact: true,
  });
  const intraoralStatus = page.getByRole("button", {
    name: "Intraoral",
    exact: true,
  });
  await intraoralStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();
  const freeText = page.getByRole("textbox", {
    name: "Intraoral findings",
    exact: true,
  });
  await freeText.fill("Legacy observation");

  const normalFlow = structuredIntraoral.getByRole("checkbox", {
    name: "Normal flow",
    exact: true,
  });
  page.once("dialog", async (dialog) => {
    await dialog.dismiss();
  });
  await structuredIntraoral
    .getByRole("button", {
      name: "Apply normal structured observations",
      exact: true,
    })
    .click();
  await expect(freeText).toHaveValue("Legacy observation");
  await expect(normalFlow).not.toBeChecked();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Replace all entered intraoral findings with the reviewed normal structured observations?"
    );
    await dialog.accept();
  });
  await structuredIntraoral
    .getByRole("button", {
      name: "Apply normal structured observations",
      exact: true,
    })
    .click();

  await expect(intraoralStatus).toContainText("Findings");
  await expect(freeText).toHaveValue("");
  await expect(normalFlow).toBeChecked();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Intraoral:\n  - Buccal mucosa: pink; moist; no lesions; no swelling\.\n  - Tongue: pink; moist; symmetrical; no lesions\.\n  - Floor of mouth: pink; smooth; no swelling; no discoloration\.\n  - Palate \(hard\/soft\): pink; intact; no lesions; no abnormal growths\.\n  - Oropharynx: uvula midline; no redness; no swelling; no exudate\.\n  - Saliva: clear; normal flow\./
  );

  const reducedFlow = structuredIntraoral.getByRole("checkbox", {
    name: "Reduced flow",
    exact: true,
  });
  await reducedFlow.check();
  await expect(reducedFlow).toBeChecked();
  await expect(normalFlow).not.toBeChecked();
  await expect(page.locator("#recare-summary")).toContainText("reduced flow");
  await expect(page.locator("#recare-summary")).not.toContainText("normal flow");

  const noSwelling = structuredIntraoral.getByRole("checkbox", {
    name: "No swelling",
    exact: true,
  }).first();
  const swelling = structuredIntraoral.getByRole("checkbox", {
    name: "Swelling",
    exact: true,
  }).first();
  await swelling.check();
  await expect(swelling).toBeChecked();
  await expect(noSwelling).not.toBeChecked();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear all entered intraoral observations and return Intraoral to Not assessed?"
    );
    await dialog.accept();
  });
  await structuredIntraoral
    .getByRole("button", {
      name: "Clear intraoral observations",
      exact: true,
    })
    .click();
  await expect(intraoralStatus).toContainText("Not assessed");
  await expect(freeText).toHaveCount(0);
  await expect(normalFlow).toHaveCount(0);
  await expect(page.locator("#recare-summary")).toHaveValue("");
});

test("Recare Exam preserves intraoral findings when destructive actions are cancelled and isolates accepted WNL", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const intraoralStatus = page.getByRole("button", {
    name: "Intraoral",
    exact: true,
  });
  await intraoralStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();

  const freeText = page.getByRole("textbox", {
    name: "Intraoral findings",
    exact: true,
  });
  await freeText.fill("Synthetic intraoral observation");

  const structuredIntraoral = page.getByRole("group", {
    name: "Structured intraoral observations",
    exact: true,
  });
  const normalFlow = structuredIntraoral.getByRole("checkbox", {
    name: "Normal flow",
    exact: true,
  });
  await normalFlow.check();

  await page.getByLabel("Overbite (mm)", { exact: true }).fill("4");
  const cariesRisk = page.getByRole("button", {
    name: "Caries risk level",
    exact: true,
  });
  await cariesRisk.click();
  await page.getByRole("option", { name: "Moderate", exact: true }).click();
  const hasCpap = page.getByRole("button", {
    name: "Has a CPAP?",
    exact: true,
  });
  await hasCpap.click();
  await page.getByRole("option", { name: "No", exact: true }).click();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Mark Intraoral WNL and clear all entered intraoral findings?",
    );
    await dialog.dismiss();
  });
  await intraoralStatus.click();
  await page.getByRole("option", { name: "WNL", exact: true }).click();
  await expect(intraoralStatus).toContainText("Findings");
  await expect(freeText).toHaveValue("Synthetic intraoral observation");
  await expect(normalFlow).toBeChecked();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear all entered intraoral observations and return Intraoral to Not assessed?",
    );
    await dialog.dismiss();
  });
  await structuredIntraoral
    .getByRole("button", {
      name: "Clear intraoral observations",
      exact: true,
    })
    .click();
  await expect(intraoralStatus).toContainText("Findings");
  await expect(freeText).toHaveValue("Synthetic intraoral observation");
  await expect(normalFlow).toBeChecked();

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await intraoralStatus.click();
  await page.getByRole("option", { name: "WNL", exact: true }).click();

  await expect(intraoralStatus).toContainText("WNL");
  await expect(freeText).toHaveCount(0);
  await expect(normalFlow).toHaveCount(0);
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Intraoral: WNL\.\nOverbite: 4 mm\.\n\nCPAP: No\.\n\nCaries risk: Moderate caries risk$/,
  );
});

test("Recare Exam exposes only supported structured annotations and keeps saliva independent from caries risk", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const intraoralStatus = page.getByRole("button", {
    name: "Intraoral",
    exact: true,
  });
  await intraoralStatus.click();
  await page.getByRole("option", { name: "Findings", exact: true }).click();

  const structuredIntraoral = page.getByRole("group", {
    name: "Structured intraoral observations",
    exact: true,
  });
  const buccalUlcer = structuredIntraoral
    .getByRole("checkbox", { name: "Ulcer", exact: true })
    .first();
  await buccalUlcer.check();
  const buccalUlcerCard = buccalUlcer.locator("xpath=../..");
  await buccalUlcerCard
    .getByLabel("Location", { exact: true })
    .fill("Right posterior");
  await buccalUlcerCard
    .getByLabel("Measurement (mm)", { exact: true })
    .fill("4");
  await buccalUlcerCard
    .getByLabel("Comment", { exact: true })
    .fill("Synthetic note");

  const lineaAlba = structuredIntraoral.getByRole("checkbox", {
    name: "Linea alba",
    exact: true,
  });
  await lineaAlba.check();
  const lineaAlbaCard = lineaAlba.locator("xpath=../..");
  await expect(
    lineaAlbaCard.getByLabel("Location", { exact: true }),
  ).toHaveCount(0);
  await expect(
    lineaAlbaCard.getByLabel("Measurement (mm)", { exact: true }),
  ).toHaveCount(0);
  const laterality = lineaAlbaCard.getByRole("button", {
    name: "Laterality",
    exact: true,
  });
  await laterality.click();
  await page.getByRole("option", { name: "Bilateral", exact: true }).click();

  await structuredIntraoral
    .getByRole("checkbox", { name: "Coated", exact: true })
    .check();
  await structuredIntraoral
    .getByRole("checkbox", { name: "Fissured", exact: true })
    .check();

  const normalFlow = structuredIntraoral.getByRole("checkbox", {
    name: "Normal flow",
    exact: true,
  });
  await normalFlow.check();
  const normalFlowCard = normalFlow.locator("xpath=../..");
  await expect(
    normalFlowCard.getByLabel("Location", { exact: true }),
  ).toHaveCount(0);
  await expect(
    normalFlowCard.getByRole("button", {
      name: "Laterality",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    normalFlowCard.getByLabel("Measurement (mm)", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("list", {
      name: "Caries risk factors selected values",
    }),
  ).toHaveCount(0);

  const cariesRiskFactors = page.getByRole("combobox", {
    name: "Caries risk factors",
    exact: true,
  });
  await cariesRiskFactors.focus();
  await page
    .getByRole("option", { name: "Hyposalivation Starter", exact: true })
    .click();
  await normalFlow.uncheck();
  await expect(
    page
      .getByRole("list", { name: "Caries risk factors selected values" })
      .getByText("Hyposalivation", { exact: true }),
  ).toBeVisible();

  await expect(page.locator("#recare-summary")).toHaveValue(
    /Intraoral:\n  - Buccal mucosa: ulcer \(location: Right posterior; measurement: 4 mm; notes: Synthetic note\); linea alba \(location: Bilateral\)\.\n  - Tongue: coated; fissured\.\n\nCaries risk: Factors include hyposalivation$/,
  );
  await expect(page.locator("#recare-summary")).not.toHaveValue(
    /abnormal|patholog/i,
  );
});

test("Recare Exam supports starter, custom, ordered, located, and remembered additional occlusal findings", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const additionalFindings = page.getByRole("combobox", {
    name: "Additional occlusal findings",
    exact: true,
  });
  await additionalFindings.focus();
  for (const label of [
    "Open bite",
    "Crossbite",
    "Increased overjet",
    "Increased overbite",
  ]) {
    await expect(
      page.getByRole("option", {
        name: `${label} Starter`,
        exact: true,
      }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("option", {
      name: "Slight malocclusion Starter",
      exact: true,
    }),
  ).toHaveCount(0);
  for (const duplicate of ["Cl I", "Cl II", "Cl III"]) {
    await expect(
      page.getByRole("option", {
        name: `${duplicate} Starter`,
        exact: true,
      }),
    ).toHaveCount(0);
  }

  await page
    .getByRole("option", { name: "Crossbite Starter", exact: true })
    .click();
  await page.getByLabel("Posterior", { exact: true }).check();
  await page.getByLabel("Left", { exact: true }).check();
  await page
    .getByLabel("Tooth/area or region", { exact: true })
    .fill("tooth 16");
  await expect(page.locator("#recare-summary")).toHaveValue(
    "Additional occlusal findings: Crossbite (location: Posterior, Left, tooth 16).",
  );

  let catalogueStorage = await page.evaluate(() =>
    Object.values(window.localStorage).join("\n"),
  );
  expect(catalogueStorage).not.toContain("tooth 16");

  await additionalFindings.fill("Synthetic edge-to-edge relationship");
  await multiControl(page, "Additional occlusal findings")
    .getByRole("button", { name: "Add to note", exact: true })
    .click();
  catalogueStorage = await page.evaluate(() =>
    Object.values(window.localStorage).join("\n"),
  );
  expect(catalogueStorage).not.toContain(
    "Synthetic edge-to-edge relationship",
  );

  const selectedFindings = page.getByRole("list", {
    name: "Additional occlusal findings selected values",
  });
  await selectedFindings
    .getByRole("button", {
      name: "Move Synthetic edge-to-edge relationship earlier",
      exact: true,
    })
    .click();
  await expect(page.locator("#recare-summary")).toHaveValue(
    "Additional occlusal findings: Synthetic edge-to-edge relationship; Crossbite (location: Posterior, Left, tooth 16).",
  );

  await additionalFindings.fill("Synthetic functional shift");
  await multiControl(page, "Additional occlusal findings")
    .getByRole("button", { name: "Remember and add", exact: true })
    .click();
  catalogueStorage = await page.evaluate(() =>
    Object.values(window.localStorage).join("\n"),
  );
  expect(catalogueStorage).toContain("Synthetic functional shift");
  expect(catalogueStorage).not.toContain("tooth 16");

  await selectedFindings
    .getByRole("button", {
      name: "Remove Synthetic functional shift",
      exact: true,
    })
    .click();
  await additionalFindings.focus();
  await expect(
    page.getByRole("option", {
      name: "Synthetic functional shift Local",
      exact: true,
    }),
  ).toBeVisible();
});

test("Recare Exam demo and reset handle all Slice 2 interaction state without changing remembered wording", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const additionalFindings = page.getByRole("combobox", {
    name: "Additional occlusal findings",
    exact: true,
  });
  await additionalFindings.fill("Synthetic remembered occlusal wording");
  await multiControl(page, "Additional occlusal findings")
    .getByRole("button", { name: "Remember and add", exact: true })
    .click();

  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  const intraoralStatus = page.getByRole("button", {
    name: "Intraoral",
    exact: true,
  });
  const structuredIntraoral = page.getByRole("group", {
    name: "Structured intraoral observations",
    exact: true,
  });
  await expect(intraoralStatus).toContainText("Findings");
  await expect(
    structuredIntraoral.getByRole("checkbox", {
      name: "Fissured",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    structuredIntraoral.getByRole("checkbox", {
      name: "Normal flow",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    page.getByLabel("Overbite (mm)", { exact: true }),
  ).toHaveValue("3");
  await expect(
    page
      .getByRole("list", {
        name: "Additional occlusal findings selected values",
      })
      .getByText("Crossbite", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Posterior", { exact: true })).toBeChecked();
  await expect(page.getByLabel("Left", { exact: true })).toBeChecked();

  page.once("dialog", async (dialog) => {
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(intraoralStatus).toContainText("Findings");
  await expect(
    page.getByLabel("Overbite (mm)", { exact: true }),
  ).toHaveValue("3");

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Reset form" }).click();

  await expect(intraoralStatus).toContainText("Not assessed");
  await expect(
    structuredIntraoral.getByRole("checkbox", {
      name: "Fissured",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Overbite (mm)", { exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("list", {
      name: "Additional occlusal findings selected values",
    }),
  ).toHaveCount(0);
  await expect(page.locator("#recare-summary")).toHaveValue("");

  await additionalFindings.focus();
  await expect(
    page.getByRole("option", {
      name: "Synthetic remembered occlusal wording Local",
      exact: true,
    }),
  ).toBeVisible();
  const catalogueStorage = await page.evaluate(() =>
    Object.values(window.localStorage).join("\n"),
  );
  expect(catalogueStorage).not.toContain("Posterior");
  expect(catalogueStorage).not.toContain("Left");
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
