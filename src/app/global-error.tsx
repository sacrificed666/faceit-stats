"use client";

import "./globals.scss";
import { usePathname } from "next/navigation";

import { FALLBACK_MESSAGES } from "@/shared/i18n/fallback";
import { localeFromPath } from "@/shared/i18n/locales";
import { createFallbackTranslator } from "@/shared/i18n/translate";
import { homePath } from "@/shared/lib/urls";
import ErrorScreen from "@/widgets/ErrorScreen/ErrorScreen";

import { montserrat } from "./fonts";

import styles from "./not-found.module.scss";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

// Last resort when even the layout fails, in the language of the address
const GlobalError = ({ error, retry }: GlobalErrorProps) => {
  const locale = localeFromPath(usePathname());
  const t = createFallbackTranslator(locale, FALLBACK_MESSAGES[locale]);
  return (
    <html lang={locale} className={montserrat.variable}>
      <body>
        <main className={styles.page}>
          <ErrorScreen t={t} home={homePath(locale)} digest={error.digest} onRetry={retry} />
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
