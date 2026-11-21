import { devices, expect, test } from "@playwright/test";

test.use({ ...devices["iPhone SE"], defaultBrowserType: undefined });

test("all injection techniques are reachable by touch on a small screen", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Touch swipe uses Chromium's DevTools protocol.");
  await page.goto("/templates/clinic/adult-hygiene-2026/interactive");

  const anesthesia = page.getByRole("group", { name: "Local anesthesia", exact: true });
  await anesthesia.getByRole("button", { name: "Add injection entry" }).tap();

  const trigger = anesthesia.getByRole("button", { name: "Injection type", exact: true });
  await trigger.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await trigger.tap();
  const list = anesthesia.getByRole("listbox", { name: "Injection type options" });
  const techniques = ["I/O", "M/I", "S/I", "ASA", "MSA", "PSA", "IA/L", "Buccal NB", "GP", "NP"];
  await expect(list.getByRole("option").locator(":scope > span:first-child")).toHaveText(["None selected", ...techniques]);

  const bounds = (await list.boundingBox())!;
  const x = Math.round(bounds.x + bounds.width / 2);
  const y = Math.round(bounds.y + 215);
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (const distance of [25, 55, 90, 125, 165, 200]) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y - distance }],
    });
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(trigger).toHaveAttribute("data-value", "");
  await expect(list).toBeVisible();

  const lastOption = list.getByRole("option", { name: "NP", exact: true });
  await expect(lastOption).toBeInViewport({ ratio: 1 });
  if (process.env.MOBILE_INJECTION_SCREENSHOT) {
    await page.screenshot({ path: process.env.MOBILE_INJECTION_SCREENSHOT });
  }
  await lastOption.tap();
  await expect(trigger).toHaveAttribute("data-value", "NP");

  for (const technique of techniques.slice(0, -1)) {
    await trigger.tap();
    await list.getByRole("option", { name: technique, exact: true }).tap();
    await expect(trigger).toHaveAttribute("data-value", technique);
  }
});

test("legacy template exposes the new injection techniques in its native picker", async ({
  page,
}) => {
  await page.goto("/templates/dental-hygiene-note-webform");
  await page.getByRole("checkbox", { name: "No C/I to LA" }).tap();
  await page.getByRole("button", { name: "Add injection entry" }).tap();

  const picker = page.locator("#local-anesthesia-entry-0 select").filter({
    has: page.locator('option[value="I/O"]'),
  });
  for (const technique of ["S/I", "ASA", "MSA"]) {
    await picker.selectOption(technique);
    await expect(picker).toHaveValue(technique);
  }
});
