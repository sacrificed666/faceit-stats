import { describe, expect, it } from "vitest";

import { makePlayer } from "@/test/factories";
import { i18nFor } from "@/test/render";

import { alternates, compareSchema, playerSchema, serializeJsonLd, social, squadSchema } from "./seo";

const base = new URL("https://stats.example.com");

describe("structured data", () => {
  it("escapes markup so a nickname cannot close the script tag", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ name: "</script><script>alert(1)</script>" });
  });

  it("lists the squad on the home page of each language", () => {
    const players = [makePlayer({ nickname: "sacrificed" }), makePlayer({ nickname: "Nitron" })];
    expect(squadSchema(players, base, i18nFor("en"))).toMatchObject({
      "@graph": [
        { "@type": "WebSite", url: "https://stats.example.com/en", inLanguage: "en" },
        {
          "@type": "ItemList",
          numberOfItems: 2,
          itemListElement: [
            { position: 1, url: "https://stats.example.com/en/players/sacrificed" },
            { position: 2, url: "https://stats.example.com/en/players/Nitron" },
          ],
        },
      ],
    });
    const ukrainian = squadSchema(players, base, i18nFor("uk"));
    expect(ukrainian).toHaveProperty(["@graph", 0, "url"], "https://stats.example.com/uk");
    expect(ukrainian).toHaveProperty(["@graph", 0, "inLanguage"], "uk");
  });

  it("describes a player profile with links to FACEIT and Steam", () => {
    const player = makePlayer({ nickname: "z0nGa", steamId: "76561198000000001", country: "ua" });
    expect(playerSchema(player, base, Date.UTC(2026, 9, 3), i18nFor("en"))).toMatchObject({
      "@graph": [
        {
          "@type": "ProfilePage",
          url: "https://stats.example.com/en/players/z0nGa",
          dateModified: "2026-10-03T00:00:00.000Z",
          mainEntity: {
            "@type": "Person",
            name: "z0nGa",
            nationality: { "@type": "Country", name: "Ukraine" },
            sameAs: [
              "https://www.faceit.com/en/players/z0nGa",
              "https://steamcommunity.com/profiles/76561198000000001",
            ],
          },
        },
        { "@type": "BreadcrumbList" },
      ],
    });
  });

  it("describes the compare page with breadcrumbs back to the squad", () => {
    expect(compareSchema(base, i18nFor("en"))).toMatchObject({
      "@graph": [
        { "@type": "WebPage", url: "https://stats.example.com/en/compare" },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { position: 1, item: "https://stats.example.com/en" },
            { position: 2, item: "https://stats.example.com/en/compare" },
          ],
        },
      ],
    });
  });

  it("links every language version and the language-neutral address", () => {
    expect(alternates("uk", "/players/z0nGa")).toEqual({
      canonical: "/uk/players/z0nGa",
      languages: {
        en: "/en/players/z0nGa",
        uk: "/uk/players/z0nGa",
        cs: "/cs/players/z0nGa",
        de: "/de/players/z0nGa",
        es: "/es/players/z0nGa",
        fr: "/fr/players/z0nGa",
        it: "/it/players/z0nGa",
        nl: "/nl/players/z0nGa",
        pl: "/pl/players/z0nGa",
        pt: "/pt/players/z0nGa",
        "x-default": "/players/z0nGa",
      },
    });
    expect(alternates("en").languages["x-default"]).toBe("/");
  });
});

describe("social", () => {
  it("shares the page with every language version and a large card", () => {
    expect(social(i18nFor("uk"), { url: "/uk/compare", title: "Порівняння", description: "Опис" })).toEqual({
      openGraph: {
        type: "website",
        siteName: "Статистика",
        locale: "uk_UA",
        alternateLocale: ["en_GB", "cs_CZ", "de_DE", "es_ES", "fr_FR", "it_IT", "nl_NL", "pl_PL", "pt_PT"],
        url: "/uk/compare",
        title: "Порівняння",
        description: "Опис",
      },
      twitter: { card: "summary_large_image", title: "Порівняння", description: "Опис" },
    });
  });

  it("marks player pages as profiles", () => {
    expect(social(i18nFor("en"), { title: "anna", description: "", profile: "anna" }).openGraph).toMatchObject({
      type: "profile",
      username: "anna",
    });
  });
});
