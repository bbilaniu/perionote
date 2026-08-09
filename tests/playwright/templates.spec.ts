import { test, expect } from "@playwright/test";
import packageInfo from "@/package.json";

test("template library index separates clinic and interactive templates", async ({
  page,
}) => {
  await page.goto("/templates");

  await expect(
    page.getByRole("heading", { name: "Template Libraries" }),
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/templates/clinic/"]'),
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/templates/interactive/"]'),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("HygieneNote");
  await expect(page.getByRole("contentinfo")).toContainText(
    `Version ${packageInfo.version}`,
  );
});

test("standalone interactive index excludes clinical conversions", async ({
  page,
}) => {
  await page.goto("/templates/interactive");

  await expect(
    page.getByRole("heading", { name: "Standalone Interactive Forms" }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/dental-hygiene-note-webform/"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/short-dental-hygien-note/"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/very-short-template/"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/templates/recare-exam/"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('a[href="/templates/gingival-description/"]'),
  ).toHaveCount(0);
});

test("clinical catalogue colocates the Recare Exam source and conversion", async ({
  page,
}) => {
  await page.goto("/templates/clinic");

  await expect(
    page.getByRole("heading", { name: "Clinical Templates" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("radiogroup", { name: "Card opens" })
      .getByRole("radio", { name: "Interactive", exact: true }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "Card opens" })
      .getByRole("radio", { name: "Original", exact: true }),
  ).not.toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "Show templates" })
      .getByRole("radio", { name: "All", exact: true }),
  ).toBeChecked();

  const recareCard = page
    .getByRole("article")
    .filter({ hasText: "Recare Exam" });
  await expect(
    recareCard.getByRole("link", { name: "Open interactive Recare Exam" }),
  ).toHaveAttribute("href", "/templates/clinic/recare-exam/interactive/");
  await expect(
    recareCard.getByRole("link", { name: "View original template" }),
  ).toHaveAttribute("href", "/templates/clinic/recare-exam/");
  await expect(recareCard.getByText("Interactive · pilot")).toBeVisible();

  const originalOnlyCard = page
    .getByRole("article")
    .filter({ hasText: "Local Anesthetic" });
  await expect(
    originalOnlyCard.getByRole("link", {
      name: "Open original Local Anesthetic",
    }),
  ).toHaveAttribute("href", "/templates/clinic/local-anesthetic/");

  await page
    .getByRole("radiogroup", { name: "Card opens" })
    .getByRole("radio", { name: "Original", exact: true })
    .click();
  await expect(
    page
      .getByRole("radiogroup", { name: "Card opens" })
      .getByRole("radio", { name: "Original", exact: true }),
  ).toBeChecked();
  await expect(
    recareCard.getByRole("link", { name: "Open original Recare Exam" }),
  ).toHaveAttribute("href", "/templates/clinic/recare-exam/");
  await expect(
    recareCard.getByRole("link", { name: "Open interactive version" }),
  ).toHaveAttribute("href", "/templates/clinic/recare-exam/interactive/");

  await Promise.all([
    page.waitForURL("**/templates/clinic/recare-exam/"),
    recareCard
      .getByRole("link", { name: "Open original Recare Exam" })
      .click(),
  ]);
  await expect(
    page.getByRole("heading", { name: "Recare Exam", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open interactive version · pilot" }),
  ).toHaveAttribute(
    "href",
    "/templates/clinic/recare-exam/interactive/",
  );
});

test("clinical template cards follow the selected default destination", async ({
  page,
}) => {
  await page.goto("/templates/clinic");

  const adultHygieneCard = page
    .getByRole("article")
    .filter({ hasText: "2021 Adult Hygiene" });
  await Promise.all([
    page.waitForURL("**/templates/clinic/adult-hygiene-2021/interactive/"),
    adultHygieneCard
      .getByText("Comprehensive adult hygiene assessment and treatment note.")
      .click(),
  ]);

  await page.goto("/templates/clinic");
  await page
    .getByRole("radiogroup", { name: "Card opens" })
    .getByRole("radio", { name: "Original", exact: true })
    .click();
  const recareCard = page
    .getByRole("article")
    .filter({ hasText: "Recare Exam" });
  await Promise.all([
    page.waitForURL("**/templates/clinic/recare-exam/"),
    recareCard
      .getByText("Periodic exam note covering clinical findings and planning.")
      .click(),
  ]);

  await page.goto("/templates/clinic");
  const originalOnlyCard = page
    .getByRole("article")
    .filter({ hasText: "Local Anesthetic" });
  await Promise.all([
    page.waitForURL("**/templates/clinic/local-anesthetic/"),
    originalOnlyCard
      .getByText("Short local anesthetic treatment addendum.")
      .click(),
  ]);
});

test("clinical template catalogue can show only interactive versions", async ({
  page,
}) => {
  await page.goto("/templates/clinic");

  const showTemplates = page.getByRole("radiogroup", { name: "Show templates" });
  const interactiveOnly = showTemplates.getByRole("radio", {
    name: "Interactive only",
    exact: true,
  });
  await interactiveOnly.click();

  await expect(interactiveOnly).toBeChecked();
  await expect(
    page.getByRole("article").filter({ hasText: "2021 Adult Hygiene" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").filter({ hasText: "2026 Adult Hygiene" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").filter({ hasText: "Recare Exam" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").filter({ hasText: "Local Anesthetic" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "View original template" }),
  ).toHaveCount(4);

  await showTemplates
    .getByRole("radio", { name: "All", exact: true })
    .click();
  await expect(
    page.getByRole("article").filter({ hasText: "Local Anesthetic" }),
  ).toBeVisible();
});

test("2026 Adult Hygiene uses its own route and draft storage", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  await expect(
    page.getByRole("heading", { name: "2026 Adult Hygiene", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Original 2026 Adult Hygiene template",
    }),
  ).toHaveAttribute("href", "/templates/clinic/adult-hygiene-2026/");

  await page.locator("#adult-hygiene-patient-id").fill("TEST-AH-2026");
  await page.locator("#adult-hygiene-rdh").fill("Independent RDH");
  await page.getByRole("button", { name: "Copy complete note" }).click();

  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(window.localStorage).some((key) =>
          key.startsWith(
            "hygienenote.interactive-draft.v1.adult-hygiene-2026.",
          ),
        ),
      ),
    )
    .toBe(true);
  expect(
    await page.evaluate(() =>
      Object.keys(window.localStorage).some((key) =>
        key.startsWith(
          "hygienenote.interactive-draft.v1.adult-hygiene-2021.",
        ),
      ),
    ),
  ).toBe(false);
});

test("2026 Adult Hygiene merges night guard into the occlusal splint control", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const splint = page.getByRole("button", {
    name: "Has an occlusal splint (night guard)",
    exact: true,
  });
  await expect(splint).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Has a night guard", exact: true }),
  ).toHaveCount(0);

  await splint.click();
  await page.getByRole("option", { name: "Yes", exact: true }).click();
  const usesSplint = page.getByRole("button", {
    name: "Uses the occlusal splint (night guard)",
    exact: true,
  });
  await usesSplint.click();
  await page.getByRole("option", { name: "Yes", exact: true }).click();

  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Occlusal splint (night guard): Yes; uses.",
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toContainText(
    "Night guard:",
  );
});

