# ♿ Accessibility

The goal is **WCAG 2.2 AA**: everything works with a keyboard, reads well with a screen reader and keeps its contrast in both themes.

## 🧭 Structure

| Element      | Implementation                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 🏠 Landmarks | `header`, `main`, `footer` and labelled `nav` elements for sections and breadcrumbs                                   |
| ⏭️ Skip link | **Skip to content** appears on the first <kbd>Tab</kbd> and moves focus to `main`                                     |
| 🏷️ Headings  | One `h1` per page, an `h2` per section, `h3` inside cards                                                             |
| 🗂️ Regions   | Every section is a `section` labelled by its heading                                                                  |
| 📋 Tables    | Real tables with captions, `scope` on headers and a row header for every player                                       |
| 🌍 Language  | `lang` on the document matches the page language; each language in the settings carries its own `lang` and `hreflang` |

## ⌨️ Keyboard

Every control is a native element, so it behaves the way browsers and assistive technology expect:

| Control                          | Element                                            | Keys                                              |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| 🎚️ Range, metrics, theme, result | Radio group inside a `fieldset` with a `legend`    | <kbd>Tab</kbd> to the group, arrows to choose     |
| ↕️ Sortable columns              | `button` inside `th` with `aria-sort`              | <kbd>Enter</kbd> or <kbd>Space</kbd>              |
| 🗺️ Map filter                    | `select`                                           | Arrows                                            |
| 📋 Data tables                   | `details` and `summary`                            | <kbd>Enter</kbd>                                  |
| 📈 Charts                        | `input type="range"` over the plot                 | Arrows, <kbd>Home</kbd>, <kbd>End</kbd>           |
| 🃏 Player cards                  | One link that covers the card                      | <kbd>Enter</kbd>                                  |
| ⚙️ Settings                      | `button` that opens a native `<dialog popover>`    | <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close |
| ⚔️ Compared players              | Two labelled `select` elements and a swap `button` | Arrows, <kbd>Enter</kbd>                          |
| 🕹️ Recent matches                | **Show more matches** `button`                     | <kbd>Enter</kbd> or <kbd>Space</kbd>              |

Focus is always visible: a 2 px accent outline with an offset, and a ring around the whole card when its link has focus.

## 🗣️ Screen readers

- 🏆 Sorted columns announce their direction through `aria-sort`, and the table caption says how the table is sorted.
- ✅ Win and loss badges are letters for sighted users (**W** and **L** in English, **В** and **П** in Ukrainian) and whole words for screen readers; the form guide reads as one sentence, newest first.
- 🥇 Medals say _1st place_, level badges say _Level 10_, and records such as `12-8` are read as _Wins: 12, losses: 8_.
- 🎚️ Level progress and playstyle bars are native `<meter>` elements with a spoken value, for example _63 ELO to level 9_.
- 📈 Each chart is a slider: moving it announces the date, map, result and every value of that match. A **Show data table** button below every chart offers the same numbers as a table, with real column and row headers, and turns into **Hide data table** while it is open.
- ⚔️ Every row of the comparison tells screen readers who is ahead, for example _Kills per death, anna is ahead_, because the highlight alone is visual.
- 🕹️ The feed reads K-D-A as _Kills: 20, deaths: 15, assists: 4_, and **Showing 16 of 40** is announced politely after **Show more matches**.
- 🌍 The language button says _Language: English (EN)_, so its name contains the visible code and voice control users can say what they see.
- 🔗 Links that open FACEIT or Steam say _opens in a new tab_, and every **Match room** link of the records names its map, so a list of links never repeats the same name.
- 🖼️ Avatars are decorative because the nickname is always next to them; flags carry the country name.
- ⏳ Loading screens announce _Loading…_ through an `output` element while the skeleton stays hidden from assistive technology.
- 📴 The offline notice is an `output`, so it is announced politely when the connection drops. The `output` stays on the page while the app is online and only its text changes, because a live region that appears together with its message is often never read.

## 🎨 Colour and contrast

- 📏 Text reaches **4.5:1** against its background in both themes, large numbers and graphical marks reach **3:1**.
- 🚦 Colour never carries meaning alone: wins and losses have letters, differences have arrows and signs, heatmap cells print their value, medals print their place.
- 🌡️ The heatmap's green and red are tuned to stay apart for red-green colour blindness, see [Design system](./design.md#-green-and-red-for-everyone), and its text stays readable on every cell.

## 🌊 Motion and preferences

| Preference                  | Response                                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🐢 `prefers-reduced-motion` | Transitions, the skeleton pulse, the fade-in of data and smooth scrolling are switched off                                                                                                                |
| 🌗 `prefers-color-scheme`   | Picks the theme unless the visitor chose one                                                                                                                                                              |
| 🔆 `prefers-contrast: more` | Secondary text and borders get stronger                                                                                                                                                                   |
| 🖥️ `forced-colors: active`  | Windows high contrast keeps every card border, the chosen option of each switch, data bars and legends visible with system colours; the current page link is underlined; heatmap cells keep their colours |

> [!NOTE]
> In forced colours mode browsers replace author colours with the visitor's system palette, which would erase anything drawn only with a background colour. Bars, legend swatches and chosen options therefore carry the `mark` and `choice` classes, which switch them to system colours such as `Highlight` instead.

## 📱 Zoom and small screens

The layout reflows down to **320 px**, the width of a 1280 px window zoomed to 400 %, without horizontal page scrolling (WCAG 1.4.10). Wide tables scroll inside their card with the player column pinned, the range toolbar wraps onto a second row, and text can be zoomed to 200 % without losing content.

## ✅ How it is checked

- 🤖 **axe-core** runs in the end-to-end tests on the overview, a player page, the comparison and the 404 page in English, Ukrainian, Polish and Dutch, in light and dark mode, with the full effects of Apple devices and with the settings open, on desktop and phone screens, with no violations. Two rules that axe leaves off by default are switched on: `label-content-name-mismatch` and `target-size`, which asks for 24 × 24 px targets or enough room around smaller ones (WCAG 2.2, 2.5.8).
- ⌨️ A keyboard test checks that the first <kbd>Tab</kbd> reaches the skip link and that it moves focus to `main`.
- 🖥️ A forced colours test checks that the chosen range and the ranking bars stay visible with system colours.
- 📱 Five pages in four languages are checked for sideways scrolling at 320 px.
- 🚦 **Lighthouse** must score 1 for accessibility on every page of the budget, and every accessibility audit must pass, including the ones without weight.
- 🧪 Component tests find elements by role and accessible name, so a missing label fails a test.
- ⌨️ The pull request checklist asks for a pass with the keyboard only, in both themes and on a phone-sized screen.

> [!TIP]
> To check a change by hand, use the keyboard only, then open Chrome DevTools, choose **Rendering** and emulate `forced-colors: active`, `prefers-contrast: more` and a vision deficiency such as deuteranopia.
