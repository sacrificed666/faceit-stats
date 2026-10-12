import { LOCALE_INFO, type Locale } from "./locales";
import type { en } from "./messages/en";

export type PluralMessage = Readonly<Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }>;
export type Message = string | PluralMessage;
export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, Message>>;
export type TranslationParams = Readonly<Record<string, string | number>>;
export type Translate = (key: MessageKey, params?: TranslationParams) => string;

const pluralRules = new Map<Locale, Intl.PluralRules>();
const numberFormats = new Map<Locale, Intl.NumberFormat>();

// The plural form of a count in a language
export const pluralCategory = (locale: Locale, count: number): Intl.LDMLPluralRule => {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(LOCALE_INFO[locale].intl);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
};

// Numbers inside messages are formatted for the language
const formatParameter = (locale: Locale, value: string | number): string => {
  if (typeof value === "string") return value;
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE_INFO[locale].intl, { maximumFractionDigits: 0 });
    numberFormats.set(locale, format);
  }
  return format.format(value);
};

// A message with its plural form picked and placeholders filled
const formatMessage = (locale: Locale, message: Message, params: TranslationParams): string => {
  const template =
    typeof message === "string"
      ? message
      : (message[pluralCategory(locale, Number(params.count ?? 0))] ?? message.other);
  return template.replaceAll(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : formatParameter(locale, value);
  });
};

// A message of a catalog in its language
export const translate = (
  locale: Locale,
  messages: Messages,
  key: MessageKey,
  params: TranslationParams = {},
): string => formatMessage(locale, messages[key], params);

// A translate function bound to one language
export const createTranslator =
  (locale: Locale, messages: Messages): Translate =>
  (key, params) =>
    translate(locale, messages, key, params);

// A translate function over a few messages that shows the key for the rest
export const createFallbackTranslator =
  (locale: Locale, messages: Partial<Messages>): Translate =>
  (key, params = {}) => {
    const message = messages[key];
    return message === undefined ? key : formatMessage(locale, message, params);
  };
