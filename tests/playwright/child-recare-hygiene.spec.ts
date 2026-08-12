import { expect, test } from "@playwright/test";

const sourceUrl = "/templates/clinic/child-recare-exam-hygiene-notes";
const interactiveUrl = `${sourceUrl}/interactive`;

test("child recare draft is discoverable from its source template", async ({
  page,
}) => {
  await page.goto(sourceUrl);

  const interactiveLink = page.getByRole("link", {
    name: "Open interactive version · draft",
  });
  await expect(interactiveLink).toHaveAttribute("href", `${interactiveUrl}/`);
  await interactiveLink.click();

  await expect(page).toHaveURL(new RegExp(`${interactiveUrl}/?$`));
  await expect(
    page.getByRole("heading", {
      name: "Child Recare Exam & Hygiene Notes",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('header[data-template-lifecycle="draft"]')).toContainText(
    "Draft interactive conversion",
  );
});

test("child recare demo generates audience-specific notes", async ({ page }) => {
  await page.goto(interactiveUrl);
  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  await expect(page.locator("#child-recare-patient-id")).toHaveValue(
    "TEST-CHILD-1001",
  );
  const preview = page.locator("#child-recare-summary");
  await expect(preview).toHaveValue(/DENTAL EXAM[\s\S]*HYGIENE/);
  await expect(preview).toHaveValue(/Overjet: 2 mm\./);
  await expect(preview).toHaveValue(/Scaling: Yes — 0\.5 units\./);

  await page.getByRole("radio", { name: "Dentist", exact: true }).check();
  await expect(preview).toHaveValue(/DENTAL EXAM/);
  await expect(preview).not.toHaveValue(/HYGIENE/);
  await expect(preview).toHaveValue(/Recall interval: 6-month recall\./);
  await expect(preview).not.toHaveValue(/Hygiene interval:/);

  await page.getByRole("radio", { name: "Hygienist", exact: true }).check();
  await expect(preview).toHaveValue(/HYGIENE/);
  await expect(preview).not.toHaveValue(/DENTAL EXAM/);
  await expect(preview).toHaveValue(/Hygiene interval: 6-month scale\./);
  await expect(preview).not.toHaveValue(/Recall interval:/);
});
