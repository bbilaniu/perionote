import { expect, test, type Page } from "@playwright/test";

const clinical = [
  "adult-hygiene-2026",
  "adolescent-hygiene-2026",
  "adult-hygiene-2021",
  "adolescent-hygiene",
  "child-recare-exam-hygiene-notes",
  "recare-exam",
];
const standalone = [
  "dental-hygiene-note-webform",
  "short-dental-hygien-note",
  "very-short-template",
  "gingival-description",
];
const cases = [
  ...clinical.map((slug) => ({
    slug,
    url: `/templates/clinic/${slug}/interactive`,
    drafts: true,
    rapid: false,
  })),
  {
    slug: "adult-rapid",
    url: "/templates/clinic/adult-hygiene-2026/interactive",
    drafts: true,
    rapid: true,
  },
  ...standalone.map((slug) => ({
    slug,
    url: `/templates/${slug}`,
    drafts: false,
    rapid: false,
  })),
];
const choices = (page: Page, label: string) =>
  page.getByRole("group", { name: label, exact: true });

for (const scenario of cases) {
  test(`${scenario.slug} records multiple methods, preserves them and clears them`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(scenario.url);
    if (scenario.rapid)
      await page
        .getByRole("radio", { name: "Rapid Entry", exact: true })
        .check();
    if (scenario.drafts)
      await page
        .getByRole("textbox", { name: "Patient ID", exact: true })
        .fill("SYNTHETIC-METHODS-001");
    const toothbrush = choices(page, "Type of toothbrush used");
    const floss = choices(page, "Type of flossing used");
    const summary = page.locator("textarea[readonly]").first();
    await expect(toothbrush).toBeVisible();
    await expect(floss).toBeVisible();
    await expect(summary).not.toHaveValue(
      /Toothbrush type used:|Flossing type used:/,
    );
    for (const name of ["Electric", "Manual"])
      await toothbrush.getByRole("checkbox", { name, exact: true }).check();
    for (const name of ["String floss", "Water flosser", "Interdental picks"])
      await floss.getByRole("checkbox", { name, exact: true }).check();
    await expect(summary).toHaveValue(
      /Toothbrush type used: Electric; Manual\./,
    );
    await expect(summary).toHaveValue(
      /Flossing type used: String floss; Water flosser; Interdental picks\./,
    );

    if (scenario.rapid) {
      await page.getByRole("radio", { name: "Detailed", exact: true }).check();
      await expect(
        toothbrush.getByRole("checkbox", { name: "Electric", exact: true }),
      ).toBeChecked();
      await expect(
        floss.getByRole("checkbox", { name: "Water flosser", exact: true }),
      ).toBeChecked();
      await page
        .getByRole("radio", { name: "Rapid Entry", exact: true })
        .check();
    }
    if (scenario.drafts) {
      await page.reload();
      await expect(
        toothbrush.getByRole("checkbox", { name: "Manual", exact: true }),
      ).toBeChecked();
      await expect(
        floss.getByRole("checkbox", { name: "Interdental picks", exact: true }),
      ).toBeChecked();
      await expect(summary).toHaveValue(
        /Toothbrush type used: Electric; Manual\./,
      );
    }
    if (
      [
        "adult-rapid",
        "very-short-template",
        "child-recare-exam-hygiene-notes",
      ].includes(scenario.slug)
    ) {
      await toothbrush
        .locator("..")
        .locator("..")
        .screenshot({
          path: testInfo.outputPath(`${scenario.slug}-methods-desktop.png`),
        });
    }
    for (const name of ["Electric", "Manual"])
      await toothbrush.getByRole("checkbox", { name, exact: true }).uncheck();
    for (const name of ["String floss", "Water flosser", "Interdental picks"])
      await floss.getByRole("checkbox", { name, exact: true }).uncheck();
    await expect(summary).not.toHaveValue(
      /Toothbrush type used:|Flossing type used:/,
    );

    if (scenario.drafts) {
      // Simulate the older stored encounter shape before the app hydrates.
      await page.addInitScript(() => {
        for (const key of Object.keys(localStorage)) {
          if (!key.startsWith("hygienenote.interactive-draft.v1.")) continue;
          const draft = JSON.parse(localStorage.getItem(key)!);
          delete draft.form.toothbrushTypes;
          delete draft.form.flossingTypes;
          localStorage.setItem(key, JSON.stringify(draft));
        }
      });
      await page.reload();
      await expect(
        page.getByRole("textbox", { name: "Patient ID", exact: true }),
      ).toHaveValue("SYNTHETIC-METHODS-001");
      await expect(
        toothbrush.getByRole("checkbox", { name: "Electric", exact: true }),
      ).not.toBeChecked();
      await expect(summary).not.toHaveValue(
        /Toothbrush type used:|Flossing type used:/,
      );
    }
  });
}

test("Rapid Entry method choices wrap on mobile and are keyboard selectable", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");
  await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
  const electric = choices(page, "Type of toothbrush used").getByRole(
    "checkbox",
    { name: "Electric", exact: true },
  );
  await electric.focus();
  await electric.press("Space");
  await expect(electric).toBeChecked();
  await choices(page, "Type of flossing used")
    .getByRole("checkbox", { name: "Water flosser", exact: true })
    .check();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("region", { name: "Oral Hygiene", exact: true })
    .screenshot({ path: testInfo.outputPath("methods-mobile.png") });
});