test("2026 Adult Hygiene documents EOE and IOE findings", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  await expect(page.getByRole("heading", { name: "EOE" })).toBeVisible();
  await page
    .getByRole("button", { name: /Structured extraoral observations/ })
    .click();
  const temporomandibular = page.getByRole("group", {
    name: "Temporomandibular assessment",
    exact: true,
  });
  for (const name of [
    "TMJ",
    "Masseter palpation",
    "TMJ loading test",
  ]) {
    await expect(
      temporomandibular.getByRole("button", { name, exact: true }),
    ).toBeVisible();
  }
  await expect(
    temporomandibular.getByRole("checkbox", {
      name: "TMJ clicking",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Additional extraoral clinical exam",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Apply normal extraoral exam" })
    .click();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "EOE: WNL.",
  );
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "TMJ: WNL.",
  );
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Lymph nodes: WNL.",
  );
  await page
    .getByRole("group", { name: "Structured extraoral observations" })
    .getByRole("button", { name: "Collapse observations" })
    .click();
  await expect(
    page.getByRole("button", { name: /Structured extraoral observations/ }),
  ).toHaveAttribute("aria-expanded", "false");

  await expect(page.getByRole("heading", { name: "IOE" })).toBeVisible();
  await page
    .getByRole("button", { name: /Structured intraoral observations/ })
    .click();
  await page.getByRole("checkbox", { name: "Coated tongue" }).click();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "IOE:\n  - Tongue: coated.",
  );
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    /TMJ loading test: WNL\.\n\nIOE:/,
  );
  await page
    .getByRole("group", { name: "Structured intraoral observations" })
    .getByRole("button", { name: "Collapse observations" })
    .click();
  await expect(
    page.getByRole("button", { name: /Structured intraoral observations/ }),
  ).toHaveAttribute("aria-expanded", "false");

  await expect(page.getByRole("heading", { name: "Records" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Occlusion and Habits" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Teeth and Odontogram" }),
  ).toBeVisible();
  const sectionTitles = await page.locator("main h2").allTextContents();
  const occlusionIndex = sectionTitles.indexOf("Occlusion and Habits");
  expect(sectionTitles.slice(occlusionIndex, occlusionIndex + 3)).toEqual([
    "Occlusion and Habits",
    "Teeth and Odontogram",
    "Appliances and Relevant History",
  ]);

  const output = page.getByRole("group", { name: "Note output" });
  const completeOutput = output.getByRole("radio", {
    name: "Complete",
    exact: true,
  });
  const hygieneOutput = output.getByRole("radio", {
    name: "Hygiene",
    exact: true,
  });
  await expect(completeOutput).toBeChecked();
  await hygieneOutput.click();
  await expect(hygieneOutput).toBeChecked();
  await expect(completeOutput).not.toBeChecked();
  await expect(page.locator("#adult-hygiene-summary")).not.toContainText(
    "EOE:",
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toContainText(
    "IOE:",
  );
  await expect(
    page.getByRole("button", { name: "Copy hygiene note" }),
  ).toBeVisible();

  await output.getByRole("radio", { name: "Recare" }).click();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "EOE: WNL.",
  );
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "IOE:\n  - Tongue: coated.",
  );
  await expect(
    page.getByRole("button", { name: "Copy recare note" }),
  ).toBeVisible();

  await page.locator("#adult-hygiene-patient-id").fill("TEST-OUTPUTS");
  await page.locator("#adult-hygiene-rdh").fill("Output RDH");
  await page.getByRole("button", { name: "Copy recare note" }).click();
  await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain(
    "EOE: WNL.",
  );

  await output.getByRole("radio", { name: "Hygiene" }).click();
  await page.getByRole("button", { name: "Copy hygiene note" }).click();
  await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.not.toContain(
    "EOE:",
  );
});

