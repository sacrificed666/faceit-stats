import { locale as rootLocale } from "next/root-params";
import { describe, expect, it, vi } from "vitest";

import { CATALOG } from "@/test/render";

import { LOCALES } from "./locales";
import { currentLocale, getI18n, getMessages } from "./server";

vi.mock("next/root-params", () => ({ locale: vi.fn<() => Promise<string | undefined>>() }));

describe("server translations", () => {
  it("loads the catalog of every language", async () => {
    const catalogs = await Promise.all(LOCALES.map((locale) => getMessages(locale)));
    expect(catalogs).toEqual(LOCALES.map((locale) => CATALOG[locale]));
  });

  it("creates a translator and a formatter for a language", async () => {
    const { t, format } = await getI18n("uk");
    expect(t("count.matches", { count: 3 })).toBe("3 матчі");
    expect(format.integer(65_552)).toMatch(/^65\s552$/u);
  });

  it("reads the language of the current route", async () => {
    vi.mocked(rootLocale).mockResolvedValueOnce("de");
    expect(await currentLocale()).toBe("de");
    vi.mocked(rootLocale).mockResolvedValueOnce("ru");
    expect(await currentLocale()).toBe("en");
  });
});
