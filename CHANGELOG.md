# 📜 Changelog

All notable changes to FACEIT Stats are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). How versions are cut is described in [docs/releases.md](./docs/releases.md).

## [Unreleased]

## [1.0.0] - 2026-10-15

The first release.

### Added

- 🧑‍🤝‍🧑 A squad overview with the average ELO, squad K/D and win rate, matches played together and the hottest streak.
- 🃏 Compact player cards with the level, ELO progress to the next level, region ranking, rating, K/D, ADR, win rate, recent results and the last match, in grids that fit the number of players without empty cells.
- ⭐ A Rating 1.0 and the share of rounds survived for every match, calculated from the FACEIT match statistics.
- 🚦 Good values in green and weak ones in red, with the same thresholds on cards, tables, bars, charts and data tables.
- 🖼️ The FACEIT picture of every map next to its name, in the feed, the map pool, the match history and the comparison.
- 🕹️ One feed of recent matches for the whole squad, a sortable leaderboard, rankings against the squad average and per-player trend charts with a readout that never covers the lines.
- 🗺️ A map pool heatmap of win rate, K/D or picks, duos and lineups detected from shared matches, and records such as the best rating, the most kills or the longest win streak.
- 👤 Player pages with current form, a trend chart, maps, a filterable match history, teammates, lifetime and playstyle statistics.
- ⚔️ A head-to-head comparison of two players, including every match they played together or against each other.
- 🎚️ One range for every page: the last 7, 30 or 90 days, or the last 20, 50 or 100 matches, kept in the address, in a floating toolbar with links to every section.
- ⚙️ A settings panel with the theme (automatic, light or dark, without a flash), full or reduced effects (reduced by default outside Apple devices) and the language.
- 🌍 Ten languages under their own addresses: English, Ukrainian, Czech, German, Spanish, French, Italian, Dutch, Polish and Portuguese, with correct plurals, numbers and dates.
- ♿ WCAG AA support: landmarks, sortable table headers, native radio groups and meters, and charts with data tables.
- 🔎 Canonical and `hreflang` links, generated share cards for every page and language, a sitemap, robots rules and JSON-LD.
- ⚡ Prerendered pages refreshed every five minutes, a shared cache for FACEIT responses, throttled, retried requests and links that prefetch one shared shell per kind of page.
- 📱 An installable web app with PNG and maskable icons, a notice when the connection drops and a translated error screen with a retry, even when the layout itself fails.
- 📴 A page of its own in every language when a page cannot load offline, which reloads itself once the connection is back.
- 🖨️ Printed pages in dark text on white in any theme, without the controls.
- 🛡️ A server-only API key, validated FACEIT data, flags served by the app itself and strict security headers.
- 📜 Server logs for every failed request and every failed refresh in the background, with the route and the reference of the error, never with the address.
- 🧪 Unit tests, end-to-end tests against a mock FACEIT API in Chrome and Safari's WebKit, visual tests, axe checks and a Lighthouse budget in CI.
- ▲ Vercel deployments with the server functions in Frankfurt, close to the visitors in Europe.
- 🐳 Docker images for development, staging and production: a multi-stage Dockerfile, a Compose overlay per environment, a non-root standalone server without Linux capabilities and with resource limits, environment files passed to the build as secrets and a `/healthz` endpoint for health checks; every release also publishes the production image to GitHub Packages for amd64 and arm64 with provenance and an SBOM.
- 📡 A `security.txt` for private reports and a monitor that checks the live site and the age of the squad data every hour and its Lighthouse scores every week.
- 🪝 Git hooks and CI checks for formatting, one-line comments, em and en dashes, Conventional Commits and pull request titles.
- 🛠️ A Makefile with a coloured, grouped `make help`: setup that creates `.env` from `.env.example`, the dev server, checks, end-to-end tests, every Docker environment and a sync of the files the three apps share.

[Unreleased]: https://github.com/sacrificed666/faceit-stats/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sacrificed666/faceit-stats/releases/tag/v1.0.0
