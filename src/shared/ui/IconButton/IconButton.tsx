import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";
import type { IconName } from "../Icon/icons";

import styles from "./IconButton.module.scss";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> {
  icon: IconName;
  label: string;
  variant?: "ghost" | "inset" | "outline";
  size?: "small" | "medium";
  iconSize?: number;
  iconClassName?: string;
}

// A round icon button, named by its label and tooltip
const IconButton = ({
  icon,
  label,
  variant = "ghost",
  size = "medium",
  iconSize = 18,
  iconClassName,
  className,
  ...props
}: IconButtonProps) => (
  <button
    {...props}
    type="button"
    aria-label={label}
    title={label}
    className={cx(styles.button, styles[size], variant !== "ghost" && styles[variant], className)}
  >
    <Icon name={icon} size={iconSize} className={iconClassName} />
  </button>
);

export default IconButton;
