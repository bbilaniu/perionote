import { expect, test } from "@playwright/test";
import { openGeneratedNote } from "./helpers/interactiveTemplate";

const sourceUrl = "/templates/clinic/adolescent-hygiene-2026";
const interactiveUrl = `${sourceUrl}/interactive`;

for (const width of [1600, 390]) {
  test(`2026 adolescent shares its encounter between entry modes at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(interactiveUrl);
    const entryMode = page.getByRole("group", { name: "Entry mode", exact: true });
    const detailed = entryMode.getByRole("radio", { name: "Detailed", exact: true });
    const rapidEntry = entryMode.getByRole("radio", { name: "Rapid Entry", exact: true });
    await expect(detailed).toBeChecked();
    await page.getByRole("button", { name: "Load synthetic demo" }).click();
    const summary = page.locator("#adult-hygiene-summary");
    const detailedNote = await summary.inputValue();

    await rapidEntry.check();
    const rapid = page.getByTestId("rapid-entry");
    await expect(rapid).toBeVisible();
    await expect(summary).toHaveValue(detailedNote);
    await expect(rapid.getByText(
      "EOE and IOE are included in Combined and Dentist notes.",
      { exact: true },
    )).toBeVisible();
    const notes = page.getByRole("textbox", { name: "CAMBRA123 notes", exact: true });
    await expect(notes).toBeVisible();
    await notes.fill("Synthetic adolescent counseling rationale");
    await rapid.getByRole("textbox", { name: "Communication details", exact: true })
      .fill("Synthetic home-care discussion with guardian");
    await rapid.getByRole("group", { name: "Brushing frequency", exact: true })
      .getByRole("radio", { name: "Brushing 2x/day", exact: true }).check();
    const rapidNote = await summary.inputValue();
    expect(rapidNote).toContain("Synthetic adolescent counseling rationale");
    expect(rapidNote).toContain("Synthetic home-care discussion with guardian");

    await detailed.check();
    await expect(rapid).toHaveCount(0);
    await expect(notes).toHaveValue("Synthetic adolescent counseling rationale");
    await expect(page.getByRole("textbox", { name: "Communication details", exact: true }))
      .toHaveValue("Synthetic home-care discussion with guardian");
    await expect(page.getByRole("combobox", { name: "Brushing frequency", exact: true }))
      .toHaveValue("Brushing 2x/day");
    await expect(summary).toHaveValue(rapidNote);
    await rapidEntry.check();
    await expect(summary).toHaveValue(rapidNote);
    await entryMode.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`adolescent-rapid-${width}.png`) });

    await openGeneratedNote(page);
    await page.getByRole("radio", { name: "Dentist", exact: true }).check();
    await expect(summary).toHaveValue(/EOE:/);
    await expect(summary).not.toHaveValue(/Treatment completed today:/);
    await page.getByRole("radio", { name: "Hygienist", exact: true }).check();
    await expect(summary).not.toHaveValue(/EOE:/);
    await expect(summary).toHaveValue(/Treatment completed today:/);
    await expect(summary).toHaveValue(/Synthetic home-care discussion with guardian/);
    await page.getByRole("radio", { name: "Combined", exact: true }).check();
    await expect(summary).toHaveValue(rapidNote);
  });
}

test("2026 adolescent remembers entry mode and draft independently of adult hygiene", async ({ page }) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");
  await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
  await page.getByRole("radio", { name: "Detailed", exact: true }).check();
  await page.goto(interactiveUrl);
  await expect(page.getByRole("radio", { name: "Detailed", exact: true })).toBeChecked();
  await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
  await page.getByRole("textbox", { name: "Patient ID", exact: true }).fill("SYNTHETIC-ADOLESCENT-RAPID");
  await page.getByRole("textbox", { name: "CAMBRA123 notes", exact: true }).fill("Synthetic adolescent draft rationale");
  const draftPrefix = "hygienenote.interactive-draft.v1.";
  await expect.poll(() => page.evaluate((prefix) =>
    Object.keys(localStorage).filter((key) => key.startsWith(prefix))
      .map((key) => localStorage.getItem(key)).join(""), draftPrefix),
  { timeout: 15000 }).toContain("Synthetic adolescent draft rationale");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Rapid Entry", exact: true })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Patient ID", exact: true }))
    .toHaveValue("SYNTHETIC-ADOLESCENT-RAPID");
  await expect(page.getByRole("textbox", { name: "CAMBRA123 notes", exact: true }))
    .toHaveValue("Synthetic adolescent draft rationale");
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");
  await expect(page.getByRole("radio", { name: "Detailed", exact: true })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Patient ID", exact: true })).toHaveValue("");
  await expect(page.getByRole("textbox", { name: "CAMBRA123 notes", exact: true })).toHaveValue("");
});

test("2026 adolescent is a separate unified encounter", async ({ page }) => {
  await page.goto(interactiveUrl);

  await expect(
    page.getByRole("heading", { name: "2026 Adolescent Hygiene", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Records", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Patient Concerns and Hygiene Findings",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Radiographs taken today", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "EOE", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "IOE", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Teeth and Odontogram", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Communication with Parent or Legal Guardian",
      exact: true,
    }),
  ).toBeVisible();

  await openGeneratedNote(page);
  const output = page.getByRole("group", { name: "Note output" });
  await expect(output.getByText("Combined", { exact: true })).toBeVisible();
  await expect(output.getByText("Dentist", { exact: true })).toBeVisible();
  await expect(output.getByText("Hygienist", { exact: true })).toBeVisible();
});

test("2026 adolescent projects dentist and hygienist notes from one record", async ({
  page,
}) => {
  await page.goto(interactiveUrl);
  await page.getByRole("button", { name: "Load synthetic demo" }).click();
  await openGeneratedNote(page);

  const summary = page.locator("#adult-hygiene-summary");
  await expect(summary).toHaveValue(/EOE:/);
  await expect(summary).toHaveValue(/Treatment completed today:/);

  await page.getByRole("radio", { name: "Dentist", exact: true }).click();
  await expect(summary).toHaveValue(/EOE:/);
  await expect(summary).not.toHaveValue(/Treatment completed today:/);

  await page.getByRole("radio", { name: "Hygienist", exact: true }).click();
  await expect(summary).not.toHaveValue(/EOE:/);
  await expect(summary).toHaveValue(/Treatment completed today:/);
  await expect(summary).toHaveValue(
    /Information relayed to parent or legal guardian: Yes/,
  );
});
