import type { MetadataRoute } from "next";

import { alternates } from "@/features/seo/model/seo";
import { getSquad } from "@/features/squad/api/loader";
import { LOCALES } from "@/shared/i18n/locales";
import { siteUrl } from "@/shared/lib/site";

type Entry = MetadataRoute.Sitemap[number];

// An absolute address escaped for XML, which Next.js leaves to the app
const xmlUrl = (href: string, base?: URL) => new URL(href, base).href.replaceAll("&", "&amp;");

// One sitemap entry per language, each linking the others
const localized = (path: string, base: URL, entry: Omit<Entry, "url" | "alternates">): Entry[] => {
  const languages = Object.fromEntries(
    Object.entries(alternates("en", path).languages).map(([language, href]) => [language, xmlUrl(href, base)]),
  );
  return LOCALES.map((locale) =>
    Object.assign({}, entry, { url: xmlUrl(`/${locale}${path}`, base), alternates: { languages } }),
  );
};

// Sitemap of the overview, compare and every player page
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const base = siteUrl();
  const squad = await getSquad();
  const lastModified = squad.status === "ready" ? new Date(squad.updatedAt) : undefined;
  const pages = [
    ...localized("", base, { lastModified, changeFrequency: "hourly", priority: 1 }),
    ...localized("/compare", base, { lastModified, changeFrequency: "daily", priority: 0.6 }),
  ];
  if (squad.status !== "ready") return pages;
  return [
    ...pages,
    ...squad.players.flatMap((player) =>
      localized(`/players/${encodeURIComponent(player.nickname)}`, base, {
        lastModified,
        changeFrequency: "hourly",
        priority: 0.8,
        images: player.avatar ? [xmlUrl(player.avatar)] : undefined,
      }),
    ),
  ];
};

export default sitemap;
