import type { ReactNode } from "react";

import { cx } from "@/shared/lib/cx";

import styles from "./StatTile.module.scss";

interface StatTileProps {
  label: string;
  value: ReactNode;
  unit?: ReactNode;
  detail?: ReactNode;
  delta?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

// A label and a value with an optional unit, difference and detail
const StatTile = ({ label, value, unit, detail, delta, icon, className }: StatTileProps) => (
  <div className={cx(styles.tile, className)}>
    <dt className={styles.label}>
      {icon}
      {label}
    </dt>
    <dd className={styles.values}>
      <span className={styles.value}>{value}</span>
      {unit ? <span className={styles.unit}>{unit}</span> : null}
      {delta}
    </dd>
    {detail ? <dd className={styles.detail}>{detail}</dd> : null}
  </div>
);

export default StatTile;
