import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

import { createI18n } from "@/shared/i18n/create";
import I18nProvider from "@/shared/i18n/I18nProvider";
import type { Locale } from "@/shared/i18n/locales";
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

export const CATALOG: Readonly<Record<Locale, Messages>> = { en, uk, cs, de, es, fr, it, nl, pl, pt };

// Translator and formatter for a language in tests
export const i18nFor = (locale: Locale = "en") => createI18n(locale, CATALOG[locale]);

// Renders a component inside the translations of a language
export const renderWithI18n = (ui: ReactElement, locale: Locale = "en"): RenderResult =>
  render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider locale={locale} messages={CATALOG[locale]}>
        {children}
      </I18nProvider>
    ),
  });
