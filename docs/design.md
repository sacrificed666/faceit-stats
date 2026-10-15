# 🎨 Design system

## 💡 Principles

- 🔶 **FACEIT at heart**: a calm dark or light surface with FACEIT orange for everything interactive.
- 🔢 **Numbers first**: large proportional figures for headlines, tabular figures in tables, units in a quieter tone.
- 🧑 **Identity through faces**: players are recognised by their avatar and nickname, never by a colour, which keeps the data colours free for meaning.
- 🪶 **Quiet chrome**: hairline borders and gridlines, soft shadows, no decoration that is not data.
- 📱 **One layout for every screen**: the same markup reflows from phones to wide screens; nothing is duplicated for mobile.
- ⭕ **Concentric corners**: an inner radius is the outer radius minus the padding between them. Panels are rounded 1.5 rem and what sits 1 rem inside them 0.5 rem; menu items 6 px inside a panel are rounded 1.125 rem; the settings popover is rounded 0.75 rem plus the 1.1 rem around its language rows. Round avatars and buttons are left as circles.

## 🔤 Typography

**Montserrat** is loaded with `next/font` and self-hosted at build time. Only the Latin subset is preloaded; Latin Extended (Polish) and Cyrillic (Ukrainian) are fetched through `unicode-range` when a page needs them. The generated images use the same font from `src/shared/assets/fonts` (SIL Open Font License).

| Role             | Style                                                  |
| ---------------- | ------------------------------------------------------ |
| 🏷️ Page title    | 36-60 px, extra bold, tight tracking                   |
| 📰 Section title | 20-24 px, bold                                         |
| 🔢 Stat values   | 24-30 px, bold, proportional figures                   |
| 📋 Table cells   | 14 px, tabular figures                                 |
| 🔖 Kicker        | 12 px, bold, uppercase with wide tracking, accent text |

## 🎨 Tokens

All colours are CSS custom properties. They are defined once in the `light` and `dark` mixins of `src/shared/styles/_tokens.scss` and applied to `:root` in `src/app/globals.scss`; components read them with `var(--surface)` in their CSS modules, so there is no other palette to pick from.

| Token           | ☀️ Light              | 🌙 Dark               | Used for                                           |
| --------------- | --------------------- | --------------------- | -------------------------------------------------- |
| `plane`         | `#f3f3f0`             | `#0f1011`             | Page background                                    |
| `surface`       | `#fcfcfb`             | `#18191b`             | Cards and tables                                   |
| `raised`        | `#ffffff`             | `#202124`             | Tooltips                                           |
| `inset`         | `#ebeae6`             | `#26272a`             | Tracks, wells and placeholders                     |
| `ink`           | `#111110`             | `#f5f5f3`             | Primary text                                       |
| `ink-secondary` | `#4d4c48`             | `#c3c2b7`             | Secondary text                                     |
| `ink-muted`     | `#64635e`             | `#a09f98`             | Captions, axis labels                              |
| `accent`        | `#ff5500`             | `#ff5500`             | Selected controls, focus rings, skip link          |
| `accent-text`   | `#b33a0a`             | `#ff7a3d`             | Links and accent text                              |
| `data`          | `#eb6834`             | `#d95926`             | Bars, lines and meters                             |
| `data-muted`    | `#c3c2b7`             | `#4a4a46`             | Context series                                     |
| `good` / `bad`  | `#006300` / `#b42323` | `#3fbf3f` / `#f06a6a` | Wins and losses, differences, good and weak values |
| `div-positive`  | `#75cca7`             | `#007e57`             | Heatmap cells above the baseline                   |
| `div-middle`    | `#f0efec`             | `#383835`             | Heatmap cells at the baseline                      |
| `div-negative`  | `#ea6e52`             | `#c0453b`             | Heatmap cells below the baseline                   |

Every text token reaches **4.5:1** on the surfaces it sits on and every mark reaches **3:1**, measured with a contrast script rather than by eye.

## 🧵 Styling

