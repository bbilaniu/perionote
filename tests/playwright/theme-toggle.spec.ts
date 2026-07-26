import { expect, test } from "@playwright/test";

const themeStorageKey = "hygienenote-theme";

test("theme listbox persists explicit choices and follows system changes", async ({
  page,
}) => {
  await page.goto("/templates/clinic");

  const theme = page.getByRole("button", { name: "Theme" });
  await expect(theme).toHaveAttribute("data-value", "system");
  await expect(page.locator("select[aria-label='Theme']")).toHaveCount(0);

  await theme.click();
  await page.getByRole("option", { name: "Dark", exact: true }).click();
  await expect(theme).toHaveAttribute("data-value", "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect
    .poll(() =>
      page.evaluate((storageKey) => localStorage.getItem(storageKey), themeStorageKey),
    )
    .toBe("dark");

  await page.reload();
  await expect(theme).toHaveAttribute("data-value", "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);

  await theme.focus();
  await theme.press("ArrowDown");
  const options = page.getByRole("listbox", { name: "Theme options" });
  await expect(options).toBeFocused();
  await options.press("Home");
  await options.press("Enter");
  await expect(theme).toHaveAttribute("data-value", "light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  await theme.click();
  await page.getByRole("option", { name: "System", exact: true }).click();
  await expect(theme).toHaveAttribute("data-value", "system");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("compact theme listbox remains within the narrow header and supports touch", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/templates/clinic");

  const header = page.getByRole("banner");
  const theme = page.getByRole("button", { name: "Theme" });
  await theme.tap();
  const options = page.getByRole("listbox", { name: "Theme options" });
  await expect(options).toBeVisible();

  const headerBox = await header.boundingBox();
  const triggerBox = await theme.boundingBox();
  const optionsBox = await options.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  expect(optionsBox).not.toBeNull();
  expect(headerBox?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((headerBox?.x ?? 0) + (headerBox?.width ?? 0)).toBeLessThanOrEqual(390);
  expect((triggerBox?.x ?? 0) + (triggerBox?.width ?? 0)).toBeLessThanOrEqual(
    390,
  );
  expect((optionsBox?.x ?? 0) + (optionsBox?.width ?? 0)).toBeLessThanOrEqual(
    390,
  );
  expect(await header.evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(
    await header.evaluate((element) => element.clientWidth),
  );

  await page.getByRole("option", { name: "Dark", exact: true }).tap();
  await expect(theme).toHaveAttribute("data-value", "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);

  await context.close();
});
