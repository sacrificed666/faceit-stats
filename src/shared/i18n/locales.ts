export const LOCALES = ["en", "uk", "cs", "de", "es", "fr", "it", "nl", "pl", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "faceit-stats-locale";

interface LocaleInfo {
  name: string;
  flag: string;
  intl: string;
  openGraph: string;
}

export const LOCALE_INFO: Readonly<Record<Locale, LocaleInfo>> = {
  en: { name: "English", flag: "GB", intl: "en-GB", openGraph: "en_GB" },
  uk: { name: "Українська", flag: "UA", intl: "uk-UA", openGraph: "uk_UA" },
  cs: { name: "Čeština", flag: "CZ", intl: "cs-CZ", openGraph: "cs_CZ" },
  de: { name: "Deutsch", flag: "DE", intl: "de-DE", openGraph: "de_DE" },
  es: { name: "Español", flag: "ES", intl: "es-ES", openGraph: "es_ES" },
  fr: { name: "Français", flag: "FR", intl: "fr-FR", openGraph: "fr_FR" },
  it: { name: "Italiano", flag: "IT", intl: "it-IT", openGraph: "it_IT" },
  nl: { name: "Nederlands", flag: "NL", intl: "nl-NL", openGraph: "nl_NL" },
  pl: { name: "Polski", flag: "PL", intl: "pl-PL", openGraph: "pl_PL" },
  pt: { name: "Português", flag: "PT", intl: "pt-PT", openGraph: "pt_PT" },
};

// Whether a value is a supported language
export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

// The best supported language for an Accept-Language header
export const negotiateLocale = (acceptLanguage: string | null | undefined): Locale => {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag = "", ...parameters] = part.trim().split(";");
      const quality = parameters.map((parameter) => parameter.trim()).find((parameter) => parameter.startsWith("q="));
      const weight = quality ? Number.parseFloat(quality.slice(2)) : 1;
      return { language: tag.toLowerCase().split("-")[0] ?? "", weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((entry) => entry.language !== "" && entry.weight > 0)
    .toSorted((a, b) => b.weight - a.weight || a.index - b.index);
  return ranked.map((entry) => entry.language).find(isLocale) ?? DEFAULT_LOCALE;
};

// The language an address starts with, or the default one
export const localeFromPath = (pathname: string): Locale => {
  const [, first] = pathname.split("/");
  return isLocale(first) ? first : DEFAULT_LOCALE;
};

// The same address in another language
export const switchLocale = (pathname: string, locale: Locale) => {
  const [, first = "", ...rest] = pathname.split("/");
  const tail = isLocale(first) ? rest : [first, ...rest].filter(Boolean);
  return ["", locale, ...tail].join("/");
};

// A path inside a language
export const localePath = (locale: Locale, path = "/"): string => (path === "/" ? `/${locale}` : `/${locale}${path}`);
