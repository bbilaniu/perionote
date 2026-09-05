import { expect, test, type Page } from "@playwright/test";
import { openGeneratedNote } from "./helpers/interactiveTemplate";

const url = "/templates/clinic/adult-hygiene-2026/interactive";
const draftPrefix = "hygienenote.interactive-draft.v1.";

async function openRapid(page: Page) {
  await page.goto(url);
  await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
  await expect(page.getByTestId("rapid-entry")).toBeVisible();
}
const group = (page: Page, name: string) =>
  page.getByTestId("rapid-entry").getByRole("group", { name, exact: true });
const choose = (page: Page, name: string, option: string) =>
  group(page, name).getByRole("radio", { name: option, exact: true }).check();

test("desktop Rapid navigation reveals the active link while scrolling down and back up", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openRapid(page);
  // Exercise overflow with the larger default text size supported by browsers.
  await page.addStyleTag({ content: "html { font-size: 20px; }" });
  const navigation = page.getByRole("navigation", { name: "Form sections" });
  const sectionList = navigation.locator("[data-section-list]");
  await expect
    .poll(() => sectionList.evaluate((list) => list.scrollWidth - list.clientWidth))
    .toBeGreaterThan(1);

  for (const [id, label] of [
    ["education-and-treatment", "OHE / Treatment"],
    ["recommendations", "Next Visit"],
    ["oral-hygiene", "Oral Hygiene"],
    ["visit", "Visit"],
  ]) {
    // Scroll the form directly: clicking a link would let browser focus reveal it
    // and hide a regression in page-scroll synchronization.
    const pagePosition = await page.locator(`#template-section-${id}`).evaluate((section) => {
      window.scrollTo({
        top: section.getBoundingClientRect().top + window.scrollY - 140,
        behavior: "instant",
      });
      return window.scrollY;
    });
    const link = navigation.getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("aria-current", "location");
    await expect
      .poll(() => link.evaluate((activeLink) => {
        const list = activeLink.closest("[data-section-list]")!;
        const listBounds = list.getBoundingClientRect();
        const linkBounds = activeLink.getBoundingClientRect();
        return Math.max(listBounds.left - linkBounds.left, linkBounds.right - listBounds.right);
      }), { message: `${label} should fit within the navigation strip` })
      .toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(pagePosition, 0);

    if (id === "recommendations") {
      await expect.poll(() => sectionList.evaluate((list) => list.scrollLeft)).toBeGreaterThan(0);
      await page.screenshot({ path: testInfo.outputPath("rapid-navigation-next-visit.png") });
    }
  }

  await expect.poll(() => sectionList.evaluate((list) => list.scrollLeft)).toBe(0);
});

