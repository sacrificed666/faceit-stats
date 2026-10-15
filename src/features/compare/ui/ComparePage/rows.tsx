import { mapName } from "@/features/squad/model/maps";
import { mapCells, type PlayerView } from "@/features/squad/model/squad";
import type { Player } from "@/features/squad/model/types";
import MapThumb from "@/features/squad/ui/MapThumb/MapThumb";
import type { Translate } from "@/shared/i18n/translate";
import type { Formatter } from "@/shared/lib/format";

import type { CompareRow } from "../CompareRows/CompareRows";

import styles from "./ComparePage.module.scss";

// A total divided by the matches played, or nothing without matches
const perMatch = (view: PlayerView, value: (view: PlayerView) => number): number | null =>
  view.summary.matches > 0 ? value(view) / view.summary.matches : null;

// The value only when the player has matches in the range
const played = (view: PlayerView, value: number): number | null => (view.summary.matches > 0 ? value : null);

// 3K, 4K and 5K rounds in the range
const multiKills = (view: PlayerView): number =>
  view.summary.tripleKills + view.summary.quadroKills + view.summary.pentaKills;

// Form rows: averages over the range plus per-match counts
export const formRows = (first: PlayerView, second: PlayerView, t: Translate, format: Formatter): CompareRow[] => {
  // A formatter with fixed digits
  const decimal = (digits: number) => (value: number) => format.decimal(value, digits);
  // A percentage with one digit
  const percent = (value: number) => format.percent(value, 1);
  return [
    {
      key: "matches",
      label: t("metric.matches"),
      first: first.summary.matches,
      second: second.summary.matches,
      display: format.integer,
      ranked: false,
    },
    {
      key: "winRate",
      label: t("metric.winRate.name"),
      first: played(first, first.summary.winRate),
      second: played(second, second.summary.winRate),
      display: percent,
    },
    {
      key: "rating",
      label: t("metric.rating.name"),
      first: played(first, first.summary.rating),
      second: played(second, second.summary.rating),
      display: decimal(2),
    },
    {
      key: "kd",
      label: t("metric.kd.name"),
      first: played(first, first.summary.kd),
      second: played(second, second.summary.kd),
      display: decimal(2),
    },
    {
      key: "kr",
      label: t("metric.kr.name"),
      first: played(first, first.summary.kr),
      second: played(second, second.summary.kr),
      display: decimal(2),
    },
    {
      key: "adr",
      label: t("metric.adr.name"),
      first: played(first, first.summary.adr),
      second: played(second, second.summary.adr),
      display: decimal(1),
    },
    {
      key: "hs",
      label: t("metric.hsPercent.name"),
      first: played(first, first.summary.hsPercent),
      second: played(second, second.summary.hsPercent),
      display: percent,
    },
    {
      key: "survival",
      label: t("metric.survival.name"),
      first: played(first, first.summary.survival),
      second: played(second, second.summary.survival),
      display: percent,
    },
    {
      key: "kills",
      label: t("metric.killsPerMatch"),
      first: played(first, first.summary.kills),
      second: played(second, second.summary.kills),
      display: decimal(1),
    },
    {
      key: "mvps",
      label: t("metric.mvpsPerMatch"),
      first: perMatch(first, (view) => view.summary.mvps),
      second: perMatch(second, (view) => view.summary.mvps),
      display: decimal(2),
    },
    {
      key: "multi",
      label: t("metric.multiKills"),
      first: played(first, multiKills(first)),
      second: played(second, multiKills(second)),
      display: format.integer,
    },
    {
      key: "aces",
      label: t("metric.aces"),
      first: played(first, first.summary.pentaKills),
      second: played(second, second.summary.pentaKills),
      display: format.integer,
    },
  ];
};

// Lifetime rows from the all-time FACEIT statistics
export const lifetimeRows = (first: Player, second: Player, t: Translate, format: Formatter): CompareRow[] => {
  const a = first.lifetime;
  const b = second.lifetime;
  // A whole percentage
  const percent = (value: number) => format.percent(value, 0);
  return [
    {
      key: "matches",
      label: t("lifetime.matches"),
      first: a?.matches ?? null,
      second: b?.matches ?? null,
      display: format.integer,
      ranked: false,
    },
    {
      key: "winRate",
      label: t("lifetime.winRate"),
      first: a?.winRate ?? null,
      second: b?.winRate ?? null,
      display: percent,
    },
    {
      key: "kd",
      label: t("lifetime.kd"),
      first: a?.kd ?? null,
      second: b?.kd ?? null,
      display: (value) => format.decimal(value, 2),
    },
    { key: "hs", label: t("lifetime.hs"), first: a?.hsPercent ?? null, second: b?.hsPercent ?? null, display: percent },
    {
      key: "adr",
      label: t("lifetime.adr"),
      first: a?.adr ?? null,
      second: b?.adr ?? null,
      display: (value) => format.decimal(value, 1),
    },
    {
      key: "entry",
      label: t("lifetime.entrySuccess"),
      first: a?.entrySuccessRate ?? null,
      second: b?.entrySuccessRate ?? null,
      display: percent,
    },
    {
      key: "clutch",
      label: t("lifetime.clutch1v1"),
      first: a?.oneVsOneWinRate ?? null,
      second: b?.oneVsOneWinRate ?? null,
      display: percent,
    },
    {
      key: "flash",
      label: t("lifetime.flash"),
      first: a?.flashSuccessRate ?? null,
      second: b?.flashSuccessRate ?? null,
      display: percent,
    },
    {
      key: "utility",
      label: t("lifetime.utility"),
      first: a?.utilityDamagePerRound ?? null,
      second: b?.utilityDamagePerRound ?? null,
      display: (value) => format.decimal(value, 1),
    },
    {
      key: "streak",
      label: t("lifetime.streak"),
      first: a?.longestWinStreak ?? null,
      second: b?.longestWinStreak ?? null,
      display: format.integer,
    },
  ];
};

// Win rate on every map either player played, the busiest maps first
export const mapRows = (first: PlayerView, second: PlayerView, t: Translate, format: Formatter): CompareRow[] => {
  const a = mapCells(first);
  const b = mapCells(second);
  const maps = [...new Set([...a.keys(), ...b.keys()])].toSorted(
    (x, y) =>
      (b.get(y)?.matches ?? 0) + (a.get(y)?.matches ?? 0) - (b.get(x)?.matches ?? 0) - (a.get(x)?.matches ?? 0) ||
      mapName(x).localeCompare(mapName(y)),
  );
  return maps.map((map) => {
    const left = a.get(map);
    const right = b.get(map);
    return {
      key: map,
      label: (
        <span className={styles.map}>
          <MapThumb map={map} />
          {mapName(map)}
        </span>
      ),
      first: left ? left.winRate : null,
      second: right ? right.winRate : null,
      display: (value, side) =>
        `${format.percent(value, 0)} · ${t("count.matches", { count: (side === "first" ? left : right)?.matches ?? 0 })}`,
    };
  });
};
