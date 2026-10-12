"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";

import styles from "./ExternalLink.module.scss";

interface ExternalLinkProps {
  href: string;
  children?: ReactNode;
  className?: string;
  variant?: "text" | "icon";
  icon?: boolean;
  label?: string;
  context?: string;
}

// A link to another site that opens in a new tab and says so
const ExternalLink = ({
  href,
  children,
  className,
  variant = "text",
  icon = true,
  label,
  context,
}: ExternalLinkProps) => {
  const { t } = useI18n();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? t("external.label", { label }) : undefined}
      className={cx(styles.link, variant === "icon" && styles.icon, className)}
    >
      {children}
      {context ? <span className="visually-hidden">{`, ${context}`}</span> : null}
      {icon ? <Icon name="external" size={14} className={styles.arrow} /> : null}
      {label ? null : <span className="visually-hidden">{` (${t("external.newTab")})`}</span>}
    </a>
  );
};

export default ExternalLink;