test("routine encounter uses direct choices and existing generated outputs", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openRapid(page);
  const rapid = page.getByTestId("rapid-entry");
  await rapid
    .getByRole("textbox", { name: "Patient ID", exact: true })
    .fill("SYNTHETIC-RAPID-001");
  await rapid
    .getByRole("combobox", { name: "RDH", exact: true })
    .fill("Synthetic RDH");
  await group(page, "Consent given by")
    .getByRole("checkbox", { name: "Patient", exact: true })
    .check();
  await choose(
    page,
    "Medical history reviewed",
    "YES- NP- CLEARED, NO CONTRAINDICATIONS TO TX",
  );
  await choose(page, "Brushing frequency", "Brushing 2x/day");
  await choose(page, "Flossing frequency", "Flossing 1x/day");
  await choose(page, "Plaque amount", "Moderate");
  await choose(page, "Plaque distribution", "Generalized");
  await group(page, "Plaque location")
    .getByRole("checkbox", { name: "interproximal", exact: true })
    .check();
  await choose(page, "Calculus amount", "Mild");
  await choose(page, "Calculus distribution", "Localized");
  await choose(page, "Stain amount", "None");
  await choose(page, "Bleeding amount", "Mild");
  await choose(page, "Bleeding distribution", "Localized");
  await choose(page, "Gingival Description", "WNL");
  await choose(page, "EOE", "WNL");
  await choose(page, "IOE", "WNL");
  await group(page, "Radiographs taken today")
    .getByRole("checkbox", { name: "Bitewings (BW)", exact: true })
    .check();
  await group(page, "OHE reviewed")
    .getByRole("checkbox", { name: "Bass brushing", exact: true })
    .check();
  await group(page, "OHE reviewed")
    .getByRole("checkbox", { name: "C-shape flossing technique", exact: true })
    .check();
  await rapid.getByRole("button", { name: "Scaling", exact: true }).click();
  await rapid
    .getByRole("button", { name: "Selective polish", exact: true })
    .click();
  await rapid.getByRole("button", { name: "OHE", exact: true }).click();
  await choose(page, "Recommended hygiene interval", "4-month scale");
  await choose(page, "Next hygiene visit", "4 MONTH SCALE");
  const summary = page.locator("#adult-hygiene-summary");
  await expect(summary).toHaveValue(
    /Plaque: Generalized moderate interproximal/,
  );
  await expect(summary).toHaveValue(/Brushing 2x\/day/);
  await expect(summary).toHaveValue(
    /Full mouth scaling with hand and Cavitron instrumentation \(3U Scale\)/,
  );
  await expect(summary).toHaveValue(/Bass brushing/);
  await expect(summary).toHaveValue(/4 BW/);
  await expect(summary).toHaveValue(/EOE: WNL/);
  await page.getByRole("radio", { name: "Hygiene", exact: true }).check();
  await expect(summary).toHaveValue(/Plaque:/);
  await expect(summary).not.toHaveValue(/EOE:/);
  await page.getByRole("radio", { name: "Recare", exact: true }).check();
  await expect(summary).toHaveValue(/EOE: WNL/);
  await expect(summary).not.toHaveValue(/Plaque:/);
  await page.getByRole("radio", { name: "Complete", exact: true }).check();
  await page
    .getByTestId("rapid-entry")
    .getByRole("region", { name: "Oral Hygiene", exact: true })
    .screenshot({ path: testInfo.outputPath("oral-hygiene-desktop.png") });
  await page
    .getByRole("link", { name: "Hygiene Findings", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("rapid-entry-desktop.png"),
  });
});

test("single selections replace, checkboxes toggle, and clear removes note text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openRapid(page);
  await choose(page, "Plaque amount", "Mild");
  await choose(page, "Plaque amount", "Heavy");
  await expect(
    group(page, "Plaque amount").getByRole("radio", {
      name: "Mild",
      exact: true,
    }),
  ).not.toBeChecked();
  await choose(page, "Plaque distribution", "Localized");
  const locations = group(page, "Plaque location");
  await locations
    .getByRole("checkbox", { name: "marginal", exact: true })
    .check();
  await locations
    .getByRole("checkbox", { name: "interproximal", exact: true })
    .check();
  await locations
    .getByRole("checkbox", { name: "marginal", exact: true })
    .uncheck();
  await expect(
    locations.getByRole("checkbox", { name: "interproximal", exact: true }),
  ).toBeChecked();
  await choose(page, "Plaque amount", "None");
  await expect(group(page, "Plaque distribution")).toHaveCount(0);
  await expect(locations).toHaveCount(0);
  await openGeneratedNote(page);
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Plaque: None/,
  );
  await page
    .getByRole("button", { name: "Clear plaque selection", exact: true })
    .click();
  await openGeneratedNote(page);
  await expect(page.locator("#adult-hygiene-summary")).not.toHaveValue(
    /Plaque:/,
  );
});

