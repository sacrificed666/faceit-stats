"use client";

import { use } from "react";

import { I18nContext, type I18n } from "./context";

// Translator and formatter for Client Components
export const useI18n = (): I18n => {
  const i18n = use(I18nContext);
  if (!i18n) throw new Error("useI18n must be used inside I18nProvider");
  return i18n;
};
