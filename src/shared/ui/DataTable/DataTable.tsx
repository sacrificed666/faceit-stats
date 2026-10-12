"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";

import styles from "./DataTable.module.scss";

export interface DataTableColumn {
  label: string;
  align?: "start" | "end";
}

export interface DataTableRow {
  key: string;
  header: ReactNode;
  cells: ReactNode[];
}

interface DataTableProps {
  caption: string;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
}

// Numbers sit at the end of a column, text at the start
const alignment = (column: DataTableColumn) => (column.align === "start" ? styles.start : styles.end);

// The numbers behind a chart in a table that opens on demand, header kept in view
const DataTable = ({ caption, columns, rows }: DataTableProps) => {
  const { t } = useI18n();
  return (
    <details className={styles.table}>
      <summary className={styles.summary}>
        <Icon name="table" size={16} />
        <span className={styles.show}>{t("table.show")}</span>
        <span className={styles.hide}>{t("table.hide")}</span>
        <Icon name="chevronDown" size={16} className={styles.chevron} />
      </summary>
      <div className={styles.scroller}>
        <table className={styles.grid}>
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.label}
                  scope="col"
                  className={cx(styles.head, index === 0 ? styles.start : alignment(column))}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={styles.row}>
                <th scope="row" className={styles.header}>
                  {row.header}
                </th>
                {columns.slice(1).map((column, index) => (
                  <td key={column.label} className={cx(styles.cell, alignment(column))}>
                    {row.cells[index]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
};

export default DataTable;
