import type { ReactNode, SelectHTMLAttributes } from "react";

import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";

import styles from "./Select.module.scss";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  leading?: ReactNode;
  className?: string;
}

// A native select as a pill with a chevron and an optional picture at the start
const Select = ({ leading, className, children, ...props }: SelectProps) => (
  <span className={cx(styles.field, className)}>
    {leading ? (
      <span aria-hidden="true" className={styles.leading}>
        {leading}
      </span>
    ) : null}
    <select {...props} className={cx(styles.select, Boolean(leading) && styles.withLeading)}>
      {children}
    </select>
    <Icon name="chevronDown" size={16} className={styles.chevron} />
  </span>
);

export default Select;
