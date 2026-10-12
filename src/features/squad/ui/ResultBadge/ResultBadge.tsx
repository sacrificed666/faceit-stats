"use client";

import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";

import styles from "./ResultBadge.module.scss";

interface ResultBadgeProps {
  won: boolean;
  score?: string;
  size?: "sm" | "md";
}

// W or L with the score, coloured and spoken in full
const ResultBadge = ({ won, score, size = "md" }: ResultBadgeProps) => {
  const { t } = useI18n();
  return (
    <span className={cx(styles.badge, won ? styles.win : styles.loss, size === "sm" && styles.small)}>
      <span aria-hidden="true">{t(won ? "result.winShort" : "result.lossShort")}</span>
      <span className="visually-hidden">{t(won ? "result.win" : "result.loss")}</span>
      {score ? <span className={styles.score}>{score}</span> : null}
    </span>
  );
};

interface FormGuideProps {
  matches: ReadonlyArray<{ id: string; won: boolean }>;
  label?: string;
}

// The latest results as a row of W and L badges
export const FormGuide = ({ matches, label }: FormGuideProps) => {
  const { t, format } = useI18n();
  const name = label ?? t("form.recent");
  if (matches.length === 0) return <span className={styles.none}>{t("form.none")}</span>;
  const results = format.list(matches.map((match) => t(match.won ? "result.win" : "result.loss").toLowerCase()));
  return (
    <span className={styles.guide} title={t("form.newestFirst", { label: name })}>
      <span className="visually-hidden">{t("form.spoken", { label: name, results })}</span>
      {matches.map((match) => (
        <span key={match.id} aria-hidden="true" className={cx(styles.result, match.won ? styles.win : styles.loss)}>
          {t(match.won ? "result.winShort" : "result.lossShort")}
        </span>
      ))}
    </span>
  );
};

export default ResultBadge;