Every component has a CSS module next to it (`Name/Name.module.scss`) and joins class names with `cx()` from `shared/lib/cx.ts`. The shared Sass lives in `src/shared/styles`:

| File           | Contents                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_tokens.scss` | Colour tokens for both themes and for more contrast, fonts, easing, the layout width and the line heights of the type scale                                      |
| `_mixins.scss` | Breakpoints (`from(md)`, `below(sm)`), `text(sm)` with its line height, `panel`, `hover`, `reduced`, `opaque`, `focus-ring`, `fit-grid`, `hide-in-print`, meters |
| `globals.scss` | (in `src/app`) The reset, the page background, the skip link, reduced motion, forced colours hooks and print rules                                               |

- 📏 Breakpoints are named once in `$breakpoints` (`xs` 30 rem up to `2xl` 96 rem) and used through `@include from(md)` or `@include below(sm)`, never as raw media queries.
- 🔤 Line heights are tokens (`--leading-sm`) because Sass would round `calc(1.25 / 0.875)`; `text($size)` sets the size and its line height together.
- 🪶 Base styles that a parent may override sit inside `:where()`, which keeps their specificity at zero, so the order of CSS modules in the bundle never decides a conflict.

## 🌗 Themes

The light tokens live on `:root`. The dark tokens are applied twice: inside `@media (prefers-color-scheme: dark)` for `:root:not([data-theme="light"])`, and for `:root[data-theme="dark"]`, so the system setting works without JavaScript and an explicit choice wins in both directions. An inline script in `<head>` copies a saved choice to `data-theme` before the first paint and gives the `theme-color` meta tags the same colour, so the browser's address bar matches a forced theme.

| Preference                  | What changes                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔆 `prefers-contrast: more` | Secondary and muted text move closer to the primary ink, and borders get two to three times stronger                                                                 |
| 🖥️ `forced-colors: active`  | Selected options use `Highlight`, data bars `Highlight` and `GrayText`, reference lines `CanvasText`, current links are underlined; heatmap cells keep their colours |
| 🐢 `prefers-reduced-motion` | Transitions, the fade-in of data and the skeleton pulse are switched off                                                                                             |

> [!TIP]
> All three can be tried in Chrome DevTools under **Rendering**, with the emulation options for `prefers-contrast`, `forced-colors` and `prefers-reduced-motion`.

## 📈 Data visualisation

| Job                          | Form                              | Colour                                                                                               |
| ---------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 🏆 Compare players           | Ranked horizontal bars            | One hue (`data`), names and values as text                                                           |
| 📈 Change over time          | Small multiples on a shared scale | `data` for the rolling average, `data-muted` for single matches, a dashed line for the squad average |
| 🗺️ Above or below a baseline | Heatmap                           | Diverging green ↔ red around a grey midpoint (50 % wins, 1.00 K/D), paler for small samples          |
| 🔁 How often                 | Heatmap                           | One hue, lighter to darker                                                                           |
| ✅ Win or loss               | Badges                            | `good` / `bad` **with** the letter W or L                                                            |
| 🚦 Good or weak value        | Coloured numbers                  | `good` from the metric's good threshold, `bad` below its weak one, the normal ink in between         |
| 🎚️ Progress                  | Meters                            | The level colour or `data` on an `inset` track                                                       |
| 🥊 Two players               | Mirrored bars from the centre     | `data` for the leader of the row, `data-muted` for the other                                         |

Rules that keep the charts honest and readable:

- 🎯 No colour per player. Ten players would need ten hues, and past eight they become indistinguishable, especially with colour blindness.
- 📏 Bars are at most 20 px thick with a rounded data end and a square baseline.
- ✏️ Lines are 2 px with round joins; gridlines are solid 1 px hairlines.
- 🏷️ Values are written as text next to every bar and inside every heatmap cell; the readout only adds detail.
- 🔍 A chart's readout floats above the plot, never over the lines it describes; a tap keeps it until the next tap elsewhere.
- 📋 Every chart has a data table or an equivalent text alternative.
- 🧮 Small samples are pale: a heatmap cell reaches its full colour only from five matches on, so one lucky game does not look like a strength.
- 🚦 Values are coloured by fixed thresholds per metric, the same in every view, so a green K/D on a card is green in the leaderboard, the match history and the data tables too. The thresholds live next to the metric definitions; see [Features](./features.md#-highlighted-numbers).

### 🟢 Green and red for everyone

Green for above and red for below matches the rest of the interface, where wins and positive differences are green. Red and green are also the pair that people with red-green colour blindness (about one in twelve men) confuse most, so the two poles are chosen to stay apart for them too:

- 🧭 The green leans towards teal (OKLCH hue 165) and the red towards vermilion (hue 34), so they still differ on the blue-yellow axis that red-green colour blind eyes see.
- 🌗 In the light theme the green is lighter than the red, which adds a difference in lightness.
- 🔢 Every cell prints its value and the legend names both ends, so colour is never the only clue.

| Pair, light theme | Normal vision | Protanopia | Deuteranopia | Tritanopia |
| ----------------- | ------------: | ---------: | -----------: | ---------: |
| 🔵 Blue ↔ red     |          17.7 |       13.1 |         14.7 |       22.3 |
| 🟢 Green ↔ red    |          25.8 |       20.6 |         11.7 |       31.9 |

The numbers are OKLab distances between the two poles after simulating each kind of colour blindness (Machado et al.), where about 10 is easy to tell apart. Text on every cell keeps at least **4.6:1** in both themes.

> [!NOTE]
> The dark theme has less room: light text needs dark cells, so the two poles differ mainly in hue and stay around 7.7 apart for red-green colour blindness. The printed values carry the meaning there.

## 🧩 Components

| Component                   | Purpose                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Section`                   | Titled region with description and actions                                                                                      |
| `SegmentedControl`          | Native radios in a `<fieldset>` with a `<legend>`, as pills                                                                     |
| `StatTile`                  | Label, value with an optional unit word that wraps under it, difference and detail                                              |
| `MetricValue`               | A metric formatted and coloured by its good and weak values                                                                     |
| `PlayerName`                | Avatar, nickname and flag; the nickname ends in an ellipsis only where nothing makes room for it, never in a table that scrolls |
| `MapThumb`                  | The map picture next to a map name, or its initials                                                                             |
| `LevelBadge`                | FACEIT-style ring with the level number in the level colour                                                                     |
| `LevelProgress`, `Meter`    | Native `<meter>` styled with tokens                                                                                             |
| `BarList`                   | Ranked bars with an optional reference line                                                                                     |
| `LineChart`                 | SVG line chart with crosshair, readout and slider; a long date under it takes a second line                                     |
| `DataTable`                 | Collapsible table behind every chart, header kept in view                                                                       |
| `Select`                    | Native select as a pill with a chevron and a picture                                                                            |
| `ResultBadge`, `FormGuide`  | W/L badges and the last results                                                                                                 |
| `RankMedal`                 | Gold, silver and bronze place for the top three                                                                                 |
| `CompareRows`               | Two players per row with mirrored bars and the leader named                                                                     |
| `PlayerPicker`, `Contender` | The select for a side of the comparison and its player card                                                                     |
| `MapPool`                   | Diverging heatmap with a squad row and a legend                                                                                 |
| `Skeleton`                  | Pulsing placeholders and a spoken loading message                                                                               |
| `SettingsButton`            | Sliders button that opens `SettingsDialog`                                                                                      |
| `SettingsDialog`            | Popover with the appearance, the effects and the languages                                                                      |
| `Avatar`, `BackdropImage`   | Images that fall back gracefully when the CDN fails                                                                             |
| `EmptyState`                | A low icon and message for a section without data                                                                               |
| `ExternalLink`, `Flag`      | Links that say they open a new tab, self-hosted flags                                                                           |

