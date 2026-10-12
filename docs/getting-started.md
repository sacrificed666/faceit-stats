# 🏁 Getting started

## 📋 Requirements

| Tool              | Version                                              |
| ----------------- | ---------------------------------------------------- |
| 🟢 Node.js        | **24 or newer**; `.nvmrc` pins `26`, the newest line |
| 📦 npm            | 11 or newer (ships with Node 24)                     |
| 🔑 FACEIT API key | A **server-side** key for the FACEIT Data API        |
| 🌐 Browser        | Any evergreen browser                                |

> [!TIP]
> With a version manager, run `nvm use` (or `fnm use`) in the project root to switch to the Node.js line from `.nvmrc`.

## 🗝️ Getting a FACEIT API key

1. 🧑‍💻 Sign in at [developers.faceit.com](https://developers.faceit.com) with your FACEIT account.
2. 📱 Create an app. Any name works, for example _Squad stats_.
3. 🗝️ Open the app's **API keys** tab and create a key of type **Server side**.
4. 📋 Copy the key into `FACEIT_API_KEY` in `.env` as it is: no quotes and no `Bearer` prefix.

> [!IMPORTANT]
> Use a **server-side** key. Client-side keys are bound to browser origins and FACEIT rejects them when the server calls the API.

> [!CAUTION]
> Never commit `.env` and never give the key a `NEXT_PUBLIC_` prefix. The key only lives on the server and is never sent to the browser, see [Security](./security.md#-the-api-key).

## 🔑 Environment variables

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

| Variable            | Required | What it does                                                                                                                      |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 🔑 `FACEIT_API_KEY` | Required | Server-side FACEIT Data API key                                                                                                   |
| 🧑‍🤝‍🧑 `FACEIT_PLAYERS` | Required | FACEIT nicknames separated by commas, spaces or new lines, up to 20                                                               |
| 🌍 `SITE_URL`       | Optional | Public address used in canonical links, Open Graph cards and the sitemap. On Vercel the production domain is used automatically   |
| 🛰️ `FACEIT_API_URL` | Optional | Base address of the FACEIT Data API, `https://open.faceit.com/data/v4/` by default. The end-to-end tests point it at a local mock |
| 🔌 `APP_PORT`       | Optional | Docker only: the port on the host, 3000 by default and 3001 for staging                                                           |

> [!NOTE]
> FACEIT looks nicknames up **case-sensitively**: `JACKSONGG` and `jacksongg` are different players. Copy each nickname exactly as it appears on the FACEIT profile.

Without the two required variables the app still starts and shows which ones are missing. Restart the server after changing `.env`.

## 📦 Install and run

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. It redirects to your browser's language, for example `/en` or `/uk`. The first page load fetches the whole squad from FACEIT, which takes a few seconds; after that the data is cached for five minutes.

### 🐳 In Docker

```bash
docker compose -f compose.yaml -f docker/development.yaml up --watch
```

The same dev server runs in a container on port 3000 with the variables from `.env` (and `.env.local`, if present), and Compose Watch copies every change into it. Staging and production images are described in [Deployment](./deployment.md#-docker).

## 📜 npm scripts

| Script                  | What it does                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run dev`           | 🔥 Starts the Next.js dev server with Turbopack                                                   |
| `npm run build`         | 📦 Type-checks and builds the production bundle, prerendering every page                          |
| `npm start`             | 👀 Serves the production build                                                                    |
| `npm run typecheck`     | 🧠 Generates the route types and runs the TypeScript 7 compiler without emitting                  |
| `npm run lint`          | 🧹 Lints with Oxlint, including type-aware, React Compiler, Next.js, a11y and layer rules         |
| `npm run lint:fix`      | 🩹 Applies the automatic Oxlint fixes                                                             |
| `npm run lint:text`     | 🧾 Finds em and en dashes in every text file and says where they are                              |
| `npm run format`        | 🎨 Formats every supported file with Oxfmt                                                        |
| `npm run format:check`  | 🔎 Fails if a file is not formatted                                                               |
| `npm test`              | 👁️ Starts Vitest in watch mode                                                                    |
| `npm run test:run`      | 🧪 Runs the whole unit test suite once                                                            |
| `npm run test:coverage` | 📊 Runs the unit tests with V8 coverage and enforces the thresholds                               |
| `npm run test:e2e`      | 🎭 Builds the app against a mock FACEIT API and runs Playwright, axe and Lighthouse               |
| `npm run check`         | ✅ Lint, the dash check, format check, type check and unit tests in one go; run it before pushing |

> [!TIP]
> Install the browsers for the end-to-end tests once with `npx playwright install chromium webkit`, or `make browsers`.

## 🛠️ make

Every common task has a short `make` command with a coloured summary of what it is doing:

| Command                                               | What it does                                                                                                                                                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make` or `make help`                                 | 📖 Every command, grouped by environment, with coloured **[DEV]**, **[STAGE]** and **[PROD]** tags                                                                                                                                                   |
| `make setup`                                          | 🧰 Installs the packages, creates `.env` from `.env.example`, installs Chromium and WebKit for the tests and turns on the Git hooks                                                                                                                  |
| `make env`                                            | 🔐 Creates the env file of `ENV` from `.env.example` if it is missing, never overwrites one. `make dev` does the same and keeps running; `make dev-up`, `make stage-up` and `make prod-up` create theirs and stop, so you can fill in the keys first |
| `make hooks`                                          | 🪝 Turns on the Git hooks in `.githooks/`: format, lint and dash checks of the staged files, and Conventional Commits for the message                                                                                                                |
| `make doctor`                                         | 🩺 Checks Node.js, npm, Docker, the packages and the env file                                                                                                                                                                                        |
| `make dev`                                            | 🚀 Starts the dev server                                                                                                                                                                                                                             |
| `make dev-mock`                                       | 🧪 Starts the dev server against the mock FACEIT API, so no key is needed                                                                                                                                                                            |
| `make check` / `make ci`                              | ✅ The checks before pushing / everything CI runs: registry signatures, the changelog, the checks with coverage, the build with its report and the end-to-end tests                                                                                  |
| `make e2e-chromium` · `make e2e-webkit`               | 🎭 The two end-to-end jobs of CI: Chromium with the visual tests and Lighthouse, or WebKit                                                                                                                                                           |
| `make fix`                                            | 🪄 Applies the lint fixes and formats every file                                                                                                                                                                                                     |
| `make dev-up` · `make stage-up` · `make prod-up`      | 🐳 Starts an environment in Docker: development with hot reload, staging and production in the background                                                                                                                                            |
| `make stage-logs` · `make prod-ps` · `make dev-shell` | 📜 Every environment has the same commands: `up`, `down`, `restart`, `logs`, `ps`, `shell`, `open` and `clean`                                                                                                                                       |
| `make status`                                         | 🚦 Shows which environments are running                                                                                                                                                                                                              |
| `make up ENV=…`                                       | 🐳 The same commands for any `ENV`, handy in scripts; production asks before `down`, `restart` and `clean` unless `YES=1`                                                                                                                            |
| `make shared`                                         | 🔗 Compares the files shared with the other two apps when they are checked out next to this one                                                                                                                                                      |
| `make shared-sync`                                    | 🔁 Copies the shared files of this app over the other two after you changed one of them here                                                                                                                                                         |
| `make live` · `make live-lighthouse`                  | 📡 The checks of the monitor against the live site, or the address in `MONITOR_URL`                                                                                                                                                                  |
| `make screenshots`                                    | 📸 Takes the README pictures again from a running app, see [Contributing](./contributing.md#-readme-pictures)                                                                                                                                        |
| `make clean` · `make reset`                           | 🧹 Removes build output and reports / also reinstalls the packages                                                                                                                                                                                   |

> [!NOTE]
> The Makefile needs GNU Make and Bash, which macOS and Linux ship with; on Windows use WSL or the npm scripts above. Colours switch off in pipes and with `NO_COLOR=1`.

## 🗂️ Project layout

```text
faceit-stats/
├── .github/
│   ├── ISSUE_TEMPLATE/              Bug report and feature request forms
│   ├── workflows/ci.yml             CI: verify, build with a report, end-to-end tests, Docker image, dependency review
│   ├── workflows/codeql.yml         CodeQL code scanning
│   ├── workflows/release.yml        GitHub release for every version tag
│   ├── dependabot.yml               Weekly npm, GitHub Actions and Docker updates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── SECURITY.md                  How to report vulnerabilities
├── docker/                          Multi-stage Dockerfile and the development, staging and production overlays
├── docs/                            This documentation and its screenshots
├── e2e/                             Playwright specs and the mock FACEIT API they run against
├── lint/comments.js                 Custom Oxlint rule that keeps comments to one short line
├── scripts/
│   ├── build-report.mjs             Checks the production build and reports the bundle size in CI
│   ├── coverage-summary.mjs         Coverage table for the CI summary
│   └── release-notes.mjs            Checks the version and prints its notes from the changelog
├── src/
│   ├── app/                         Routes: overview, players and compare under [locale], flags, 404, sitemap, robots, icons
│   ├── widgets/
│   │   ├── Header/                  Logo, navigation and the settings button
│   │   └── Footer/                  Author, version, data source and the source code
│   ├── features/
│   │   ├── squad/                   api: FACEIT client, parser and cached loader; model: ranges, statistics, duos; ui: names, toolbar, badges
│   │   ├── dashboard/               The squad overview sections, the recent matches feed and the records
│   │   ├── player/                  The player page and its per-range context
│   │   ├── compare/                 The comparison of two players
│   │   ├── settings/                    The settings panel: theme and language
│   │   └── seo/                     Structured data, social metadata and the share images
│   ├── shared/
│   │   ├── i18n/                    Languages, the ten catalogs, plurals, the provider and the server loader
│   │   ├── lib/                     Formatting, scales, addresses, site settings, theme and the inline boot script
│   │   ├── hooks/                   Address state, time zone, clock and sorting
│   │   ├── ui/                      Building blocks: sections, tiles, bars, the line chart, tables, meters, icons
│   │   └── assets/fonts/            Montserrat for the generated images
│   ├── proxy.ts                     Language redirects, canonical nicknames and 404s before a page renders
│   ├── test/                        Test setup, factories and FACEIT fixtures
│   └── types/                       Global type augmentations
├── CHANGELOG.md                     Every release, newest first
├── Makefile                         make help, setup, dev, checks and Docker commands
├── compose.yaml                     The Docker Compose service shared by every environment
├── next.config.ts                   Cache profiles, typed routes, images and security headers
├── playwright.config.ts             Browsers, the mock API and the production server for end-to-end tests
├── vercel.json                      Runs the server functions in Frankfurt
├── vitest.config.ts                 Unit test environment and coverage thresholds
├── .dockerignore                    Keeps dependencies, build output and secrets out of the image
├── .oxlintrc.json                   Lint rules, including the layer rules
└── .oxfmtrc.json                    Formatting rules
```

Every component has its own folder, for example `features/dashboard/ui/MapPool/MapPool.tsx`, and tests sit next to the code they cover as `*.test.ts(x)`. How the layers work together is explained in [Architecture](./architecture.md#️-layers).

## 💻 Editor setup

Editor settings are not committed. For the best experience in VS Code, install:

- 🦀 **Oxc**: inline Oxlint diagnostics and Oxfmt formatting on save
- ⚡ **Vitest**: run and debug tests from the editor
- 🎭 **Playwright Test for VS Code**: run end-to-end tests and record locators
- 📝 **EditorConfig**: consistent whitespace settings (`.editorconfig` is part of the repository)
- 🔷 Select **TypeScript: Use Workspace Version** so the editor uses the project's TypeScript and the Next.js plugin

## 👉 Next steps

- ✨ See what the dashboard can do in [Features](./features.md).
- 🏗️ Follow a request from FACEIT to the page in [Architecture](./architecture.md).
- 🚀 Put it online with [Deployment](./deployment.md).
