import "@/app/globals.scss";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import OfflineNotice from "@/features/notifications/ui/OfflineNotice/OfflineNotice";
import ServiceWorker from "@/features/notifications/ui/ServiceWorker/ServiceWorker";
import { social } from "@/features/seo/model/seo";
import { createI18n } from "@/shared/i18n/create";
import I18nProvider from "@/shared/i18n/I18nProvider";
import { isLocale, LOCALES } from "@/shared/i18n/locales";
import { getI18n, getMessages } from "@/shared/i18n/server";
import { BOOT_SCRIPT } from "@/shared/lib/boot";
import { isIndexable, SITE, siteUrl } from "@/shared/lib/site";
import QueryReady from "@/shared/ui/QueryReady/QueryReady";
import Footer from "@/widgets/Footer/Footer";
import Header from "@/widgets/Header/Header";

import { montserrat } from "../fonts";

import styles from "./layout.module.scss";

// Prerenders every language
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// Site-wide metadata in the page language
export const generateMetadata = async ({ params }: LayoutProps<"/[locale]">): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const i18n = await getI18n(locale);
  const name = i18n.t("app.name");
  const description = i18n.t("app.description");
  return {
    metadataBase: siteUrl(),
    title: { default: name, template: `%s · ${name}` },
    description,
    applicationName: name,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.author.name, url: SITE.author.url }],
    creator: SITE.author.name,
    publisher: SITE.author.name,
    category: "sports",
    ...social(i18n, { title: name, description }),
    robots: isIndexable()
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: false },
    formatDetection: { telephone: false, address: false, email: false },
  };
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: SITE.themeColor.dark },
  ],
  colorScheme: "light dark",
};

// The document shell: boot script, header, content and footer
const LocaleLayout = async ({ children, params }: LayoutProps<"/[locale]">) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages(locale);
  const i18n = createI18n(locale, messages);

  return (
    <html lang={locale} className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <a href="#main" className="skip-link">
            {i18n.t("app.skip")}
          </a>
          <Header i18n={i18n} />
          <main id="main" tabIndex={-1} className={styles.main}>
            {children}
          </main>
          <Footer i18n={i18n} />
          <OfflineNotice />
          <ServiceWorker />
          <QueryReady />
        </I18nProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
