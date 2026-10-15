import { currentStreak, type Streak } from "./form";
import { mapName } from "./maps";
import type { MatchMetricKey, MetricKey } from "./metrics";
import { selectMatches, type Range } from "./range";
import { rank, rollingAverage, summarize, type Summary } from "./stats";
import type { SquadMember } from "./together";
import type { Match, Player } from "./types";

export interface PlayerView {
  player: Player;
  matches: Match[];
  summary: Summary;
  streak: Streak | null;
}

export interface MapCell {
  map: string;
  playerId: string;
  summary: Summary;
}

export interface MapColumn {
  map: string;
  name: string;
  matches: number;
}

export const ROLLING_WINDOW = 5;

// A player cut to the range, with the summary and the current streak
export const viewPlayer = (player: Player, range: Range, reference: number): PlayerView => {
  const matches = selectMatches(player.matches, range, reference);
  return { player, matches, summary: summarize(matches), streak: currentStreak(matches) };
};

// Every player cut to the same range
export const viewPlayers = (players: readonly Player[], range: Range, reference: number): PlayerView[] =>
  players.map((player) => viewPlayer(player, range, reference));

// Ids and matches, the input of the playing together helpers
export const members = (views: readonly PlayerView[]): SquadMember[] =>
  views.map((view) => ({ id: view.player.id, matches: view.matches }));

// Players with at least one match in the range
export const active = (views: readonly PlayerView[]): PlayerView[] => views.filter((view) => view.summary.matches > 0);

// The mean of a metric over the players with matches
export const squadAverage = (views: readonly PlayerView[], key: MetricKey): number => {
  const playing = active(views);
  if (playing.length === 0) return 0;
  return playing.reduce((sum, view) => sum + view.summary[key], 0) / playing.length;
};

// The mean ELO of the squad
export const averageElo = (views: readonly PlayerView[]): number => {
  if (views.length === 0) return 0;
  return views.reduce((sum, view) => sum + view.player.elo, 0) / views.length;
};

// Places of every player for a metric or ELO; ties share a place
export const metricRanks = (views: readonly PlayerView[], key: MetricKey | "elo"): Map<string, number> => {
  if (key === "elo") return rank(views.map((view) => ({ id: view.player.id, value: view.player.elo })));
  return rank(active(views).map((view) => ({ id: view.player.id, value: view.summary[key] })));
};

// Every map played in the range, the most played first
export const mapColumns = (views: readonly PlayerView[]): MapColumn[] => {
  const counts = new Map<string, number>();
  for (const view of views) {
    for (const match of view.matches) counts.set(match.map, (counts.get(match.map) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([map, matches]) => ({ map, name: mapName(map), matches }))
    .toSorted((a, b) => b.matches - a.matches || a.name.localeCompare(b.name));
};

// A player's summary per map
export const mapCells = (view: PlayerView): Map<string, Summary> => {
  const byMap = new Map<string, Match[]>();
  for (const match of view.matches) {
    const list = byMap.get(match.map) ?? [];
    list.push(match);
    byMap.set(match.map, list);
  }
  return new Map([...byMap.entries()].map(([map, matches]) => [map, summarize(matches)]));
};

export interface TrendSeries {
  perMatch: number[];
  rolling: number[];
  matches: Match[];
}

// A metric per match, oldest first, with its rolling average
export const trendSeries = (matches: readonly Match[], key: MatchMetricKey): TrendSeries => {
  const chronological = matches.toReversed();
  const perMatch = chronological.map((match) => match[key]);
  return { perMatch, rolling: rollingAverage(perMatch, ROLLING_WINDOW), matches: chronological };
};

// Players by id
export const playerById = (views: readonly PlayerView[]): Map<string, Player> =>
  new Map(views.map((view) => [view.player.id, view.player]));
