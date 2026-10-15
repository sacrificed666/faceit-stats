"use client";

import type { ReactNode } from "react";

import { leader } from "@/features/compare/model/compare";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import styles from "./CompareRows.module.scss";

export interface CompareRow {
  key: string;
  label: ReactNode;
  first: number | null;
  second: number | null;
  display: (value: number, side: "first" | "second") => string;
  ranked?: boolean;
}

interface CompareRowsProps {
  caption: string;
  firstName: string;
  secondName: string;
  rows: readonly CompareRow[];
}

// A bar that grows away from the metric names in the middle
const Bar = ({
  value,
  max,
  strong,
  side,
}: {
  value: number | null;
  max: number;
  strong: boolean;
  side: "start" | "end";
}) => {
  const width = value === null || max <= 0 ? 0 : Math.max((value / max) * 100, value > 0 ? 2 : 0);
  return (
    <div aria-hidden="true" className={cx(styles.track, side === "start" && styles.towardsStart)}>
      <div
        className={cx(
          styles.bar,
          side === "start" ? styles.roundStart : styles.roundEnd,
          strong ? cx(styles.strong, "mark") : "mark-muted",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

// Two players mirrored around the metric names, the better value in bold
const CompareRows = ({ caption, firstName, secondName, rows }: CompareRowsProps) => {
  const { t } = useI18n();
  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr className={styles.names}>
            <th scope="col" className={cx(styles.name, styles.start)}>
              {firstName}
            </th>
            <th scope="col" className={styles.metricHead}>
              <span className="visually-hidden">{t("compare.metric")}</span>
            </th>
            <th scope="col" className={cx(styles.name, styles.end)}>
              {secondName}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const ahead = row.ranked === false ? null : leader(row.first, row.second);
            const max = Math.max(row.first ?? 0, row.second ?? 0);
            const note =
              ahead === null ? "" : t("compare.better", { player: ahead === "first" ? firstName : secondName });
            return (
              <tr key={row.key} className={styles.row}>
                <td className={cx(styles.cell, styles.start)}>
                  <span className={cx(styles.value, ahead === "first" && styles.ahead)}>
                    {row.first === null ? "-" : row.display(row.first, "first")}
                  </span>
                  <Bar value={row.first} max={max} strong={ahead === "first"} side="start" />
                </td>
                <th scope="row" className={styles.metric}>
                  {row.label}
                  {note ? <span className="visually-hidden">{`, ${note}`}</span> : null}
                </th>
                <td className={cx(styles.cell, styles.end)}>
                  <span className={cx(styles.value, ahead === "second" && styles.ahead)}>
                    {row.second === null ? "-" : row.display(row.second, "second")}
                  </span>
                  <Bar value={row.second} max={max} strong={ahead === "second"} side="end" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompareRows;
