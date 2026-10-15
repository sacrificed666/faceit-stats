import { describe, expect, it } from "vitest";

import { CATALOG } from "@/test/render";

import { LOCALES } from "./locales";
import { en } from "./messages/en";
import { createFallbackTranslator, pluralCategory, translate, type Message } from "./translate";

// The placeholders of a message
const placeholders = (message: Message): string[] => {
  const texts = typeof message === "string" ? [message] : Object.values(message);
  const names = texts.flatMap((text) => Array.from(text.matchAll(/\{(\w+)\}/g), (match) => match[1] ?? ""));
  return [...new Set(names)].toSorted();
};

describe("translate", () => {
  it("interpolates parameters and formats numbers for each language", () => {
    expect(translate("en", CATALOG.en, "roster.regionRank", { rank: 65_552, region: "EU" })).toBe("#65,552 in EU");
    expect(translate("de", CATALOG.de, "level.toNext", { elo: 1250, level: 9 })).toBe("1.250 ELO bis Level 9");
    expect(translate("uk", CATALOG.uk, "roster.regionRank", { rank: 65_552, region: "EU" })).toMatch(
      /^№ 65\s552 в EU$/u,
    );
  });

  it("keeps unknown placeholders untouched", () => {
    expect(translate("en", CATALOG.en, "level.label")).toBe("Level {level}");
  });

  it("selects plural forms", () => {
    expect(translate("en", CATALOG.en, "count.matches", { count: 1 })).toBe("1 match");
    expect(translate("en", CATALOG.en, "count.matches", { count: 3 })).toBe("3 matches");
    expect(translate("uk", CATALOG.uk, "count.matches", { count: 3 })).toBe("3 матчі");
    expect(translate("uk", CATALOG.uk, "count.matches", { count: 5 })).toBe("5 матчів");
    expect(translate("uk", CATALOG.uk, "count.matches", { count: 21 })).toBe("21 матч");
    expect(translate("pl", CATALOG.pl, "count.matches", { count: 1 })).toBe("1 mecz");
    expect(translate("pl", CATALOG.pl, "count.matches", { count: 3 })).toBe("3 mecze");
    expect(translate("pl", CATALOG.pl, "count.matches", { count: 12 })).toBe("12 meczów");
    expect(translate("pl", CATALOG.pl, "count.matches", { count: 22 })).toBe("22 mecze");
    expect(translate("fr", CATALOG.fr, "count.matches", { count: 0 })).toBe("0 match");
    expect(translate("fr", CATALOG.fr, "count.matches", { count: 2 })).toBe("2 matchs");
    expect(translate("de", CATALOG.de, "count.matches", { count: 1 })).toBe("1 Match");
    expect(translate("cs", CATALOG.cs, "count.matches", { count: 3 })).toBe("3 zápasy");
    expect(translate("cs", CATALOG.cs, "count.matches", { count: 12 })).toBe("12 zápasů");
    expect(translate("pt", CATALOG.pt, "count.matches", { count: 1 })).toBe("1 partida");
    expect(translate("pt", CATALOG.pt, "count.matches", { count: 0 })).toBe("0 partidas");
  });

  it("translates every message in every language", () => {
    const keys = Object.keys(en).toSorted();
    for (const locale of LOCALES) expect(Object.keys(CATALOG[locale]).toSorted()).toEqual(keys);
  });

  it("spells out every plural form a language needs", () => {
    const missing = LOCALES.flatMap((locale) =>
      Object.entries(CATALOG[locale]).flatMap(([key, message]) => {
        if (typeof message === "string") return [];
        return Array.from({ length: 200 }, (_, count) => pluralCategory(locale, count))
          .filter((category) => message[category] === undefined)
          .map((category) => `${locale} ${key} ${category}`);
      }),
    );
    expect([...new Set(missing)]).toEqual([]);
  });

  it("keeps the placeholders and plural forms of every message", () => {
    const mismatched = LOCALES.flatMap((locale) => {
      const messages = new Map<string, Message>(Object.entries(CATALOG[locale]));
      return Object.entries(en)
        .filter(([key, message]) => {
          const translated = messages.get(key);
          return (
            translated === undefined ||
            typeof translated !== typeof message ||
            placeholders(translated).join() !== placeholders(message).join()
          );
        })
        .map(([key]) => `${locale} ${key}`);
    });
    expect(mismatched).toEqual([]);
  });
});

describe("createFallbackTranslator", () => {
  it("translates the messages it has and shows the key for the rest", () => {
    const t = createFallbackTranslator("en", { "error.reference": "Error reference: {digest}" });
    expect(t("error.reference", { digest: "abc" })).toBe("Error reference: abc");
    expect(t("error.retry")).toBe("error.retry");
  });
});
