"use client";

import { useState, type CSSProperties } from "react";

import { mapCells, mapColumns, type PlayerView } from "@/features/squad/model/squad";
import { summarize, type Summary } from "@/features/squad/model/stats";
import MapThumb from "@/features/squad/ui/MapThumb/MapThumb";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import type { MessageKey, Translate } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import type { Formatter } from "@/shared/lib/format";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Section from "@/shared/ui/Section/Section";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

import styles from "./MapPool.module.scss";

type HeatMetric = "winRate" | "kd" | "matches";

const FULL_CONFIDENCE = 5;

interface HeatDefinition {
  label: MessageKey;
  describe: MessageKey;
  format: (format: Formatter, summary: Summary) => string;
  tone: (summary: Summary, busiest: number) => { pole: "positive" | "negative" | "data"; strength: number };
  legend: (format: Formatter, t: Translate) => [string, string];
}

// Cells with fewer than five matches are paler, as their numbers say less
const confidence = (summary: Summary): number => Math.min(summary.matches / FULL_CONFIDENCE, 1);

const HEAT: Record<HeatMetric, HeatDefinition> = {
  winRate: {
    label: "metric.winRate",
    describe: "maps.winRate.describe",
    format: (format, summary) => format.percent(summary.winRate, 0),
    tone: (summary) => ({
      pole: summary.winRate >= 50 ? "positive" : "negative",
      strength: Math.min(Math.abs(summary.winRate - 50) / 35, 1) * confidence(summary),
    }),
    legend: (format, t) => [
      t("maps.below", { value: format.percent(50, 0) }),
      t("maps.above", { value: format.percent(50, 0) }),
    ],
  },
  kd: {
    label: "metric.kd",
    describe: "maps.kd.describe",
    format: (format, summary) => format.decimal(summary.kd, 2),
    tone: (summary) => ({
      pole: summary.kd >= 1 ? "positive" : "negative",
      strength: Math.min(Math.abs(summary.kd - 1) / 0.6, 1) * confidence(summary),
    }),
    legend: (format, t) => [
      t("maps.below", { value: format.decimal(1, 2) }),
      t("maps.above", { value: format.decimal(1, 2) }),
    ],
  },
  matches: {
    label: "metric.matches",
    describe: "maps.matches.describe",
    format: (format, summary) => format.integer(summary.matches),
    tone: (summary, busiest) => ({ pole: "data", strength: busiest === 0 ? 0 : (summary.matches / busiest) * 0.7 }),
    legend: (_format, t) => [t("maps.fewer"), t("maps.more")],
  },
};

const POLES = {
  positive: "var(--div-positive)",
  negative: "var(--div-negative)",
  data: "var(--data)",
} as const;

const HEAT_KEYS: readonly HeatMetric[] = ["winRate", "kd", "matches"];

interface MapPoolProps {
  views: readonly PlayerView[];
}

// The colour of a heatmap cell, from its pole and strength
const heatStyle = (definition: HeatDefinition, summary: Summary, busiest: number): CSSProperties => {
  const { pole, strength } = definition.tone(summary, busiest);
  return { "--heat": strength.toFixed(3), "--heat-pole": POLES[pole] };
};

// A heatmap of every player and map, with the whole squad in the last row
const MapPool = ({ views }: MapPoolProps) => {
  const { t, format } = useI18n();
  const [metric, setMetric] = useState<HeatMetric>("winRate");
  const definition = HEAT[metric];
  // A summary formatted for the chosen metric
  const show = (summary: Summary) => definition.format(format, summary);
  const options = HEAT_KEYS.map((key) => ({ value: key, label: t(HEAT[key].label) }));
  const [lower, higher] = definition.legend(format, t);
  const columns = mapColumns(views);
  const rows = views.map((view) => ({ view, cells: mapCells(view) }));
  const busiest = Math.max(0, ...rows.flatMap(({ cells }) => [...cells.values()].map((summary) => summary.matches)));
  const squad = new Map(
    columns.map((column) => [
      column.map,
      summarize(views.flatMap((view) => view.matches.filter((match) => match.map === column.map))),
    ]),
  );
  const squadBusiest = Math.max(0, ...[...squad.values()].map((summary) => summary.matches));

  return (
    <Section
      id="maps"
      title={t("maps.title")}
      description={t(definition.describe, {
        value: metric === "kd" ? format.decimal(1, 2) : format.percent(50, 0),
      })}
      actions={
        <SegmentedControl hideLabel label={t("maps.metric")} options={options} value={metric} onChange={setMetric} />
      }
    >
      {columns.length === 0 ? (
        <div className={styles.panel}>
          <EmptyState icon="map" title={t("empty.range")} />
        </div>
      ) : (
        <div className={styles.pool}>
          <div className={styles.scroller}>
            <table className={styles.table}>
              <caption className="visually-hidden">{t("maps.caption", { metric: t(definition.label) })}</caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.sticky}>
                    {t("maps.player")}
                  </th>
                  {columns.map((column) => (
                    <th key={column.map} scope="col" className={styles.mapHead}>
                      <span className={styles.mapLabel}>
                        <MapThumb map={column.map} size="md" />
                        {column.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ view, cells }) => (
                  <tr key={view.player.id}>
                    <th scope="row" className={styles.player}>
                      <PlayerName player={view.player} size={24} />
                    </th>
                    {columns.map((column) => {
                      const summary = cells.get(column.map);
                      if (!summary) {
                        return (
                          <td key={column.map} className={styles.empty}>
                            <span aria-hidden="true">-</span>
                            <span className="visually-hidden">{t("maps.none")}</span>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={column.map}
                          className={styles.heat}
                          style={heatStyle(definition, summary, busiest)}
                          title={t("maps.cell", {
                            player: view.player.nickname,
                            map: column.name,
                            value: show(summary),
                            matches: t("count.matches", { count: summary.matches }),
                          })}
                        >
                          <span className={styles.value}>{show(summary)}</span>
                          {metric === "matches" ? null : (
                            <span className={styles.matches}>{t("count.matches", { count: summary.matches })}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className={styles.sticky}>
                    {t("maps.squad")}
                  </th>
                  {columns.map((column) => {
                    const summary = squad.get(column.map) ?? summarize([]);
                    return (
                      <td
                        key={column.map}
                        className={cx(styles.heat, styles.squad)}
                        style={heatStyle(definition, summary, squadBusiest)}
                      >
                        <span className={styles.value}>{show(summary)}</span>
                        {metric === "matches" ? null : (
                          <span className={styles.matches}>{t("count.matches", { count: summary.matches })}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
          <div className={styles.legend}>
            <span>{lower}</span>
            <span
              aria-hidden="true"
              className={styles.scale}
              style={{
                backgroundImage:
                  metric === "matches"
                    ? "linear-gradient(90deg, var(--div-middle), color-mix(in oklab, var(--div-middle), var(--data) 70%))"
                    : "linear-gradient(90deg, var(--div-negative), var(--div-middle), var(--div-positive))",
              }}
            />
            <span>{higher}</span>
          </div>
        </div>
      )}
    </Section>
  );
};

export default MapPool;
