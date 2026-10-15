# 🔎 SEO

## 🏷️ Metadata

| Field                    | Squad overview                              | Player page                                        | Compare                                 |
| ------------------------ | ------------------------------------------- | -------------------------------------------------- | --------------------------------------- |
| 🏷️ Title                 | `Stats` (the in-app name of the language)   | `sacrificed · Stats`                               | `Compare players · Stats`               |
| 📝 Description           | What the dashboard compares                 | Level, ELO and the last 20 matches in one sentence | What the comparison shows               |
| 🔗 Canonical             | `/en`                                       | `/en/players/<exact nickname>`                     | `/en/compare`                           |
| 🌐 Alternates            | All ten languages and `x-default`           | The same                                           | The same                                |
| 🖼️ Open Graph and X card | Generated squad card, `summary_large_image` | Generated player card, Open Graph type `profile`   | Generated card with the two top players |
| 🤖 Robots                | `index, follow`, large image previews       | The same                                           | The same                                |

The defaults live in `src/app/[locale]/layout.tsx`. Every page builds its Open Graph and X fields through `social()` in `src/features/seo/model/seo.ts`, so the site name, the language, the alternate languages and the large card are never lost when a page overrides the title. All URLs are absolute thanks to `metadataBase`.

## 🌍 Languages

Each language version is a separate page with its own address, title, description and card, see [Localization](./i18n.md).

- 🔗 `<link rel="canonical">` points to the page in its own language.
- 🌐 `<link rel="alternate" hreflang>` lists all ten versions, and `x-default` points to the address without a language, which redirects by browser language.
- 🏷️ `og:locale` names the language (`uk_UA`), `og:locale:alternate` the other nine.
- 📄 `<html lang>` matches the page.

## 🌍 The public address

`siteUrl()` in `src/shared/lib/site.ts` decides the base for every absolute URL:

1. 🌍 `SITE_URL`, when it is set.
2. ▲ `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets to the shortest custom domain of the project, `stats.sacrificed.me`, or to the `vercel.app` address before a domain is added.
3. 💻 `http://localhost:<PORT>` for local development.

## 🖼️ Open Graph images

Cards are drawn with `ImageResponse` from `next/og` for every page and language at build time and regenerated together with the data:

| Card       | Content                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 🧑‍🤝‍🧑 Squad   | Title, number of players, average ELO and the five highest-rated players with level and ELO     |
| 👤 Player  | Avatar, nickname, level, ELO, region ranking, the last ten results and K/D, ADR, HS % and Win % |
| ⚔️ Compare | The two highest-rated players with their level and ELO                                          |

The cards use Montserrat from `src/shared/assets/fonts` in the Latin, Latin Extended and Cyrillic subsets, so every language renders correctly. Each card has a translated `alt` text. Avatars are downloaded once, embedded as data URLs and cached for a day, so a slow CDN never breaks an image.

## 🗺️ Sitemap and robots

- 🗺️ `/sitemap.xml` lists the overview, the compare page and every player page in all ten languages, each with its `hreflang` alternates, the time of the last update and the player's avatar as an image entry.
- 🤖 `/robots.txt` allows everything in production and points to the sitemap.

> [!NOTE]
> On Vercel preview deployments (`VERCEL_ENV=preview`) robots disallow everything and pages are marked `noindex`, so previews never compete with the real site.

## 🧩 Structured data

Every page includes JSON-LD in its language (`inLanguage`), escaped so that a nickname can never close the script tag:

| Page              | Types                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| 🧑‍🤝‍🧑 Squad overview | `WebSite` and an `ItemList` of player pages                                                                      |
| 👤 Player page    | `ProfilePage` with a `Person` (image, nationality and `sameAs` links to FACEIT and Steam) and a `BreadcrumbList` |
| ⚔️ Compare        | `WebPage` that belongs to the site and a `BreadcrumbList` back to the squad                                      |

> [!TIP]
> Validate changes with the [Rich Results Test](https://search.google.com/test/rich-results) or the [Schema Markup Validator](https://validator.schema.org/), and check share cards with the preview of the network you post to.

## 🔗 Clean URLs

- 🔤 `/en/players/jacksongg` redirects permanently (`308`) to `/en/players/JACKSONGG`, so each player has exactly one URL per language.
- ↪️ `/players/JACKSONGG` without a language redirects temporarily (`307`) to the visitor's language, and `/EN/players/JACKSONGG` permanently (`308`) to `/en/players/JACKSONGG`.
- ❓ The range and the compared pair live in query parameters (`?range=50`, `?a=…&b=…`) that the canonical link leaves out.
- 🚫 Nicknames outside the squad and unknown addresses answer with a real **404** status and a page marked `noindex`.

## ⚡ Page experience

- 📄 Every page is prerendered HTML with the full content, so crawlers see the same numbers as visitors.
- 🔤 Fonts are self-hosted with `font-display: swap`; only the Latin subset is preloaded, other alphabets load when a page needs them.
- 🖼️ Avatars and map art go through `next/image` with explicit sizes.
- 📐 Charts are drawn on the server, so nothing shifts when JavaScript loads.
- 🧭 `manifest.webmanifest`, an SVG icon, an Apple touch icon and theme colours for light and dark mode are generated from `src/app`.
- 🚦 A Lighthouse budget in CI keeps performance, accessibility, best practices and SEO in check, see [Testing](./testing.md#-lighthouse-budget).
