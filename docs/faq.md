# ❓ FAQ

### 🔑 The page says the API key does not work. What should I check?

1. 💾 Save `.env`. An unsaved editor tab is the most common reason; the page then asks for `FACEIT_API_KEY`.
2. 🗝️ Use a **server-side** key from the FACEIT developer portal; client-side keys are rejected by the API.
3. ✂️ Paste the key as it is, without quotes and without `Bearer`.
4. 🔄 Restart the server after changing `.env`, so the cached snapshot is loaded again.

> [!NOTE]
> FACEIT answers a wrong key with status 400 or 401. The app shows **FACEIT rejected the API key** in that case and logs the status on the server.

### 🔤 A player is listed as "not found on FACEIT". Why?

FACEIT looks nicknames up **case-sensitively**: `JACKSONGG` exists, `jacksongg` does not. Copy the nickname exactly as it appears on the player's FACEIT profile into `FACEIT_PLAYERS`.

### ➕ How do I add or remove players?

Edit `FACEIT_PLAYERS` (up to 20 nicknames separated by commas), then restart the local server or redeploy on Vercel.

### ⏱️ How fresh is the data?

At most five minutes old while the site has visitors. **Updated …** under the title shows when the data was fetched. After a day without visits, the first visit waits a few seconds for fresh data.

### 🗓️ Should I pick days or matches?

**Days** (7, 30 or 90) compare everyone over the same period, so someone who barely played shows few matches. **Matches** (20, 50 or 100) compare the same amount of play: someone who plays every day covers the last few days, someone who rarely plays may go back months. The player cards show when each player last played.

### 🌫️ Why are some map pool cells pale?

A cell reaches its full colour only from five matches on. A map played once at 100 % would otherwise look like the strongest map of the squad, so cells with fewer matches stay closer to grey. The number of matches is printed in every cell.

### 🟢 Why green and red, and can colour blind people read the map pool?

Green and red match the rest of the site, where wins and positive differences are green. The two colours are tuned to stay apart for red-green colour blindness, and every cell prints its value, see [Design system](./design.md#-green-and-red-for-everyone).

### 🎮 Why are some matches missing?

Only **5v5** matches count; Wingman, 1v1 and other modes are left out. FACEIT also returns at most the last 100 matches per player, so 100 is the largest range, and a 90-day range of a very active player ends at their 100th match.

### 🤝 How are duos found?

Two squad members who appear in the same match with the same result were on the same team. That needs no extra requests, but it only sees squad members: queuing with a friend outside `FACEIT_PLAYERS` counts as **No squad mates**.

### 🧮 Why is a K/D slightly different from FACEIT's profile?

K/D, K/R, ADR and headshot rate are averaged per match, the way FACEIT averages them, but only over the selected range. The lifetime numbers on the player page come straight from FACEIT.

### 🖼️ Why are there no profile banners?

FACEIT no longer lets players change their profile banners, so many of them are outdated. The app shows avatars only.

### 🗺️ Where do the map pictures come from?

From the lifetime map statistics of each player on FACEIT. Maps that are new to the app still work: their names are derived from the map key, for example `de_eldorado` becomes **Eldorado**.

### 🚦 Can the app hit FACEIT's rate limit?

FACEIT allows 20 requests per second. The app makes four requests per player when it refreshes, stays under 10 per second, keeps the answers for four minutes and backs off when FACEIT asks it to. With 10 players a refresh takes a few seconds, and all ten languages share it.

### 🌍 How is the language chosen?

The first visit follows the browser's language, and English when it is not one of the ten. Pick another language in **Settings** in the header: the page switches, keeps its filters and the choice is remembered for the next visit. Every language has its own address, such as `/uk/players/sacrificed`, so a shared link opens in the sender's language.

### ➕ Can I add a language?

Yes: one catalog file, one line in the list of languages and a loader. [Localization](./i18n.md#-adding-a-language) walks through it, and the tests tell you what is missing.

### ⚔️ How do I compare two players?

Open **Compare** in the header or the **Compare** button on a player page, then pick the two players. The address keeps the pair and the range, for example `/en/compare?a=sacrificed&b=Nitron&range=30d`, so it can be shared.

### 🌗 How do I switch between light and dark mode?

Open **Settings** in the header and pick **Auto**, **Light** or **Dark** under **Appearance**. The choice is stored in the browser.

> [!TIP]
> **Auto** follows the operating system, including a change at sunset, while **Light** and **Dark** stay as they are.

### 🐢 Why are the panels not blurred on my computer?

On Windows, Linux and Android the app starts with **Reduced** effects: the range toolbar and the profile panels are opaque instead of blurred and the player cards do not lift under the pointer, which keeps scrolling smooth on computers without a strong graphics chip. Recent Macs get the **Full** effects. Open **Settings** and choose **Effects: Full** or **Reduced** to change it; the choice is stored in the browser.

### 🎯 Does it work for other games?

No, the app reads CS2 statistics only.

### 🐳 Can I run it in Docker?

Yes. `docker compose -f compose.yaml -f docker/development.yaml up --watch` starts the dev server in a container with the variables from `.env`, and `docker/staging.yaml` and `docker/production.yaml` build the small production image for a server. See [Deployment](./deployment.md#-docker).
