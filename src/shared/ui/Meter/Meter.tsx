"use client";

import { useId } from "react";

import { useI18n } from "@/shared/i18n/useI18n";

import styles from "./Meter.module.scss";

interface MeterProps {
  label: string;
  value: number | null;
  display: string;
  max?: number;
  hint?: string;
}

// A labelled native meter with the value and an optional hint
const Meter = ({ label, value, display, max = 100, hint }: MeterProps) => {
  const id = useId();
  const { t } = useI18n();
  return (
    <div className={styles.meter}>
      <div className={styles.heading}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span aria-hidden="true" className={styles.value}>
          {value === null ? "-" : display}
        </span>
      </div>
      <meter
        id={id}
        className={styles.bar}
        min={0}
        max={max}
        value={Math.min(Math.max(value ?? 0, 0), max)}
        aria-valuetext={value === null ? t("lifetime.noData") : display}
      >
        {value === null ? t("lifetime.noData") : display}
      </meter>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
};

export default Meter;