test("2026 Adult Hygiene conditionally documents removable-dentures comments", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const status = page.getByRole("button", {
    name: "Partial/complete removable dentures",
    exact: true,
  });
  const comment = page.getByRole("textbox", {
    name: "Removable dentures comments",
    exact: true,
  });
  await expect(comment).toHaveCount(0);

  await status.click();
  await page.getByRole("option", { name: "Yes", exact: true }).click();
  await comment.fill("Lower complete denture used routinely");
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Partial/complete removable dentures: Yes—Lower complete denture used routinely.",
  );

  await status.click();
  await page.getByRole("option", { name: "No", exact: true }).click();
  await expect(comment).toHaveCount(0);
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Partial/complete removable dentures: No.",
  );
  await expect(page.locator("#adult-hygiene-summary")).not.toContainText(
    "Lower complete denture used routinely",
  );

  await status.click();
  await page.getByRole("option", { name: "Yes", exact: true }).click();
  await expect(comment).toHaveValue("Lower complete denture used routinely");
});

test("2026 Adult Hygiene keeps each occlusal location editor with its finding", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const input = page.getByRole("combobox", {
    name: "Additional occlusal findings",
    exact: true,
  });
  await input.focus();
  await page
    .getByRole("option", { name: "Spacing Starter", exact: true })
    .click();
  await input.fill("Crowd");
  await page
    .getByRole("option", { name: "Crowding Starter", exact: true })
    .click();

  const selected = page.getByRole("list", {
    name: "Additional occlusal findings selected values",
  });
  const spacing = selected
    .getByRole("listitem")
    .filter({ hasText: "Spacing" });
  const crowding = selected
    .getByRole("listitem")
    .filter({ hasText: "Crowding" });
  const spacingLocation = spacing.getByRole("group", {
    name: "Spacing location",
    exact: true,
  });
  const crowdingLocation = crowding.getByRole("group", {
    name: "Crowding location",
    exact: true,
  });

  await spacingLocation
    .getByRole("checkbox", { name: "Anterior", exact: true })
    .check();
  await expect(
    spacingLocation.getByRole("checkbox", {
      name: "Anterior",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    crowdingLocation.getByRole("checkbox", {
      name: "Anterior",
      exact: true,
    }),
  ).not.toBeChecked();

  await page
    .getByRole("checkbox", {
      name: "List each additional occlusal finding on a separate line in the note",
      exact: true,
    })
    .check();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    `Additional occlusal findings:
  - Spacing (location: Anterior).
  - Crowding.`,
  );
});

test("2026 Adult Hygiene coordinates standard and additional OHE controls", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const education = page.getByRole("group", {
    name: "Education provided today",
    exact: true,
  });
  await education
    .getByRole("checkbox", {
      name: "Reviewed brushing and flossing frequency recommendations",
      exact: true,
    })
    .check();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY",
  );

  const automaticGoal =
    "Pt will start flossing at least 1-2 times a week, implement bass brushing by the next hygiene appointment.";
  const hygieneGoal = education.getByRole("textbox", {
    name: "Hygiene goal",
    exact: true,
  });
  await expect(hygieneGoal).toHaveValue("");

  await education
    .getByRole("button", { name: "Apply standard OHE", exact: true })
    .click();
  await expect(hygieneGoal).toHaveValue(automaticGoal);
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    `Hygiene goal: ${automaticGoal}`,
  );
  await expect(
    education.getByText("Included in Standard OHE", { exact: true }),
  ).toBeVisible();
  await education
    .getByRole("button", {
      name: "Additional OHE topics reviewed",
      exact: true,
    })
    .click();
  const topics = page.getByRole("dialog", {
    name: "Additional OHE topics reviewed options",
    exact: true,
  });
  await expect(topics.getByText("Bass brushing", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    topics.getByText("Sulcabrush and interdental brush technique", {
      exact: true,
    }),
  ).toBeVisible();
  await topics.getByRole("button", { name: "Done", exact: true }).click();

  await education
    .getByRole("button", { name: "Clear standard OHE", exact: true })
    .click();
  await expect(hygieneGoal).toHaveValue("");
  await education
    .getByRole("button", {
      name: "Additional OHE topics reviewed",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("dialog", {
        name: "Additional OHE topics reviewed options",
        exact: true,
      })
      .getByText("Bass brushing", { exact: true }),
  ).toBeVisible();

  await page
    .getByRole("dialog", {
      name: "Additional OHE topics reviewed options",
      exact: true,
    })
    .getByRole("button", { name: "Done", exact: true })
    .click();
  await hygieneGoal.fill("Customized hygiene goal.");
  await education
    .getByRole("button", { name: "Apply standard OHE", exact: true })
    .click();
  await expect(hygieneGoal).toHaveValue("Customized hygiene goal.");
  await education
    .getByRole("button", { name: "Clear standard OHE", exact: true })
    .click();
  await expect(hygieneGoal).toHaveValue("Customized hygiene goal.");
});

