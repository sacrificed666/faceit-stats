import { expect, test } from "@playwright/test";

test.describe("with a Ukrainian browser", () => {
  test.use({ locale: "uk-UA" });

  test("opens the squad in the browser language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/uk$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Статистика скваду");
  });

  test("prefers the language chosen earlier", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "faceit-stats-locale", value: "pl", url: baseURL ?? "" }]);
    await page.goto("/compare?a=chris");
    await expect(page).toHaveURL(/\/pl\/compare\?a=chris$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Porównaj graczy");
  });
});

test.describe("with a Czech browser", () => {
  test.use({ locale: "cs-CZ" });

  test("opens the squad in Czech with Czech plurals", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/cs$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "cs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Statistiky týmu");
    await expect(page.getByText(/4 hráči v porovnání za posledních 20 zápasů/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Nastavení" })).toBeVisible();
  });
});

test("lowercases the language of an address", async ({ page }) => {
  await page.goto("/EN/compare?a=chris");
  await expect(page).toHaveURL(/\/en\/compare\?a=chris$/);
});

test("keeps the filters and fixes the letter case of a nickname", async ({ page }) => {
  await page.goto("/players/bohdan?range=50");
  await expect(page).toHaveURL(/\/en\/players\/Bohdan\?range=50$/);
  await expect(page.getByRole("heading", { level: 1, name: "Bohdan" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Last 50 matches" })).toBeChecked();
});

test("answers unknown players and pages with a translated 404", async ({ page }) => {
  const player = await page.goto("/en/players/ghost");
  expect(player?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nobody here");

  const missing = await page.goto("/de/nope");
  expect(missing?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Niemand hier");
  await expect(page.getByRole("link", { name: "Übersicht der Gruppe" })).toHaveAttribute("href", "/de");
});
