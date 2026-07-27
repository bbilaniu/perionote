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

test("Adult Hygiene pilot pill matches the amber pilot notice", async ({
  page,
}) => {
  await page.goto("/templates/clinic");
  const pilotPills = page.getByText("Interactive · pilot", { exact: true });
  await expect(pilotPills).toHaveCount(2);
  await expect(pilotPills.first()).toHaveClass(/bg-amber-100/);
  await expect(pilotPills.first()).toHaveClass(/text-amber-900/);
});

test("interactive Generated Note cards match the form card background", async ({
  page,
}) => {
  for (const url of [
    adultHygieneUrl,
    "/templates/clinic/recare-exam/interactive",
  ]) {
    await page.goto(url);
    const generatedNoteCard = page
      .getByRole("heading", { name: "Generated Note", exact: true })
      .locator("xpath=ancestor::section[1]");
    await expect(generatedNoteCard).toHaveClass(/bg-white/);
    await expect(generatedNoteCard).toHaveClass(/dark:bg-slate-900/);
  }
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
    page.getByText("Pilot interactive conversion", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#adult-hygiene-note-started")).toHaveValue(
    "2026-07-25 09:10",
  );
  const consentHistorySection = page
    .getByRole("heading", {
      name: "Consent, Medical History, and Sterilization",
      exact: true,
    })
    .locator("xpath=ancestor::section[1]");
  await expect(
    consentHistorySection
      .locator('input, button[data-list-control="fixed-listbox"]')
      .evaluateAll((controls) => controls.map((control) => control.id)),
  ).resolves.toEqual([
    "adult-hygiene-class5",
    "adult-hygiene-miele-codes",
    "adult-hygiene-consent-patient",
    "adult-hygiene-consent-parent",
    "adult-hygiene-consent-guardian",
    "adult-hygiene-medical-history",
    "adult-hygiene-premedication",
  ]);

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
  await page.locator("#adult-hygiene-plaque-choice").click();
  await page
    .getByRole("option", {
      name: "Localized moderate interproximal",
      exact: true,
    })
    .click();
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
    /Treatment completed today: Synthetic scaling — full mouth; Synthetic polishing — maxilla/,
  );
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Recommended Recall Interval: 6-month recall\./,
  );

  await reloadDiscardingForm(page);
  await expect(page.locator("#adult-hygiene-patient-id")).toHaveValue("");
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /^----- July 25, 2026 9:10:00 AM -----\nPATIENT ID:\nDENTIST:\nRDA:\nRDH:$/,
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
    ["#adult-hygiene-compliance", "Good"],
    ["#adult-hygiene-ohi-aids", "SULCABRUSH"],
    ["#adult-hygiene-desensitizer", "PREVIDENT FL"],
    ["#adult-hygiene-recall-interval", "6-month recall"],
    ["#adult-hygiene-hygiene-interval", "4-month scale"],
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

  await page
    .getByRole("button", { name: "Add treatment completed", exact: true })
    .click();
  const completedValues = page.getByRole("list", {
    name: "Treatment completed today entries",
  });
  const completedRow = completedValues.locator(":scope > li").first();
  const treatmentCompleted = completedRow.getByRole("combobox", {
    name: "Treatment type",
    exact: true,
  });
  await treatmentCompleted.focus();
  await page
    .getByRole("option", {
      name: "1U scale (cavitron and hand scaling) Starter",
      exact: true,
    })
    .click();

  await completedRow
    .getByText("Select Tooth/area", { exact: true })
    .click();
  const toothAreaOptions = completedRow.getByRole("group", {
    name: "Standard Tooth/area choices",
    exact: true,
  });
  await expect(toothAreaOptions.getByRole("checkbox")).toHaveCount(13);
  const q3ToothArea = toothAreaOptions.getByRole("checkbox", {
    name: "Q3",
    exact: true,
  });
  const q2ToothArea = toothAreaOptions.getByRole("checkbox", {
    name: "Q2",
    exact: true,
  });
  await toothAreaOptions.getByText("Q3", { exact: true }).click();
  await expect(q3ToothArea).toBeChecked();
  await expect(toothAreaOptions).toBeVisible();
  await toothAreaOptions.getByText("Q2", { exact: true }).click();
  await expect(q2ToothArea).toBeChecked();
  await completedRow
    .getByRole("textbox", {
      name: "Search or add custom Tooth/area",
      exact: true,
    })
    .fill("teeth 14–16");
  await completedRow
    .getByRole("button", {
      name: "Add “teeth 14–16” to this note",
      exact: true,
    })
    .click();
  await expect(toothAreaOptions).toBeVisible();

  await expect(
    completedRow.getByRole("checkbox", {
      name: "teeth 14–16 Custom",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    completedRow.getByRole("button", {
      name: "Q2, Q3, teeth 14–16",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    completedRow.getByRole("list", {
      name: "Tooth/area selected values",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Treatment completed today: 1U scale \(cavitron and hand scaling\) — Q2, Q3, teeth 14–16/,
  );
  await completedRow
    .getByRole("button", { name: "Done", exact: true })
    .click();
  await expect(toothAreaOptions).toBeHidden();
  await expect(
    completedRow.getByRole("button", {
      name: "Move treatment completed item 1 earlier",
    }),
  ).toHaveClass(/py-2/);
  const removeCompleted = completedRow.getByRole("button", {
    name: "Remove treatment completed item 1",
  });
  await expect(removeCompleted).toHaveClass(/border-red-300/);
  await expect(removeCompleted).toHaveClass(/text-red-800/);
  await removeCompleted.hover();
  await expect(
    completedRow.getByRole("tooltip").filter({
      hasText: "Remove this treatment line from the note.",
    }),
  ).toBeVisible();

  const anesthetic = page.locator("#adult-hygiene-anesthetic");
  await anesthetic.focus();
  await expect(anesthetic).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("No catalogue suggestions saved yet.", { exact: true }),
  ).toBeVisible();

  await medicalHistory.fill("Synthetic reusable history phrase");
  await page.getByRole("button", { name: "Remember this value" }).click();

  const compliance = page.locator("#adult-hygiene-compliance");
  await compliance.fill("Synthetic reusable compliance");
  await compliance
    .locator("xpath=../..")
    .getByRole("button", { name: "Remember this value" })
    .click();

  const ohiAids = page.locator("#adult-hygiene-ohi-aids");
  const ohiControl = ohiAids.locator("xpath=../..");
  await ohiAids.fill("Synthetic reusable OHI aid");
  await ohiControl.getByRole("button", { name: "Remember and add" }).click();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /OH Aids Reviewed\/Recommended: Synthetic reusable OHI aid/,
  );
  const ohiAidRow = page
    .getByRole("list", {
      name: "OH aids reviewed/recommended selected values",
    })
    .locator(":scope > li")
    .first();
  await expect(
    ohiAidRow.getByRole("button", {
      name: "Move Synthetic reusable OHI aid earlier",
    }),
  ).toHaveClass(/py-2/);
  const removeOhiAid = ohiAidRow.getByRole("button", {
    name: "Remove Synthetic reusable OHI aid",
  });
  await expect(removeOhiAid).toHaveClass(/border-red-300/);
  await removeOhiAid.hover();
  await expect(
    ohiAidRow.getByRole("tooltip").filter({
      hasText: "Remove this value from the note.",
    }),
  ).toBeVisible();

  await reloadDiscardingForm(page);
  await expect(medicalHistory).toHaveValue("");
  await medicalHistory.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable history phrase Local/,
    }),
  ).toBeVisible();

  await compliance.focus();
  await expect(
    page.getByRole("option", {
      name: /Synthetic reusable compliance Local/,
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
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /teeth 14–16/,
  );
});

test("Adult Hygiene uses clockwise sextant labels and output", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);
  const sextantInputs = page
    .getByRole("group", { name: "PSR/Pocketing" })
    .getByRole("textbox");
  await expect(sextantInputs).toHaveCount(6);
  await expect(
    sextantInputs.evaluateAll((inputs) =>
      inputs.map((input) =>
        document.querySelector(`label[for="${input.id}"]`)?.textContent,
      ),
    ),
  ).resolves.toEqual([
    "Sextant 1",
    "Sextant 2",
    "Sextant 3",
    "Sextant 6",
    "Sextant 5",
    "Sextant 4",
  ]);

  for (const sextant of [1, 2, 3, 6, 5, 4]) {
    await page
      .getByLabel(`Sextant ${sextant}`, { exact: true })
      .fill(`${sextant}`);
  }
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /PSR\/Pocketing: 1 2 3 \/ 6 5 4/,
  );
});

