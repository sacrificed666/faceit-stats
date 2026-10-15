// Takes the pictures of the README and the docs from a running app
import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";

import { chromium } from "@playwright/test";

// Where the app runs, where the pictures go and how long the page settles
const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = new URL(process.env.SCREENSHOT_DIR ?? "../docs/images/", import.meta.url);
const SETTLE = 1500;
const DESKTOP = { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 };
const SECTION = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const PHONE = { viewport: { width: 390, height: 664 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

// Saves a picture next to the others
const save = (name, buffer) => writeFile(new URL(name, OUT), buffer);

// A page in a theme with full effects, settled and ready for a picture
const open = async (browser, device, theme, path) => {
  const context = await browser.newContext({ ...device, locale: "en-GB", timezoneId: "Europe/Kyiv" });
  await context.addInitScript((value) => {
    localStorage.setItem("faceit-stats/theme", value);
    localStorage.setItem("faceit-stats/effects", "full");
  }, theme);
  const page = await context.newPage();
  await page.goto(new URL(path, BASE).href);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(SETTLE);
  return page;
};

// Takes a picture of the window and closes it
const shoot = async (page, name) => {
  await save(name, await page.screenshot({ type: "jpeg", quality: 85 }));
  await page.context().close();
};

// Scrolls a section of the overview to just under the range toolbar
const scrollTo = async (page, id, offset) => {
  await page.evaluate(
    ({ section, room }) => {
      const element = document.getElementById(section);
      if (element) window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - room);
    },
    { section: id, room: offset },
  );
  await page.waitForTimeout(SETTLE);
};

// The overview scrolled to one of its sections
const section =
  (name, theme, id, offset, height = 900) =>
  async (browser) => {
    const page = await open(browser, { ...SECTION, viewport: { width: 1440, height } }, theme, "/en");
    await scrollTo(page, id, offset);
    await shoot(page, name);
  };

// The page of the best player of the squad, without the language
const topPlayer = async (browser) => {
  const page = await open(browser, DESKTOP, "dark", "/en");
  const href = await page.locator('a[href*="/players/"]').first().getAttribute("href");
  await page.context().close();
  if (!href) throw new Error("The overview links to no player");
  return href.replace(/^\/en/u, "");
};

const SHOTS = [
  // The overview in both themes
  async (browser) => shoot(await open(browser, DESKTOP, "light", "/en"), "desktop-light.jpg"),
  async (browser) => shoot(await open(browser, DESKTOP, "dark", "/en"), "desktop-dark.jpg"),
  // Sections of the overview
  section("activity-light.jpg", "light", "activity", 160, 830),
  section("leaderboard-dark.jpg", "dark", "leaderboard", 90),
  section("trends-dark.jpg", "dark", "trends", 90),
  section("maps-light.jpg", "light", "maps", 90),
  // A player, a comparison and two phones
  async (browser) => shoot(await open(browser, DESKTOP, "dark", `/en${await topPlayer(browser)}`), "player-dark.jpg"),
  async (browser) => shoot(await open(browser, DESKTOP, "dark", "/en/compare"), "compare-dark.jpg"),
  async (browser) => shoot(await open(browser, PHONE, "dark", "/en"), "mobile-dark.jpg"),
  async (browser) =>
    shoot(await open(browser, PHONE, "light", `/uk${await topPlayer(browser)}`), "mobile-player-light.jpg"),
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  await SHOTS.reduce((previous, shot) => previous.then(() => shot(browser)), Promise.resolve());
  process.stdout.write(`Saved ${SHOTS.length} pictures in ${OUT.pathname}.\n`);
} finally {
  await browser.close();
}
