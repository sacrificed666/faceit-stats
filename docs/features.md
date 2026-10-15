# ✨ Features

## 🧭 Layout

Every page shares one header with the logo, the **Squad** and **Compare** links and the **Settings** button, and one footer with the author, the version, the data source and a link to the source code:

| Page                                  | What it shows                                            |
| ------------------------------------- | -------------------------------------------------------- |
| 🧑‍🤝‍🧑 `/en` Squad overview               | Every player of `FACEIT_PLAYERS` side by side            |
| 👤 `/en/players/<nickname>`           | One player in depth, compared with the rest of the squad |
| ⚔️ `/en/compare?a=<first>&b=<second>` | Two players head to head                                 |

Every address starts with a language, see [Localization](./i18n.md). Below the page title, a floating toolbar stays at the top of the screen while you scroll. It holds the **range** and links to every section: in a row on wide screens, behind a **Sections** button on smaller ones.

## 🎚️ Range

Every number on a page is calculated from one range, chosen in the toolbar:

| Range                                     | Each player's matches                            |
| ----------------------------------------- | ------------------------------------------------ |
| 📅 Last **7**, **30** or **90** days      | Every CS2 match finished in those days           |
| 🔢 Last **20**, **50** or **100** matches | Their own most recent matches, **20** by default |

- 🔗 The range is kept in the address (`?range=30d`, `?range=50`), so a link opens with the same view. Player and compare links carry it along.
- ⚡ FACEIT returns up to 100 matches per player and every range is calculated in the browser, so switching is instant.
- 🗓️ A day range compares everyone over the same period; a match range compares the same amount of play, even if one player plays daily and another once a month.

> [!TIP]
> Share a link to show the same view: the range, the compared players and the language all live in the address.
> [!NOTE]
> Only **5v5** matches count. Wingman, 1v1 and other modes are left out of every statistic, and FACEIT returns at most the last 100 matches of each player.

## 📐 Metrics

FACEIT reports kills, deaths, assists, ADR, headshots, MVPs and multi-kill rounds for every match. Two more numbers are calculated from them:

- ⭐ **Rating 1.0**: the HLTV 1.0 rating of a match, from kills per round, rounds survived and multi-kill rounds, each measured against the average of professional play. **1.00** is an average game, **1.20** a strong one.
- 🛡️ **Rounds survived**: the share of rounds in which the player did not die.

## 🚦 Highlighted numbers

Wherever a metric appears, in cards, tables, bars, charts and the data tables under them, a good value is **green** and a weak one **red**; everything in between keeps the normal colour:

| Metric             | Green from | Red below |
| ------------------ | ---------- | --------- |
| ⭐ Rating          | 1.10       | 0.90      |
| 🎯 K/D             | 1.10       | 0.90      |
| 🔫 K/R             | 0.75       | 0.60      |
| 💥 ADR             | 85         | 70        |
| 💀 HS %            | 55 %       | 35 %      |
| 🛡️ Rounds survived | 40 %       | 28 %      |
| 🏆 Win %           | 55 %       | 45 %      |

Colour is never the only signal: the value itself is always printed, and the differences to the squad average carry an arrow.

## 🖼️ Map pictures

Every map name comes with the picture FACEIT shows for that map, taken from the players' lifetime map statistics: in the recent matches, the map pool, the match history and the compare page. A map without a picture shows its initials instead.

## 🧑‍🤝‍🧑 Squad overview

### 📊 Overview tiles

| Tile               | Meaning                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| 📈 Average ELO     | Mean ELO of the squad with the level it falls into, and the highest-rated player  |
| 🎯 Squad K/D       | Mean of the players' average K/D, highlighted, and the best player                |
| 🏆 Squad win rate  | Mean of the players' win rates, highlighted, and the best player                  |
| 🤝 Played together | Matches in which at least two squad members were on the same team, and their wins |
| 🔥 Hottest streak  | The longest win streak that is still running                                      |

### 🃏 Players

One compact card per player, sorted by ELO, four in a row on wide screens: avatar, nickname and flag, region ranking, level badge, ELO with a bar towards the next level (or the ELO above level 10), rating, K/D, ADR and win rate, the last five results and how long ago the last match was. The whole card opens the player page.

### 🕹️ Recent matches

