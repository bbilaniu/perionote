import { expect, test, type Page } from "@playwright/test";

const recareExamUrl = "/templates/clinic/recare-exam/interactive";

async function reloadDiscardingForm(page: Page) {
  const dialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page.reload();
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
  await reloadPromise;
}

test("Recare Exam offers public occlusion seeds and remembers providers explicitly", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const rightMolar = page.getByRole("combobox", {
    name: "Right molar occlusion",
  });
  await rightMolar.focus();
  await expect(page.getByRole("option", { name: /Cl I Starter/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Cl II Starter/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Cl III Starter/ })).toBeVisible();
  await rightMolar.press("ArrowDown");
  await rightMolar.press("ArrowDown");
  await rightMolar.press("Enter");
  await expect(rightMolar).toHaveValue("Cl II");
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Molar occlusion—right: Cl II\./,
  );

  const dentist = page.getByRole("combobox", { name: "Dentist" });
  await dentist.fill("Synthetic Dentist");
  await page.getByRole("button", { name: "Remember this value" }).click();

  await reloadDiscardingForm(page);

  await expect(dentist).toHaveValue("");
  await dentist.focus();
  await expect(
    page.getByRole("option", { name: /Synthetic Dentist Local/ }),
  ).toBeVisible();
  await page.getByRole("option", { name: /Synthetic Dentist Local/ }).click();
  await expect(dentist).toHaveValue("Synthetic Dentist");
});

test("typing and demo loading do not silently add catalogue values", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const rda = page.getByRole("combobox", { name: "RDA" });
  await rda.fill("Unsaved Synthetic RDA");
  await reloadDiscardingForm(page);

  await rda.focus();
  await expect(
    page.getByRole("option", { name: /Unsaved Synthetic RDA/ }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Load synthetic demo" }).click();
  await reloadDiscardingForm(page);

  const dentist = page.getByRole("combobox", { name: "Dentist" });
  await dentist.focus();
  await expect(
    page.getByRole("option", { name: /Synthetic Dentist/ }),
  ).toHaveCount(0);
});

test("form reset preserves remembered values and catalogue management controls seeds", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const rdh = page.getByRole("combobox", { name: "RDH" });
  await rdh.fill("Synthetic Remembered RDH");
  await page.getByRole("button", { name: "Remember this value" }).click();
  page.once("dialog", async (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(rdh).toHaveValue("");
  await rdh.focus();
  await expect(
    page.getByRole("option", { name: /Synthetic Remembered RDH Local/ }),
  ).toBeVisible();

  await page.goto("/catalogues");
  const molarCatalogue = page.locator(
    '[data-catalogue-key="clinical-exam.molar-occlusion"]',
  );
  const classOneRow = molarCatalogue.locator("li").filter({ hasText: "Cl I" }).first();
  await classOneRow.getByRole("button", { name: "Hide" }).click();
  await expect(classOneRow.getByText("Hidden", { exact: true })).toBeVisible();

  await page.goto(recareExamUrl);
  const rightMolar = page.getByRole("combobox", {
    name: "Right molar occlusion",
  });
  await rightMolar.focus();
  await expect(page.getByRole("option", { name: /Cl I Starter/ })).toHaveCount(0);
  await expect(page.getByRole("option", { name: /Cl II Starter/ })).toBeVisible();

  await page.goto("/catalogues");
  const hiddenClassOneRow = page
    .locator('[data-catalogue-key="clinical-exam.molar-occlusion"] li')
    .filter({ hasText: "Cl I" })
    .first();
  await hiddenClassOneRow.getByRole("button", { name: "Reactivate" }).click();
  await expect(
    hiddenClassOneRow.getByText("Hidden", { exact: true }),
  ).toHaveCount(0);
});

test("catalogue export and import transfer local values without a network request", async ({
  page,
}) => {
  await page.goto("/catalogues");
  await page.waitForLoadState("networkidle");
  const networkRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "fetch" || request.resourceType() === "xhr") {
      networkRequests.push(request.url());
    }
  });

  const dentistCatalogue = page.locator(
    '[data-catalogue-key="visit-team.dentist"]',
  );
  await dentistCatalogue
    .getByLabel("Add Dentist value")
    .fill("Portable Synthetic Dentist");
  await dentistCatalogue
    .getByRole("button", { name: "Add local value" })
    .click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export catalogue" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^hygienenote-catalogue-\d{4}-\d{2}-\d{2}\.json$/,
  );
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const exportedJson = await (
    await import("node:fs/promises")
  ).readFile(downloadPath!, "utf8");
  const exportedValue = JSON.parse(exportedJson);
  expect(exportedValue.catalogueState.userItems).toHaveLength(1);
  expect(exportedValue).not.toHaveProperty("patientId");
  expect(exportedValue).not.toHaveProperty("form");
  expect(exportedValue).not.toHaveProperty("theme");

  page.once("dialog", async (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset local catalogues" }).click();
  await expect(
    dentistCatalogue.locator('input[value="Portable Synthetic Dentist"]'),
  ).toHaveCount(0);

  await page.getByLabel("Import catalogue JSON").setInputFiles({
    name: "portable-catalogue.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportedJson),
  });
  await expect(page.getByRole("heading", { name: "Import preview" })).toBeVisible();
  await expect(page.getByText("1 local value in file")).toBeVisible();
  page.once("dialog", async (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Merge with this catalogue" })
    .click();
  await expect(
    dentistCatalogue.locator('input[value="Portable Synthetic Dentist"]'),
  ).toBeVisible();

  const rdaCatalogue = page.locator(
    '[data-catalogue-key="visit-team.rda"]',
  );
  await rdaCatalogue
    .getByLabel("Add RDA value")
    .fill("Temporary Synthetic RDA");
  await rdaCatalogue
    .getByRole("button", { name: "Add local value" })
    .click();
  await page.getByLabel("Import catalogue JSON").setInputFiles({
    name: "portable-catalogue.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportedJson),
  });
  page.once("dialog", async (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Replace this catalogue" })
    .click();
  await expect(
    rdaCatalogue.locator('input[value="Temporary Synthetic RDA"]'),
  ).toHaveCount(0);
  await expect(
    dentistCatalogue.locator('input[value="Portable Synthetic Dentist"]'),
  ).toBeVisible();
  expect(networkRequests).toEqual([]);
});

test("Recare Exam remains usable when browser-local catalogue storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Storage blocked for test", "SecurityError");
      },
    });
  });
  await page.goto(recareExamUrl);

  await page.locator("#recare-patient-id").fill("TEST-STORAGE-BLOCKED");
  const rdh = page.getByRole("combobox", { name: "RDH" });
  await rdh.fill("Unsaved Synthetic RDH");
  await expect(
    page.getByRole("button", { name: "Remember this value" }),
  ).toBeDisabled();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /PATIENT ID: TEST-STORAGE-BLOCKED[\s\S]*RDH: Unsaved Synthetic RDH/,
  );

  const rightMolar = page.getByRole("combobox", {
    name: "Right molar occlusion",
  });
  await rightMolar.focus();
  await page.getByRole("option", { name: /Cl III Starter/ }).click();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Molar occlusion—right: Cl III\./,
  );
});
