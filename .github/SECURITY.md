# 🛡️ Security policy

## ✅ Supported versions

Only the latest release receives security fixes, currently **1.x**, deployed to [stats.sacrificed.me](https://stats.sacrificed.me). A fix ships as a patch version, for example `1.0.1`, as described in [docs/releases.md](../docs/releases.md).

## 📮 Reporting a vulnerability

Please **do not open a public issue** for security problems.

1. Open the repository's **Security** tab and choose **Report a vulnerability** to send a private advisory.
2. Describe the problem, the affected version or commit and the steps to reproduce it.
3. If you have a proof of concept, attach it to the advisory rather than publishing it.

You can expect an acknowledgement within **3 working days** and a status update at least once a week until the report is resolved. Once a fix is deployed, the advisory is published and you are credited, unless you prefer to stay anonymous.

## 🎯 Scope

FACEIT Stats is a server-rendered Next.js app that reads public player statistics from the FACEIT Data API with a server-side key. It has no accounts, no database and no forms. Reports are especially welcome about:

- 🔑 ways to make the server reveal `FACEIT_API_KEY` or send it anywhere other than `open.faceit.com`;
- 💉 script injection through FACEIT data such as nicknames, avatars or map names, including the JSON-LD and Open Graph images;
- 🧱 ways to bypass the Content Security Policy or the other security headers;
- 🌊 requests that make the server hammer the FACEIT API or exhaust its rate limit;
- ⚙️ weaknesses in the GitHub Actions workflows.

The measures already in place are described in [docs/security.md](../docs/security.md).