The latest matches of the whole squad in one table, newest first, with columns for the map, the result, the player, K-D-A, rating, K/D and ADR, so every number lines up with the ones above it:

- 🫂 A match that several squad members played is shown **once** and marked **Together**: the map, the result and the match room span a row for everyone who played.
- ⚔️ When squad members met on opposite teams, each side gets its own result and the match is marked **Squad vs squad**.
- 🔗 Every match has the map with its picture, how long ago it was and a link to the FACEIT match room; on phones each player shows K-D-A and the rating under the name, so the table fits the screen.
- ➕ Eight matches are shown at first, **Show more matches** adds eight more.

![Recent matches, with matches played together shown once with both players](./images/activity-light.jpg)

### 🏆 Leaderboard

A table of every player with ELO, level, form, matches with the win-loss record, rating, K/D, K/R, ADR, headshot rate and win rate.

- ↕️ Every numeric column header is a button: the first click sorts from high to low, the next one reverses it.
- 🥇 Medals mark the top three of every column; ties share a place. ELO medals count every player, because ELO does not depend on the range.
- 💤 Players without matches in the range stay at the bottom in both sort directions and show a dash.
- ➗ The footer row shows the squad average.
- 📱 On narrow screens the table scrolls sideways while the player column stays in place.

### 📊 Rankings

Horizontal bars for one metric at a time (Rating, K/D, K/R, ADR, HS % or Win %), sorted from best to worst, with a vertical line for the squad average.

### 📈 Trends

Small multiples: one chart per player, four in a row on wide screens, all on the same scale and ordered from the best average down, so the shapes can be compared directly. Each chart shows the value of every match (Rating, K/D, K/R, ADR or HS %) and a **five-match rolling average**, with the squad average as a dashed reference. Hover, tap or use the arrow keys to read a single match in the readout above the chart, and open **Show data table** for the highlighted numbers: every player with their avatar, the average, the best and worst match and the last five, under a header that stays in view while the table scrolls.

![Trend charts for every player on a shared scale](./images/trends-dark.jpg)

### 🗺️ Map pool

A heatmap with a row per player and a column per map, each column headed by the map picture and ordered by how often the squad plays it:

| Metric     | Colours                                          |
| ---------- | ------------------------------------------------ |
| 🏆 Win %   | Green above 50 %, red below, grey around 50 %    |
| 🎯 K/D     | Green above 1.00, red below                      |
| 🔁 Matches | Darker orange for maps a player picks more often |

Every cell also prints the value and the number of matches, and the **Whole squad** row adds up all players. A cell reaches its full colour only from five matches on, so a map played once or twice stays pale instead of looking like a strength or a weakness.

![The map pool heatmap with win rates per player and map](./images/maps-light.jpg)

### 🤝 Playing together

Two squad members who appear in the same match **with the same result** were on the same team. From that:

- 👥 **Win rate by lineup**: results without squad mates, as a duo, trio, four-stack or five-stack.
- 🫂 **Most played duos**: the pairs with the most shared matches, their highlighted win rate and when they last played together.

Only matches inside both players' ranges count, so a larger range finds more shared games.

### 🏅 Records

The best performances in the range, each with the player and the result, map picture and date of the match on one line; the link to the FACEIT match room sits in the corner of the card:

| Record                | Rule                                         |
| --------------------- | -------------------------------------------- |
| ⭐ Best rating        | Matches of at least 13 rounds                |
| 🔫 Most kills         | Kills in one match                           |
| ⚡ Highest ADR        | Matches of at least 13 rounds                |
| 🎯 Best K/D           | Matches of at least 13 rounds                |
| 💀 Headshot machine   | Highest headshot rate with at least 15 kills |
| ⭐ Most MVPs          | MVP stars in one match                       |
| 🔥 Longest win streak | Consecutive wins inside the range            |
| 🎖️ Ace club           | Most five-kill rounds                        |

## 👤 Player page

