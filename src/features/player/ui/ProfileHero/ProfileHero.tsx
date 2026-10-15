"use client";

import Link from "next/link";

import { DEFAULT_RANGE } from "@/features/squad/model/range";
import type { Player } from "@/features/squad/model/types";
import { useRange } from "@/features/squad/model/useRange";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import LevelProgress from "@/features/squad/ui/LevelProgress/LevelProgress";
import { useI18n } from "@/shared/i18n/useI18n";
import { comparePath, faceitProfileUrl, steamProfileUrl } from "@/shared/lib/urls";
import Avatar from "@/shared/ui/Avatar/Avatar";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";
import Flag from "@/shared/ui/Flag/Flag";
import Icon from "@/shared/ui/Icon/Icon";

import styles from "./ProfileHero.module.scss";

export type HeroPlayer = Pick<
  Player,
  "nickname" | "avatar" | "country" | "elo" | "level" | "region" | "regionRank" | "steamId"
>;

interface ProfileHeroProps {
  player: HeroPlayer;
}

// Avatar, name, links and the ELO progress of a player
const ProfileHero = ({ player }: ProfileHeroProps) => {
  const { locale, t, format } = useI18n();
  const range = useRange();
  const compare = new URLSearchParams({ a: player.nickname });
  if (range !== DEFAULT_RANGE) compare.set("range", range);
  return (
    <header className={styles.hero}>
      <div aria-hidden="true" className={styles.glow} />
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.identity}>
            <Avatar src={player.avatar} name={player.nickname} size={112} phoneSize={72} ring="accent" eager />
            <div className={styles.names}>
              <p className={styles.kicker}>
                {player.region ? t("player.kickerRegion", { region: player.region }) : t("player.kicker")}
              </p>
              <h1 className={styles.title}>{player.nickname}</h1>
              <p className={styles.facts}>
                {player.country ? (
                  <span className={styles.fact}>
                    <Flag country={player.country} height={14} />
                    {format.country(player.country)}
                  </span>
                ) : null}
                {player.regionRank && player.region ? (
                  <span className={styles.fact}>
                    <Icon name="trophy" size={15} className={styles.trophy} />
                    {t("roster.regionRank", {
                      rank: format.integer(player.regionRank),
                      region: player.region,
                    })}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className={styles.links}>
            <ExternalLink href={faceitProfileUrl(player.nickname)} className={styles.button}>
              {t("player.faceit")}
            </ExternalLink>
            {player.steamId ? (
              <ExternalLink href={steamProfileUrl(player.steamId)} className={styles.button}>
                {t("player.steam")}
              </ExternalLink>
            ) : null}
            <Link href={`${comparePath(locale)}?${compare.toString()}`} className={styles.button}>
              <Icon name="users" size={15} />
              {t("player.compare")}
            </Link>
          </div>
        </div>
        <div className={styles.elo}>
          <div className={styles.level}>
            <LevelBadge level={player.level} size={52} />
            <div>
              <p className={styles.eloValue}>{format.integer(player.elo)}</p>
              <p className={styles.eloLevel}>{t("level.eloLevel", { level: player.level })}</p>
            </div>
          </div>
          <LevelProgress elo={player.elo} />
        </div>
      </div>
    </header>
  );
};

export default ProfileHero;
