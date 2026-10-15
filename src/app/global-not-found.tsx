import "./globals.scss";
import type { Metadata, Viewport } from "next";

import { DEFAULT_LOCALE, LOCALES } from "@/shared/i18n/locales";
import { cs } from "@/shared/i18n/messages/cs";
import { de } from "@/shared/i18n/messages/de";
import { en } from "@/shared/i18n/messages/en";
import { es } from "@/shared/i18n/messages/es";
import { fr } from "@/shared/i18n/messages/fr";
import { it } from "@/shared/i18n/messages/it";
import { nl } from "@/shared/i18n/messages/nl";
import { pl } from "@/shared/i18n/messages/pl";
import { pt } from "@/shared/i18n/messages/pt";
import { uk } from "@/shared/i18n/messages/uk";
import type { Messages } from "@/shared/i18n/translate";
import { BOOT_SCRIPT } from "@/shared/lib/boot";
import { SITE } from "@/shared/lib/site";
import { homePath } from "@/shared/lib/urls";
import Logo from "@/shared/ui/Logo/Logo";

import { montserrat } from "./fonts";

import styles from "./not-found.module.scss";

const CATALOG: Readonly<Record<(typeof LOCALES)[number], Messages>> = { en, uk, cs, de, es, fr, it, nl, pl, pt };

// A message of the not found page as plain text
const text = (
  messages: Messages,
  key: "notFound.meta" | "notFound.title" | "notFound.body" | "notFound.home",
): string => {
  const message = messages[key];
  return (typeof message === "string" ? message : message.other).replace("{variable}", "FACEIT_PLAYERS");
};

const COPY = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    {
      meta: text(CATALOG[locale], "notFound.meta"),
      title: text(CATALOG[locale], "notFound.title"),
      body: text(CATALOG[locale], "notFound.body"),
      home: text(CATALOG[locale], "notFound.home"),
    },
  ]),
);

const LOCALIZE = `(function(copy){var locale=location.pathname.split("/")[1];var c=copy[locale];if(!c)return;document.documentElement.lang=locale;document.title=c.meta;document.getElementById("missing-title").textContent=c.title;document.getElementById("missing-body").textContent=c.body;var home=document.getElementById("missing-home");home.lastChild.textContent=c.home;home.setAttribute("href","/"+locale)})(${JSON.stringify(COPY).replaceAll("<", "\\u003c")})`;

const fallback = COPY[DEFAULT_LOCALE] ?? { meta: "", title: "", body: "", home: "" };

export const metadata: Metadata = {
  title: fallback.meta,
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: SITE.themeColor.dark },
  ],
  colorScheme: "light dark",
};

// Not found page for addresses outside any language
const GlobalNotFound = () => (
  <html lang={DEFAULT_LOCALE} className={montserrat.variable} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
    </head>
    <body>
      <main className={styles.page}>
        <Logo size={40} />
        <p className={styles.code}>404</p>
        <div className={styles.text}>
          <h1 id="missing-title" className={styles.title} suppressHydrationWarning>
            {fallback.title}
          </h1>
          <p id="missing-body" className={styles.body} suppressHydrationWarning>
            {fallback.body}
          </p>
        </div>
        <a id="missing-home" href={homePath(DEFAULT_LOCALE)} className={styles.home} suppressHydrationWarning>
          <span aria-hidden="true">←</span>
          <span suppressHydrationWarning>{fallback.home}</span>
        </a>
      </main>
      <script dangerouslySetInnerHTML={{ __html: LOCALIZE }} />
    </body>
  </html>
);

export default GlobalNotFound;
