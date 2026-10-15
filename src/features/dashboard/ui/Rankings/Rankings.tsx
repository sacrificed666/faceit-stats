"use client";

import { useState } from "react";

import { formatMetric, METRICS, METRIC_KEYS, type MetricKey } from "@/features/squad/model/metrics";
import { active, metricRanks, squadAverage, type PlayerView } from "@/features/squad/model/squad";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import { useI18n } from "@/shared/i18n/useI18n";
import BarList from "@/shared/ui/BarList/BarList";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import RankMedal from "@/shared/ui/RankMedal/RankMedal";
import Section from "@/shared/ui/Section/Section";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

import styles from "./Rankings.module.scss";

interface RankingsProps {
  views: readonly PlayerView[];
}

// Ranked bars for one metric against the squad average
const Rankings = ({ views }: RankingsProps) => {
  const { t, format } = useI18n();
  const [metric, setMetric] = useState<MetricKey>("kd");
  const definition = METRICS[metric];
  const ranks = metricRanks(views, metric);
  const average = squadAverage(views, metric);
  const options = METRIC_KEYS.map((key) => ({ value: key, label: t(METRICS[key].label), title: t(METRICS[key].name) }));
  const items = active(views)
    .toSorted((a, b) => b.summary[metric] - a.summary[metric])
    .map((view) => ({
      id: view.player.id,
      value: view.summary[metric],
      display: <MetricValue metric={metric} value={view.summary[metric]} />,
      label: (
        <>
          <span className={styles.rank}>{format.integer(ranks.get(view.player.id) ?? 0)}</span>
          <PlayerName player={view.player} size={24} />
          <RankMedal rank={ranks.get(view.player.id) ?? 0} />
        </>
      ),
    }));

  return (
    <Section
      id="rankings"
      title={t("rankings.title")}
      description={t("rankings.description", { metric: t(definition.name) })}
      actions={
        <SegmentedControl
          hideLabel
          label={t("rankings.metric")}
          options={options}
          value={metric}
          onChange={setMetric}
        />
      }
    >
      <div className={styles.panel}>
        {items.length > 0 ? (
          <BarList
            items={items}
            max={definition.percent ? 100 : undefined}
            reference={{
              value: average,
              label: t("rankings.average", { value: formatMetric(format, metric, average) }),
            }}
          />
        ) : (
          <EmptyState title={t("empty.range")} />
        )}
      </div>
    </Section>
  );
};

export default Rankings;
