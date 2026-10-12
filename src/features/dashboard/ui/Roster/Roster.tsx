"use client";

import Link from "next/link";

import { METRICS, type MetricKey } from "@/features/squad/model/metrics";
import type { PlayerView } from "@/features/squad/model/squad";
import { useRange, withRange } from "@/features/squad/model/useRange";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import LevelProgress from "@/features/squad/ui/LevelProgress/LevelProgress";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import { FormGuide } from "@/features/squad/ui/ResultBadge/ResultBadge";
import { rich } from "@/shared/i18n/rich";
import { useI18n } from "@/shared/i18n/useI18n";
import { fitGrid } from "@/shared/lib/fitGrid";
import { playerPath } from "@/shared/lib/urls";
import Avatar from "@/shared/ui/Avatar/Avatar";
import Flag from "@/shared/ui/Flag/Flag";
import RelativeTime from "@/shared/ui/RelativeTime/RelativeTime";
import Section from "@/shared/ui/Section/Section";

import styles from "./Roster.module.scss";

const CARD_METRICS: readonly MetricKey[] = ["rating", "kd", "adr", "winRate"];

interface RosterProps {
  views: readonly PlayerView[];
}

// A card for every player, highest ELO first, with form numbers for the range
const Roster = ({ views }: RosterProps) => {
  const { locale, t, format } = useI18n();
  const range = useRange();
  const ordered = views.toSorted((a, b) => b.player.elo - a.player.elo);
  const grid = fitGrid(ordered.length, { sm: [2], md: [2, 3], lg: [3, 4], xl: [4, 5] });
  return (
    <Section id="players" title={t("roster.title")} description={t("roster.description")}>
      <ul className={styles.grid} style={grid.list}>
        {ordered.map(({ player, summary, matches }, index) => {
          const latest = player.matches[0];
          return (
            <li key={player.id} className={styles.item} style={grid.item(index)}>
              <article className={styles.card}>
                <div className={styles.body}>
                  <div className={styles.identity}>
                    <Avatar src={player.avatar} name={player.nickname} size={44} />
                    <div className={styles.names}>
                      <h3 className={styles.name}>
                        <Link href={withRange(playerPath(locale, player.nickname), range)} className={styles.link}>
                          {player.nickname}
                        </Link>
                        {player.country ? (
                          <Flag country={player.country} height={12} label={format.country(player.country)} />
                        ) : null}
                      </h3>
                      <p className={styles.region}>
                        {player.regionRank && player.region
                          ? t("roster.regionRank", { rank: format.integer(player.regionRank), region: player.region })
                          : (player.region ?? "FACEIT")}
                      </p>
                    </div>
                  </div>
                  <div className={styles.level}>
                    <div className={styles.eloRow}>
                      <p className={styles.elo}>
                        <span className={styles.eloValue}>{format.integer(player.elo)}</span>
                        <span className={styles.eloUnit}>{t("metric.elo")}</span>
                      </p>
                      <LevelBadge level={player.level} size={30} />
                    </div>
                    <LevelProgress elo={player.elo} />
                  </div>
                  <dl className={styles.metrics}>
                    {CARD_METRICS.map((key) => (
                      <div key={key} className={styles.metric}>
                        <dt className={styles.metricLabel}>{t(METRICS[key].label)}</dt>
                        <dd className={styles.metricValue}>
                          {summary.matches ? (
                            <MetricValue metric={key} value={summary[key]} digits={key === "winRate" ? 0 : undefined} />
                          ) : (
                            "-"
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className={styles.footer}>
                    <FormGuide matches={matches.slice(0, 5)} />
                    {latest ? (
                      <span className={styles.played}>
                        {rich(t("roster.played"), { time: <RelativeTime timestamp={latest.finishedAt} /> })}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

export default Roster;
