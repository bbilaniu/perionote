import { expect, test } from "@playwright/test";

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test("BP location information supports touch and a new encounter starts blank", async ({ page }, testInfo) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");
  await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
  const vitals = page.getByRole("group", { name: "Vitals Readings", exact: true });
  await vitals.getByRole("button", { name: "Add reading", exact: true }).tap();
  await vitals.getByRole("button", { name: "Upper arm artery information" }).tap();
  await expect(vitals.getByRole("tooltip", { name: "Brachial artery" })).toBeVisible();
  await vitals.screenshot({ path: testInfo.outputPath("bp-location-touch.png") });
  await expect(vitals.getByRole("button", { pressed: true })).toHaveCount(0);
  await vitals.getByRole("button", { name: "Right (R)", exact: true }).tap();
  await expect(vitals.getByRole("tooltip", { name: "Brachial artery" })).toBeHidden();
  await vitals.getByRole("button", { name: "Upper arm", exact: true }).tap();
  await expect(vitals.getByRole("button", { name: "Upper arm", exact: true })).toHaveAttribute("aria-pressed", "true");
  await vitals.getByRole("button", { name: "Upper arm", exact: true }).tap();
  await expect(vitals.getByRole("button", { name: "Upper arm", exact: true })).toHaveAttribute("aria-pressed", "false");
  await vitals.getByRole("button", { name: "Upper arm", exact: true }).tap();
  await vitals.getByLabel("Systolic", { exact: true }).fill("120");
  await vitals.getByLabel("Diastolic", { exact: true }).fill("80");

  await page.getByRole("button", { name: "New / clear form", exact: true }).tap();
  await page.getByRole("button", { name: "Save draft & start new", exact: true }).tap();
  await expect(vitals.getByLabel("Systolic", { exact: true })).toHaveCount(0);
  await vitals.getByRole("button", { name: "Add reading", exact: true }).tap();
  await expect(vitals.getByRole("button", { pressed: true })).toHaveCount(0);
  await expect(vitals.getByLabel("Systolic", { exact: true })).toHaveValue("");
  await expect(vitals.getByLabel("Diastolic", { exact: true })).toHaveValue("");
});
