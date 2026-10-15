"use client";

import type { Player } from "@/features/squad/model/types";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import { useI18n } from "@/shared/i18n/useI18n";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Meter from "@/shared/ui/Meter/Meter";
import Section from "@/shared/ui/Section/Section";
import StatTile from "@/shared/ui/StatTile/StatTile";

import styles from "./Playstyle.module.scss";

interface PlaystyleProps {
  player: Player;
}

// All-time numbers and the playstyle meters FACEIT reports for a player
const Playstyle = ({ player }: PlaystyleProps) => {
  const { t, format } = useI18n();
  const lifetime = player.lifetime;
  // A whole percentage, 0 when unknown
  const percent = (value: number | null) => format.percent(value ?? 0, 0);
  return (
    <Section id="lifetime" title={t("lifetime.title")} description={t("lifetime.description")}>
      {lifetime ? (
        <div className={styles.lifetime}>
          <dl className={styles.tiles}>
            <StatTile label={t("lifetime.matches")} value={format.integer(lifetime.matches)} />
            <StatTile
              label={t("lifetime.winRate")}
              value={<MetricValue metric="winRate" value={lifetime.winRate} digits={0} />}
            />
            <StatTile label={t("lifetime.kd")} value={<MetricValue metric="kd" value={lifetime.kd} />} />
            <StatTile
              label={t("lifetime.hs")}
              value={<MetricValue metric="hsPercent" value={lifetime.hsPercent} digits={0} />}
            />
            <StatTile
              label={t("lifetime.adr")}
              value={lifetime.adr === null ? "-" : <MetricValue metric="adr" value={lifetime.adr} />}
            />
            <StatTile label={t("lifetime.streak")} value={format.integer(lifetime.longestWinStreak)} />
          </dl>
          <div className={styles.meters}>
            <Meter
              label={t("lifetime.entryRate")}
              value={lifetime.entryRate}
              display={percent(lifetime.entryRate)}
              hint={t("lifetime.entryRateHint")}
            />
            <Meter
              label={t("lifetime.entrySuccess")}
              value={lifetime.entrySuccessRate}
              display={percent(lifetime.entrySuccessRate)}
              hint={t("lifetime.entrySuccessHint")}
            />
            <Meter
              label={t("lifetime.clutch1v1")}
              value={lifetime.oneVsOneWinRate}
              display={percent(lifetime.oneVsOneWinRate)}
            />
            <Meter
              label={t("lifetime.clutch1v2")}
              value={lifetime.oneVsTwoWinRate}
              display={percent(lifetime.oneVsTwoWinRate)}
            />
            <Meter
              label={t("lifetime.flash")}
              value={lifetime.flashSuccessRate}
              display={percent(lifetime.flashSuccessRate)}
              hint={t("lifetime.flashHint")}
            />
            <Meter
              label={t("lifetime.sniper")}
              value={lifetime.sniperKillRate}
              display={percent(lifetime.sniperKillRate)}
              hint={t("lifetime.sniperHint")}
            />
            <Meter
              label={t("lifetime.utility")}
              value={lifetime.utilityDamagePerRound}
              max={15}
              display={format.decimal(lifetime.utilityDamagePerRound ?? 0, 1)}
            />
          </div>
        </div>
      ) : (
        <div className={styles.panel}>
          <EmptyState icon="chart" title={t("lifetime.empty")} />
        </div>
      )}
    </Section>
  );
};

export default Playstyle;
