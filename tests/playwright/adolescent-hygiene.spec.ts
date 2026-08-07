import { expect, test } from "@playwright/test";

const sourceUrl = "/templates/clinic/adolescent-hygiene";
const interactiveUrl = `${sourceUrl}/interactive`;

test("adolescent source links to its draft interactive conversion", async ({
  page,
}) => {
  await page.goto(sourceUrl);

  const interactiveLink = page.getByRole("link", {
    name: "Open interactive version · draft",
  });
  await expect(interactiveLink).toHaveAttribute("href", `${interactiveUrl}/`);
  await interactiveLink.click();

  await expect(page).toHaveURL(new RegExp(`${interactiveUrl}/?$`));
  const draftLabel = page.getByText("Draft interactive conversion", {
    exact: true,
  });
  await expect(draftLabel).toHaveClass(/text-violet-800/);
  const draftBanner = draftLabel.locator("xpath=ancestor::header[1]");
  await expect(draftBanner).toHaveClass(/border-violet-300/);
  await expect(draftBanner).toHaveClass(/bg-violet-50/);
});

test("adolescent synthetic demo generates and copies the mapped note", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(interactiveUrl);
  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  await expect(page.locator("#adolescent-hygiene-patient-id")).toHaveValue(
    "TEST-ADOLESCENT-001",
  );
  await page.locator("#adolescent-hygiene-plaque-choice").click();
  const plaqueOptions = page.getByRole("dialog", {
    name: "Plaque options",
    exact: true,
  });
  await expect(
    plaqueOptions
      .getByRole("group", {
        name: "Finding Plaque choices",
        exact: true,
      })
      .getByRole("checkbox", { name: "None", exact: true }),
  ).toBeVisible();
  await plaqueOptions.getByRole("button", { name: "Done" }).click();
  await page.locator("#adolescent-hygiene-calculus-choice").click();
  const calculusOptions = page.getByRole("dialog", {
    name: "Calculus options",
    exact: true,
  });
  await expect(
    calculusOptions
      .getByRole("group", {
        name: "Finding Calculus choices",
        exact: true,
      })
      .getByRole("checkbox", { name: "None", exact: true }),
  ).toBeVisible();
  await calculusOptions.getByRole("button", { name: "Done" }).click();
  await expect(
    page.getByLabel("Periodontal diagnosis category", { exact: true }),
  ).toHaveAttribute("data-value", "gingivitis");
  await expect(
    page.getByLabel("Health/Gingivitis classification", { exact: true }),
  ).toHaveAttribute("data-value", "gingivitis-intact");
  await expect(page.locator("#adolescent-hygiene-summary")).toHaveValue(
    /Treatment completed today: 2BW; Dentist Recall Exam; 0\.5U scale with hand and power instrumentation — full mouth; Selective polish — full mouth; OHE; FluoriMax 2\.5% NaF Varnish application — full mouth/,
  );
  await expect(page.locator("#adolescent-hygiene-summary")).toHaveValue(
    /Recall Interval: 6 MONTH RECALL\.[\s\S]*Hygiene Interval: 6-month scale\.[\s\S]*Next Visit: 6 MONTH SCALE\./,
  );

  const preview = await page
    .locator("#adolescent-hygiene-summary")
    .inputValue();
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(
    preview,
  );
});
