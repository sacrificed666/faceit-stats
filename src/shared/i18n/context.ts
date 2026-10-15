import { createContext } from "react";

import type { Formatter } from "@/shared/lib/format";

import type { Locale } from "./locales";
import type { Translate } from "./translate";

export interface I18n {
  locale: Locale;
  t: Translate;
  format: Formatter;
}

export const I18nContext = createContext<I18n | null>(null);
