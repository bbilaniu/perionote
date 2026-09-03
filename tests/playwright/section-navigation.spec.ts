import { expect, test } from "@playwright/test";

const interactiveTemplates = [
  {
    url: "/templates/clinic/child-recare-exam-hygiene-notes/interactive",
    section: "Records and dental exam",
  },
  {
    url: "/templates/clinic/adolescent-hygiene/interactive",
    section: "Hygiene Findings",
  },
  {
    url: "/templates/clinic/adolescent-hygiene-2026/interactive",
    section: "Communication with Parent or Legal Guardian",
  },
  {
    url: "/templates/clinic/adult-hygiene-2021/interactive",
    section: "Periodontal Assessment",
  },
  {
    url: "/templates/clinic/adult-hygiene-2026/interactive",
    section: "Teeth and Odontogram",
  },
  {
    url: "/templates/clinic/recare-exam/interactive",
    section: "Clinical Exam",
  },
  {
    url: "/templates/dental-hygiene-note-webform",
    section: "Gingival Description",
  },
  {
    url: "/templates/short-dental-hygien-note",
    section: "Recommendations",
  },
  {
    url: "/templates/very-short-template",
    section: "Local Anesthesia",
  },
] as const;

test("each interactive template exposes section navigation", async ({
  page,
}) => {
  for (const template of interactiveTemplates) {
    await page.goto(template.url);

    const navigation = page.getByRole("navigation", {
      name: "Form sections",
    });
    await expect(navigation).toBeVisible();
    await expect(
      navigation.getByRole("link", { name: template.section, exact: true })
    ).toBeVisible();
  }
});

test("section links update the URL and active location", async ({ page }) => {
  await page.goto("/templates/clinic/recare-exam/interactive");

  const navigation = page.getByRole("navigation", { name: "Form sections" });
  const clinicalExamLink = navigation.getByRole("link", {
    name: "Clinical Exam",
    exact: true,
  });
  await page
    .locator("#template-section-clinical-exam")
    .evaluate((section) => section.scrollIntoView({ block: "start" }));
  await expect(clinicalExamLink).toHaveAttribute("aria-current", "location");

  const treatmentLink = navigation.getByRole("link", {
    name: "Treatment and Next Visit",
    exact: true,
  });
  await treatmentLink.click();

  await expect(page).toHaveURL(/#template-section-treatment-and-next-visit$/);
  await expect(treatmentLink).toHaveAttribute("aria-current", "location");
  await expect(
    page.locator("#template-section-treatment-and-next-visit")
  ).toBeInViewport();
});

test("navigation expands a collapsed very-short-template section", async ({
  page,
}) => {
  await page.goto("/templates/very-short-template");

  const localAnesthesia = page.locator("#template-section-localAnesthesia");
  await expect(
    localAnesthesia.locator("#template-section-localAnesthesia-content")
  ).toHaveAttribute("aria-hidden", "true");

  await page
    .getByRole("navigation", { name: "Form sections" })
    .getByRole("link", { name: "Local Anesthesia", exact: true })
    .click();

  await expect(
    localAnesthesia.locator("#template-section-localAnesthesia-content")
  ).toHaveAttribute("aria-hidden", "false");
  await expect(page).toHaveURL(/#template-section-localAnesthesia$/);
});

test("compact section navigation stays within the page viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  await expect(
    page.getByRole("navigation", { name: "Form sections" })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    )
  ).toBe(true);

  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect
    .poll(() =>
      page
        .getByRole("navigation", { name: "Form sections" })
        .evaluate((navigation) => navigation.getBoundingClientRect().top)
    )
    .toBeLessThanOrEqual(9);
});
