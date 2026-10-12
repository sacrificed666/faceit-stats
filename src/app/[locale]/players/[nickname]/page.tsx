import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { profileData } from "@/features/player/model/profile";
import PlayerProfile from "@/features/player/ui/PlayerProfile/PlayerProfile";
import ProfileHero from "@/features/player/ui/ProfileHero/ProfileHero";
import { alternates, playerSchema, social } from "@/features/seo/model/seo";
import JsonLd from "@/features/seo/ui/JsonLd/JsonLd";
import { getSquad, squadNicknames } from "@/features/squad/api/loader";
import { decodeNickname, findPlayer } from "@/features/squad/model/players";
import { DEFAULT_RANGE, selectMatches } from "@/features/squad/model/range";
import { summarize } from "@/features/squad/model/stats";
import SquadLink from "@/features/squad/ui/SquadLink/SquadLink";
import SquadStatus from "@/features/squad/ui/SquadStatus/SquadStatus";
import { isLocale } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";
import { siteUrl } from "@/shared/lib/site";
import { playerPath } from "@/shared/lib/urls";
import Icon from "@/shared/ui/Icon/Icon";

import styles from "./page.module.scss";

const PLACEHOLDER = "__squad__";

// Prerenders every player of the squad in every language
export const generateStaticParams = async () => {
  const nicknames = await squadNicknames();
  return nicknames.length > 0 ? nicknames.map((nickname) => ({ nickname })) : [{ nickname: PLACEHOLDER }];
};

// Title, description, links and structured data of a player page
export const generateMetadata = async ({ params }: PageProps<"/[locale]/players/[nickname]">): Promise<Metadata> => {
  const { locale, nickname } = await params;
  if (!isLocale(locale)) return {};
  const [squad, i18n] = await Promise.all([getSquad(), getI18n(locale)]);
  const { t, format } = i18n;
  const player = squad.status === "ready" ? findPlayer(squad.players, nickname) : null;
  if (!player) return { title: t("player.notFound"), robots: { index: false, follow: true } };

  const summary = summarize(
    selectMatches(player.matches, DEFAULT_RANGE, squad.status === "ready" ? squad.updatedAt : 0),
  );
  const facts = { player: player.nickname, level: player.level, elo: format.integer(player.elo) };
  const description =
    summary.matches > 0
      ? t("meta.player", {
          ...facts,
          count: summary.matches,
          kd: format.decimal(summary.kd, 2),
          adr: format.decimal(summary.adr, 1),
          hs: format.percent(summary.hsPercent, 0),
          win: format.percent(summary.winRate, 0),
        })
      : t("meta.playerShort", facts);
  const links = alternates(locale, `/players/${encodeURIComponent(player.nickname)}`);
  const heading = `${player.nickname} · FACEIT CS2`;
  const title = `${heading} · ${t("app.name")}`;

  return {
    title: heading,
    description,
    alternates: links,
    ...social(i18n, { url: links.canonical, title, description, profile: player.nickname }),
  };
};

// A player page, redirecting to the exact spelling of the nickname
const PlayerPage = async ({ params }: PageProps<"/[locale]/players/[nickname]">) => {
  const { locale, nickname } = await params;
  if (!isLocale(locale)) notFound();
  const [squad, i18n] = await Promise.all([getSquad(), getI18n(locale)]);

  if (squad.status !== "ready") return <SquadStatus problem={squad} i18n={i18n} />;
  const player = findPlayer(squad.players, nickname);
  if (!player) notFound();
  if (decodeNickname(nickname) !== player.nickname) permanentRedirect(playerPath(locale, player.nickname));

  return (
    <div className={styles.player}>
      <JsonLd data={playerSchema(player, siteUrl(), squad.updatedAt, i18n)} />
      <nav aria-label={i18n.t("player.breadcrumb")}>
        <ol className={styles.breadcrumb}>
          <li>
            <SquadLink className={styles.squad}>{i18n.t("nav.squad")}</SquadLink>
          </li>
          <li aria-hidden="true">
            <Icon name="chevronRight" size={14} />
          </li>
          <li aria-current="page" className={styles.current}>
            {player.nickname}
          </li>
        </ol>
      </nav>
      <ProfileHero
        player={{
          nickname: player.nickname,
          avatar: player.avatar,
          country: player.country,
          elo: player.elo,
          level: player.level,
          region: player.region,
          regionRank: player.regionRank,
          steamId: player.steamId,
        }}
      />
      <PlayerProfile data={profileData(squad.players, player, squad.updatedAt)} />
    </div>
  );
};

export default PlayerPage;
