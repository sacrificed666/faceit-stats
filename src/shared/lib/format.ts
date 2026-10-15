import { LOCALE_INFO, type Locale } from "@/shared/i18n/locales";

export type DateStyle = "date" | "short" | "datetime";

export const DATE_FORMATS: Readonly<Record<DateStyle, Intl.DateTimeFormatOptions>> = {
  date: { day: "numeric", month: "short", year: "numeric" },
  short: { day: "numeric", month: "short" },
  datetime: { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
};

export const RELATIVE_UNITS: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

const MINUS = "−";

export interface Formatter {
  locale: Locale;
  decimal: (value: number, digits: number) => string;
  integer: (value: number) => string;
  percent: (value: number, digits?: number) => string;
  signed: (value: number, digits: number) => string;
  date: (timestamp: number, timeZone: string, style?: DateStyle) => string;
  relative: (timestamp: number, now: number) => string;
  list: (items: readonly string[]) => string;
  country: (code: string) => string;
}

// Caches one Intl formatter per option
const memo = <K, V>(create: (key: K) => V): ((key: K) => V) => {
  const cache = new Map<K, V>();
  return (key) => {
    let value = cache.get(key);
    if (value === undefined) {
      value = create(key);
      cache.set(key, value);
    }
    return value;
  };
};

// A real minus sign instead of a hyphen
const minus = (text: string): string => text.replaceAll("-", MINUS);

// Numbers, dates, relative times and lists in one language
export const createFormatter = (locale: Locale): Formatter => {
  const tag = LOCALE_INFO[locale].intl;
  const decimals = memo(
    (digits: number) => new Intl.NumberFormat(tag, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
  );
  const percents = memo(
    (digits: number) =>
      new Intl.NumberFormat(tag, { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }),
  );
  const signs = memo(
    (digits: number) =>
      new Intl.NumberFormat(tag, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
        signDisplay: "exceptZero",
      }),
  );
  const dates = memo((style: DateStyle) =>
    memo((timeZone: string) => new Intl.DateTimeFormat(tag, { ...DATE_FORMATS[style], timeZone })),
  );
  const relativeFormat = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  const listFormat = new Intl.ListFormat(tag, { style: "long", type: "conjunction" });
  const regions = new Intl.DisplayNames([tag], { type: "region" });

  return {
    locale,
    decimal: (value, digits) => minus(decimals(digits).format(value)),
    integer: (value) => minus(decimals(0).format(Math.round(value))),
    percent: (value, digits = 1) => minus(percents(digits).format(value / 100)),
    signed: (value, digits) => minus(signs(digits).format(Number(value.toFixed(digits)) || 0)),
    date: (timestamp, timeZone, style = "date") => dates(style)(timeZone).format(timestamp),
    relative: (timestamp, now) => {
      const seconds = Math.round((timestamp - now) / 1000);
      const unit = RELATIVE_UNITS.find(([, size]) => Math.abs(seconds) >= size);
      return unit ? relativeFormat.format(Math.round(seconds / unit[1]), unit[0]) : relativeFormat.format(0, "second");
    },
    list: (items) => listFormat.format(items),
    country: (code) => {
      try {
        return regions.of(code.toUpperCase()) ?? code.toUpperCase();
      } catch {
        return code.toUpperCase();
      }
    },
  };
};
