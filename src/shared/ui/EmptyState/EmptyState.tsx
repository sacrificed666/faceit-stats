import type { ReactNode } from "react";

import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";
import type { IconName } from "../Icon/icons";

import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  className?: string;
}

// A short note for a section with nothing to show
const EmptyState = ({ icon = "info", title, children, className }: EmptyStateProps) => (
  <div className={cx(styles.empty, className)}>
    <span className={styles.icon}>
      <Icon name={icon} size={20} />
    </span>
    <div className={styles.text}>
      <p className={styles.title}>{title}</p>
      {children ? <div className={styles.hint}>{children}</div> : null}
    </div>
  </div>
);

export default EmptyState;
