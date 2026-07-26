import { expect, test, type Page } from "@playwright/test";

const adultHygieneUrl =
  "/templates/clinic/adult-hygiene-2021/interactive";

async function reloadDiscardingForm(page: Page) {
  const dialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page.reload();
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
  await reloadPromise;
}

test("Adult Hygiene draft pill matches the purple draft notice", async ({
  page,
}) => {
  await page.goto("/templates/clinic");
  const draftPill = page.getByText("Interactive · draft", { exact: true });
  await expect(draftPill).toHaveClass(/bg-violet-100/);
  await expect(draftPill).toHaveClass(/text-violet-900/);
  await expect(
    page.getByText("Interactive · pilot", { exact: true }),
  ).toHaveClass(/bg-amber-100/);
});

test("Adult Hygiene enforces copy requirements and supports independent consent sources", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.install({ time: new Date(2026, 6, 25, 9, 10) });
  await page.goto(adultHygieneUrl);

  await expect(
    page.getByRole("link", {
      name: "Original 2021 Adult Hygiene template",
    }),
  ).toHaveAttribute("href", "/templates/clinic/adult-hygiene-2021/");
  await expect(
    page.getByText("Draft interactive conversion", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-note-started")).toHaveValue(
    "2026-07-25 09:10",
  );

  await page.evaluate(() => navigator.clipboard.writeText("sentinel"));
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Enter a Patient ID.")).toBeVisible();
  await expect(
    page.getByText("Enter at least one of Dentist, RDH, or RDA."),
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-patient-id")).toBeFocused();

  await page.locator("#adult-hygiene-patient-id").fill("TEST-AH-3003");
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.locator("#adult-hygiene-dentist")).toBeFocused();
  await expect(
    page.evaluate(() => navigator.clipboard.readText()),
  ).resolves.toBe("sentinel");

  await page.locator("#adult-hygiene-rdh").fill("Example RDH");
  await page.getByLabel("Patient", { exact: true }).check();
  await page.getByLabel("Parent", { exact: true }).check();
  await page
    .locator("#adult-hygiene-plaque-choice")
    .selectOption("Localized moderate interproximal");
  await page
    .locator("#adult-hygiene-calculus-other")
    .fill("Imported calculus wording");
  const ohiAids = page.locator("#adult-hygiene-ohi-aids");
  await ohiAids.fill("Synthetic interdental aid");
  await ohiAids.press("Enter");

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Informed verbal consent given by PATIENT and PARENT for treatment today\./,
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Plaque: Localized moderate interproximal\.[\s\S]*Calculus: Imported calculus wording\./,
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /OH Aids Reviewed\/Recommended: Synthetic interdental aid/,
  );

  const preview = await page.locator("#adult-hygiene-summary").inputValue();
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => navigator.clipboard.readText()),
  ).resolves.toBe(preview);
});

test("Adult Hygiene demo output resets and does not survive reload", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(2026, 6, 25, 9, 10) });
  await page.goto(adultHygieneUrl);
  await page.getByRole("button", { name: "Load synthetic demo" }).click();

  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue(
    "TEST-AH-1001",
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /PSR\/Pocketing: 1 2 2 \/ 2 1 2/,
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Treatment completed today: Synthetic scaling; Synthetic polishing/,
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Recommended Recall Interval: 6-month recall\./,
  );

  await reloadDiscardingForm(page);
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /^NOTE STARTED: 2026-07-25 09:10$/,
  );

  await page.getByRole("button", { name: "Load synthetic demo" }).click();
  await page.clock.setSystemTime(new Date(2026, 6, 25, 10, 25));
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear all entered 2021 Adult Hygiene values and start a new note?",
    );
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-note-started")).toHaveValue(
    "2026-07-25 10:25",
  );
});

test("Adult Hygiene catalogue values persist while encounter selections do not", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  const medicalHistory = page.getByRole("combobox", {
    name: "Medical history reviewed",
  });
  await medicalHistory.focus();
  for (const label of [
    "YES- NO CHANGES",
    "YES- NP- CLEARED, NO CONTRAINDICATIONS TO TX",
    "YES- UPDATED, BUT NO CONTRAINDICATIONS TO TX",
    "YES- UPDATED MEDS",
  ]) {
    await expect(
      page.getByRole("option", {
        name: `${label} Starter`,
        exact: true,
      }),
    ).toBeVisible();
  }

  for (const [controlId, starter] of [
    [
      "#adult-hygiene-fmp-done",
      "YES, ALL FINDINGS DISCUSSED WITH PATIENT",
    ],
    [
      "#adult-hygiene-health-gingivitis",
      "HEALTH INTACT PERIODONTAL SUPPORT",
    ],
    ["#adult-hygiene-ohi-aids", "SULCABRUSH"],
    [
      "#adult-hygiene-treatment-completed",
      "1U scale (cavitron and hand scaling)",
    ],
    ["#adult-hygiene-desensitizer", "PREVIDENT FL"],
    ["#adult-hygiene-next-visit", "FOLLOW-UP HYGIENE"],
  ]) {
    await page.locator(controlId).focus();
    await expect(
      page.getByRole("option", {
        name: `${starter} Starter`,
        exact: true,
      }),
    ).toBeVisible();
  }

  const anesthetic = page.locator("#adult-hygiene-anesthetic");
  await anesthetic.focus();
  await expect(anesthetic).toHaveAttribute("aria-expanded", "false");

  await medicalHistory.fill("Synthetic reusable history phrase");
  await page.getByRole("button", { name: "Remember this value" }).click();

  const ohiAids = page.locator("#adult-hygiene-ohi-aids");
  const ohiControl = ohiAids.locator("xpath=../..");
  await ohiAids.fill("Synthetic reusable OHI aid");
  await ohiControl.getByRole("button", { name: "Remember and add" }).click();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /OH Aids Reviewed\/Recommended: Synthetic reusable OHI aid/,
  );

  await reloadDiscardingForm(page);
  await expect(medicalHistory).toHaveValue("");
  await medicalHistory.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable history phrase Local/,
    }),
  ).toBeVisible();

  await expect(
    page.getByText("Synthetic reusable OHI aid", { exact: true }),
  ).toHaveCount(0);
  await ohiAids.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable OHI aid Local/,
    }),
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Synthetic reusable/,
  );
});

test("Adult Hygiene supports position-preserving partial PSR output", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  await page.locator("#adult-hygiene-psr-1").fill("1");
  await page.locator("#adult-hygiene-psr-3").fill("3");
  await page.locator("#adult-hygiene-psr-5").fill("2");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /PSR\/Pocketing: 1 _ 3 \/ _ 2 _/,
  );
});
