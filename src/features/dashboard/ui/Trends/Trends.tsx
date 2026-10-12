"use client";

import { useState } from "react";

import { mapName } from "@/features/squad/model/maps";
import { formatMetric, MATCH_METRIC_KEYS, METRICS, type MatchMetricKey } from "@/features/squad/model/metrics";
import { active, ROLLING_WINDOW, squadAverage, trendSeries, type PlayerView } from "@/features/squad/model/squad";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import { useTimeZone } from "@/shared/hooks/useClient";
import { useI18n } from "@/shared/i18n/useI18n";
import { fitGrid } from "@/shared/lib/fitGrid";
import { niceScale } from "@/shared/lib/scale";
import DataTable from "@/shared/ui/DataTable/DataTable";
import Delta from "@/shared/ui/Delta/Delta";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import LineChart, { ChartLegend } from "@/shared/ui/LineChart/LineChart";
import Section from "@/shared/ui/Section/Section";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

import styles from "./Trends.module.scss";

interface TrendsProps {
  views: readonly PlayerView[];
}

// A small chart per player on one scale, the best value of the metric first
const Trends = ({ views }: TrendsProps) => {
  const { t, format } = useI18n();
  const [metric, setMetric] = useState<MatchMetricKey>("kd");
  const timeZone = useTimeZone();
  const definition = METRICS[metric];
  const average = squadAverage(views, metric);
  const panels = active(views)
    .toSorted((a, b) => b.summary[metric] - a.summary[metric])
    .map((view) => ({ view, trend: trendSeries(view.matches, metric) }));
  const scale = niceScale(
    panels.flatMap(({ trend }) => trend.perMatch),
    3,
  );
  // A value formatted for the metric
  const show = (value: number) => formatMetric(format, metric, value);
  const rolling = t("trends.rolling", { count: ROLLING_WINDOW });
  const options = MATCH_METRIC_KEYS.map((key) => ({
    value: key,
    label: t(METRICS[key].label),
    title: t(METRICS[key].name),
  }));
  const grid = fitGrid(panels.length, { md: [2], lg: [3, 4], xl: [4, 5] });
  const legend = [
    { id: "match", label: t("trends.perMatch"), tone: "context" as const },
    { id: "rolling", label: rolling, tone: "data" as const },
  ];

  return (
    <Section
      id="trends"
      title={t("trends.title")}
      description={t("trends.description", { metric: t(definition.name) })}
      actions={
        <SegmentedControl hideLabel label={t("trends.metric")} options={options} value={metric} onChange={setMetric} />
      }
    >
      {panels.length === 0 ? (
        <div className={styles.panel}>
          <EmptyState icon="chart" title={t("empty.range")} />
        </div>
      ) : (
        <>
          <ChartLegend series={legend} reference={t("trends.squadAverageValue", { value: show(average) })} />
          <ul className={styles.grid} style={grid.list}>
            {panels.map(({ view, trend }, index) => (
              <li key={view.player.id} className={styles.card} style={grid.item(index)}>
                <div className={styles.heading}>
                  <PlayerName player={view.player} size={28} />
                  <span className={styles.summary}>
                    <span className={styles.value}>
                      <MetricValue metric={metric} value={view.summary[metric]} />
                    </span>
                    <Delta
                      value={view.summary[metric] - average}
                      digits={definition.digits}
                      points={definition.percent}
                    />
                  </span>
                </div>
                <LineChart
                  label={t("trends.chart", { metric: t(definition.name), player: view.player.nickname })}
                  height={112}
                  scale={scale}
                  format={show}
                  reference={{ value: average, label: t("trends.squadAverage") }}
                  points={trend.matches.map((match) => ({
                    key: match.id,
                    timestamp: match.finishedAt,
                    label: format.date(match.finishedAt, timeZone),
                    detail: `${mapName(match.map)} · ${t("result.score", {
                      result: t(match.won ? "result.win" : "result.loss"),
                      score: `${match.teamScore}:${match.opponentScore}`,
                    })}`,
                  }))}
                  series={[
                    { id: "match", label: t("trends.match"), tone: "context", values: trend.perMatch },
                    { id: "rolling", label: rolling, tone: "data", values: trend.rolling },
                  ]}
                />
              </li>
            ))}
          </ul>
          <DataTable
            caption={t("trends.caption", { metric: t(definition.name) })}
            columns={[
              { label: t("leaderboard.player") },
              { label: t("trends.average") },
              { label: t("trends.best") },
              { label: t("trends.worst") },
              { label: t("trends.last", { count: ROLLING_WINDOW }) },
            ]}
            rows={panels.map(({ view, trend }) => ({
              key: view.player.id,
              header: <PlayerName player={view.player} size={22} />,
              cells: [
                <MetricValue key="average" metric={metric} value={view.summary[metric]} />,
                <MetricValue key="best" metric={metric} value={Math.max(...trend.perMatch)} />,
                <MetricValue key="worst" metric={metric} value={Math.min(...trend.perMatch)} />,
                <MetricValue key="last" metric={metric} value={trend.rolling.at(-1) ?? 0} />,
              ],
            }))}
          />
        </>
      )}
    </Section>
  );
};

export default Trends;