| Section                   | Content                                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🪪 Profile                | Avatar, nickname, country, region ranking, links to the FACEIT and Steam profiles, level and ELO progress, and a **Compare** button                                                 |
| 📊 Current form           | Rating, K/D, K/R, ADR, HS %, rounds survived and Win % with the difference to the squad average and the lifetime value, the record and the current streak, the last ten results     |
| 📈 Trend                  | One metric per match with a five-match rolling average and the squad average                                                                                                        |
| 🗺️ Maps                   | A card per map with the map picture and a small table: matches, win rate, K/D and ADR in the range, and the same all-time numbers from FACEIT underneath                            |
| 📜 Match history          | Date, map, result and score, K-D-A, rating, kills, K/D, K/R, ADR, HS %, MVPs, 3K, 4K and aces, the squad mates in the team and a link to the match room; sortable and filterable    |
| 🫂 Teammates              | Win rate with every squad mate, compared with the player's overall win rate                                                                                                         |
| 🧬 Lifetime and playstyle | A row of all-time tiles (matches, win rate, K/D, headshots, ADR and longest streak) and meters for entry rate and success, clutches, flash success, sniper kills and utility damage |
| 🔗 More from the squad    | Links to every other player                                                                                                                                                         |

Scores always show the player's team first. Nicknames in the address are matched without regard to case and redirect to the exact spelling; nicknames outside the squad answer with a 404.

## ⚔️ Compare

Two squad members side by side, picked from two lists that show each player's avatar and ELO, or opened from a player's **Compare** button. The pair is kept in the address (`?a=anna&b=Bohdan`), together with the range.

| Part              | Content                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| 🥊 Contenders     | Avatar, level, ELO with the progress to the next level and the last five results of both players                     |
| 🤝 Shared history | Matches on the same team with their record, and the head to head score of matches against each other                 |
| 📊 Form           | Matches, win rate, rating, K/D, K/R, ADR, headshots, rounds survived, kills and MVPs per match, multi-kills and aces |
| 🧬 Lifetime       | All-time matches, win rate, K/D, headshots, ADR, entry success, 1v1 clutches, flash success, utility and streak      |
| 🗺️ Maps           | Win rate and matches on every map either player played in the range, with the map pictures                           |
| 📜 Shared matches | Every match both played, on the same team or as opponents, with both highlighted lines and the match room            |

Form and lifetime sit side by side on wide screens. Each row draws two bars from the centre and highlights the better value; screen readers hear who is ahead. Picking the player who is already on the other side swaps the two, and **Swap players** flips them in one click.

![Two players compared side by side](./images/compare-dark.jpg)

## 🌍 Languages

English, Ukrainian, Czech, German, Spanish, French, Italian, Dutch, Polish and Portuguese. The **Settings** panel in the header switches the page and keeps the range and the players. Numbers, dates and relative times follow the language and the visitor's time zone. See [Localization](./i18n.md).

## ⚙️ Appearance and effects

The **Settings** panel in the header has three sections: **Appearance**, **Effects** and **Language**.

- 🌗 **Appearance**: **Auto**, **Light** or **Dark**. Auto follows the operating system. The choice is stored in the browser and applied before the first paint, so pages never flash in the wrong theme, and the browser's address bar takes the same colour.
- ⚡ **Effects**: **Auto**, **Full** or **Reduced**. Full adds the blurred, translucent range toolbar and profile panels and the cards that lift under the pointer; Reduced keeps the panels opaque and still for smooth scrolling on any computer. Auto picks Full on recent Macs and Reduced everywhere else, and the panel shows which one is in use.

See [Design system](./design.md#-effects-and-performance).

## 🔄 Data freshness

Pages are prerendered and regenerated in the background at most every five minutes, so a visit is always instant and the data is never more than a few minutes old. **Updated …** under the title shows when the data was fetched. If FACEIT is unreachable, the last good version stays online. See [Architecture](./architecture.md#-caching).

## 📴 Offline

When the connection drops, a notice says so and the page stays as it is; Next.js retries navigations once the connection returns. A page that cannot load at all shows **No connection** in the language of the address and reloads itself when the connection is back. The service worker behind it stores nothing but that page, so old stats are never shown as current.

## 🖨️ Printing

A printed page keeps the stats, tables and charts in dark text on white, even in the dark theme. The navigation, the settings, the range toolbar and the offline notice stay on screen, and no panel is split between two pages.

## ♿ Accessibility

Landmarks, a skip link, one `h1` per page, native radio groups for every switch, sortable headers with `aria-sort`, meters for progress, readable charts with tables and WCAG AA contrast in both themes. Details are in [Accessibility](./accessibility.md).
