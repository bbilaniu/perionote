import { expect, test, type Page } from "@playwright/test";
import { openGeneratedNote } from "./helpers/interactiveTemplate";

const recareExamUrl = "/templates/clinic/recare-exam/interactive";
const adultHygieneUrl = "/templates/clinic/adult-hygiene-2021/interactive";

async function reloadDiscardingForm(page: Page) {
  const dialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page.reload();
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
  await reloadPromise;
}

test("catalogue manager groups related catalogues into keyboard-accessible tabs", async ({
  page,
}) => {
  await page.goto("/catalogues");

  const providerGroup = page.getByRole("region", {
    name: "Provider roles catalogues",
  });
  const dentistTab = providerGroup.getByRole("tab", { name: /Dentist/ });
  const rdaTab = providerGroup.getByRole("tab", { name: /RDA/ });
  const rdhTab = providerGroup.getByRole("tab", { name: /RDH/ });
  const dentistCatalogue = providerGroup.locator(
    '[data-catalogue-key="visit-team.dentist"]',
  );
  const rdaCatalogue = providerGroup.locator(
    '[data-catalogue-key="visit-team.rda"]',
  );

  await expect(dentistTab).toHaveAttribute("aria-selected", "true");
  await expect(rdaTab).toHaveAttribute("aria-selected", "false");
  await expect(rdhTab).toHaveAttribute("aria-selected", "false");
  await expect(dentistCatalogue).toBeVisible();
  await expect(rdaCatalogue).toBeHidden();

  await dentistCatalogue
    .getByLabel("Add Dentist value")
    .fill("Unsubmitted Dentist");
  await rdaTab.click();
  await rdaCatalogue
    .getByLabel("Add RDA value")
    .fill("Unsubmitted RDA");
  await dentistTab.click();
  await expect(dentistCatalogue.getByLabel("Add Dentist value")).toHaveValue(
    "Unsubmitted Dentist",
  );

  await dentistTab.press("ArrowRight");
  await expect(rdaTab).toBeFocused();
  await expect(rdaTab).toHaveAttribute("aria-selected", "true");
  await rdaTab.press("End");
  await expect(rdhTab).toBeFocused();
  await expect(rdhTab).toHaveAttribute("aria-selected", "true");

  const occlusionGroup = page.getByRole("region", {
    name: "Occlusion catalogues",
  });
  const molarTab = occlusionGroup.getByRole("tab", {
    name: /Molar occlusion/,
  });
  const skeletalTab = occlusionGroup.getByRole("tab", {
    name: /Skeletal occlusion/,
  });
  const additionalFindingsTab = occlusionGroup.getByRole("tab", {
    name: /Additional occlusal findings/,
  });
  await expect(molarTab).toHaveAttribute("aria-selected", "true");
  await expect(molarTab).toContainText("3");
  await skeletalTab.click();
  await expect(
    occlusionGroup.locator(
      '[data-catalogue-key="clinical-exam.molar-occlusion"]',
    ),
  ).toBeHidden();
  await expect(
    occlusionGroup.locator(
      '[data-catalogue-key="clinical-exam.skeletal-occlusion"]',
    ),
  ).toBeVisible();
  await skeletalTab.press("ArrowRight");
  await expect(additionalFindingsTab).toBeFocused();
  await expect(additionalFindingsTab).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    occlusionGroup.locator(
      '[data-catalogue-key="clinical-exam.additional-occlusal-findings"]',
    ),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Continuity of care", exact: true }),
  ).toBeVisible();
  const continuityGroup = page.getByRole("region", {
    name: "Intervals and next visits catalogues",
  });
  const recareTab = continuityGroup.getByRole("tab", {
    name: /Recommended recare interval/,
  });
  const hygieneTab = continuityGroup.getByRole("tab", {
    name: /Recommended hygiene interval/,
  });
  const hygieneNextVisitTab = continuityGroup.getByRole("tab", {
    name: /Next hygiene visit/,
  });
  const dentistNextVisitTab = continuityGroup.getByRole("tab", {
    name: /Next dentist visit/,
  });
  await expect(recareTab).toHaveAttribute("aria-selected", "true");
  await hygieneTab.click();
  await expect(hygieneTab).toHaveAttribute("aria-selected", "true");
  await hygieneNextVisitTab.click();
  await expect(
    continuityGroup.locator(
      '[data-catalogue-key="scheduling.hygiene-next-visit"]',
    ),
  ).toBeVisible();
  await dentistNextVisitTab.click();
  await expect(
    continuityGroup.locator(
      '[data-catalogue-key="scheduling.dentist-next-visit"]',
    ),
  ).toBeVisible();
});

