import type { Page } from "@playwright/test";

export async function openGeneratedNote(page: Page) {
  const reviewButton = page.getByRole("button", { name: "Review note" });
  if (await reviewButton.isVisible()) await reviewButton.click();
}
