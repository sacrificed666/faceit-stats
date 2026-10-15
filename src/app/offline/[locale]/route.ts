import { offlinePage } from "@/features/notifications/model/offlinePage";
import { isLocale, LOCALES } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";

// Prerenders the offline page in every language
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// The page the service worker shows when another page cannot load offline
export const GET = async (_request: Request, { params }: RouteContext<"/offline/[locale]">) => {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  const { t } = await getI18n(locale);
  const { html, policy } = offlinePage({
    lang: locale,
    name: t("app.name"),
    title: t("offline.title"),
    message: t("offline.message"),
    retry: t("error.retry"),
    light: {
      background: "#f3f3f0",
      surface: "#fcfcfb",
      text: "#111110",
      muted: "#4d4c48",
      accent: "#ff5500",
      onAccent: "#111110",
    },
    dark: {
      background: "#0f1011",
      surface: "#18191b",
      text: "#f5f5f3",
      muted: "#c3c2b7",
      accent: "#ff5500",
      onAccent: "#111110",
    },
  });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": policy,
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
};