test("Rapid and Detailed retain the same state, including uncommon findings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openRapid(page);
  await choose(page, "Plaque amount", "Moderate");
  await choose(page, "Plaque distribution", "Generalized");
  await choose(page, "Brushing frequency", "Brushing 2x/day");
  await page.getByRole("radio", { name: "Detailed", exact: true }).check();
  await expect(
    page.getByRole("combobox", { name: "Brushing frequency", exact: true }),
  ).toHaveValue("Brushing 2x/day");
  await page
    .getByRole("textbox", { name: "Recession", exact: true })
    .fill("Synthetic site-specific observation");
  await page
    .getByRole("combobox", { name: "Flossing frequency", exact: true })
    .fill("Synthetic custom frequency");
  const before = await page.locator("#adult-hygiene-summary").inputValue();
  await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
  await expect(
    group(page, "Plaque amount").getByRole("radio", {
      name: "Moderate",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    page.getByRole("textbox", { name: "Recession", exact: true }),
  ).toHaveValue("Synthetic site-specific observation");
  await expect(
    group(page, "Flossing frequency").getByRole("radio", {
      name: "Synthetic custom frequency",
      exact: true,
    }),
  ).toBeChecked();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(before);
  await page.getByRole("radio", { name: "Detailed", exact: true }).check();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(before);
});

test("autosave and reload restore one shared draft and mode preference", async ({
  page,
}) => {
  await openRapid(page);
  await page
    .getByTestId("rapid-entry")
    .getByRole("textbox", { name: "Patient ID", exact: true })
    .fill("SYNTHETIC-RAPID-DRAFT");
  await choose(page, "Bleeding amount", "Moderate");
  await choose(page, "Bleeding distribution", "Generalized");
  await expect
    .poll(
      () =>
        page.evaluate(
          (prefix) =>
            Object.keys(localStorage)
              .filter((key) => key.startsWith(prefix))
              .map((key) => localStorage.getItem(key))
              .join(""),
          draftPrefix,
        ),
      { timeout: 15000 },
    )
    .toContain("Generalized moderate");
  const keys = await page.evaluate(
    (prefix) =>
      Object.keys(localStorage).filter((key) => key.startsWith(prefix)),
    draftPrefix,
  );
  expect(keys).toHaveLength(1);
  await page.getByRole("radio", { name: "Detailed", exact: true }).check();
  await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Rapid Entry", exact: true }),
  ).toBeChecked();
  await expect(
    group(page, "Bleeding amount").getByRole("radio", {
      name: "Moderate",
      exact: true,
    }),
  ).toBeChecked();
  await expect(
    group(page, "Bleeding distribution").getByRole("radio", {
      name: "Generalized",
      exact: true,
    }),
  ).toBeChecked();
  expect(
    await page.evaluate(
      (prefix) =>
        Object.keys(localStorage).filter((key) => key.startsWith(prefix)),
      draftPrefix,
    ),
  ).toEqual(keys);
});

test("normal exam shortcuts confirm before replacing contradictory findings", async ({
  page,
}) => {
  await openRapid(page);
  await choose(page, "EOE", "Findings");
  await expect(
    page.getByRole("textbox", { name: "Extraoral findings", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Extraoral findings", exact: true })
    .fill("Synthetic finding");
  page.once("dialog", (dialog) => dialog.dismiss());
  await group(page, "EOE")
    .getByRole("radio", { name: "WNL", exact: true })
    .click();
  await expect(
    group(page, "EOE").getByRole("radio", { name: "Findings", exact: true }),
  ).toBeChecked();
  page.once("dialog", (dialog) => dialog.accept());
  await choose(page, "EOE", "WNL");
  await expect(
    group(page, "EOE").getByRole("radio", { name: "WNL", exact: true }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "Detailed", exact: true }).check();
  await expect(page.locator("#adult-hygiene-extraoral-findings")).toHaveCount(
    0,
  );
});

test("native radio arrow keys and narrow layouts remain usable", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openRapid(page);
  await page
    .getByTestId("rapid-entry")
    .getByRole("region", { name: "Oral Hygiene", exact: true })
    .screenshot({ path: testInfo.outputPath("oral-hygiene-mobile.png") });
  const mild = group(page, "Bleeding amount").getByRole("radio", {
    name: "Mild",
    exact: true,
  });
  await mild.focus();
  await mild.press("ArrowRight");
  await expect(
    group(page, "Bleeding amount").getByRole("radio", {
      name: "Moderate",
      exact: true,
    }),
  ).toBeChecked();
  await expect(page.locator("#adult-hygiene-summary")).toHaveValue(
    /Bleeding: moderate\./,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("rapid-entry-mobile.png"),
  });
});

test("gingival conflicts and conditional periodontal classification reuse existing rules", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await openRapid(page);
  const summary = page.locator("#adult-hygiene-summary");
  await expect(summary).not.toHaveValue(
    /WNL|Periodontal diagnosis:|Gingival Description:/,
  );
  await expect(group(page, "Periodontal diagnosis category")).toBeVisible();
  await expect(group(page, "Extent/distribution")).toBeVisible();
  await choose(
    page,
    "Periodontal diagnosis category",
    "Periodontitis / history of periodontitis",
  );
  await choose(page, "Periodontitis extent/distribution", "Generalized");
  await expect(summary).toHaveValue(
    /Periodontal diagnosis: GENERALIZED PERIODONTITIS/,
  );
  await choose(page, "Gingival Description", "Findings");
  const color = group(page, "Color");
  await color.getByRole("radio", { name: "Coral pink", exact: true }).check();
  await color
    .getByRole("radio", { name: "Red / erythematous", exact: true })
    .check();
  await expect(
    color.getByRole("radio", { name: "Coral pink", exact: true }),
  ).not.toBeChecked();
  await expect(summary).toHaveValue(/erythematous/i);
  await choose(
    page,
    "Periodontal diagnosis category",
    "Periodontitis / history of periodontitis",
  );
  await choose(page, "Periodontitis stage", "Stage II (P2)");
  await choose(page, "Periodontitis grade", "Grade B: moderate rate");
  await expect(summary).toHaveValue(/Stage II, Grade B/);
  await choose(page, "Periodontal diagnosis category", "Gingivitis");
  await expect(group(page, "Periodontitis stage")).toHaveCount(0);
  await expect(summary).not.toHaveValue(/Stage II|Grade B/);
});