test("2026 Adult Hygiene links radiograph quantities and a recare exam to completed care", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const radiographs = page.getByRole("group", {
    name: "Radiographs taken today",
    exact: true,
  });
  const bitewings = radiographs.getByRole("checkbox", {
    name: "Bitewings (BW)",
    exact: true,
  });
  await expect(bitewings).not.toBeChecked();
  await bitewings.click();
  await expect(bitewings).toBeChecked();
  const bwQuantity = radiographs.getByRole("spinbutton", {
    name: "Number of images",
    exact: true,
  }).first();
  await expect(bwQuantity).toHaveValue("4");
  await radiographs
    .getByRole("button", { name: "Increase BW images", exact: true })
    .click();
  await radiographs
    .getByRole("checkbox", { name: "Periapicals (PA)", exact: true })
    .click();
  await radiographs
    .getByRole("checkbox", { name: "Panoramic (PAN)", exact: true })
    .click();
  await radiographs
    .getByLabel("Type name", { exact: true })
    .fill("Occlusal view");
  await radiographs.getByLabel("Short code", { exact: true }).fill("OCC");
  await radiographs
    .getByLabel("Default images", { exact: true })
    .fill("2");
  await radiographs
    .getByRole("button", { name: "Remember and add", exact: true })
    .click();

  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Radiographs: 5 BW; 3 PA; PAN; 2 OCC",
  );
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Treatment completed today: 5 BW; 3 PA; PAN; 2 OCC",
  );

  await page
    .getByRole("button", { name: "Apply recare exam", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply recare exam", exact: true })
    .click();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Treatment completed today: 5 BW; 3 PA; PAN; 2 OCC; Dentist Recare Exam",
  );
  await expect(
    page
      .getByRole("list", { name: "Treatment completed today entries" })
      .locator(":scope > li"),
  ).toHaveCount(5);

  await bitewings.click();
  await expect(bitewings).not.toBeChecked();
  await expect(page.locator("#adult-hygiene-summary")).not.toContainText(
    "5 BW",
  );
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Treatment completed today: 3 PA; PAN; 2 OCC; Dentist Recare Exam",
  );
});

test("2026 Adult Hygiene standard treatment uses structured procedure controls", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const education = page.getByRole("group", {
    name: "Education provided today",
    exact: true,
  });
  await education
    .getByRole("checkbox", {
      name: "Reviewed brushing and flossing frequency recommendations",
      exact: true,
    })
    .check();
  await education
    .getByRole("button", { name: "Apply standard OHE", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply standard treatment", exact: true })
    .click();

  const completed = page.getByRole("list", {
    name: "Treatment completed today entries",
  });
  await expect(completed.locator(":scope > li")).toHaveCount(6);
  const scaling = completed.locator(":scope > li").filter({
    has: page.getByRole("heading", { name: "Scaling", exact: true }),
  });
  await expect(
    scaling.getByRole("spinbutton", { name: "Scaling units", exact: true }),
  ).toHaveValue("3");
  const hand = scaling.getByRole("checkbox", {
    name: "Hand instrumentation",
    exact: true,
  });
  await expect(hand).toBeChecked();
  const power = scaling.getByRole("checkbox", {
    name: "Power instrumentation",
    exact: true,
  });
  await expect(power).toBeChecked();
  await expect(
    scaling.getByRole("combobox", { name: "Power device", exact: true }),
  ).toHaveValue("Cavitron");

  await scaling
    .getByRole("spinbutton", { name: "Scaling units", exact: true })
    .fill("2");
  await power.click();
  await expect(power).not.toBeChecked();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Full mouth scaling with hand instrumentation (2U Scale)",
  );

  const polish = completed.locator(":scope > li").filter({
    has: page.getByRole("heading", { name: "Selective polish", exact: true }),
  });
  await expect(
    polish.getByRole("spinbutton", { name: "Polish units", exact: true }),
  ).toHaveValue("1");
  const polishProduct = polish.getByRole("combobox", {
    name: "Polish product",
    exact: true,
  });
  await expect(polishProduct).toHaveValue(
    "Enamel Pro® Prophy Paste with Fluoride (Strawberry)",
  );
  await polishProduct.focus();
  await page
    .getByRole("option", {
      name: /Enamel Pro® Prophy Paste with Fluoride \(Raspberry\) Starter/,
    })
    .click();
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "Selective polish with Enamel Pro® Prophy Paste with Fluoride (Raspberry) (1U Polish)",
  );

  const ohe = completed.locator(":scope > li").filter({
    has: page.getByRole("heading", {
      name: "Oral hygiene education",
      exact: true,
    }),
  });
  const recap = ohe.getByRole("textbox", {
    name: "Treatment-line recap",
    exact: true,
  });
  await expect(recap).toHaveValue(
    "Bass brushing at least twice daily; C-shape flossing at least daily; benefits of fluoride",
  );
  await expect(recap).toHaveAttribute("readonly", "");
  await ohe
    .getByRole("button", { name: "Customize recap", exact: true })
    .click();
  await recap.fill("Customized OHE recap");
  await education.locator("#adult-hygiene-ohe-notes").fill("New education note");
  await expect(recap).toHaveValue("Customized OHE recap");
  await expect(page.locator("#adult-hygiene-summary")).toContainText(
    "OHE on proper home care (Customized OHE recap)",
  );
});

