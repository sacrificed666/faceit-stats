"use client";

import type { PlayerView } from "@/features/squad/model/squad";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import LevelProgress from "@/features/squad/ui/LevelProgress/LevelProgress";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import { FormGuide } from "@/features/squad/ui/ResultBadge/ResultBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import Avatar from "@/shared/ui/Avatar/Avatar";

import styles from "./Contender.module.scss";

// One player's card: avatar, level, ELO and the last five results
const Contender = ({ view, align }: { view: PlayerView; align: "start" | "end" }) => {
  const { t, format } = useI18n();
  const { player } = view;
  return (
    <div className={cx(styles.contender, align === "end" && styles.end)}>
      <Avatar src={player.avatar} name={player.nickname} size={72} phoneSize={56} ring="accent" />
      <div className={styles.identity}>
        <PlayerName player={player} avatar={false} flag className={styles.name} />
        <p className={styles.elo}>
          <LevelBadge level={player.level} size={30} />
          <span className={styles.eloValue}>{format.integer(player.elo)}</span>
          <span className={styles.eloUnit}>{t("metric.elo")}</span>
        </p>
      </div>
      <LevelProgress elo={player.elo} className={styles.progress} />
      <FormGuide matches={view.matches.slice(0, 5)} />
    </div>
  );
};

export default Contender;
