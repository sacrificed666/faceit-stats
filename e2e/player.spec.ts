import { expect, test } from "@playwright/test";

import { option } from "./helpers";

test("filters the match history", async ({ page }) => {
  await page.goto("/en/players/anna");
  await expect(page).toHaveTitle("anna · FACEIT CS2 · Stats");
  const history = page.getByRole("table", { name: /Match history for anna/ });
  const rows = history.locator("tbody tr");
  // The history streams in after the shell of the page
  await expect(rows.first()).toBeVisible();
  const total = await rows.count();
  expect(total).toBeGreaterThan(0);

  await option(page, "Wins").check();
  await expect(rows).not.toHaveCount(total);
  await expect(history.getByText("Loss", { exact: true })).toHaveCount(0);
});

test("compares the player with the squad", async ({ page }) => {
  await page.goto("/en/players/chris");
  await expect(page.getByRole("link", { name: "FACEIT (opens in a new tab)" })).toHaveAttribute(
    "href",
    "https://www.faceit.com/en/players/chris",
  );
  await page.getByRole("main").getByRole("link", { name: "Compare", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/compare\?a=chris/);
  await expect(page.getByRole("combobox", { name: "First player" })).toHaveValue("chris");
});

test("explains missing lifetime numbers", async ({ page }) => {
  await page.goto("/en/players/dana");
  await expect(page.getByText("FACEIT has no lifetime statistics for this player")).toBeVisible();
});
