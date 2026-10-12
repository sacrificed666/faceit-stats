import type { Metadata } from "next";

import type { Player } from "@/features/squad/model/types";
import type { I18n } from "@/shared/i18n/context";
import { LOCALE_INFO, LOCALES, type Locale } from "@/shared/i18n/locales";
import { SITE } from "@/shared/lib/site";
import { comparePath, faceitProfileUrl, homePath, playerPath, steamProfileUrl } from "@/shared/lib/urls";

type Schema = Record<string, unknown>;

export interface Alternates {
  canonical: string;
  languages: Record<string, string>;
}

// JSON-LD that cannot close the script tag it sits in
export const serializeJsonLd = (data: Schema): string => JSON.stringify(data).replaceAll("<", "\\u003c");

export interface SocialPage {
  title: string;
  description: string;
  url?: string;
  profile?: string;
}

// Canonical and hreflang links of a page in every language
export const alternates = (locale: Locale, path = ""): Alternates => {
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((entry) => [entry, `/${entry}${path}`]));
  languages["x-default"] = path === "" ? "/" : path;
  return { canonical: `/${locale}${path}`, languages };
};

// Open Graph and Twitter metadata of a page
export const social = (
  { locale, t }: Pick<I18n, "locale" | "t">,
  page: SocialPage,
): Pick<Metadata, "openGraph" | "twitter"> => {
  const shared = {
    siteName: t("app.name"),
    locale: LOCALE_INFO[locale].openGraph,
    alternateLocale: LOCALES.filter((entry) => entry !== locale).map((entry) => LOCALE_INFO[entry].openGraph),
    title: page.title,
    description: page.description,
    ...(page.url ? { url: page.url } : {}),
  };
  return {
    openGraph: page.profile ? { ...shared, type: "profile", username: page.profile } : { ...shared, type: "website" },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
  };
};

// A player as a schema.org Person with the FACEIT and Steam profiles
const person = (player: Player, base: URL, { locale, format }: I18n): Schema => {
  const url = new URL(playerPath(locale, player.nickname), base).href;
  const sameAs = [faceitProfileUrl(player.nickname)];
  if (player.steamId) sameAs.push(steamProfileUrl(player.steamId));
  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: player.nickname,
    url,
    ...(player.avatar ? { image: player.avatar } : {}),
    ...(player.country ? { nationality: { "@type": "Country", name: format.country(player.country) } } : {}),
    sameAs,
  };
};

// The site as a schema.org WebSite
const website = (base: URL, { locale, t }: I18n): Schema => ({
  "@type": "WebSite",
  "@id": new URL(`${homePath(locale)}#website`, base).href,
  name: t("app.name"),
  url: new URL(homePath(locale), base).href,
  description: t("app.description"),
  inLanguage: locale,
  author: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
});

// Structured data of the overview: the site and the list of players
export const squadSchema = (players: readonly Player[], base: URL, i18n: I18n): Schema => {
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(base, i18n),
      {
        "@type": "ItemList",
        name: i18n.t("meta.squadList"),
        numberOfItems: players.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: players.map((player, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: new URL(playerPath(i18n.locale, player.nickname), base).href,
          name: player.nickname,
        })),
      },
    ],
  };
};

// Structured data of a player page: the profile and its breadcrumbs
export const playerSchema = (player: Player, base: URL, updatedAt: number, i18n: I18n): Schema => {
  const url = new URL(playerPath(i18n.locale, player.nickname), base).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        name: i18n.t("meta.profile", { player: player.nickname, app: i18n.t("app.name") }),
        inLanguage: i18n.locale,
        dateModified: new Date(updatedAt).toISOString(),
        isPartOf: { "@id": new URL(`${homePath(i18n.locale)}#website`, base).href },
        mainEntity: person(player, base, i18n),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: i18n.t("nav.squad"),
            item: new URL(homePath(i18n.locale), base).href,
          },
          { "@type": "ListItem", position: 2, name: player.nickname, item: url },
        ],
      },
    ],
  };
};

// Structured data of the compare page: the page and its breadcrumbs
export const compareSchema = (base: URL, i18n: I18n): Schema => {
  const url = new URL(comparePath(i18n.locale), base).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: i18n.t("compare.title"),
        description: i18n.t("meta.compare"),
        inLanguage: i18n.locale,
        isPartOf: { "@id": new URL(`${homePath(i18n.locale)}#website`, base).href },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: i18n.t("nav.squad"),
            item: new URL(homePath(i18n.locale), base).href,
          },
          { "@type": "ListItem", position: 2, name: i18n.t("nav.compare"), item: url },
        ],
      },
    ],
  };
};
