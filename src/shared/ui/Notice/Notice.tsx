import type { ReactNode } from "react";

import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";
import type { IconName } from "../Icon/icons";

import styles from "./Notice.module.scss";

interface NoticeProps {
  tone?: "info" | "warning";
  title: string;
  children?: ReactNode;
  icon?: IconName;
}

// A highlighted message with an icon, for warnings and information
const Notice = ({ tone = "info", title, children, icon }: NoticeProps) => (
  <div
    role={tone === "warning" ? "status" : undefined}
    className={cx(styles.notice, tone === "warning" && styles.warning)}
  >
    <Icon name={icon ?? (tone === "warning" ? "alert" : "info")} size={20} className={styles.icon} />
    <div className={styles.body}>
      <p className={styles.title}>{title}</p>
      {children ? <div className={styles.text}>{children}</div> : null}
    </div>
  </div>
);

export default Notice;
