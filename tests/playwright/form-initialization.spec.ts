import { expect, test } from "@playwright/test";
import {
  CATALOGUE_STORAGE_KEY,
  createEmptyCatalogueState,
  rememberCatalogueValue,
} from "@/lib/catalogues/catalogue";
import {
  PROVIDER_DEFAULTS_STORAGE_KEY,
  createEmptyProviderDefaults,
  setProviderDefault,
} from "@/lib/catalogues/providerDefaults";
import { INTERACTIVE_DRAFT_STORAGE_PREFIX } from "@/lib/templates/localDrafts";
import { clearCurrentForm } from "./helpers/interactiveTemplate";

for (const template of [
  "adult-hygiene-2021",
  "adult-hygiene-2026",
  "adolescent-hygiene",
  "adolescent-hygiene-2026",
  "child-recare-exam-hygiene-notes",
  "recare-exam",
]) {
  test(`${template} initializes defaults once and preserves restored providers and note time`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const added = rememberCatalogueValue(createEmptyCatalogueState(), "visit-team.dentist", "Synthetic default dentist");
    const defaults = setProviderDefault(createEmptyProviderDefaults(), added.state, "visit-team.dentist", added.item.id);
    await page.addInitScript(({ entries }) => {
      for (const [key, value] of entries) localStorage.setItem(key, value);
    }, { entries: [
      [CATALOGUE_STORAGE_KEY, JSON.stringify(added.state)],
      [PROVIDER_DEFAULTS_STORAGE_KEY, JSON.stringify(defaults)],
    ] });
    await page.goto(`/templates/clinic/${template}/interactive`);
    const dentist = page.getByRole("combobox", { name: "Dentist", exact: true });
    const noteStarted = page.getByLabel("Note started", { exact: true });
    await expect(dentist).toHaveValue("Synthetic default dentist");
    await expect(noteStarted).toHaveValue(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    await page.getByRole("textbox", { name: "Patient ID", exact: true }).fill("Synthetic restored patient");
    await dentist.fill("");
    await page.getByRole("link", { name: "View all saved drafts" }).click();
    await expect(page.getByRole("button", { name: /Open draft:.*Synthetic restored patient/ })).toBeVisible();
    await page.evaluate((prefix) => {
      const key = Object.keys(localStorage).find((key) => key.startsWith(prefix));
      if (!key) throw new Error("The form did not checkpoint its draft");
      const draft = JSON.parse(localStorage.getItem(key)!);
      draft.startedAt = new Date(2026, 0, 2, 3, 4).toISOString();
      localStorage.setItem(key, JSON.stringify(draft));
    }, INTERACTIVE_DRAFT_STORAGE_PREFIX);
    await page.getByRole("button", { name: /Open draft:.*Synthetic restored patient/ }).click();
    await expect(dentist).toHaveValue("");
    await expect(noteStarted).toHaveValue("2026-01-02 03:04");
    await clearCurrentForm(page);
    await expect(dentist).toHaveValue("Synthetic default dentist");
    await expect(noteStarted).not.toHaveValue("2026-01-02 03:04");
    expect(errors).toEqual([]);
  });
}
