"use client";

import type { SortDirection } from "@/shared/hooks/useSort";
import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";

import styles from "./SortHeader.module.scss";

interface SortHeaderProps {
  label: string;
  title?: string;
  active: boolean;
  direction: SortDirection;
  onSort: () => void;
  align?: "left" | "right";
  className?: string;
}

// A column header that sorts the table and reports the order
const SortHeader = ({ label, title, active, direction, onSort, align = "right", className }: SortHeaderProps) => {
  const sort = active ? (direction === "asc" ? "ascending" : "descending") : undefined;
  return (
    <th scope="col" aria-sort={sort} className={cx(styles.header, align === "left" && styles.left, className)}>
      <button type="button" onClick={onSort} title={title} className={cx(styles.button, active && styles.active)}>
        <span>{label}</span>
        <Icon name={active && direction === "asc" ? "chevronUp" : "chevronDown"} size={14} className={styles.arrow} />
        {title ? <span className="visually-hidden">{`, ${title}`}</span> : null}
      </button>
    </th>
  );
};

export default SortHeader;
