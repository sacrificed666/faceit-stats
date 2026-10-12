"use client";

import type { SquadMate } from "@/features/player/model/profile";
import type { PlayerView } from "@/features/squad/model/squad";
import type { Teammate } from "@/features/squad/model/together";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import { useI18n } from "@/shared/i18n/useI18n";
import BarList from "@/shared/ui/BarList/BarList";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Section from "@/shared/ui/Section/Section";

import styles from "./Teammates.module.scss";

interface TeammatesProps {
  view: PlayerView;
  squad: ReadonlyMap<string, SquadMate>;
  mates: readonly Teammate[];
}

// Win rate with every squad mate, against the player's own win rate
const Teammates = ({ view, squad, mates }: TeammatesProps) => {
  const { t, format } = useI18n();
  const items = mates.flatMap((mate) => {
    const player = squad.get(mate.id);
    if (!player) return [];
    return [
      {
        id: mate.id,
        value: mate.winRate,
        display: <MetricValue metric="winRate" value={mate.winRate} digits={0} />,
        label: <PlayerName player={player} size={26} />,
        detail: t("teammates.detail", { count: mate.matches, record: `${mate.wins}-${mate.matches - mate.wins}` }),
      },
    ];
  });

  return (
    <Section
      id="teammates"
      title={t("teammates.title")}
      description={t("teammates.description", { player: view.player.nickname })}
    >
      {items.length > 0 ? (
        <div className={styles.bars}>
          <BarList
            ordered={false}
            max={100}
            items={items}
            reference={{
              value: view.summary.winRate,
              label: t("teammates.overall", { value: format.percent(view.summary.winRate, 0) }),
            }}
          />
        </div>
      ) : (
        <div className={styles.panel}>
          <EmptyState icon="users" title={t("teammates.empty")}>
            {t("teammates.emptyHint")}
          </EmptyState>
        </div>
      )}
    </Section>
  );
};

export default Teammates;
