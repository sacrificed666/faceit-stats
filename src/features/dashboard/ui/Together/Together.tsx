"use client";

import { playerById, type PlayerView } from "@/features/squad/model/squad";
import { duos, partySizes, type Lineup } from "@/features/squad/model/together";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import Avatar from "@/shared/ui/Avatar/Avatar";
import BarList from "@/shared/ui/BarList/BarList";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import RelativeTime from "@/shared/ui/RelativeTime/RelativeTime";
import Section from "@/shared/ui/Section/Section";

import styles from "./Together.module.scss";

const DUO_LIMIT = 8;

const LINEUPS: Partial<Record<number, MessageKey>> = {
  1: "together.lineup.1",
  2: "together.lineup.2",
  3: "together.lineup.3",
  4: "together.lineup.4",
  5: "together.lineup.5",
};

interface TogetherProps {
  views: readonly PlayerView[];
  lineups: readonly Lineup[];
}

// Win rate by party size and the duos that queue together most
const Together = ({ views, lineups }: TogetherProps) => {
  const { t, format } = useI18n();
  const players = playerById(views);
  const sizes = partySizes(lineups);
  const pairs = duos(lineups).slice(0, DUO_LIMIT);
  // Duo, trio and so on, or the number of squad members
  const lineupLabel = (size: number) => {
    const key = LINEUPS[size];
    return key ? t(key) : t("together.lineup.other", { count: size });
  };

  return (
    <Section id="together" title={t("together.title")} description={t("together.description")}>
      <div className={styles.grid}>
        <div className={styles.panel}>
          <h3 className={styles.title}>{t("together.lineups")}</h3>
          {sizes.length > 0 ? (
            <BarList
              ordered={false}
              max={100}
              items={sizes.map((size) => ({
                id: String(size.size),
                value: size.winRate,
                display: <MetricValue metric="winRate" value={size.winRate} digits={0} />,
                label: <span className={styles.lineup}>{lineupLabel(size.size)}</span>,
                detail: `${t("count.matches", { count: size.matches })}, ${size.wins}-${size.matches - size.wins}`,
              }))}
              reference={{ value: 50, label: t("together.reference", { value: format.percent(50, 0) }) }}
            />
          ) : (
            <EmptyState icon="users" title={t("empty.range")} />
          )}
        </div>
        <div className={styles.panel}>
          <h3 className={styles.title}>{t("together.duos")}</h3>
          {pairs.length > 0 ? (
            <ol className={styles.duos}>
              {pairs.map((pair) => {
                const first = players.get(pair.ids[0]);
                const second = players.get(pair.ids[1]);
                if (!first || !second) return null;
                return (
                  <li key={pair.ids.join(":")} className={styles.duo}>
                    <span aria-hidden="true" className={styles.avatars}>
                      <Avatar src={first.avatar} name={first.nickname} size={30} ring="surface" />
                      <Avatar src={second.avatar} name={second.nickname} size={30} ring="surface" />
                    </span>
                    <span className={styles.names}>
                      <PlayerName player={first} avatar={false} className={styles.name} />
                      <span className={styles.and}>&amp;</span>
                      <PlayerName player={second} avatar={false} className={styles.name} />
                    </span>
                    <span className={styles.numbers}>
                      <span className={styles.matches}>{t("count.matches", { count: pair.matches })}</span>
                      <span className={styles.rate}>
                        <MetricValue metric="winRate" value={pair.winRate} digits={0} />
                      </span>
                      <span className={styles.last}>
                        <RelativeTime timestamp={pair.lastPlayedAt} />
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState icon="users" title={t("together.noDuos")}>
              {t("together.noDuosHint")}
            </EmptyState>
          )}
        </div>
      </div>
    </Section>
  );
};

export default Together;
