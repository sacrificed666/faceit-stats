"use client";

import { formatMetric, METRICS, METRIC_KEYS, type MetricKey } from "@/features/squad/model/metrics";
import { rangeSpec } from "@/features/squad/model/range";
import { active, averageElo, metricRanks, squadAverage, type PlayerView } from "@/features/squad/model/squad";
import { rank } from "@/features/squad/model/stats";
import { useRange } from "@/features/squad/model/useRange";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import { FormGuide } from "@/features/squad/ui/ResultBadge/ResultBadge";
import { compareBy, useSort } from "@/shared/hooks/useSort";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import RankMedal from "@/shared/ui/RankMedal/RankMedal";
import Section from "@/shared/ui/Section/Section";
import SortHeader from "@/shared/ui/SortHeader/SortHeader";

import styles from "./Leaderboard.module.scss";

type SortKey = MetricKey | "elo" | "matches";

interface LeaderboardProps {
  views: readonly PlayerView[];
}

// The number a column sorts by
const sortValue = (view: PlayerView, key: SortKey): number => {
  if (key === "elo") return view.player.elo;
  if (key === "matches") return view.summary.matches;
  return view.summary[key];
};

// Players without matches have no place, except for ELO
const isRanked = (view: PlayerView, key: SortKey): boolean => key === "elo" || view.summary.matches > 0;

// Every player and metric in one sortable table with medals
const Leaderboard = ({ views }: LeaderboardProps) => {
  const { t, format } = useI18n();
  const spec = rangeSpec(useRange());
  const { sort, toggle } = useSort<SortKey>("elo");
  const ranks = new Map((["elo", ...METRIC_KEYS] as const).map((key) => [key, metricRanks(views, key)] as const));
  const positions = rank(
    views
      .filter((view) => isRanked(view, sort.key))
      .map((view) => ({ id: view.player.id, value: sortValue(view, sort.key) })),
  );
  const byValue = compareBy((view: PlayerView) => sortValue(view, sort.key), sort.direction);
  const rows = views.toSorted((a, b) => Number(isRanked(b, sort.key)) - Number(isRanked(a, sort.key)) || byValue(a, b));
  const column =
    sort.key === "elo" ? t("metric.elo") : sort.key === "matches" ? t("metric.matches") : t(METRICS[sort.key].label);
  const playing = active(views);

  return (
    <Section
      id="leaderboard"
      title={t("leaderboard.title")}
      description={t(spec.unit === "days" ? "leaderboard.description.days" : "leaderboard.description.matches", {
        count: spec.count,
      })}
    >
      <div className={styles.scroller}>
        <table className={styles.table}>
          <caption className="visually-hidden">
            {t("leaderboard.caption", {
              column,
              order: t(sort.direction === "desc" ? "leaderboard.highestFirst" : "leaderboard.lowestFirst"),
            })}
          </caption>
          <thead className={styles.head}>
            <tr>
              <th scope="col" className={cx(styles.th, styles.position)}>
                {t("leaderboard.position")}
              </th>
              <th scope="col" className={cx(styles.th, styles.sticky)}>
                {t("leaderboard.player")}
              </th>
              <SortHeader
                label={t("metric.elo")}
                active={sort.key === "elo"}
                direction={sort.direction}
                onSort={() => toggle("elo")}
              />
              <th scope="col" className={styles.th}>
                {t("leaderboard.form")}
              </th>
              <SortHeader
                label={t("metric.matches")}
                active={sort.key === "matches"}
                direction={sort.direction}
                onSort={() => toggle("matches")}
              />
              {METRIC_KEYS.map((key) => (
                <SortHeader
                  key={key}
                  label={t(METRICS[key].label)}
                  title={t(METRICS[key].name)}
                  active={sort.key === key}
                  direction={sort.direction}
                  onSort={() => toggle(key)}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((view) => {
              const { player, summary, matches } = view;
              const played = summary.matches > 0;
              return (
                <tr key={player.id} className={styles.row}>
                  <td className={cx(styles.cell, styles.rank)}>{positions.get(player.id) ?? "-"}</td>
                  <th scope="row" className={cx(styles.cell, styles.player)}>
                    <PlayerName player={player} flag truncate={false} />
                  </th>
                  <td className={styles.cell}>
                    <span className={styles.values}>
                      <RankMedal rank={ranks.get("elo")?.get(player.id) ?? 0} />
                      <span className={styles.elo}>{format.integer(player.elo)}</span>
                      <LevelBadge level={player.level} size={22} />
                    </span>
                  </td>
                  <td className={styles.cell}>
                    <FormGuide matches={matches.slice(0, 5)} />
                  </td>
                  <td className={cx(styles.cell, styles.matches)}>
                    {played ? (
                      <span>
                        <span className={styles.count}>{format.integer(summary.matches)}</span>
                        <span
                          aria-hidden="true"
                          className={styles.muted}
                        >{` · ${summary.wins}-${summary.losses}`}</span>
                        <span className="visually-hidden">
                          {`, ${t("record.spoken", { wins: summary.wins, losses: summary.losses })}`}
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  {METRIC_KEYS.map((key) => (
                    <td key={key} className={styles.cell}>
                      <span className={cx(styles.values, styles.metricValues)}>
                        <RankMedal rank={played ? (ranks.get(key)?.get(player.id) ?? 0) : 0} />
                        <span className={cx(styles.metric, sort.key === key && styles.sorted)}>
                          {played ? <MetricValue metric={key} value={summary[key]} /> : "-"}
                        </span>
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot className={styles.foot}>
            <tr>
              <th scope="row" colSpan={2} className={cx(styles.cell, styles.averageLabel)}>
                {t("leaderboard.average")}
              </th>
              <td className={cx(styles.cell, styles.average)}>{format.integer(averageElo(views))}</td>
              <td colSpan={2} className={cx(styles.cell, styles.average)}>
                {format.decimal(
                  views.reduce((sum, view) => sum + view.summary.matches, 0) / Math.max(views.length, 1),
                  1,
                )}
              </td>
              {METRIC_KEYS.map((key) => (
                <td key={key} className={cx(styles.cell, styles.average)}>
                  {playing.length > 0 ? formatMetric(format, key, squadAverage(views, key)) : "-"}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </Section>
  );
};

export default Leaderboard;
