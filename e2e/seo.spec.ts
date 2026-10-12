import { expect, test } from "@playwright/test";

import { LOCALES } from "../src/shared/i18n/locales";

test.skip(({ isMobile }) => isMobile, "The markup for search engines is the same on every screen");

test("links every language version of a page", async ({ page, baseURL }) => {
  await page.goto("/uk/players/anna");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${baseURL}/uk/players/anna`);
  const languages = await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("hreflang")));
  expect(new Set(languages)).toEqual(new Set([...LOCALES, "x-default"]));
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "uk_UA");
});

test("describes the page with structured data", async ({ page }) => {
  await page.goto("/en/players/anna");
  const json = await page.locator('script[type="application/ld+json"]').first().textContent();
  const schema: unknown = JSON.parse(json ?? "null");
  expect(schema).toHaveProperty(["@graph", "0", "@type"], "ProfilePage");
  expect(schema).toHaveProperty(["@graph", "0", "inLanguage"], "en");
});

test("lists every page in the sitemap", async ({ request, baseURL }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  for (const path of ["/en", "/uk/compare", "/pl/players/Bohdan"])
    expect(xml).toContain(`<loc>${baseURL}${path}</loc>`);
});

for (const path of ["/en", "/fr/players/chris", "/it/compare"]) {
  test(`serves a share image for ${path}`, async ({ page, request }) => {
    await page.goto(path);
    const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    const response = await request.get(image ?? "");
    expect(response.headers()["content-type"]).toBe("image/png");
  });
}

test("names a security contact that has not expired", async ({ request }) => {
  const text = await (await request.get("/.well-known/security.txt")).text();
  expect(text).toMatch(/^Contact: https:\/\/github\.com\/sacrificed666\/[\w-]+\/security\/advisories\/new$/mu);
  const expires = Date.parse(/^Expires: (?<date>.+)$/mu.exec(text)?.groups?.date ?? "");
  expect(expires).toBeGreaterThan(Date.now());
});