test("provider fields offer contextual save and default actions", async ({
  page,
}) => {
  await page.goto(recareExamUrl);
  const dentist = page.getByRole("combobox", { name: "Dentist" });

  await dentist.fill("Inline Synthetic Dentist");
  await expect(
    page.getByRole("button", { name: "Remember this value" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Remember Inline Synthetic Dentist and set it as the default Dentist for new notes",
    })
    .click();
  await expect(page.getByText("Default for new notes")).toBeVisible();

  await dentist.fill("");
  await expect(
    page.getByRole("option", {
      name: /Inline Synthetic Dentist Default Local/,
    }),
  ).toBeVisible();

  await dentist.fill("Alternate Synthetic Dentist");
  await page.getByRole("button", { name: "Remember this value" }).click();
  await page
    .getByRole("button", {
      name: "Set Alternate Synthetic Dentist as the default Dentist for new notes",
    })
    .click();
  await expect(page.getByText("Default for new notes")).toBeVisible();

  await dentist.fill("");
  await expect(
    page.getByRole("option", {
      name: /Alternate Synthetic Dentist Default Local/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("option", {
      name: /Inline Synthetic Dentist Default Local/,
    }),
  ).toHaveCount(0);
});

test("saved providers can prefill new notes without changing restored drafts", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/catalogues");
  const dentistCatalogue = page.locator(
    '[data-catalogue-key="visit-team.dentist"]',
  );
  await dentistCatalogue
    .getByLabel("Add Dentist value")
    .fill("Default Synthetic Dentist");
  await dentistCatalogue
    .getByRole("button", { name: "Add local value" })
    .click();
  const dentistRow = dentistCatalogue
    .locator("li")
    .filter({ hasText: "Default Synthetic Dentist" });
  await dentistCatalogue
    .getByRole("button", { name: "Set default" })
    .click();
  await expect(dentistRow).toContainText("Default for new notes");

  const providerGroup = page.getByRole("region", {
    name: "Provider roles catalogues",
  });
  await providerGroup.getByRole("tab", { name: /RDA/ }).click();
  const rdaCatalogue = page.locator(
    '[data-catalogue-key="visit-team.rda"]',
  );
  await rdaCatalogue.getByLabel("Add RDA value").fill("Default Synthetic RDA");
  await rdaCatalogue
    .getByRole("button", { name: "Add local value" })
    .click();
  await rdaCatalogue.getByRole("button", { name: "Set default" }).click();

  await providerGroup.getByRole("tab", { name: /RDH/ }).click();
  const rdhCatalogue = page.locator(
    '[data-catalogue-key="visit-team.rdh"]',
  );
  await rdhCatalogue.getByLabel("Add RDH value").fill("Default Synthetic RDH");
  await rdhCatalogue
    .getByRole("button", { name: "Add local value" })
    .click();
  await rdhCatalogue.getByRole("button", { name: "Set default" }).click();

  await page.goto(recareExamUrl);
  const recareDentist = page.getByRole("combobox", { name: "Dentist" });
  const recareRda = page.getByRole("combobox", { name: "RDA" });
  const recareRdh = page.getByRole("combobox", { name: "RDH" });
  await expect(recareDentist).toHaveValue("Default Synthetic Dentist");
  await expect(recareRda).toHaveValue("Default Synthetic RDA");
  await expect(recareRdh).toHaveValue("Default Synthetic RDH");

  await page.getByLabel("Patient ID").fill("SYNTHETIC-DEFAULT-RESTORE");
  await recareDentist.fill("");
  await recareRda.fill("");
  await recareRdh.fill("");
  await openGeneratedNote(page);
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(
    page.getByText("Enter at least one of Dentist, RDA, or RDH."),
  ).toBeVisible();
  await reloadDiscardingForm(page);
  await expect(recareDentist).toHaveValue("");
  await expect(recareRda).toHaveValue("");
  await expect(recareRdh).toHaveValue("");

  page.once("dialog", async (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear form" }).click();
  await expect(recareDentist).toHaveValue("Default Synthetic Dentist");
  await expect(recareRda).toHaveValue("Default Synthetic RDA");
  await expect(recareRdh).toHaveValue("Default Synthetic RDH");

  page.once("dialog", async (dialog) => dialog.accept());
  await page.goto(adultHygieneUrl);
  await expect(page.locator("#adult-hygiene-dentist")).toHaveValue(
    "Default Synthetic Dentist",
  );
  await expect(page.locator("#adult-hygiene-rda")).toHaveValue(
    "Default Synthetic RDA",
  );
  await expect(page.locator("#adult-hygiene-rdh")).toHaveValue(
    "Default Synthetic RDH",
  );
});

test("Recare Exam offers public occlusion seeds and remembers providers explicitly", async ({
  page,
}) => {
  await page.goto(recareExamUrl);

  const rightMolar = page.getByRole("combobox", {
    name: "Right molar occlusion",
  });
  await page
    .getByRole("button", {
      name: "Show Right molar occlusion suggestions",
      exact: true,
    })
    .click();
  await expect(page.getByRole("option", { name: /Cl I Starter/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Cl II Starter/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Cl III Starter/ })).toBeVisible();
  await page
    .getByRole("button", {
      name: "Hide Cl III from suggestions",
      exact: true,
    })
    .click();
  await expect(rightMolar).toBeFocused();
  await expect(rightMolar).toHaveValue("");
  await expect(
    page.getByRole("option", { name: /Cl III Starter/ }),
  ).toHaveCount(0);
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
  await page
    .getByRole("button", {
      name: "Show Dentist suggestions",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("option", { name: /Synthetic Dentist Local/ }),
  ).toBeVisible();
  await page.getByRole("option", { name: /Synthetic Dentist Local/ }).click();
  await expect(dentist).toHaveValue("Synthetic Dentist");
});

test("Adult Hygiene documents catalogue-backed caries risk factors", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await page
    .getByRole("button", { name: "Caries risk level", exact: true })
    .click();
  await page.getByRole("option", { name: "Moderate", exact: true }).click();

  const factors = page.getByRole("combobox", {
    name: "Caries risk factors",
    exact: true,
  });
  await factors.focus();
  await page
    .getByRole("option", {
      name: /High frequency of sugar intake Starter/,
    })
    .click();
  await factors.fill("Synthetic local dry-mouth factor");
  await page.getByRole("button", { name: "Remember and add" }).click();
  await page
    .getByLabel("Caries risk notes", { exact: true })
    .fill("Synthetic rationale reviewed");

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Caries risk: Moderate caries risk due to high frequency of sugar intake and synthetic local dry-mouth factor\. Synthetic rationale reviewed\.$/,
  );

  await reloadDiscardingForm(page);
  await expect(
    page.getByRole("list", { name: "Caries risk factors selected values" }),
  ).toContainText("Synthetic local dry-mouth factor");
  await page
    .getByRole("button", {
      name: "Remove Synthetic local dry-mouth factor",
    })
    .click();
  await factors.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic local dry-mouth factor Local/,
    }),
  ).toBeVisible();
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
  await page.getByRole("button", { name: "Clear form" }).click();
  await expect(rdh).toHaveValue("");
  await rdh.focus();
  await expect(
    page.getByRole("option", { name: /Synthetic Remembered RDH Local/ }),
  ).toBeVisible();

  await page.goto("/catalogues");
  const molarCatalogue = page.locator(
    '[data-catalogue-key="clinical-exam.molar-occlusion"]',
  );
  const classOneRow = molarCatalogue.locator(
    '[data-catalogue-item-id="seed.molar.cl-i"]',
  );
  await expect(
    classOneRow.getByRole("button", { name: "Move Cl I up" }),
  ).toBeDisabled();
  const classThreeRow = molarCatalogue
    .locator("li")
    .filter({ hasText: "Cl III" });
  await expect(
    classThreeRow.getByRole("button", { name: "Move Cl III down" }),
  ).toBeDisabled();
  const classTwoRow = molarCatalogue.locator(
    '[data-catalogue-item-id="seed.molar.cl-ii"]',
  );
  await classTwoRow.getByRole("button", { name: "Hide" }).click();
  await expect(
    classTwoRow.getByRole("button", { name: "Move Cl II up" }),
  ).toBeEnabled();
  await expect(
    classTwoRow.getByRole("button", { name: "Move Cl II down" }),
  ).toBeEnabled();
  await classTwoRow.getByRole("button", { name: "Unhide" }).click();
  await classOneRow.getByRole("button", { name: "Hide" }).hover();
  await expect(
    classOneRow.getByRole("tooltip", {
      name: "Remove this value from future form suggestions without deleting it.",
    }),
  ).toBeVisible();
  await classOneRow.getByRole("button", { name: "Hide" }).click();
  await expect(classOneRow.getByText("Hidden", { exact: true })).toBeVisible();
  await expect(classOneRow).toHaveClass(/opacity-60/);

  await page.goto(recareExamUrl);
  const rightMolar = page.getByRole("combobox", {
    name: "Right molar occlusion",
  });
  await rightMolar.focus();
  await expect(page.getByRole("option", { name: /Cl I Starter/ })).toHaveCount(0);
  await expect(page.getByRole("option", { name: /Cl II Starter/ })).toBeVisible();

  await page.goto("/catalogues");
  const hiddenClassOneRow = page
    .locator('[data-catalogue-key="clinical-exam.molar-occlusion"]')
    .locator('[data-catalogue-item-id="seed.molar.cl-i"]');
  await expect(
    hiddenClassOneRow.getByRole("button", { name: "Unhide" }),
  ).toBeVisible();
  await hiddenClassOneRow.getByRole("button", { name: "Favorite" }).click();
  await expect(
    hiddenClassOneRow.getByText("Hidden", { exact: true }),
  ).toHaveCount(0);
  await expect(
    hiddenClassOneRow.getByRole("button", { name: "Unfavorite" }),
  ).toBeVisible();
});

