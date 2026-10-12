"use client";

import { levelProgress } from "@/features/squad/model/levels";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import styles from "./LevelProgress.module.scss";

interface LevelProgressProps {
  elo: number;
  className?: string;
}

// A meter towards the next level with the ELO still needed
const LevelProgress = ({ elo, className }: LevelProgressProps) => {
  const { t, format } = useI18n();
  const { current, next, eloToNext } = levelProgress(elo);
  const caption =
    next && eloToNext !== null
      ? t("level.toNext", { elo: format.integer(eloToNext), level: next.level })
      : t("level.above", { elo: format.integer(elo - current.min), level: current.level });
  return (
    <div className={cx(styles.progress, className)}>
      <meter
        className={styles.bar}
        min={current.min}
        max={next ? next.min : Math.max(elo, current.min + 1)}
        value={elo}
        aria-label={next ? t("level.progress", { level: next.level }) : t("level.label", { level: current.level })}
        aria-valuetext={caption}
        style={{ "--meter-fill": current.color }}
      >
        {caption}
      </meter>
      <p aria-hidden="true" className={styles.caption}>
        {caption}
      </p>
    </div>
  );
};

export default LevelProgress;
