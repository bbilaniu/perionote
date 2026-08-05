import { expect, test } from "@playwright/test";
import { INTERACTIVE_DRAFT_STORAGE_PREFIX } from "@/lib/templates/localDrafts";

const adultHygieneUrl = "/templates/clinic/adult-hygiene-2021/interactive";
const recareExamUrl = "/templates/clinic/recare-exam/interactive";

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

test("saved drafts page opens and deletes a local draft without listing patient content", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(adultHygieneUrl);
  await page
    .locator("#adult-hygiene-patient-id")
    .fill("Synthetic private draft patient");
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
  await expect(page.locator("#adult-hygiene-rdh")).toHaveValue("");

  await page.goto("/drafts");
  await expect(
    page.getByRole("heading", { name: "Saved local drafts" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "2021 Adult Hygiene" }),
  ).toBeVisible();
  await expect(page.getByText("Synthetic private draft patient")).toHaveCount(
    0,
  );

  await page.getByRole("button", { name: "Open draft" }).click();
  await expect(page).toHaveURL(new RegExp(`${adultHygieneUrl}/?$`));
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue(
    "Synthetic private draft patient",
  );
  await expect(page.locator("#adult-hygiene-rdh")).toHaveValue(
    "Synthetic Draft RDH",
  );

  await page.goto("/drafts");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete draft" }).click();
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
    return dialog.accept();
  });
  await page.getByRole("button", { name: "Delete all drafts" }).click();
  await expect(page.getByText("Deleted 2 saved local drafts.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No saved drafts" }),
  ).toBeVisible();
});
