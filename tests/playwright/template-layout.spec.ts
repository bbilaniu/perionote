import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`standalone field labels stay separated from controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/templates/dental-hygiene-note-webform/");

    const label = page.locator('label[for="exam-date"]');
    const input = page.locator("#exam-date");
    await expect(label).toBeVisible();
    await expect(input).toBeVisible();

    const labelBox = await label.boundingBox();
    const inputBox = await input.boundingBox();
    expect(labelBox).not.toBeNull();
    expect(inputBox).not.toBeNull();
    expect(inputBox!.y - (labelBox!.y + labelBox!.height)).toBeGreaterThanOrEqual(8);
    expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(width);
  });

  test(`source template link stays separated from the interactive form at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/templates/clinic/recare-exam/interactive/");

    const sourceLink = page.getByRole("link", { name: /Original .* template/ });
    const form = page.locator("form");
    await expect(sourceLink).toBeVisible();
    await expect(form).toBeVisible();

    const linkBox = await sourceLink.boundingBox();
    const formBox = await form.boundingBox();
    expect(linkBox).not.toBeNull();
    expect(formBox).not.toBeNull();
    expect(formBox!.y - (linkBox!.y + linkBox!.height)).toBeGreaterThanOrEqual(20);
    expect(formBox!.x).toBeGreaterThanOrEqual(0);
    expect(formBox!.x + formBox!.width).toBeLessThanOrEqual(width);
  });
}