test("catalogue export and import transfer local values without a network request", async ({
  page,
}) => {
  await page.goto("/catalogues");
  await page.waitForLoadState("networkidle");
  const networkRequests: string[] = [];
  page.on("request", (request) => {
    const isApplicationRequest =
      request.resourceType() === "fetch" || request.resourceType() === "xhr";
    const isDevelopmentTooling = new URL(request.url()).pathname.startsWith(
      "/_next/",
    );
    if (isApplicationRequest && !isDevelopmentTooling) {
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
  const portableDentistRow = dentistCatalogue.locator(
    'li:has(input[value="Portable Synthetic Dentist"])',
  );
  await expect(portableDentistRow).toContainText("Saved in this browser");
  let deleteConfirmationMessage = "";
  page.once("dialog", async (dialog) => {
    deleteConfirmationMessage = dialog.message();
    await dialog.dismiss();
  });
  await portableDentistRow.getByRole("button", { name: "Delete" }).click();
  expect(deleteConfirmationMessage).toContain(
    "permanently from this browser's catalogue",
  );
  expect(deleteConfirmationMessage).toContain(
    "Open forms and previously copied notes will not change.",
  );
  await expect(portableDentistRow).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Choose catalogue file" }),
  ).toBeVisible();
  await expect(
    page.getByText("No file selected", { exact: true }),
  ).toBeVisible();

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
  const selectedFileName = page.locator("#catalogue-import-file-name");
  await expect(selectedFileName).toHaveText("portable-catalogue.json");
  await expect(selectedFileName).toHaveAttribute(
    "title",
    "portable-catalogue.json",
  );
  await expect(page.getByRole("heading", { name: "Import preview" })).toBeVisible();
  await expect(page.getByText("1 local value in file")).toBeVisible();
  page.once("dialog", async (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Merge with this catalogue" })
    .click();
  await expect(
    page.getByText("No file selected", { exact: true }),
  ).toBeVisible();
  await expect(
    dentistCatalogue.locator('input[value="Portable Synthetic Dentist"]'),
  ).toBeVisible();

  const rdaCatalogue = page.locator(
    '[data-catalogue-key="visit-team.rda"]',
  );
  await page
    .getByRole("region", { name: "Provider roles catalogues" })
    .getByRole("tab", { name: /RDA/ })
    .click();
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
    page.getByText("No file selected", { exact: true }),
  ).toBeVisible();
  await expect(
    rdaCatalogue.locator('input[value="Temporary Synthetic RDA"]'),
  ).toHaveCount(0);
  await page
    .getByRole("region", { name: "Provider roles catalogues" })
    .getByRole("tab", { name: /Dentist/ })
    .click();
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
