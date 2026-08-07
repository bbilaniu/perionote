import { expect, test, type Page } from "@playwright/test";
import {
  INTERACTIVE_DRAFT_STORAGE_PREFIX,
  interactiveDraftStorageKey,
} from "@/lib/templates/localDrafts";

const adultHygieneUrl = "/templates/clinic/adult-hygiene-2021/interactive";
const recareExamUrl = "/templates/clinic/recare-exam/interactive";

type SyntheticDraftSummary = {
  draftId: string;
  templateId?: "adult-hygiene-2021" | "recare-exam" | "legacy-template";
  patientId?: string;
  dentist?: string;
  rdh?: string;
  rda?: string;
  assistant?: string;
  savedOffsetMinutes?: number;
};

async function seedSyntheticDrafts(
  page: Page,
  drafts: SyntheticDraftSummary[],
) {
  const now = Date.now();
  const values = drafts.map((draft, index) => {
    const templateId = draft.templateId ?? "adult-hygiene-2021";
    const savedAt = new Date(
      now - (draft.savedOffsetMinutes ?? index + 1) * 60_000,
    ).toISOString();
    return {
      key: interactiveDraftStorageKey(templateId, draft.draftId),
      value: JSON.stringify({
        kind: "hygienenote.interactive-draft",
        schemaVersion: 1,
        templateId,
        draftId: draft.draftId,
        savedAt,
        startedAt: new Date(Date.parse(savedAt) - 5 * 60_000).toISOString(),
        form: {
          patientId: draft.patientId ?? "",
          dentist: draft.dentist ?? "",
          rdh: draft.rdh ?? "",
          rda: draft.rda ?? "",
          assistant: draft.assistant ?? "",
          hiddenClinicalFinding: "Synthetic finding that must not be searched",
        },
      }),
    };
  });
  await page.evaluate((entries) => {
    for (const entry of entries) window.localStorage.setItem(entry.key, entry.value);
  }, values);
}

test("Adult Hygiene autosaves after ten seconds and restores its tab after reload", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  await page.locator("#adult-hygiene-patient-id").fill("Synthetic autosave A");
  await page.locator("#adult-hygiene-rdh").fill("Synthetic RDH");

  await page.waitForTimeout(10_500);

  const savedDrafts = await page.evaluate(
    (prefix) =>
      Object.entries(window.localStorage)
        .filter(([key]) => key.startsWith(prefix))
        .map(([, value]) => value),
    INTERACTIVE_DRAFT_STORAGE_PREFIX,
  );
  expect(savedDrafts).toHaveLength(1);
  expect(savedDrafts[0]).toContain("Synthetic autosave A");

  await page.reload();
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue(
    "Synthetic autosave A",
  );
  await expect(page.locator("#adult-hygiene-rdh")).toHaveValue("Synthetic RDH");
  await expect(page.getByText(/Restored the draft saved/)).toBeVisible();
});

test("client-side navigation checkpoints edits before the draft hook unmounts", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  await page
    .locator("#adult-hygiene-patient-id")
    .fill("Synthetic navigation checkpoint");
  await page.locator("#adult-hygiene-rdh").fill("Synthetic RDH");

  await page.getByRole("link", { name: "View all saved drafts" }).click();

  const savedDraftRow = page
    .getByRole("table", { name: "Saved local drafts" })
    .getByRole("row")
    .filter({ hasText: "Synthetic navigation checkpoint" });
  await expect(savedDraftRow).toBeVisible();
  await savedDraftRow.getByRole("button", { name: /Open draft:/ }).click();
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue(
    "Synthetic navigation checkpoint",
  );
});