test("2026 Adult Hygiene offers transparent periodontal and caries suggestions", async ({
  page,
}) => {
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const currentCondition = page.getByRole("region", {
    name: "Current clinical condition",
  });
  await expect(
    currentCondition.getByRole("heading", {
      name: "Possible diagnosis categories",
    }),
  ).toBeVisible();
  await expect(
    currentCondition.getByText("Periodontal health", { exact: true }),
  ).toBeVisible();
  await expect(
    currentCondition.getByText("Gingivitis", { exact: true }),
  ).toBeVisible();
  await expect(
    currentCondition.getByText("Periodontitis / history of periodontitis", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(currentCondition).toContainText(
    "No diagnosis is selected or changed by these suggestions.",
  );

  await page
    .getByRole("button", { name: /Structured periodontal observations/ })
    .click();
  await page.locator("#adult-hygiene-periodontium").click();
  await page
    .getByRole("option", { name: "Intact periodontal support", exact: true })
    .click();
  await page.locator("#adult-hygiene-bop-percent").fill("5");
  await page.locator("#adult-hygiene-maximum-ppd").fill("3");
  await page.locator("#adult-hygiene-attachment-loss").click();
  await page.getByRole("option", { name: "Absent", exact: true }).click();
  await page.locator("#adult-hygiene-radiographic-bone-loss").click();
  await page.getByRole("option", { name: "Absent", exact: true }).click();

  await expect(
    currentCondition.getByText("Periodontal health", { exact: true }),
  ).toBeVisible();
  await expect(
    currentCondition.getByText("Gingivitis", { exact: true }),
  ).toHaveCount(0);
  await expect(
    currentCondition.getByText("Periodontitis / history of periodontitis", {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(currentCondition).toContainText(
    "BOP 5% is below the 10% case threshold.",
  );

  const cariesRiskLevel = page.getByRole("button", {
    name: "Caries risk level",
    exact: true,
  });
  const factors = page.getByRole("combobox", {
    name: "Caries risk factors",
    exact: true,
  });
  await factors.focus();
  await page
    .getByRole("option", { name: /High frequency of sugar intake Starter/ })
    .click();

  await expect(
    page.getByRole("heading", { name: "Suggested caries risk level" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Suggested caries risk level" })
      .locator("xpath=.."),
  ).toContainText("High");
  await expect(cariesRiskLevel).toHaveAttribute("data-value", "");
  await page
    .getByRole("button", { name: "Apply caries risk suggestion" })
    .click();
  await expect(cariesRiskLevel).toHaveAttribute("data-value", "High");
});

test("recare exam blocks copying until Patient ID and a provider are entered", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/templates/clinic/recare-exam/interactive");
  await expect(
    page.getByRole("link", { name: "Original Recare Exam template" }),
  ).toHaveAttribute("href", "/templates/clinic/recare-exam/");
  await expect(page.locator("#recare-note-started")).toHaveValue(
    /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/,
  );
  await page.evaluate(() => navigator.clipboard.writeText("sentinel"));

  await page.getByRole("button", { name: "Copy note" }).click();

  await expect(page.getByText("Enter a Patient ID.")).toBeVisible();
  await expect(
    page.getByText("Enter at least one of Dentist, RDA, or RDH."),
  ).toBeVisible();
  await expect(page.locator("#recare-patient-id")).toBeFocused();
  await expect(
    page.evaluate(() => navigator.clipboard.readText()),
  ).resolves.toBe("sentinel");

  await page.locator("#recare-patient-id").fill("TEST-3003");
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.locator("#recare-dentist")).toBeFocused();
  await expect(
    page.evaluate(() => navigator.clipboard.readText()),
  ).resolves.toBe("sentinel");

  await page.locator("#recare-rdh").fill("Example RDH");
  const visiblePreview = await page.locator("#recare-summary").inputValue();
  await page.getByRole("button", { name: "Copy note" }).click();

  await expect(page.getByText("Note copied.", { exact: true })).toBeVisible();
  const copiedNote = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedNote).toBe(visiblePreview);
  expect(copiedNote).toMatch(
    /^----- [A-Z][a-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2}:\d{2} [AP]M -----\n/,
  );
  expect(copiedNote).toMatch(
    /\nPATIENT ID: TEST-3003\nDENTIST:\nRDA:\nRDH: Example RDH$/,
  );
  expect(copiedNote).not.toContain("NOTE STARTED:");
});

test("recare exam uses the harmonized consent, history, and sterilization controls", async ({
  page,
}) => {
  await page.goto("/templates/clinic/recare-exam/interactive");

  const section = page
    .getByRole("heading", {
      name: "Consent, Medical History, and Sterilization",
      exact: true,
    })
    .locator("xpath=ancestor::section[1]");
  await expect(section).toHaveCount(1);
  await expect(
    section
      .locator('input, button[data-list-control="fixed-listbox"]')
      .evaluateAll((controls) => controls.map((control) => control.id)),
  ).resolves.toEqual([
    "recare-class5",
    "recare-miele-codes",
    "recare-consent-patient",
    "recare-consent-parent",
    "recare-consent-guardian",
    "recare-medical-history",
    "recare-premedication",
  ]);

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

  await page.getByLabel("Patient", { exact: true }).check();
  await page.getByLabel("Legal guardian", { exact: true }).check();
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Informed verbal consent given by PATIENT and LEGAL GUARDIAN for treatment today\./,
  );
});

test("recare exam demo preserves paragraph spacing and restores its local draft", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.install({ time: new Date(2026, 6, 25, 9, 10) });
  await page.goto("/templates/clinic/recare-exam/interactive");
  await expect(page.locator("#recare-note-started")).toHaveValue(
    /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/,
  );
  const initialStartedAt = await page
    .locator("#recare-note-started")
    .inputValue();

  await page.getByRole("button", { name: "Load synthetic demo" }).click();
  await expect(page.locator("#recare-patient-id")).toHaveValue("TEST-1001");
  await expect(
    page.getByLabel("Partial/complete removable dentures"),
  ).toHaveAttribute("data-value", "no");
  await expect(page.getByLabel("Masseter palpation")).toBeVisible();
  await expect(page.getByLabel("TMJ loading test")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Odontogram", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Caries risk level", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Occlusal splint \(night guard\): Yes; uses\./,
  );
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Molar occlusion—right: Synthetic Class I\.\nMolar occlusion—left: N\/A\./,
  );

  const demoPreview = await page.locator("#recare-summary").inputValue();
  await page.getByRole("button", { name: "Copy note" }).click();
  const copiedNote = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedNote).toBe(demoPreview);
  expect(copiedNote).toContain(
    "Intraoral photos: No.\n\na) Patient's chief concern:",
  );
  expect(copiedNote).toContain(
    "Treatment Options:\n  1. Hygiene maintenance\n  2. Synthetic restorative consultation",
  );
  expect(copiedNote).toContain("ODONTOGRAM UP TO DATE");
  expect(copiedNote).not.toContain("Caries risk:");
  expect(copiedNote).not.toContain("\n\n\n");

  const reloadDialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page.reload();
  const reloadDialog = await reloadDialogPromise;
  expect(reloadDialog.type()).toBe("beforeunload");
  await reloadDialog.accept();
  await reloadPromise;
  await expect(page.locator("#recare-patient-id")).toHaveValue("TEST-1001");
  await expect(page.locator("#recare-note-started")).toHaveValue(
    initialStartedAt,
  );
  await expect(page.locator("#recare-summary")).toHaveValue(
    /Treatment Options:\n  1\. Hygiene maintenance\n  2\. Synthetic restorative consultation/,
  );
  await expect(page.getByText(/Restored the draft saved/)).toBeVisible();

  const reloadedStartedAt = await page
    .locator("#recare-note-started")
    .inputValue();
  await page.clock.setSystemTime(new Date(2026, 6, 25, 10, 25));
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Clear all entered Recare Exam values and start a new note?",
    );
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(page.locator("#recare-patient-id")).toHaveValue("");
  const resetStartedAt = await page
    .locator("#recare-note-started")
    .inputValue();
  expect(resetStartedAt).not.toBe(reloadedStartedAt);
  await expect(page.locator("#recare-summary")).toHaveValue(
    /^----- [A-Z][a-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2}:\d{2} [AP]M -----\nPATIENT ID:\nDENTIST:\nRDA:\nRDH:$/,
  );

  await page.clock.setSystemTime(new Date(2026, 6, 25, 11, 40));
  page.once("dialog", async (dialog) => {
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(page.locator("#recare-note-started")).toHaveValue(
    resetStartedAt,
  );
  expect(initialStartedAt).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
});

test("clinic template library follows the clinical menu and opens a template", async ({
  page,
}) => {
  await page.goto("/templates/clinic");

  await expect(
    page.getByRole("heading", { name: "Clinical Templates" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hygiene", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Exams and adjuncts", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Periodontal Maintenance/Re-evaluation",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "This category is ready for the clinic's next treatment or referral addendum.",
    ),
  ).toBeVisible();

  const adultHygieneCard = page
    .getByRole("article")
    .filter({ hasText: "2021 Adult Hygiene" });
  await adultHygieneCard
    .getByRole("link", { name: "View original template" })
    .click();
  await expect(
    page.getByRole("heading", { name: "2021 Adult Hygiene" }),
  ).toBeVisible();
  await expect(page.getByText("Patient Chief Concern:")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy template" }),
  ).toBeVisible();
});

test("imported webform preview renders summary panel and updated EOE/IOE sections", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await expect(
    page.getByRole("heading", { name: "Dental Hygiene Note Webform Template" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Summary Preview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "EOE Within Normal Limits" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "IOE Within Normal Limits" }),
  ).toBeVisible();
  await expect(page.getByText("EOE observations")).toBeVisible();
  await expect(page.getByText("IOE observations")).toBeVisible();
});

test("Very short template combines side buttons as bilateral and keeps symptom status single-choice", async ({
  page,
}) => {
  await page.goto("/templates/very-short-template");

  const eoeIoeSection = page.locator("#template-section-eoeIoe");
  await eoeIoeSection
    .getByRole("button", { name: "Expand", exact: true })
    .click();
  await eoeIoeSection
    .getByRole("button", { name: "TMJ clicking", exact: true })
    .click();

  const laterality = eoeIoeSection.getByRole("group", {
    name: "Laterality",
    exact: true,
  }).first();
  const left = laterality.getByRole("checkbox", { name: "Left", exact: true });
  const right = laterality.getByRole("checkbox", { name: "Right", exact: true });
  await left.click();
  await expect(left).toBeChecked();
  await right.click();
  await expect(right).toBeChecked();
  await expect(left).toBeChecked();
  await expect(page.locator("textarea[readonly]")).toHaveValue(
    /EOE: bilateral tmj clicking/,
  );

  const status = eoeIoeSection.getByRole("group", {
    name: "Status",
    exact: true,
  });
  const symptomatic = status.getByRole("radio", {
    name: "Symptomatic",
    exact: true,
  });
  const asymptomatic = status.getByRole("radio", {
    name: "Asymptomatic",
    exact: true,
  });
  await symptomatic.click();
  await asymptomatic.click();
  await expect(symptomatic).not.toBeChecked();
  await expect(asymptomatic).toBeChecked();
});

test("OHE section can select all topics with one click", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  const oheSection = page.locator("#template-section-ohe");
  const selectAllButton = oheSection.getByRole("button", { name: "Select All" });

  await expect(selectAllButton).toBeVisible();
  await selectAllButton.click();
  await expect(selectAllButton).toBeDisabled();

  const summary = await page.locator("textarea[readonly]").inputValue();
  expect(summary).toContain(
    "OHE: Caries theory and risk factors, bass brushing, c-shaped flossing, sulcabrush and interdental brush technique, review benefits of Prevident or Opti-Rinse, periodontitis theory and risk factors, importance of maintaining a 4-month hygiene interval",
  );
});

