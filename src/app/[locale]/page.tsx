import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Dashboard from "@/features/dashboard/ui/Dashboard/Dashboard";
import { withoutDetails } from "@/features/player/model/profile";
import { alternates, social, squadSchema } from "@/features/seo/model/seo";
import JsonLd from "@/features/seo/ui/JsonLd/JsonLd";
import { getSquad } from "@/features/squad/api/loader";
import { mapImages } from "@/features/squad/model/maps";
import SquadStatus from "@/features/squad/ui/SquadStatus/SquadStatus";
import { isLocale } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";
import { siteUrl } from "@/shared/lib/site";

// Title, description and links of the squad overview
export const generateMetadata = async ({ params }: PageProps<"/[locale]">): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const i18n = await getI18n(locale);
  const links = alternates(locale);
  const title = `${i18n.t("app.name")} · ${i18n.t("app.tagline")}`;
  return {
    title: { absolute: title },
    alternates: links,
    ...social(i18n, { url: links.canonical, title, description: i18n.t("app.description") }),
  };
};

// The squad overview, or the setup help while the squad is unavailable
const HomePage = async ({ params }: PageProps<"/[locale]">) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [squad, i18n] = await Promise.all([getSquad(), getI18n(locale)]);

  if (squad.status === "unconfigured" || squad.status === "unavailable")
    return <SquadStatus problem={squad} i18n={i18n} />;
  if (squad.players.length === 0) {
    return <SquadStatus problem={{ status: "empty", failed: squad.failed }} i18n={i18n} />;
  }

  return (
    <>
      <JsonLd data={squadSchema(squad.players, siteUrl(), i18n)} />
      <Dashboard
        players={squad.players.map(withoutDetails)}
        failed={squad.failed}
        updatedAt={squad.updatedAt}
        mapImages={mapImages(squad.players)}
      />
    </>
  );
};

export default HomePage;