test("restoring another draft first checkpoints the current form", async ({
  page,
}) => {
  await page.goto(recareExamUrl);
  await page.locator("#recare-patient-id").fill("Synthetic draft A");
  await page.locator("#recare-rdh").fill("Synthetic RDH A");
  await page.getByRole("button", { name: "Copy note" }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset form" }).click();
  await page.locator("#recare-patient-id").fill("Synthetic draft B unsaved");
  await page.locator("#recare-rdh").fill("Synthetic RDH B");

  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.locator("#recare-patient-id")).toHaveValue(
    "Synthetic draft A",
  );

  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.locator("#recare-patient-id")).toHaveValue(
    "Synthetic draft B unsaved",
  );
  await expect(page.locator("#recare-rdh")).toHaveValue("Synthetic RDH B");
});

test("Recare copy saves independent drafts for multiple open tabs", async ({
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const firstPage = await context.newPage();
  await firstPage.goto(recareExamUrl);
  const copiedTabSession = await firstPage.evaluate(() =>
    Object.entries(window.sessionStorage),
  );
  const secondPage = await context.newPage();
  await secondPage.addInitScript((entries) => {
    for (const [key, value] of entries)
      window.sessionStorage.setItem(key, value);
  }, copiedTabSession);
  await secondPage.goto(recareExamUrl);

  await firstPage.locator("#recare-patient-id").fill("Synthetic tab A");
  await firstPage.locator("#recare-rdh").fill("Synthetic RDH A");
  await firstPage.getByRole("button", { name: "Copy note" }).click();
  await expect(
    firstPage.getByText("Note copied.", { exact: true }),
  ).toBeVisible();

  await secondPage.locator("#recare-patient-id").fill("Synthetic tab B");
  await secondPage.locator("#recare-rdh").fill("Synthetic RDH B");
  await secondPage.getByRole("button", { name: "Copy note" }).click();
  await expect(
    secondPage.getByText("Note copied.", { exact: true }),
  ).toBeVisible();

  expect(
    await firstPage.evaluate(
      (prefix) =>
        Object.keys(window.localStorage).filter((key) => key.startsWith(prefix))
          .length,
      INTERACTIVE_DRAFT_STORAGE_PREFIX,
    ),
  ).toBe(2);

  await Promise.all([firstPage.reload(), secondPage.reload()]);
  await expect(firstPage.locator("#recare-patient-id")).toHaveValue(
    "Synthetic tab A",
  );
  await expect(secondPage.locator("#recare-patient-id")).toHaveValue(
    "Synthetic tab B",
  );
});

test("saved drafts page identifies, opens, and deletes a local draft", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(adultHygieneUrl);
  await page
    .locator("#adult-hygiene-patient-id")
    .fill("Synthetic private draft patient");
  await page.locator("#adult-hygiene-dentist").fill("Synthetic Draft Dentist");
  await page.locator("#adult-hygiene-rda").fill("Synthetic Draft RDA");
  await page.locator("#adult-hygiene-rdh").fill("Synthetic Draft RDH");
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain(
      "current local draft will remain available",
    );
    return dialog.accept();
  });
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-dentist")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-rda")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-rdh")).toHaveValue("");

  await page.goto("/drafts");
  await expect(
    page.getByRole("heading", { name: "Saved local drafts" }),
  ).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "2021 Adult Hygiene" })).toBeVisible();
  const savedDraftRow = page.getByRole("table", { name: "Saved local drafts" }).getByRole("row").filter({ hasText: "Synthetic private draft patient" });
  await expect(savedDraftRow.getByRole("cell").filter({ hasText: "Synthetic private draft patient" })).toBeVisible();
  await expect(savedDraftRow.getByRole("cell").filter({ hasText: "Synthetic Draft Dentist" })).toBeVisible();
  await expect(savedDraftRow.getByRole("cell").filter({ hasText: "Synthetic Draft RDA" })).toBeVisible();
  await expect(savedDraftRow.getByRole("cell").filter({ hasText: "Synthetic Draft RDH" })).toBeVisible();

  await seedSyntheticDrafts(page, [
    {
      draftId: "open-action-decoy",
      templateId: "recare-exam",
      patientId: "ZZZ-DECOY",
      rdh: "Decoy RDH",
    },
  ]);
  await page.reload();
  const patientIdHeader = page.getByRole("columnheader", { name: /Sort by Patient ID/ });
  await patientIdHeader.getByRole("button").click();
  await expect(patientIdHeader).toHaveAttribute("aria-sort", "ascending");
  const actionSearch = page.getByRole("searchbox", { name: "Search saved drafts" });
  await actionSearch.fill("private draft patient");
  await expect(page.getByText("1 of 2 drafts")).toBeVisible();
  await page.getByRole("button", { name: /Open draft:.*Synthetic private draft patient/ }).click();
  await expect(page).toHaveURL(new RegExp(`${adultHygieneUrl}/?$`));
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue(
    "Synthetic private draft patient",
  );
  await expect(page.locator("#adult-hygiene-dentist")).toHaveValue(
    "Synthetic Draft Dentist",
  );
  await expect(page.locator("#adult-hygiene-rda")).toHaveValue(
    "Synthetic Draft RDA",
  );
  await expect(page.locator("#adult-hygiene-rdh")).toHaveValue(
    "Synthetic Draft RDH",
  );

  await page.goto("/drafts");
  await page.getByRole("searchbox", { name: "Search saved drafts" }).fill("private draft patient");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Delete draft:.*Synthetic private draft patient/ }).click();
  await expect(page.getByRole("heading", { name: "No saved drafts match your search." })).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).last().click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Delete draft:.*ZZZ-DECOY/ }).click();
  await expect(
    page.getByRole("heading", { name: "No saved drafts" }),
  ).toBeVisible();
});

