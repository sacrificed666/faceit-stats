"use client";

import { useState } from "react";

import { mapName } from "@/features/squad/model/maps";
import {
  formatMetric,
  MATCH_METRIC_KEYS,
  METRICS,
  type MatchMetricKey,
  type MetricKey,
} from "@/features/squad/model/metrics";
import { ROLLING_WINDOW, trendSeries, type PlayerView } from "@/features/squad/model/squad";
import MapThumb from "@/features/squad/ui/MapThumb/MapThumb";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import ResultBadge from "@/features/squad/ui/ResultBadge/ResultBadge";
import { useTimeZone } from "@/shared/hooks/useClient";
import { useI18n } from "@/shared/i18n/useI18n";
import { niceScale } from "@/shared/lib/scale";
import DataTable from "@/shared/ui/DataTable/DataTable";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import LineChart, { ChartLegend } from "@/shared/ui/LineChart/LineChart";
import LocalDate from "@/shared/ui/LocalDate/LocalDate";
import Section from "@/shared/ui/Section/Section";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

import styles from "./PlayerTrend.module.scss";

interface PlayerTrendProps {
  view: PlayerView;
  averages: Readonly<Record<MetricKey, number>>;
}

// One metric per match with the rolling and squad averages
const PlayerTrend = ({ view, averages }: PlayerTrendProps) => {
  const { t, format } = useI18n();
  const [metric, setMetric] = useState<MatchMetricKey>("kd");
  const timeZone = useTimeZone();
  const definition = METRICS[metric];
  const trend = trendSeries(view.matches, metric);
  const average = averages[metric];
  const scale = niceScale([...trend.perMatch, average], 4);
  // A value formatted for the metric
  const show = (value: number) => formatMetric(format, metric, value);
  const rolling = t("trends.rolling", { count: ROLLING_WINDOW });
  const options = MATCH_METRIC_KEYS.map((key) => ({
    value: key,
    label: t(METRICS[key].label),
    title: t(METRICS[key].name),
  }));
  const series = [
    { id: "match", label: t("trends.perMatch"), tone: "context" as const, values: trend.perMatch },
    { id: "rolling", label: rolling, tone: "data" as const, values: trend.rolling },
  ];
  // A spoken result with the score
  const result = (won: boolean, score: string) =>
    t("result.score", { result: t(won ? "result.win" : "result.loss"), score });

  return (
    <Section
      id="trend"
      title={t("trend.title")}
      description={t("trend.description", { metric: t(definition.name) })}
      actions={
        <SegmentedControl hideLabel label={t("trend.metric")} options={options} value={metric} onChange={setMetric} />
      }
    >
      <div className={styles.panel}>
        {trend.matches.length === 0 ? (
          <EmptyState icon="chart" title={t("empty.range")} />
        ) : (
          <>
            <ChartLegend series={series} reference={t("trends.squadAverageValue", { value: show(average) })} />
            <LineChart
              label={t("trends.chart", { metric: t(definition.name), player: view.player.nickname })}
              height={200}
              scale={scale}
              format={show}
              reference={{ value: average, label: t("trends.squadAverage") }}
              points={trend.matches.map((match) => ({
                key: match.id,
                timestamp: match.finishedAt,
                label: format.date(match.finishedAt, timeZone),
                detail: `${mapName(match.map)} · ${result(match.won, `${match.teamScore}:${match.opponentScore}`)}`,
              }))}
              series={series}
            />
            <DataTable
              caption={t("trend.caption", { metric: t(definition.name), player: view.player.nickname })}
              columns={[
                { label: t("trend.date") },
                { label: t("trend.map"), align: "start" },
                { label: t("trend.result"), align: "start" },
                { label: t(definition.label) },
                { label: rolling },
              ]}
              rows={trend.matches
                .map((match, index) => ({
                  key: match.id,
                  header: <LocalDate timestamp={match.finishedAt} format="datetime" />,
                  cells: [
                    <span key="map" className={styles.map}>
                      <MapThumb map={match.map} size="xs" />
                      {mapName(match.map)}
                    </span>,
                    <ResultBadge key="result" won={match.won} score={`${match.teamScore}:${match.opponentScore}`} />,
                    <MetricValue key="match" metric={metric} value={trend.perMatch[index] ?? 0} />,
                    <MetricValue key="rolling" metric={metric} value={trend.rolling[index] ?? 0} />,
                  ],
                }))
                .toReversed()}
            />
          </>
        )}
      </div>
    </Section>
  );
};

export default PlayerTrend;