## 📐 Layout

- 📏 Content is centred with a maximum width of 80 rem and 16-32 px side padding.
- 🧱 Card grids pick their columns from the number of cards with `fitGrid()`, so ten players fill two rows of five instead of leaving two holes in a row of four. When a last row is short, its cards share the row evenly.
- 🔢 The five overview numbers stay in one row on wide screens, show three and two on tablets, and on phones the average ELO leads over two pairs.
- 🗜️ Blocks stay as tall as their content: lists share one panel with dividers instead of a card per row, side-by-side panels align to the top instead of stretching, and empty sections show one low line instead of a tall placeholder.
- 📊 Wide tables scroll sideways inside their card with the first column pinned, and a soft shadow at the edge shows there is more to see; the page itself never scrolls horizontally. On phones the recent matches fold K-D-A and the rating under each player instead, so the table fits without scrolling.
- 📌 The range toolbar is a floating pill that sticks to the top while scrolling; days and matches are two clusters of one radio group that fit one row down to 360 px. On wide screens it links to every section; narrower screens get a **Sections** button that opens the same links as a menu.
- 🎚️ On phones a segmented control takes the full width and shares it between its options, so six metrics fit without scrolling.
- 🪪 On phones the player avatar sits beside the name, and the compare page stacks the two pickers and shows the two players facing each other.
- 🧭 On phones the navigation moves to its own row under the logo. The settings panel opens under its button with CSS anchor positioning where supported, and as a bottom sheet below 640 px.
- 🌍 Long words in German, Dutch or Polish wrap instead of widening the page; every page is checked for sideways scrolling at 320 px, the width of a 1280 px window zoomed to 400 %.