test("vitals reading time can be reset to the current time with one click", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await page.locator("#vitals-time-0").fill("00:00");
  await expect(page.locator("#vitals-time-0")).toHaveValue("00:00");

  await page.getByRole("button", { name: "Set to now" }).click();
  await expect(page.locator("#vitals-time-0")).not.toHaveValue("00:00");
  await expect(page.locator("#vitals-time-0")).toHaveValue(/\d{2}:\d{2}/);
});

test("last vitals reading can be removed and re-added", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await expect(page.getByText("Vitals Entry 1")).toBeVisible();
  await expect(page.locator("#vitals-systolic-0")).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.locator("#vitals-systolic-0")).toHaveCount(0);

  await page.getByRole("button", { name: "Add reading" }).click();
  await expect(page.getByText("Vitals Entry 1")).toBeVisible();
  await expect(page.locator("#vitals-systolic-0")).toBeVisible();
});

test("local anesthesia entry time can be cleared and reset", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await page.getByRole("checkbox", { name: "No C/I to LA" }).click();
  await page.getByRole("button", { name: "Add injection entry" }).click();

  const entry = page.locator("#local-anesthesia-entry-0");
  const timeInput = page.locator("#local-anesthesia-time-0");

  await expect(timeInput).toHaveValue(/\d{2}:\d{2}/);
  await timeInput.fill("00:00");
  await expect(timeInput).toHaveValue("00:00");

  await entry.getByRole("button", { name: "Clear" }).click();
  await expect(timeInput).toHaveValue("");

  await entry.getByRole("button", { name: "Now" }).click();
  await expect(timeInput).toHaveValue(/\d{2}:\d{2}/);
});

