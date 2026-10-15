import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { clippedText, MAC_USER_AGENT, openSettings } from "./helpers";

const PAGES = [
  "/en",
  "/en/players/anna",
  "/en/compare",
  "/uk",
  "/pl/players/Bohdan",
  "/nl/compare",
  "/en/players/ghost",
];

test.use({ reducedMotion: "reduce" });

// The computed background colour of an element
const background = (locator: Locator): Promise<string> =>
  locator.evaluate((element) => getComputedStyle(element).backgroundColor);

// Axe violations of a page once it has applied the address
const violations = async (page: Page) => {
  await page.locator("html:not([data-pending])").waitFor();
  const results = await new AxeBuilder({ page })
    .options({ rules: { "label-content-name-mismatch": { enabled: true }, "target-size": { enabled: true } } })
    .analyze();
  return results.violations.map((violation) => ({
    rule: violation.id,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
};

for (const path of PAGES) {
  test(`has no detectable accessibility issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await violations(page)).toEqual([]);
  });
}

test("keeps the dark theme accessible", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("faceit-stats/theme", "dark"));
  await page.goto("/en?range=100");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await violations(page)).toEqual([]);
});

test.describe("with the full effects of Apple devices", () => {
  test.use({ userAgent: MAC_USER_AGENT });

  for (const theme of ["light", "dark"]) {
    test(`keeps the glass readable in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("faceit-stats/theme", value), theme);
      await page.goto("/en/players/anna");
      await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
      expect(await violations(page)).toEqual([]);
    });
  }
});

test("keeps the settings accessible", async ({ page }) => {
  await page.goto("/en");
  await openSettings(page);
  expect(await violations(page)).toEqual([]);
});

test("can be used with the keyboard alone", async ({ page, browserName }) => {
  await page.goto("/en");
  // Safari moves focus to links with Option+Tab
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

for (const path of ["/en", "/nl", "/de/players/anna", "/pl/compare", "/uk/compare?a=anna&b=dana"]) {
  test(`reflows at 320 pixels without scrolling sideways on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const [path, settings] of [
  ["/nl", "Instellingen"],
  ["/pl/players/Bohdan", "Ustawienia"],
  ["/uk/compare?a=anna&b=dana", "Налаштування"],
] as const) {
  test(`shows every word whole at 360 pixels on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await clippedText(page)).toEqual([]);
    await openSettings(page, settings);
    expect(await clippedText(page)).toEqual([]);
  });
}

test.describe("in forced colours mode", () => {
  test.use({ forcedColors: "active" });

  test("keeps the chosen option and the data bars visible", async ({ page }) => {
    await page.goto("/en");
    const toolbar = page.getByRole("group", { name: "Matches to include for each player" });
    const chosen = await background(toolbar.locator(":checked + span"));
    const other = await background(toolbar.locator(":not(:checked) + span").first());
    const canvas = await background(page.locator("body"));
    expect(chosen).not.toBe(other);
    expect(await background(page.locator("#rankings .mark").first())).not.toBe(canvas);
  });
});
