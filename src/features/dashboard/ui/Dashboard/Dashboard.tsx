"use client";

import Link from "next/link";

import { rangeSpec } from "@/features/squad/model/range";
import { members, viewPlayers } from "@/features/squad/model/squad";
import { lineups } from "@/features/squad/model/together";
import type { FailedPlayer, Player } from "@/features/squad/model/types";
import { useRange, withRange } from "@/features/squad/model/useRange";
import { MapImagesProvider } from "@/features/squad/ui/MapThumb/MapThumb";
import RangeToolbar from "@/features/squad/ui/RangeToolbar/RangeToolbar";
import { rich } from "@/shared/i18n/rich";
import { useI18n } from "@/shared/i18n/useI18n";
import { comparePath } from "@/shared/lib/urls";
import Avatar from "@/shared/ui/Avatar/Avatar";
import Icon from "@/shared/ui/Icon/Icon";
import Notice from "@/shared/ui/Notice/Notice";
import RelativeTime from "@/shared/ui/RelativeTime/RelativeTime";

import Activity from "../Activity/Activity";
import Highlights from "../Highlights/Highlights";
import Leaderboard from "../Leaderboard/Leaderboard";
import MapPool from "../MapPool/MapPool";
import Overview from "../Overview/Overview";
import Rankings from "../Rankings/Rankings";
import Roster from "../Roster/Roster";
import Together from "../Together/Together";
import Trends from "../Trends/Trends";

import styles from "./Dashboard.module.scss";

interface DashboardProps {
  players: Player[];
  failed: FailedPlayer[];
  updatedAt: number;
  mapImages: Readonly<Record<string, string>>;
}

// The squad overview: header, range toolbar and every section
const Dashboard = ({ players, failed, updatedAt, mapImages }: DashboardProps) => {
  const { locale, t, format } = useI18n();
  const range = useRange();
  const spec = rangeSpec(range);
  const views = viewPlayers(players, range, updatedAt);
  const squad = members(views);
  const lineupList = lineups(squad);
  const sections = [
    { id: "players", label: t("section.players") },
    { id: "activity", label: t("section.activity") },
    { id: "leaderboard", label: t("section.leaderboard") },
    { id: "rankings", label: t("section.rankings") },
    { id: "trends", label: t("section.trends") },
    { id: "maps", label: t("section.maps") },
    { id: "together", label: t("section.together") },
    { id: "records", label: t("section.records") },
  ];
  const subtitle = t(spec.unit === "days" ? "dashboard.subtitle.days" : "dashboard.subtitle.matches", {
    count: spec.count,
    players: t("count.players", { count: players.length }),
  });

  return (
    <MapImagesProvider images={mapImages}>
      <div className={styles.dashboard} data-query-scope="">
        <header className={styles.header}>
          <div className={styles.intro}>
            <p className={styles.kicker}>{t("app.kicker")}</p>
            <h1 className={styles.title}>{t("dashboard.title")}</h1>
            <p className={styles.lead}>{subtitle}</p>
            <div className={styles.meta}>
              <p className={styles.updated}>
                {rich(t("dashboard.updated"), { time: <RelativeTime timestamp={updatedAt} /> })}
              </p>
              <Link href={withRange(comparePath(locale), range)} className={styles.compare}>
                <Icon name="users" size={16} />
                {t("dashboard.compareCta")}
              </Link>
            </div>
          </div>
          <ul aria-hidden="true" className={styles.squad}>
            {players
              .toSorted((a, b) => b.elo - a.elo)
              .map((player) => (
                <li key={player.id} className={styles.member}>
                  <Avatar src={player.avatar} name={player.nickname} size={52} ring="plane" />
                </li>
              ))}
          </ul>
        </header>

        <RangeToolbar sections={sections} />

        {failed.length > 0 ? (
          <Notice tone="warning" title={t("dashboard.failed", { count: failed.length })}>
            {format.list(
              failed.map((entry) =>
                t(entry.reason === "not-found" ? "dashboard.failed.notFound" : "dashboard.failed.error", {
                  nickname: entry.nickname,
                }),
              ),
            )}
          </Notice>
        ) : null}

        <Overview views={views} lineups={lineupList} />
        <Roster views={views} />
        <Activity views={views} />
        <Leaderboard views={views} />
        <Rankings views={views} />
        <Trends views={views} />
        <MapPool views={views} />
        <Together views={views} lineups={lineupList} />
        <Highlights views={views} />
      </div>
    </MapImagesProvider>
  );
};

export default Dashboard;
