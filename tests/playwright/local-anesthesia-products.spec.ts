import { expect, test } from "@playwright/test";

const cetacaine = "Cetacaine® liquid (benzocaine 14%, butamben 2%, tetracaine HCl 2%)";
const oraqix = "ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5%";

for (const [template, mode] of [
  ["adult-hygiene-2026", "Detailed"],
  ["adult-hygiene-2026", "Rapid Entry"],
  ["adolescent-hygiene-2026", "Rapid Entry"],
] as const) {
  test(`${template} ${mode} records Cetacaine as topical with an explicit amount`, async ({ page }, testInfo) => {
    await page.goto(`/templates/clinic/${template}/interactive`);
    await page.getByRole("radio", { name: mode, exact: true }).check();
    if (mode === "Rapid Entry") {
      await page.locator("summary").filter({ hasText: /^Local anesthesia$/ }).click();
    }
    const anesthesia = page.getByRole("group", { name: "Local anesthesia", exact: true });
    await anesthesia.getByRole("button", { name: "Add topical entry", exact: true }).click();
    const entry = anesthesia.getByRole("list", { name: "Local anesthesia entries", exact: true })
      .locator(":scope > li").first();
    const product = entry.getByRole("button", { name: "Anesthetic product", exact: true });
    const amount = entry.getByRole("spinbutton", { name: "Amount (mL)", exact: true });
    await product.click();
    await entry.getByRole("option", { name: oraqix, exact: true }).click();
    await expect(amount).toHaveValue("1.7");
    await product.click();
    await entry.getByRole("option", { name: cetacaine, exact: true }).click();
    await expect(amount).toHaveValue("");
    await entry.getByRole("button", { name: "Application type", exact: true }).click();
    await entry.getByRole("option", { name: "Sulcular application", exact: true }).click();
    await entry.getByRole("button", { name: "Tooth/area", exact: true }).click();
    await entry.getByText("Q1", { exact: true }).click();
    await expect(entry.getByRole("checkbox", { name: "Q1", exact: true })).toBeChecked();
    await entry.getByRole("button", { name: "Done", exact: true }).click();
    const summary = page.locator("#adult-hygiene-summary");
    await expect(summary).not.toHaveValue(/Cetacaine/);
    await amount.fill("0.05");
    expect(await amount.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(true);
    await expect.poll(() => summary.inputValue()).toContain(`Sulcular application — Q1: ${cetacaine} 0.05 ml`);
    expect(await summary.inputValue()).toContain(`Total: ${cetacaine} 0.05 ml`);
    await entry.screenshot({ path: testInfo.outputPath("cetacaine-topical.png") });

    for (const route of ["injection", "rinse"]) {
      await anesthesia.getByRole("button", { name: `Add ${route} entry`, exact: true }).click();
      const otherEntry = anesthesia.getByRole("list", { name: "Local anesthesia entries", exact: true })
        .locator(":scope > li").last();
      await otherEntry.getByRole("button", { name: "Anesthetic product", exact: true }).click();
      const productOptions = otherEntry.getByRole("listbox", { name: "Anesthetic product options", exact: true });
      await expect(productOptions).toBeVisible();
      await expect(otherEntry.getByRole("option", { name: cetacaine, exact: true })).toHaveCount(0);
      await productOptions.press("Escape");
    }
    await amount.fill("");
    await expect(summary).not.toHaveValue(/Cetacaine/);
  });
}

test("imported webform offers Cetacaine without carrying over an Oraqix amount", async ({ page }) => {
  await page.goto("/templates/very-short-template");
  await page.getByRole("button", { name: "Expand all sections" }).click();
  await page.getByRole("checkbox", { name: "No C/I to LA" }).check();
  await page.getByRole("button", { name: "Add topical entry" }).click();
  const entry = page.locator("#local-anesthesia-entry-0");
  const product = entry.getByRole("combobox").nth(2);
  const amount = entry.locator('input:not([id^="local-anesthesia-time-"])');
  await product.selectOption(oraqix);
  await expect(amount).toHaveValue("1.7");
  await product.selectOption(cetacaine);
  await expect(amount).toHaveValue("");
  await entry.getByRole("combobox").nth(1).selectOption("Sulcular application");
  await entry.getByRole("button", { name: "Q1", exact: true }).click();
  await amount.fill("0.05");
  const summary = page.locator("textarea[readonly]");
  await expect(summary).toHaveValue(/Cetacaine/);
  expect(await summary.inputValue()).toContain(`Total: ${cetacaine} 0.05 ml`);
});
