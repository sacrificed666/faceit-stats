"use client";

import { useState } from "react";

import { activityFeed, type FeedEntry } from "@/features/dashboard/model/activity";
import { mapName } from "@/features/squad/model/maps";
import { METRICS } from "@/features/squad/model/metrics";
import { members, playerById, type PlayerView } from "@/features/squad/model/squad";
import type { Player } from "@/features/squad/model/types";
import MapThumb from "@/features/squad/ui/MapThumb/MapThumb";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import ResultBadge from "@/features/squad/ui/ResultBadge/ResultBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import { faceitMatchUrl } from "@/shared/lib/urls";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";
import Icon from "@/shared/ui/Icon/Icon";
import RelativeTime from "@/shared/ui/RelativeTime/RelativeTime";
import Section from "@/shared/ui/Section/Section";

import styles from "./Activity.module.scss";

const PAGE = 8;

const STATS = ["rating", "kd", "adr"] as const;

interface MatchRowsProps {
  entry: FeedEntry;
  players: ReadonlyMap<string, Player>;
}

// A match as a group of rows, one per squad member, the match cells spanning them
const MatchRows = ({ entry, players }: MatchRowsProps) => {
  const { t } = useI18n();
  const lines = entry.sides.flatMap((side) =>
    side.players.map((feedPlayer, index) => ({ side, feedPlayer, opensSide: index === 0 })),
  );
  const rivals = entry.sides.length > 1;
  return (
    <tbody className={styles.match}>
      {lines.map(({ side, feedPlayer, opensSide }, index) => {
        const player = players.get(feedPlayer.playerId);
        const { match } = feedPlayer;
        const kda = { kills: match.kills, deaths: match.deaths, assists: match.assists };
        return (
          <tr key={`${feedPlayer.playerId}:${String(side.won)}`}>
            {index === 0 ? (
              <th scope="rowgroup" rowSpan={lines.length} className={cx(styles.cell, styles.mapCell, styles.start)}>
                <span className={styles.map}>
                  <MapThumb map={entry.map} size="md" className={styles.thumb} />
                  <span className={styles.mapName}>
                    {mapName(entry.map)}
                    <RelativeTime timestamp={entry.finishedAt} className={styles.time} />
                    {rivals || lines.length > 1 ? (
                      <span title={t(rivals ? "activity.squadVsSquad" : "activity.together")} className={styles.shared}>
                        <Icon name={rivals ? "swap" : "users"} size={11} />
                        <span className={styles.sharedLabel}>
                          {t(rivals ? "activity.squadVsSquad" : "activity.together")}
                        </span>
                      </span>
                    ) : null}
                  </span>
                </span>
              </th>
            ) : null}
            {opensSide ? (
              <td rowSpan={side.players.length} className={cx(styles.cell, styles.result)}>
                <ResultBadge won={side.won} score={`${side.teamScore}:${side.opponentScore}`} />
              </td>
            ) : null}
            <th scope="row" className={cx(styles.cell, styles.playerCell, styles.start)}>
              {player ? <PlayerName player={player} size={24} /> : null}
              <span className={styles.folded}>
                <span aria-hidden="true">{t("activity.kda", kda)}</span>
                <span className="visually-hidden">{t("activity.kdaSpoken", kda)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {t("metric.rating")}{" "}
                  <span className={styles.strong}>
                    <MetricValue metric="rating" value={match.rating} />
                  </span>
                </span>
              </span>
            </th>
            <td className={cx(styles.cell, styles.kda, styles.end, styles.wide)}>
              <span aria-hidden="true">{t("activity.kda", kda)}</span>
              <span className="visually-hidden">{t("activity.kdaSpoken", kda)}</span>
            </td>
            {STATS.map((key) => (
              <td key={key} className={cx(styles.cell, styles.stat, styles.end, styles.wide)}>
                <MetricValue metric={key} value={match[key]} />
              </td>
            ))}
            {index === 0 ? (
              <td rowSpan={lines.length} className={cx(styles.cell, styles.end, styles.room)}>
                <ExternalLink
                  href={faceitMatchUrl(entry.matchId)}
                  label={t("activity.roomFor", { map: mapName(entry.map) })}
                  variant="icon"
                />
              </td>
            ) : null}
          </tr>
        );
      })}
    </tbody>
  );
};

interface ActivityProps {
  views: readonly PlayerView[];
}

// The latest matches of the whole squad, where a shared match appears once
const Activity = ({ views }: ActivityProps) => {
  const { t } = useI18n();
  const [limit, setLimit] = useState(PAGE);
  const players = playerById(views);
  const feed = activityFeed(members(views));
  const shown = feed.slice(0, limit);

  return (
    <Section id="activity" title={t("activity.title")} description={t("activity.description")}>
      {feed.length === 0 ? (
        <div className={styles.panel}>
          <EmptyState icon="list" title={t("empty.range")} />
        </div>
      ) : (
        <div className={styles.feed}>
          <div className={styles.scroller}>
            <table className={styles.table}>
              <caption className="visually-hidden">{t("activity.title")}</caption>
              <thead className={styles.head}>
                <tr>
                  <th scope="col" className={cx(styles.th, styles.mapHeader, styles.start)}>
                    {t("history.map")}
                  </th>
                  <th scope="col" className={cx(styles.th, styles.start)}>
                    {t("history.result")}
                  </th>
                  <th scope="col" className={cx(styles.th, styles.start)}>
                    {t("leaderboard.player")}
                  </th>
                  <th scope="col" className={cx(styles.th, styles.end, styles.wide)}>
                    <abbr title={t("history.kdaName")} className={styles.abbr}>
                      {t("history.kda")}
                    </abbr>
                  </th>
                  {STATS.map((key) => (
                    <th key={key} scope="col" className={cx(styles.th, styles.end, styles.wide)}>
                      <abbr title={t(METRICS[key].name)} className={styles.abbr}>
                        {t(METRICS[key].label)}
                      </abbr>
                    </th>
                  ))}
                  <th scope="col" className={styles.th}>
                    <span className="visually-hidden">{t("history.links")}</span>
                  </th>
                </tr>
              </thead>
              {shown.map((entry) => (
                <MatchRows key={entry.matchId} entry={entry} players={players} />
              ))}
            </table>
          </div>
          <div className={styles.more}>
            <p aria-live="polite" className={styles.shown}>
              {t("activity.shown", { shown: shown.length, total: feed.length })}
            </p>
            {shown.length < feed.length ? (
              <button type="button" onClick={() => setLimit((current) => current + PAGE)} className={styles.button}>
                <Icon name="chevronDown" size={16} />
                {t("activity.more")}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </Section>
  );
};

export default Activity;
