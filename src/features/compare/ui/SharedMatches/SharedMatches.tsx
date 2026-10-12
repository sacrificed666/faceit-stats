"use client";

import type { SharedMatch } from "@/features/compare/model/compare";
import { mapName } from "@/features/squad/model/maps";
import { METRICS } from "@/features/squad/model/metrics";
import type { Match } from "@/features/squad/model/types";
import MapThumb from "@/features/squad/ui/MapThumb/MapThumb";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import ResultBadge from "@/features/squad/ui/ResultBadge/ResultBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import { faceitMatchUrl } from "@/shared/lib/urls";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";
import LocalDate from "@/shared/ui/LocalDate/LocalDate";
import Section from "@/shared/ui/Section/Section";

import styles from "./SharedMatches.module.scss";

interface SharedMatchesProps {
  shared: readonly SharedMatch[];
  firstName: string;
  secondName: string;
}

// One player's K-D-A with the rating, K/D and ADR of that match
const Line = ({ match }: { match: Match }) => {
  const { t } = useI18n();
  return (
    <span className={styles.line}>
      <span className={styles.kda}>{`${match.kills}-${match.deaths}-${match.assists}`}</span>
      <span className={styles.stats}>
        {(["rating", "kd", "adr"] as const).map((key) => (
          <span key={key}>
            <span className={styles.statLabel}>{`${t(METRICS[key].label)} `}</span>
            <MetricValue metric={key} value={match[key]} />
          </span>
        ))}
      </span>
    </span>
  );
};

// Every match both players played, together or against each other
const SharedMatches = ({ shared, firstName, secondName }: SharedMatchesProps) => {
  const { t } = useI18n();
  return (
    <Section id="shared" title={t("compare.sharedTitle")} description={t("compare.sharedDescription")}>
      <div className={styles.scroller}>
        {shared.length === 0 ? (
          <EmptyState icon="users" title={t("compare.sharedEmpty")} />
        ) : (
          <table className={styles.table}>
            <caption className="visually-hidden">{t("compare.sharedTitle")}</caption>
            <thead className={styles.head}>
              <tr className={styles.columns}>
                <th scope="col" className={cx(styles.th, styles.start)}>
                  {t("history.date")}
                </th>
                <th scope="col" className={cx(styles.th, styles.start)}>
                  {t("history.result")}
                </th>
                <th scope="col" className={cx(styles.th, styles.end)}>
                  {firstName}
                </th>
                <th scope="col" className={cx(styles.th, styles.end)}>
                  {secondName}
                </th>
                <th scope="col" className={cx(styles.th, styles.end)}>
                  <span className="visually-hidden">{t("history.links")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shared.map((match) => (
                <tr key={match.id} className={styles.row}>
                  <th scope="row" className={cx(styles.cell, styles.matchCell)}>
                    <span className={styles.match}>
                      <MapThumb map={match.map} />
                      <span className={styles.mapName}>
                        <span className={styles.name}>{mapName(match.map)}</span>
                        <LocalDate timestamp={match.finishedAt} format="datetime" className={styles.time} />
                      </span>
                    </span>
                  </th>
                  <td className={styles.cell}>
                    <span className={styles.result}>
                      <span className={cx(styles.relation, match.together && styles.together)}>
                        {t(match.together ? "compare.sameTeam" : "compare.opponents")}
                      </span>
                      {match.together ? (
                        <ResultBadge
                          won={match.first.won}
                          score={`${match.first.teamScore}:${match.first.opponentScore}`}
                        />
                      ) : (
                        <span className={styles.winner}>
                          {t("compare.winner", { player: match.first.won ? firstName : secondName })}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={cx(styles.cell, styles.end)}>
                    <Line match={match.first} />
                  </td>
                  <td className={cx(styles.cell, styles.end)}>
                    <Line match={match.second} />
                  </td>
                  <td className={cx(styles.cell, styles.end)}>
                    <ExternalLink
                      href={faceitMatchUrl(match.id)}
                      label={t("activity.roomFor", { map: mapName(match.map) })}
                      variant="icon"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Section>
  );
};

export default SharedMatches;
