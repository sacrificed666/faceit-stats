"use client";

import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import styles from "./RankMedal.module.scss";

const MEDALS: Partial<Record<number, { tone: "gold" | "silver" | "bronze"; label: MessageKey }>> = {
  1: { tone: "gold", label: "medal.1" },
  2: { tone: "silver", label: "medal.2" },
  3: { tone: "bronze", label: "medal.3" },
};

interface RankMedalProps {
  rank: number;
  className?: string;
}

// Gold, silver or bronze for the top three places
const RankMedal = ({ rank, className }: RankMedalProps) => {
  const { t } = useI18n();
  const medal = MEDALS[rank];
  if (!medal) return null;
  const label = t(medal.label);
  return (
    <span title={label} className={cx(styles.medal, styles[medal.tone], className)}>
      <span aria-hidden="true">{rank}</span>
      <span className="visually-hidden">{label}</span>
    </span>
  );
};

export default RankMedal;