test("very short template local anesthesia product list filters by route", async ({
  page,
}) => {
  const oraqixProduct =
    "ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5%";
  const benzocaineProduct = "Benzocaine 20% paste";

  await page.goto("/templates/very-short-template");
  await page.getByRole("button", { name: "Expand all sections" }).click();
  await page.getByRole("checkbox", { name: "No C/I to LA" }).click();
  await page.getByRole("button", { name: "Add injection entry" }).click();

  const injectionEntry = page.locator("#local-anesthesia-entry-0");
  const injectionProductSelect = injectionEntry
    .getByRole("combobox")
    .nth(2);
  await injectionProductSelect.selectOption(
    "Mepivacaine 3% without epinephrine",
  );
  await expect(injectionProductSelect).toHaveValue(
    "Mepivacaine 3% without epinephrine",
  );

  await page.getByRole("button", { name: "Add topical entry" }).click();

  const topicalEntry = page.locator("#local-anesthesia-entry-1");
  const topicalProductSelect = topicalEntry.getByRole("combobox").nth(2);

  await topicalProductSelect.selectOption(oraqixProduct);
  await expect(topicalProductSelect).toHaveValue(oraqixProduct);
  await topicalProductSelect.selectOption(benzocaineProduct);
  await expect(topicalProductSelect).toHaveValue(benzocaineProduct);
});

test("local anesthesia assessment is emphasized when activity is documented without assessment", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await page.getByRole("checkbox", { name: "No C/I to LA" }).click();
  await page.getByRole("button", { name: "Add topical entry" }).click();

  await expect(
    page.getByText("Complete the post-anesthetic assessment before finishing the note."),
  ).toBeVisible();

  await page.getByRole("checkbox", { name: "No adverse reactions noted" }).click();

  await expect(
    page.getByText("Complete the post-anesthetic assessment before finishing the note."),
  ).toHaveCount(0);
});

test("imported webform summary uses preview a formatting", async ({ page }) => {
  await page.goto("/templates/dental-hygiene-note-webform");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Load demo" }).click();
  await expect(page.locator("#periodontal-status-notes")).toHaveValue(
    "Reinforced 4-month hygiene interval and home-care compliance.",
  );

  const summary = await page.locator("textarea[readonly]").inputValue();

  expect(summary).toContain(
    "Patient concerns: Sensitivity around lower anterior and occasional bleeding while flossing.",
  );
  expect(summary).toContain(
    "Medical history update:\n   Med/dent history updated. No new contraindications reported.\n   BP: 118/76 mmHg, HR: 72 bpm (at 9:15 AM)",
  );
  expect(summary).toContain("Date: 2026-03-09");
  expect(summary).toContain("Provider: Dr. Example");
  expect(summary).toContain(
    "EOE: bilateral tmj clicking (asymptomatic, on open), baseline monitoring only",
  );
  expect(summary).toContain(
    "IOE: coated tongue, scalloped tongue, bilateral linea alba, slight palatine torus at midline, slight bilateral mandibular tori, mild soft tissue variations noted",
  );
  expect(summary).toContain(
    "Gingival Description: generalized marginal dark pink on sextant 1, sextant 3 (Inflammation most notable posteriorly), localized marginal rolled on #14-16, localized papillary spongy on #23-26 (Correlates with plaque retention areas).",
  );
  expect(summary).toContain(
    "Periodontal diagnosis: Active Moderate Periodontitis Stage II Grade B moderate rate of progression. Reinforced 4-month hygiene interval and home-care compliance.",
  );
  expect(summary).toContain(
    "Caries risk: Moderate caries risk due to high frequency of sugar intake, insufficient exposure to fluoride, history of active decay in the last 36 months. Diet and home-care factors reviewed.",
  );
  expect(summary).toContain(
    "OHE: Caries theory and risk factors, bass brushing, c-shaped flossing, sulcabrush and interdental brush technique, review benefits of Prevident or Opti-Rinse, periodontitis theory and risk factors, importance of maintaining a 4-month hygiene interval",
  );
  expect(summary).toContain(
    "Treatments completed today: Med/dent history update, EOE/IOE, OHE reinforced, Reviewed homecare, Gingival assessments, Calculus index, Caries risk, Nutrition score, Periodontal risk assessment, Spot probing, Full mouth probing, Q1, Q2, Q3, Q4, Full mouth, Maxilla, Mandible Hand and Power Instrumentation (Piezo), Ipana 5% NaF varnish application",
  );
  expect(summary).toContain(
    "IA/L Q3: Mepivacaine 3% without epinephrine 1.8 ml (at 9:25 AM)",
  );
  expect(summary).toContain(
    "Mucosal application Q3: Benzocaine 20% paste 0.5 ml (at 9:24 AM)",
  );
  expect(summary).toContain(
    "Total: Benzocaine 20% paste 0.5 ml",
  );
  expect(summary).not.toContain("Visit Details:");
  expect(summary).toContain(
    "Other clinical findings: Continue monitoring tongue and linea alba findings.",
  );
});

