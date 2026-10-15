import { createFormatter } from "@/shared/lib/format";

import type { I18n } from "./context";
import type { Locale } from "./locales";
import { createTranslator, type Messages } from "./translate";

// Translator and formatter for one language
export const createI18n = (locale: Locale, messages: Messages): I18n => ({
  locale,
  t: createTranslator(locale, messages),
  format: createFormatter(locale),
});
