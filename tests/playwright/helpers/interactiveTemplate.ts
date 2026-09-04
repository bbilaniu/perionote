import type { Page } from "@playwright/test";

export async function openGeneratedNote(page: Page) {
  const drawer = page.getByRole("complementary", {
    name: "Generated note preview",
  });
  if (await drawer.isVisible()) return;

  const reviewButton = page.getByRole("button", { name: "Review note" });
  if (await reviewButton.isVisible()) await reviewButton.click();
}
