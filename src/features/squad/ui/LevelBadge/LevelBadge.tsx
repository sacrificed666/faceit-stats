"use client";

import { LEVELS, levelOf } from "@/features/squad/model/levels";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import styles from "./LevelBadge.module.scss";

interface LevelBadgeProps {
  level: number;
  size?: number;
  className?: string;
}

const RADIUS = 9.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC = CIRCUMFERENCE * 0.75;

// FACEIT-style ring with the level number in the level colour
const LevelBadge = ({ level, size = 32, className }: LevelBadgeProps) => {
  const { t } = useI18n();
  const { color } = levelOf(level);
  const filled = (ARC * Math.min(Math.max(level, 0), LEVELS.length)) / LEVELS.length;
  return (
    <span className={cx(styles.badge, className)} title={t("level.faceit", { level })}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="12" fill="var(--level-disk)" />
        <circle
          cx="12"
          cy="12"
          r={RADIUS}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
          transform="rotate(135 12 12)"
        />
        <circle
          cx="12"
          cy="12"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
          transform="rotate(135 12 12)"
        />
        <text
          x="12"
          y="12.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={level >= 10 ? 8.5 : 10}
          fontWeight="800"
          fontFamily="inherit"
        >
          {level}
        </text>
      </svg>
      <span className="visually-hidden">{t("level.label", { level })}</span>
    </span>
  );
};

export default LevelBadge;
