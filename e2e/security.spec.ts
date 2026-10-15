import { expect, test } from "@playwright/test";

import { option, watchProblems } from "./helpers";

test("runs without console errors or policy violations", async ({ page }) => {
  const check = await watchProblems(page);
  await page.goto("/en");
  await option(page, "Last 30 days").check();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.locator('img[src="/flags/CZ"]')).toBeVisible();
  // Safari reports requests that a navigation cancels as errors
  await page.waitForLoadState("networkidle");
  await page.goto("/uk/players/anna?range=50");
  await expect(page.getByRole("heading", { level: 1, name: "anna" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.goto("/pl/compare?a=chris&b=dana");
  await expect(page.getByRole("combobox").first()).toHaveValue("chris");

  await check();
});

test("sends the security headers", async ({ request }) => {
  const response = await request.get("/en");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["strict-transport-security"]).toBe("max-age=63072000; includeSubDomains");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-powered-by"]).toBeUndefined();
});
