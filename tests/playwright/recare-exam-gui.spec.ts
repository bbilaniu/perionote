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
    .getByRole("option", { name: "4 BW Starter", exact: true })
    .click();
  await radiographs.fill("Synthetic supplemental view");
  await multiControl(page, "Radiographs")
    .getByRole("button", { name: "Remember and add" })
    .click();
  await page
    .getByRole("button", {
      name: "Move Synthetic supplemental view earlier",
    })
    .click();

  await expect(page.locator("#recare-summary")).toHaveValue(
    /Radiographs: Synthetic supplemental view; 4 BW/,
  );
  await page.getByRole("button", { name: "Remove 4 BW" }).click();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Radiographs: Synthetic supplemental view/,
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

test("Recare Exam treatment lists reorder and copy options into an empty plan", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const treatmentOptions = page.getByRole("combobox", {
    name: "Treatment Options",
    exact: true,
  });
  await treatmentOptions.focus();
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

  await treatmentOptions.fill("Synthetic consultation");
  await multiControl(page, "Treatment Options")
    .getByRole("button", { name: "Add to note" })
    .click();
  await page
    .getByRole("button", { name: "Move Synthetic consultation earlier" })
    .click();

  const copyButton = page.getByRole("button", {
    name: "Copy Treatment Options to Treatment Plan",
    exact: true,
  });
  await expect(copyButton).toBeEnabled();
  await copyButton.click();
  await expect(copyButton).toHaveCount(0);

  await expect(
    page.getByRole("list", { name: "Treatment Plan selected values" }),
  ).toContainText("Synthetic consultation");
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Treatment Options:\n  - Synthetic consultation\n  - Hygiene maintenance\n\nTreatment Plan:\n  - Synthetic consultation\n  - Hygiene maintenance/,
  );

  const planValues = page.getByRole("list", {
    name: "Treatment Plan selected values",
  });
  await planValues
    .getByRole("button", { name: "Remove Synthetic consultation" })
    .click();
  await expect(
    page.getByRole("list", { name: "Treatment Options selected values" }),
  ).toContainText("Synthetic consultation");
  await expect(planValues).not.toContainText("Synthetic consultation");
});
