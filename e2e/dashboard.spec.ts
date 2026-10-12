import { expect, test } from "@playwright/test";

import { openSettings, option } from "./helpers";

const SQUAD = ["anna", "Bohdan", "chris", "dana"];

test("shows every player of the squad", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle("Stats · FACEIT CS2 squad dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Squad stats");
  const roster = page.getByRole("region", { name: "Players" });
  await Promise.all(
    SQUAD.map((nickname) => expect(roster.getByRole("link", { name: nickname, exact: true }).first()).toBeVisible()),
  );
});

test("filters by period and keeps the choice in the address", async ({ page }) => {
  await page.goto("/en");
  await option(page, "Last 7 days").check();
  await expect(page).toHaveURL(/\/en\?range=7d$/);
  await expect(page.getByText(/compared over the last 7 days/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole("radio", { name: "Last 7 days" })).toBeChecked();
  await expect(page.getByText(/compared over the last 7 days/)).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-pending");
});

test("switches the theme and remembers it", async ({ page }) => {
  await page.goto("/en");
  await openSettings(page);
  await option(page, "Dark").check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", "#0f1011");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Dark", includeHidden: true })).toBeChecked();
});

test("switches the language and keeps the filters", async ({ page }) => {
  await page.goto("/en?range=30d");
  await openSettings(page);
  await page.getByRole("link", { name: "Deutsch" }).click();
  await expect(page).toHaveURL(/\/de\?range=30d$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("radio", { name: /30/ })).toBeChecked();
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === "faceit-stats-locale")?.value).toBe("de");
});

test("shows more recent matches on demand", async ({ page }) => {
  await page.goto("/en");
  const feed = page.getByRole("region", { name: "Recent matches" });
  await expect(feed.getByText(/^Showing 8 of \d+$/)).toBeVisible();
  await feed.getByRole("button", { name: "Show more matches" }).click();
  await expect(feed.getByText(/^Showing 16 of \d+$/)).toBeVisible();
});

test("opens a player from the roster", async ({ page }) => {
  await page.goto("/en?range=50");
  await page.getByRole("region", { name: "Players" }).getByRole("link", { name: "chris", exact: true }).first().click();
  await expect(page).toHaveURL(/\/en\/players\/chris\?range=50$/);
  await expect(page.getByRole("heading", { level: 1, name: "chris" })).toBeVisible();
});