test("Adult Hygiene keeps comments independent from their main values", async ({
  page,
}) => {
  await page.goto(adultHygieneUrl);

  await page
    .getByLabel("Periodontitis stage comments", { exact: true })
    .fill("Synthetic stage context");
  await page.locator("#adult-hygiene-periodontitis-stage-choice").click();
  await page
    .getByRole("option", { name: "Stage II (P2)", exact: true })
    .click();

  await page
    .getByLabel("Periodontitis grade comments", { exact: true })
    .fill("Synthetic grade context");
  await page.locator("#adult-hygiene-periodontitis-grade-choice").click();
  await page
    .getByRole("option", {
      name: "Grade B: moderate rate",
      exact: true,
    })
    .click();

  await page
    .getByLabel("Oral hygiene compliance comment", { exact: true })
    .fill("Synthetic compliance context");
  await page
    .getByLabel("Oral hygiene compliance", { exact: true })
    .fill("Good");
  await page
    .getByLabel("Recommended recall interval comments", { exact: true })
    .fill("Synthetic recall context");
  await page
    .getByLabel("Recommended recall interval", { exact: true })
    .fill("6-month recall");
  await page
    .getByLabel("Recommended hygiene interval comments", { exact: true })
    .fill("Synthetic hygiene context");
  await page
    .getByLabel("Recommended hygiene interval", { exact: true })
    .fill("4-month scale");

  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Periodontitis Stage: Stage II \(P2\)\.[\s\S]*Periodontitis stage comments: Synthetic stage context\.[\s\S]*Periodontitis Grade: Grade B: moderate rate\.[\s\S]*Periodontitis grade comments: Synthetic grade context\.[\s\S]*Oral hygiene compliance: Good\.[\s\S]*Oral hygiene compliance comment: Synthetic compliance context\.[\s\S]*Recommended Recall Interval: 6-month recall\.[\s\S]*Recommended recall interval comments: Synthetic recall context\.[\s\S]*Recommended Hygiene Interval: 4-month scale\.[\s\S]*Recommended hygiene interval comments: Synthetic hygiene context\./,
  );
});