test("saved drafts page warns separately before deleting all drafts", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(adultHygieneUrl);
  await page.locator("#adult-hygiene-patient-id").fill("Synthetic draft one");
  await page.locator("#adult-hygiene-rdh").fill("Synthetic RDH one");
  await page.getByRole("button", { name: "Copy note" }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset form" }).click();
  await page.locator("#adult-hygiene-patient-id").fill("Synthetic draft two");
  await page.locator("#adult-hygiene-rdh").fill("Synthetic RDH two");
  await page.getByRole("button", { name: "Copy note" }).click();

  await page.goto("/drafts");
  await expect(page.getByRole("button", { name: "Open draft" })).toHaveCount(2);
  await expect(
    page.getByText(/permanently removes every local recovery draft/),
  ).toBeVisible();

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain("cannot be undone");
    expect(dialog.message()).toContain("other tabs may save a new draft again");
    expect(dialog.message()).toContain("all 2 drafts");
    return dialog.accept();
  });
  await page.getByRole("searchbox", { name: "Search saved drafts" }).fill("one");
  await expect(page.getByText("1 of 2 drafts")).toBeVisible();
  await page.getByRole("button", { name: "Delete all drafts" }).click();
  await expect(page.getByText("Deleted 2 saved local drafts.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No saved drafts" }),
  ).toBeVisible();
});

