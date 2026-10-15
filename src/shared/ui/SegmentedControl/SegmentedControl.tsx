"use client";

import { useId } from "react";

import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";
import type { IconName } from "../Icon/icons";

import styles from "./SegmentedControl.module.scss";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  icon?: IconName;
  title?: string;
}

interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  description?: string;
  hideLabel?: boolean;
  size?: "sm" | "md";
  fill?: boolean;
  className?: string;
}

// A native radio group styled as pills
const SegmentedControl = <T extends string | number>({
  label,
  options,
  value,
  onChange,
  name,
  description,
  hideLabel = false,
  size = "md",
  fill = false,
  className,
}: SegmentedControlProps<T>) => {
  const generatedName = useId();
  const descriptionId = useId();
  return (
    <fieldset className={cx(styles.control, className)} aria-describedby={description ? descriptionId : undefined}>
      <legend className={hideLabel ? "visually-hidden" : styles.legend}>{label}</legend>
      <div className={styles.track}>
        {options.map((option) => (
          <label key={String(option.value)} className={fill ? styles.fill : styles.option} title={option.title}>
            <input
              type="radio"
              name={name ?? generatedName}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className={styles.input}
            />
            <span className={cx(styles.choice, size === "sm" && styles.small)}>
              {option.icon ? <Icon name={option.icon} size={15} /> : null}
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {description ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
    </fieldset>
  );
};

export default SegmentedControl;