test("None confirms before clearing finding details and Other stays optional", async ({
  page,
}) => {
  await openRapid(page);
  await expect(
    page.getByRole("textbox", {
      name: "Custom brushing frequency",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Other brushing frequency…", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Custom brushing frequency", exact: true })
    .fill("Synthetic exception");
  await page
    .getByText("Add plaque location or detail", { exact: true })
    .click();
  await page.getByText("Add plaque comment", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Plaque comment", exact: true })
    .fill("Synthetic qualifier");
  page.once("dialog", (dialog) => dialog.dismiss());
  await group(page, "Plaque amount")
    .getByRole("radio", { name: "None", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Plaque comment", exact: true }),
  ).toHaveValue("Synthetic qualifier");
  page.once("dialog", (dialog) => dialog.accept());
  await choose(page, "Plaque amount", "None");
  await expect(
    page.getByRole("textbox", { name: "Plaque comment", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("radio", { name: "Detailed", exact: true }).check();
  await expect(
    page.getByRole("textbox", { name: "Plaque comment", exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("combobox", { name: "Brushing frequency", exact: true }),
  ).toHaveValue("Synthetic exception");
});

for (const width of [1600, 390]) {
  test(`sterilization, caries category and Dyclonine are direct and shared at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openRapid(page);
    const rapid = page.getByTestId("rapid-entry");
    const diagnosis = rapid.getByRole("region", {
      name: "Diagnosis and distribution",
      exact: true,
    });
    await expect(diagnosis).toBeVisible();
    await expect(group(page, "Periodontal diagnosis category")).toBeVisible();
    await expect(group(page, "Extent/distribution")).toBeVisible();
    const measurements = rapid.getByRole("button", {
      name: /Structured periodontal observations/,
    });
    await expect(measurements).toBeVisible();
    await expect(measurements).toHaveAttribute("aria-expanded", "false");
    await diagnosis.screenshot({
      path: testInfo.outputPath(`direct-diagnosis-${width}.png`),
    });
    await choose(
      page,
      "Periodontal diagnosis category",
      "Periodontitis / history of periodontitis",
    );
    await expect(group(page, "Periodontitis stage")).toBeVisible();
    await expect(group(page, "Periodontitis grade")).toBeVisible();
    await expect(measurements).toHaveAttribute("aria-expanded", "false");
    await measurements.click();
    await expect(
      rapid.getByRole("spinbutton", {
        name: "Bleeding on probing (%)",
        exact: true,
      }),
    ).toBeVisible();
    await measurements.click();
    await expect(
      rapid.getByRole("spinbutton", {
        name: "Bleeding on probing (%)",
        exact: true,
      }),
    ).not.toBeVisible();
    await expect(group(page, "Periodontitis stage")).toBeVisible();
    await expect(group(page, "Periodontitis grade")).toBeVisible();
    const periodontalSection = rapid.getByRole("region", {
      name: "Gingiva and Periodontal Assessment",
      exact: true,
    });
    const sectionWidth = (await periodontalSection.boundingBox())!.width;
    for (const label of [
      "Periodontal diagnosis category",
      "Periodontitis extent/distribution",
      "Periodontitis stage",
      "Periodontitis grade",
      "Current periodontal status",
    ]) {
      expect(
        (await group(page, label).boundingBox())!.width,
      ).toBeGreaterThanOrEqual(sectionWidth - 2);
    }
    await choose(page, "Periodontitis grade", "Grade C: rapid rate");
    const overrideReason = rapid.getByRole("textbox", {
      name: "Grade override reason",
      exact: true,
    });
    await overrideReason.fill("Synthetic documented rationale");
    const gradeBox = (await group(page, "Periodontitis grade").boundingBox())!;
    expect((await overrideReason.boundingBox())!.y).toBeGreaterThan(
      gradeBox.y + gradeBox.height,
    );
    const statusBox = (await group(
      page,
      "Current periodontal status",
    ).boundingBox())!;
    expect(
      (await rapid
        .getByRole("textbox", {
          name: "Periodontal status comment",
          exact: true,
        })
        .boundingBox())!.y,
    ).toBeGreaterThan(statusBox.y + statusBox.height);
    await rapid
      .getByRole("region", {
        name: "Periodontitis classification",
        exact: true,
      })
      .screenshot({
        path: testInfo.outputPath(`direct-classification-${width}.png`),
      });
    const codes = rapid.getByRole("textbox", {
      name: "Sterilization codes",
      exact: true,
    });
    const category = group(page, "Final clinician caries-risk category");
    const applyRinse = rapid.getByRole("button", {
      name: "Apply Dyclonine rinse",
      exact: true,
    });
    await expect(codes).toBeVisible();
    await expect(category).toBeVisible();
    await expect(applyRinse).toBeVisible();
    await expect(
      category.getByRole("radio", { name: "None selected", exact: true }),
    ).toBeChecked();
    await expect(
      rapid.getByRole("group", { name: "Local anesthesia", exact: true }),
    ).not.toBeVisible();
    await codes.fill("SYNTHETIC-STERI-002");
    await choose(page, "Final clinician caries-risk category", "High");
    await category.locator("xpath=ancestor::section[1]").screenshot({
      path: testInfo.outputPath(`direct-caries-${width}.png`),
    });
    await applyRinse.click();
    await expect(
      rapid.getByRole("button", {
        name: "Dyclonine rinse applied",
        exact: true,
      }),
    ).toBeDisabled();
    const anesthesia = group(page, "Local anesthesia");
    await expect(anesthesia).toBeVisible();
    await expect(
      anesthesia
        .getByRole("list", { name: "Local anesthesia entries" })
        .locator(":scope > li"),
    ).toHaveCount(1);
    await expect(
      anesthesia.getByRole("checkbox", { name: "No C/I to LA", exact: true }),
    ).not.toBeChecked();
    await expect(
      anesthesia.getByRole("spinbutton", { name: "Amount (mL)", exact: true }),
    ).toHaveValue("5");
    await expect(
      anesthesia.getByRole("spinbutton", { name: "Duration (s)", exact: true }),
    ).toHaveValue("60");
    const summary = page.locator("#adult-hygiene-summary");
    await expect(summary).toHaveValue(
      /Sterilization Codes Scanned: SYNTHETIC-STERI-002/,
    );
    await expect(summary).toHaveValue(
      /Final clinician caries-risk category: High\./,
    );
    await expect(summary).toHaveValue(
      /Rinse — full mouth: Dyclonine 1% rinse 5 ml; duration: 60 seconds/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await anesthesia.screenshot({
      path: testInfo.outputPath(`direct-anesthesia-${width}.png`),
    });

    await page.getByRole("radio", { name: "Detailed", exact: true }).check();
    await expect(
      page.getByRole("textbox", { name: "Sterilization codes", exact: true }),
    ).toHaveValue("SYNTHETIC-STERI-002");
    await expect(
      page.getByRole("button", {
        name: "Final clinician caries-risk category",
        exact: true,
      }),
    ).toHaveAttribute("data-value", "High");
    await expect(
      page.getByRole("button", {
        name: "Dyclonine rinse applied",
        exact: true,
      }),
    ).toBeDisabled();
    await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
    await expect(
      category.getByRole("radio", { name: "High", exact: true }),
    ).toBeChecked();
    await choose(page, "Final clinician caries-risk category", "None selected");
    await codes.fill("");
    await anesthesia
      .getByRole("button", { name: "Remove", exact: true })
      .click();
    await expect(applyRinse).toBeEnabled();
    await expect(summary).not.toHaveValue(
      /Final clinician caries-risk category: High\.|SYNTHETIC-STERI-002|Dyclonine 1% rinse/,
    );
    const openDetailed = page.getByRole("button", {
      name: "Open Detailed for additional findings and follow-up",
      exact: true,
    });
    const returnToTop = page.getByRole("link", {
      name: "Return to top",
      exact: true,
    });
    await openDetailed.scrollIntoViewIfNeeded();
    if (width >= 1280) {
      const detailBox = (await openDetailed.boundingBox())!;
      const topBox = (await returnToTop.boundingBox())!;
      expect(Math.abs(detailBox.y - topBox.y)).toBeLessThanOrEqual(1);
      expect(topBox.x).toBeGreaterThan(detailBox.x + detailBox.width);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await returnToTop
      .locator("..")
      .screenshot({ path: testInfo.outputPath(`rapid-footer-${width}.png`) });
    await returnToTop.click();
    await expect(page.locator("#template-top")).toBeFocused();
    const noteBeforeSwitch = await summary.inputValue();
    await openDetailed.click();
    await expect(
      page.getByRole("radio", { name: "Detailed", exact: true }),
    ).toBeChecked();
    await expect(page.locator("#adult-hygiene-entry-mode")).toBeInViewport();
    await expect(summary).toHaveValue(noteBeforeSwitch);
  });
}

for (const width of [1600, 390]) {
  test(`vitals are directly available and shared at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openRapid(page);
    const vitals = page.getByRole("group", {
      name: "Vitals Readings",
      exact: true,
    });
    const summary = page.locator("#adult-hygiene-summary");
    await expect(vitals).toBeVisible();
    await expect(
      vitals.getByRole("button", { name: "Add reading", exact: true }),
    ).toBeVisible();
    await expect(summary).not.toHaveValue(/Vitals reading|BP:|HR:/);
    await vitals
      .getByRole("button", { name: "Add reading", exact: true })
      .click();
    await expect(vitals.getByLabel("Time", { exact: true })).not.toHaveValue(
      "",
    );
    await expect(summary).not.toHaveValue(/Vitals reading|BP:|HR:/);
    await vitals.getByLabel("Systolic", { exact: true }).fill("120");
    await vitals.getByLabel("Diastolic", { exact: true }).fill("80");
    await vitals.getByLabel("Heart Rate", { exact: true }).fill("70");
    await vitals.getByLabel("Time", { exact: true }).fill("09:05");
    await vitals
      .getByRole("button", { name: "Add reading", exact: true })
      .click();
    await vitals.getByLabel("Systolic", { exact: true }).nth(1).fill("130");
    await vitals.getByLabel("Diastolic", { exact: true }).nth(1).fill("84");
    await vitals.getByLabel("Heart Rate", { exact: true }).nth(1).fill("74");
    await vitals
      .getByRole("button", { name: "Clear time", exact: true })
      .nth(1)
      .click();
    await expect(vitals.getByLabel("Time", { exact: true }).nth(1)).toHaveValue(
      "",
    );
    await expect(summary).toHaveValue(
      /Vitals reading 1: BP: 120\/80 mmHg, HR: 70 bpm \(at 09:05\)/,
    );
    await expect(summary).toHaveValue(/Average BP: 125\/82 mmHg, HR: 72 bpm/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await vitals.screenshot({
      path: testInfo.outputPath(`rapid-vitals-${width}.png`),
    });
    await page.getByRole("radio", { name: "Detailed", exact: true }).check();
    await expect(
      vitals.getByLabel("Systolic", { exact: true }).nth(1),
    ).toHaveValue("130");
    await page.getByRole("radio", { name: "Rapid Entry", exact: true }).check();
    await page.reload();
    await expect(
      vitals.getByLabel("Time", { exact: true }).first(),
    ).toHaveValue("09:05");
    await expect(
      vitals.getByLabel("Systolic", { exact: true }).nth(1),
    ).toHaveValue("130");
    await vitals
      .getByRole("button", { name: "Remove", exact: true })
      .nth(1)
      .click();
    await expect(summary).not.toHaveValue(/Average BP:|130\/84/);
    await vitals.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(summary).not.toHaveValue(/Vitals reading|BP:|HR:/);
    await expect(
      vitals.getByRole("button", { name: "Add reading", exact: true }),
    ).toBeVisible();
  });
}
