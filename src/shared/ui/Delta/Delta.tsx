"use client";

import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";

import styles from "./Delta.module.scss";

interface DeltaProps {
  value: number;
  digits: number;
  points?: boolean;
}

// A signed difference with an arrow, green above and red below
const Delta = ({ value, digits, points = false }: DeltaProps) => {
  const { t, format } = useI18n();
  const rounded = Number(value.toFixed(digits));
  const direction = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  const number = format.signed(value, digits);
  const text = points ? t("metric.points", { value: number }) : number;
  const spoken = direction === "up" ? "delta.above" : direction === "down" ? "delta.below" : "delta.even";
  return (
    <span className={cx(styles.delta, direction !== "flat" && styles[direction])}>
      {direction === "flat" ? null : <Icon name={direction === "up" ? "arrowUp" : "arrowDown"} size={13} />}
      <span aria-hidden="true">{text}</span>
      <span className="visually-hidden">{t(spoken, { value: text })}</span>
    </span>
  );
};

export default Delta;