test("saved drafts search and sorting keep stable actions attached to the correct draft", async ({
  page,
}) => {
  await page.goto("/drafts");
  await seedSyntheticDrafts(page, [
    {
      draftId: "smith-00123",
      patientId: "00123-A",
      dentist: "Synthetic Dentist",
      rdh: "Jane Smith",
      savedOffsetMinutes: 3,
    },
    {
      draftId: "recare-a10",
      templateId: "recare-exam",
      patientId: "A-10",
      rda: "Taylor RDA",
      savedOffsetMinutes: 1,
    },
    {
      draftId: "legacy-assistant",
      templateId: "legacy-template",
      patientId: "LEGACY-9",
      assistant: "Generic Assistant",
      rda: "Must not be inferred",
      savedOffsetMinutes: 2,
    },
  ]);
  await page.reload();

  const table = page.getByRole("table", { name: "Saved local drafts" });
  await expect(table).toBeVisible();
  const dataRows = table.getByRole("row").filter({ has: page.getByRole("button", { name: /Delete draft:/ }) });
  await expect(dataRows.nth(0)).toContainText("A-10");
  await expect(dataRows.nth(1)).toContainText("LEGACY-9");
  await expect(dataRows.nth(2)).toContainText("00123-A");

  const patientHeader = page.getByRole("columnheader", { name: /Sort by Patient ID/ });
  await patientHeader.getByRole("button").click();
  await expect(patientHeader).toHaveAttribute("aria-sort", "ascending");
  await expect(dataRows.nth(0)).toContainText("00123-A");
  await patientHeader.getByRole("button").click();
  await expect(patientHeader).toHaveAttribute("aria-sort", "descending");
  await expect(dataRows.nth(0)).toContainText("LEGACY-9");

  const search = page.getByRole("searchbox", { name: "Search saved drafts" });
  await search.fill("  smith   123 ");
  await expect(page.getByText("1 of 3 drafts")).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(2);
  await expect(page).toHaveURL(/\/drafts\/?$/);
  expect(
    await page.evaluate(() => ({
      local: Object.values(window.localStorage).some((value) =>
        value.includes("smith   123"),
      ),
      session: Object.values(window.sessionStorage).some((value) =>
        value.includes("smith   123"),
      ),
    })),
  ).toEqual({ local: false, session: false });

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Delete draft:.*00123-A/ }).click();
  const noMatchHeading = page.getByRole("heading", { name: "No saved drafts match your search." });
  await expect(noMatchHeading).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saved local drafts" })).toBeFocused();

  await page.getByRole("button", { name: "Clear search" }).last().click();
  await expect(search).toBeFocused();
  await expect(page.getByText("2 saved drafts")).toBeVisible();
  await expect(patientHeader).toHaveAttribute("aria-sort", "descending");
  await expect(page.getByText("Generic Assistant")).toHaveCount(0);
  await expect(page.getByText("Must not be inferred")).toHaveCount(0);
  const legacyRow = table.getByRole("row").filter({ hasText: "LEGACY-9" });
  await expect(legacyRow.getByText("—", { exact: true })).toHaveCount(3);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Delete draft:.*LEGACY-9/ }).click();
  await expect(page.getByRole("button", { name: /Delete draft:.*A-10/ })).toBeFocused();
});

test("saved drafts render one accessible responsive presentation without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/drafts");
  await seedSyntheticDrafts(page, [
    {
      draftId: "responsive-one",
      patientId: "RESP-001",
      dentist: "Synthetic Dentist With A Deliberately Long Display Name",
      rdh: "Synthetic RDH",
    },
  ]);
  await page.reload();

  await expect(page.getByRole("table", { name: "Saved local drafts" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Saved local drafts" })).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("table", { name: "Saved local drafts" })).toBeHidden();
  await expect(page.getByRole("list", { name: "Saved local drafts" })).toBeVisible();
  const mobileSort = page.getByRole("combobox", { name: "Sort by", exact: true });
  const mobileDirection = page.getByRole("combobox", { name: "Direction", exact: true });
  await expect(mobileSort.locator("option")).toHaveCount(6);
  await mobileSort.selectOption("dentist");
  await expect(mobileDirection).toHaveValue("ascending");

  const controlBoxes = await Promise.all([
    page.getByRole("searchbox", { name: "Search saved drafts" }).boundingBox(),
    mobileSort.boundingBox(),
    page.getByText("1 saved draft").boundingBox(),
  ]);
  expect(controlBoxes[0]?.y).toBeLessThan(controlBoxes[1]?.y ?? 0);
  expect(controlBoxes[1]?.y).toBeLessThan(controlBoxes[2]?.y ?? 0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);

  await page.getByRole("button", { name: "Theme" }).click();
  await page.getByRole("option", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
