import { expect, test, type Page } from "@playwright/test";

// The two players in the address of the compare page
const pair = (page: Page) => {
  const query = new URL(page.url()).searchParams;
  return [query.get("a"), query.get("b")];
};

test("compares two players and keeps them in the address", async ({ page }) => {
  await page.goto("/en/compare");
  const first = page.getByRole("combobox", { name: "First player" });
  const second = page.getByRole("combobox", { name: "Second player" });
  await expect(first).toHaveValue("anna");
  await expect(second).toHaveValue("Bohdan");

  await second.selectOption("dana");
  await expect(second).toHaveValue("dana");
  expect(pair(page)).toEqual([null, "dana"]);

  await page.getByRole("button", { name: "Swap players" }).click();
  await expect(first).toHaveValue("dana");
  expect(pair(page)).toEqual(["dana", "anna"]);

  await page.reload();
  await expect(first).toHaveValue("dana");
  await expect(second).toHaveValue("anna");
});

test("lists the matches both players played", async ({ page }) => {
  await page.goto("/en/compare?a=anna&b=Bohdan&range=100");
  const shared = page.getByRole("region", { name: "Shared matches" });
  await expect(shared.getByRole("table")).toBeVisible();
  await expect(shared.getByRole("link", { name: /Match room for/ }).first()).toHaveAttribute(
    "href",
    /^https:\/\/www\.faceit\.com\/en\/cs2\/room\/1-e2e-/,
  );
});
