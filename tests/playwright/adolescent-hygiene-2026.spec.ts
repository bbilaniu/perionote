import { expect, test } from "@playwright/test";
import { openGeneratedNote } from "./helpers/interactiveTemplate";

const sourceUrl = "/templates/clinic/adolescent-hygiene-2026";
const interactiveUrl = `${sourceUrl}/interactive`;

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
