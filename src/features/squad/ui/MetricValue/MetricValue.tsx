"use client";

import { useI18n } from "@/shared/i18n/useI18n";

import { formatMetric, metricTone, type MetricKey } from "../../model/metrics";

import styles from "./MetricValue.module.scss";

const TONES = { good: styles.good, bad: styles.bad, even: undefined } as const;

interface MetricValueProps {
  metric: MetricKey;
  value: number;
  digits?: number;
}

// A metric in green when good and red when weak; the parent sets other colours
const MetricValue = ({ metric, value, digits }: MetricValueProps) => {
  const { format } = useI18n();
  const tone = metricTone(metric, value);
  return (
    <span className={TONES[tone]} data-tone={tone === "even" ? undefined : tone}>
      {formatMetric(format, metric, value, digits)}
    </span>
  );
};

export default MetricValue;