test("combined instrumentation control exposes device and area selections", async ({
  page,
}) => {
  await page.goto("/templates/very-short-template");
  await page.getByRole("button", { name: "Expand all sections" }).click();

  const treatmentSection = page.locator(
    "#template-section-treatmentDoneToday-content",
  );
  await treatmentSection
    .getByRole("checkbox", { name: "Hand and Power Instrumentation" })
    .click();
  await expect(
    page.getByText("Instrumentation area (today)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Power instrumentation device (today)", { exact: true }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "Piezo" }).click();
  await page.getByRole("checkbox", { name: "Q1" }).click();

  const summary = await page.locator("textarea[readonly]").inputValue();
  expect(summary).toContain("Q1 Hand and Power Instrumentation (Piezo)");
});

test("short and very short templates include Full mouth instrumentation area", async ({
  page,
}) => {
  await page.goto("/templates/short-dental-hygien-note");
  const shortTreatmentSection = page.locator(
    "#template-section-treatmentDoneToday-content",
  );
  await shortTreatmentSection
    .getByRole("checkbox", { name: "Hand and Power Instrumentation" })
    .click();
  await expect(
    shortTreatmentSection.getByRole("checkbox", {
      name: "Full mouth",
      exact: true,
    }),
  ).toBeVisible();

  await page.goto("/templates/very-short-template");
  await page.getByRole("button", { name: "Expand all sections" }).click();
  const veryShortTreatmentSection = page.locator(
    "#template-section-treatmentDoneToday-content",
  );
  await veryShortTreatmentSection
    .getByRole("checkbox", { name: "Hand and Power Instrumentation" })
    .click();
  await expect(
    veryShortTreatmentSection.getByRole("checkbox", {
      name: "Full mouth",
      exact: true,
    }),
  ).toBeVisible();
});

test("periodontal stage and grade only show for periodontitis", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");

  await expect(page.getByText("Stage", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Grade", { exact: true })).toHaveCount(0);

  await page.selectOption(
    'select:has(option[value="Gingivitis"])',
    "Gingivitis",
  );
  await expect(page.getByText("Stage", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Grade", { exact: true })).toHaveCount(0);

  await page.selectOption(
    'select:has(option[value="Periodontitis"])',
    "Periodontitis",
  );
  await expect(page.getByText("Stage", { exact: true })).toBeVisible();
  await expect(page.getByText("Grade", { exact: true })).toBeVisible();
});

test("legacy gingival-description slug reuses the imported template", async ({
  page,
}) => {
  await page.goto("/templates/gingival-description");

  await expect(
    page.getByRole("heading", { name: "Dental Hygiene Note Webform Template" }),
  ).toBeVisible();
  await expect(page.locator("#exam-date")).toBeVisible();
});

test("short dental hygien note slug renders the copied template", async ({
  page,
}) => {
  await page.goto("/templates/short-dental-hygien-note");

  await expect(
    page.getByRole("heading", { name: "Short Dental Hygien Note" }),
  ).toBeVisible();
  await expect(page.locator("#exam-date")).toBeVisible();
});

test("very short template slug renders the sticky-summary variant", async ({
  page,
}) => {
  await page.goto("/templates/very-short-template");

  await expect(
    page.getByRole("heading", { name: "Very short template" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Expand all sections" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Summary Preview" }),
  ).toBeVisible();
  await expect(page.locator("#exam-date")).toBeVisible();
});

test("very short template desktop shell does not leave trailing space after the summary column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1664, height: 900 });
  await page.goto("/templates/very-short-template");

  const layoutMetrics = await page.locator("main > div.min-h-screen > div").evaluate((root) => {
    const children = Array.from(root.children);
    const summary = children[1];
    const rootRect = root.getBoundingClientRect();
    const summaryRect = summary?.getBoundingClientRect();

    return {
      trailingGap: summaryRect ? rootRect.right - summaryRect.right : null,
    };
  });

  expect(layoutMetrics.trailingGap).not.toBeNull();
  expect(layoutMetrics.trailingGap ?? Number.POSITIVE_INFINITY).toBeLessThan(2);
});

test("imported templates retain the synthetic fixture date and prefill vitals time", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(2026, 6, 25, 9, 10) });
  const fixtureDate = "2026-03-09";
  const currentTime = "09:10";

  await page.goto("/templates/gingival-description");
  await expect(page.locator("#exam-date")).toHaveValue(fixtureDate);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);

  await page.goto("/templates/dental-hygiene-note-webform");
  await expect(page.locator("#exam-date")).toHaveValue(fixtureDate);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);

  await page.goto("/templates/short-dental-hygien-note");
  await expect(page.locator("#exam-date")).toHaveValue(fixtureDate);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);

  await page.goto("/templates/very-short-template");
  await expect(page.locator("#exam-date")).toHaveValue(fixtureDate);
  await expect(page.locator("#vitals-time-0")).toHaveValue(currentTime);
});
