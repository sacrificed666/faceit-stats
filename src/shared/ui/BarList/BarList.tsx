import type { ReactNode } from "react";

import { cx } from "@/shared/lib/cx";

import styles from "./BarList.module.scss";

export interface BarListItem {
  id: string;
  label: ReactNode;
  value: number;
  display: ReactNode;
  detail?: ReactNode;
  emphasis?: boolean;
}

interface BarListProps {
  items: readonly BarListItem[];
  max?: number;
  reference?: { value: number; label: string };
  ordered?: boolean;
  className?: string;
}

// Bars on one scale, with an optional reference line such as an average
const BarList = ({ items, max, reference, ordered = true, className }: BarListProps) => {
  const limit = Math.max(max ?? 0, ...items.map((item) => item.value), reference?.value ?? 0) || 1;
  const List = ordered ? "ol" : "ul";
  return (
    <div className={cx(styles.list, className)}>
      <List className={styles.rows}>
        {items.map((item) => (
          <li key={item.id} className={styles.row}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.value}>
              <div className={styles.track}>
                <div
                  className={cx(styles.bar, item.emphasis === false ? cx(styles.muted, "mark-muted") : "mark")}
                  style={{
                    "--bar": `${Math.max((item.value / limit) * 100, item.value > 0 ? 1.5 : 0)}%`,
                  }}
                />
                {reference ? (
                  <div
                    aria-hidden="true"
                    className={cx(styles.reference, "mark-line")}
                    style={{ left: `${(reference.value / limit) * 100}%` }}
                  />
                ) : null}
              </div>
              <span className={styles.number}>{item.display}</span>
            </div>
            {item.detail ? <div className={styles.detail}>{item.detail}</div> : null}
          </li>
        ))}
      </List>
      {reference ? (
        <p className={styles.legend}>
          <span aria-hidden="true" className={cx(styles.legendLine, "mark-line")} />
          {reference.label}
        </p>
      ) : null}
    </div>
  );
};

export default BarList;