## 🌊 Motion

Motion is limited to short colour and lift transitions on hover, and a quick fade-in of the data when the address asks for a range or players other than the prerendered default. With `prefers-reduced-motion: reduce`, transitions, the fade and the skeleton pulse are switched off and smooth scrolling becomes instant.

## ⚡ Effects and performance

The design is flat on purpose, so only a few things are expensive for a weak GPU: the translucent, blurred range toolbar that sticks to the top while scrolling, the blurred panels of the profile header and the player cards that lift under the pointer. The **Effects** setting decides whether the page uses them:

| Level      | Range toolbar and profile panels   | Player cards  | Panel shadows             |
| ---------- | ---------------------------------- | ------------- | ------------------------- |
| ✨ Full    | Translucent with `backdrop-filter` | Lift on hover | A soft, deep `--shadow`   |
| 🍃 Reduced | Opaque `surface`, no blur          | Stay in place | One short `--shadow-flat` |

**Auto** resolves to Full on Apple devices (Mac, iPhone, iPad) and to Reduced everywhere else, the same rule as in the tasks and weather apps. The boot script in `shared/lib/boot.ts` applies the saved choice or the device default to `<html data-effects>` before the first paint, and `setEffects()` in `features/settings/model/useEffects.ts` switches it at once and keeps an explicit choice in `localStorage`. Components opt out with the `reduced` mixin, or with `opaque`, which also follows `prefers-reduced-transparency`, and panels follow the `--shadow` token.

Measured in headless Chrome without a GPU, with the CPU slowed down four times and a Windows user agent, scrolling the overview: the compositor's work fell from 59 to 34 ms per second and rasterizing from 117 to 80, and every page keeps 60 fps.

## 🔶 Brand mark

The logo is a rounded square with an orange gradient from `#ff9a4d` to `#ff4a00`, a soft white sheen across the top and a bold near-black **F**. The glyph is drawn from rectangles instead of a font, so the favicon, the header, the Apple touch icon and the Open Graph cards look the same everywhere. It deliberately does not reuse FACEIT's own logo.

## 🖼️ Iconography

Icons are a small set of 24 px stroke icons listed as paths in `Icon/icons.ts`, some of them following [Lucide](https://lucide.dev) (credited in `LICENSE`), drawn by `Icon.tsx` and inheriting the text colour. They are hidden from assistive technology unless they carry meaning on their own.
