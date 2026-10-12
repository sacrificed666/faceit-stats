"use client";

import { levelForElo } from "@/features/squad/model/levels";
import { active, averageElo, squadAverage, type PlayerView } from "@/features/squad/model/squad";
import type { Lineup } from "@/features/squad/model/together";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import { useI18n } from "@/shared/i18n/useI18n";
import Icon from "@/shared/ui/Icon/Icon";
import StatTile from "@/shared/ui/StatTile/StatTile";

import styles from "./Overview.module.scss";

interface OverviewProps {
  views: readonly PlayerView[];
  lineups: readonly Lineup[];
}

// The view with the highest value, or null for an empty list
const best = (views: readonly PlayerView[], value: (view: PlayerView) => number): PlayerView | null =>
  views.reduce<PlayerView | null>((top, view) => (!top || value(view) > value(top) ? view : top), null);

// Five headline numbers for the whole squad
const Overview = ({ views, lineups }: OverviewProps) => {
  const { t, format } = useI18n();
  const playing = active(views);
  const elo = averageElo(views);
  const topElo = best(views, (view) => view.player.elo);
  const topKd = best(playing, (view) => view.summary.kd);
  const topWin = best(playing, (view) => view.summary.winRate);
  const together = lineups.filter((lineup) => lineup.playerIds.length > 1);
  const togetherWins = together.filter((lineup) => lineup.won).length;
  const hot = best(
    playing.filter((view) => view.streak?.won),
    (view) => view.streak?.length ?? 0,
  );

  return (
    <section aria-labelledby="overview-title" className={styles.overview}>
      <h2 id="overview-title" className="visually-hidden">
        {t("overview.title")}
      </h2>
      <dl className={styles.tiles}>
        <StatTile
          label={t("overview.averageElo")}
          className={styles.lead}
          icon={<Icon name="chart" size={14} />}
          value={
            <span className={styles.elo}>
              <LevelBadge level={levelForElo(elo).level} size={26} />
              {format.integer(elo)}
            </span>
          }
          detail={
            topElo
              ? t("overview.top", { name: topElo.player.nickname, value: format.integer(topElo.player.elo) })
              : undefined
          }
        />
        <StatTile
          label={t("overview.squadKd")}
          className={styles.third}
          icon={<Icon name="crosshair" size={14} />}
          value={<MetricValue metric="kd" value={squadAverage(views, "kd")} />}
          detail={
            topKd
              ? t("overview.best", { name: topKd.player.nickname, value: format.decimal(topKd.summary.kd, 2) })
              : undefined
          }
        />
        <StatTile
          label={t("overview.squadWinRate")}
          className={styles.third}
          icon={<Icon name="trophy" size={14} />}
          value={<MetricValue metric="winRate" value={squadAverage(views, "winRate")} />}
          detail={
            topWin
              ? t("overview.best", { name: topWin.player.nickname, value: format.percent(topWin.summary.winRate) })
              : undefined
          }
        />
        <StatTile
          label={t("overview.together")}
          className={styles.half}
          icon={<Icon name="users" size={14} />}
          value={format.integer(together.length)}
          detail={
            together.length > 0
              ? t("overview.togetherDetail", {
                  count: togetherWins,
                  rate: format.percent((togetherWins / together.length) * 100),
                })
              : t("overview.noShared")
          }
        />
        <StatTile
          label={t("overview.streak")}
          icon={<Icon name="flame" size={14} />}
          className={styles.half}
          value={hot?.streak ? format.integer(hot.streak.length) : "-"}
          unit={hot?.streak ? t("overview.streakWins", { count: hot.streak.length }) : undefined}
          detail={hot ? hot.player.nickname : t("overview.noStreak")}
        />
      </dl>
    </section>
  );
};

export default Overview;
