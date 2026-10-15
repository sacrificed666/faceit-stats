import type { MessageKey } from "@/shared/i18n/translate";
import type { Formatter } from "@/shared/lib/format";

export type MetricKey = "rating" | "kd" | "kr" | "adr" | "hsPercent" | "survival" | "winRate";

export type MatchMetricKey = Exclude<MetricKey, "winRate">;

export type MetricTone = "good" | "bad" | "even";

export interface Metric {
  key: MetricKey;
  label: MessageKey;
  name: MessageKey;
  digits: number;
  percent: boolean;
  good: number;
  bad: number;
}

// Values from good up are green and values below bad are red wherever shown
export const METRICS: Readonly<Record<MetricKey, Metric>> = {
  rating: {
    key: "rating",
    label: "metric.rating",
    name: "metric.rating.name",
    digits: 2,
    percent: false,
    good: 1.1,
    bad: 0.9,
  },
  kd: { key: "kd", label: "metric.kd", name: "metric.kd.name", digits: 2, percent: false, good: 1.1, bad: 0.9 },
  kr: { key: "kr", label: "metric.kr", name: "metric.kr.name", digits: 2, percent: false, good: 0.75, bad: 0.6 },
  adr: { key: "adr", label: "metric.adr", name: "metric.adr.name", digits: 1, percent: false, good: 85, bad: 70 },
  hsPercent: {
    key: "hsPercent",
    label: "metric.hsPercent",
    name: "metric.hsPercent.name",
    digits: 1,
    percent: true,
    good: 55,
    bad: 35,
  },
  survival: {
    key: "survival",
    label: "metric.survival",
    name: "metric.survival.name",
    digits: 1,
    percent: true,
    good: 40,
    bad: 28,
  },
  winRate: {
    key: "winRate",
    label: "metric.winRate",
    name: "metric.winRate.name",
    digits: 1,
    percent: true,
    good: 55,
    bad: 45,
  },
};

export const METRIC_KEYS: readonly MetricKey[] = ["rating", "kd", "kr", "adr", "hsPercent", "winRate"];

export const MATCH_METRIC_KEYS: readonly MatchMetricKey[] = ["rating", "kd", "kr", "adr", "hsPercent"];

export const FORM_METRIC_KEYS: readonly MetricKey[] = ["rating", "kd", "kr", "adr", "hsPercent", "survival", "winRate"];

// A metric value as text, as a percentage or a decimal
export const formatMetric = (format: Formatter, key: MetricKey, value: number, digits = METRICS[key].digits): string =>
  METRICS[key].percent ? format.percent(value, digits) : format.decimal(value, digits);

// Whether a value is good, weak or in between
export const metricTone = (key: MetricKey, value: number): MetricTone => {
  if (value >= METRICS[key].good) return "good";
  return value < METRICS[key].bad ? "bad" : "even";
};
