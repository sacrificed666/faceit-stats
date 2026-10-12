import { describe, expect, it } from "vitest";

import { createFormatter } from "./format";

const MATCH_END = Date.UTC(2026, 8, 19, 9, 44);
const en = createFormatter("en");

describe("number formatting", () => {
  it("formats decimals with a fixed number of digits and a real minus sign", () => {
    expect(en.decimal(1.234, 2)).toBe("1.23");
    expect(en.decimal(82.43, 1)).toBe("82.4");
    expect(en.decimal(-0.5, 2)).toBe("−0.50");
  });

  it("groups thousands in integers", () => {
    expect(en.integer(65_552)).toBe("65,552");
    expect(en.integer(2403.6)).toBe("2,404");
  });

  it("formats percentages", () => {
    expect(en.percent(47.5)).toBe("47.5%");
    expect(en.percent(60, 0)).toBe("60%");
  });

  it("signs differences and keeps zero unsigned", () => {
    expect(en.signed(0.123, 2)).toBe("+0.12");
    expect(en.signed(-0.07, 2)).toBe("−0.07");
    expect(en.signed(0.001, 2)).toBe("0.00");
  });

  it("follows each language's conventions", () => {
    expect(createFormatter("uk").decimal(1.15, 2)).toBe("1,15");
    expect(createFormatter("de").integer(65_552)).toBe("65.552");
    expect(createFormatter("de").percent(47.5)).toMatch(/^47,5\s%$/u);
    expect(createFormatter("fr").percent(60, 0)).toMatch(/^60\s%$/u);
    expect(createFormatter("pl").decimal(-0.5, 2)).toBe("−0,50");
  });

  it("joins lists and names countries in the current language", () => {
    expect(en.list(["anna", "bohdan", "chris"])).toBe("anna, bohdan and chris");
    expect(createFormatter("uk").list(["anna", "bohdan"])).toBe("anna і bohdan");
    expect(en.country("ua")).toBe("Ukraine");
    expect(createFormatter("uk").country("ua")).toBe("Україна");
    expect(createFormatter("de").country("pl")).toBe("Polen");
  });
});

describe("date formatting", () => {
  it("formats dates in the requested time zone", () => {
    expect(en.date(MATCH_END, "UTC")).toBe("19 Sept 2026");
    expect(en.date(MATCH_END, "UTC", "short")).toBe("19 Sept");
    expect(en.date(MATCH_END, "Europe/Kyiv", "datetime")).toBe("19 Sept 2026, 12:44");
  });

  it("moves to the next day across midnight in the local time zone", () => {
    const lateEvening = Date.UTC(2026, 8, 19, 22, 30);
    expect(en.date(lateEvening, "UTC")).toBe("19 Sept 2026");
    expect(en.date(lateEvening, "Europe/Kyiv")).toBe("20 Sept 2026");
  });

  it("describes relative times in every language", () => {
    const now = MATCH_END;
    expect(en.relative(now - 30_000, now)).toBe("now");
    expect(en.relative(now - 5 * 60_000, now)).toBe("5 minutes ago");
    expect(en.relative(now - 26 * 3_600_000, now)).toBe("yesterday");
    expect(en.relative(now - 3 * 86_400_000, now)).toBe("3 days ago");
    expect(createFormatter("uk").relative(now - 3 * 86_400_000, now)).toBe("3 дні тому");
    expect(createFormatter("de").relative(now - 26 * 3_600_000, now)).toBe("gestern");
  });
});
