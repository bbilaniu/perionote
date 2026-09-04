import type { Page } from "@playwright/test";

export async function openGeneratedNote(page: Page) {
  const drawer = page.getByRole("complementary", {
    name: "Generated note preview",
  });
  if (await drawer.isVisible()) return;

  const reviewButton = page.getByRole("button", { name: "Review note" });
  if (await reviewButton.isVisible()) await reviewButton.click();
}

export async function openFormActionDialog(page: Page) {
  await page.getByRole("button", { name: "New / clear form" }).click();
  return page.getByRole("dialog", { name: "New or clear form?" });
}

export async function saveDraftAndStartNew(page: Page) {
  const dialog = await openFormActionDialog(page);
  await dialog
    .getByRole("button", { name: "Save draft & start new" })
    .click();
}

export async function clearCurrentForm(page: Page) {
  const dialog = await openFormActionDialog(page);
  await dialog.getByRole("button", { name: "Clear current form" }).click();
}
