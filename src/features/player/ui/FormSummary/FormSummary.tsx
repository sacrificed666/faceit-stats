"use client";

import { FORM_METRIC_KEYS, formatMetric, METRICS, type MetricKey } from "@/features/squad/model/metrics";
import type { PlayerView } from "@/features/squad/model/squad";
import type { LifetimeStats } from "@/features/squad/model/types";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import { FormGuide } from "@/features/squad/ui/ResultBadge/ResultBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import Delta from "@/shared/ui/Delta/Delta";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Section from "@/shared/ui/Section/Section";
import StatTile from "@/shared/ui/StatTile/StatTile";

import styles from "./FormSummary.module.scss";

interface FormSummaryProps {
  view: PlayerView;
  averages: Readonly<Record<MetricKey, number>>;
}

// The lifetime value of a metric, when FACEIT reports one
const lifetimeValue = (lifetime: LifetimeStats | null, key: MetricKey): number | null => {
  if (!lifetime) return null;
  switch (key) {
    case "kd":
      return lifetime.kd;
    case "hsPercent":
      return lifetime.hsPercent;
    case "winRate":
      return lifetime.winRate;
    case "adr":
      return lifetime.adr;
    case "rating":
    case "kr":
    case "survival":
      return null;
  }
};

// Averages of the range against the squad and lifetime, and the record
const FormSummary = ({ view, averages }: FormSummaryProps) => {
  const { t, format } = useI18n();
  const { summary, matches, streak, player } = view;
  return (
    <Section
      id="form"
      title={t("form.title")}
      description={summary.matches > 0 ? t("form.description", { count: summary.matches }) : undefined}
    >
      {summary.matches === 0 ? (
        <div className={styles.panel}>
          <EmptyState title={t("form.empty")} />
        </div>
      ) : (
        <div className={styles.form}>
          <dl className={styles.tiles}>
            {FORM_METRIC_KEYS.map((key) => {
              const definition = METRICS[key];
              const average = averages[key];
              const lifetime = lifetimeValue(player.lifetime, key);
              const squad = t("form.squad", { value: formatMetric(format, key, average) });
              return (
                <StatTile
                  key={key}
                  label={t(definition.name)}
                  value={<MetricValue metric={key} value={summary[key]} />}
                  delta={
                    <Delta value={summary[key] - average} digits={definition.digits} points={definition.percent} />
                  }
                  detail={
                    lifetime === null
                      ? squad
                      : `${squad} · ${t("form.lifetime", { value: formatMetric(format, key, lifetime) })}`
                  }
                />
              );
            })}
            <StatTile
              label={t("form.record")}
              value={
                <span>
                  <span aria-hidden="true">{`${summary.wins}-${summary.losses}`}</span>
                  <span className="visually-hidden">
                    {t("record.spoken", { wins: summary.wins, losses: summary.losses })}
                  </span>
                </span>
              }
              detail={streak ? t(streak.won ? "form.won" : "form.lost", { count: streak.length }) : undefined}
            />
          </dl>
          <div className={styles.recent}>
            <span className={styles.label}>{t("form.last10")}</span>
            <FormGuide matches={matches.slice(0, 10)} label={t("form.last10")} />
            <span className={styles.order}>{t("form.newest")}</span>
          </div>
        </div>
      )}
    </Section>
  );
};

export default FormSummary;
