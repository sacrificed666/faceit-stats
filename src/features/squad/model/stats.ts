import type { Match } from "./types";

export interface Summary {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  kr: number;
  adr: number;
  hsPercent: number;
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;
  doubleKills: number;
  tripleKills: number;
  quadroKills: number;
  pentaKills: number;
  rating: number;
  survival: number;
}

export const EMPTY_SUMMARY: Summary = {
  matches: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  kd: 0,
  kr: 0,
  adr: 0,
  hsPercent: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
  mvps: 0,
  doubleKills: 0,
  tripleKills: 0,
  quadroKills: 0,
  pentaKills: 0,
  rating: 0,
  survival: 0,
};

// The mean of a number over matches
const average = (matches: readonly Match[], pick: (match: Match) => number): number =>
  matches.reduce((sum, match) => sum + pick(match), 0) / matches.length;

// The sum of a number over matches
const total = (matches: readonly Match[], pick: (match: Match) => number): number =>
  matches.reduce((sum, match) => sum + pick(match), 0);

// Averages and totals of a list of matches
export const summarize = (matches: readonly Match[]): Summary => {
  if (matches.length === 0) return EMPTY_SUMMARY;
  const wins = matches.filter((match) => match.won).length;
  return {
    matches: matches.length,
    wins,
    losses: matches.length - wins,
    winRate: (wins / matches.length) * 100,
    kd: average(matches, (match) => match.kd),
    kr: average(matches, (match) => match.kr),
    adr: average(matches, (match) => match.adr),
    hsPercent: average(matches, (match) => match.hsPercent),
    kills: average(matches, (match) => match.kills),
    deaths: average(matches, (match) => match.deaths),
    assists: average(matches, (match) => match.assists),
    mvps: total(matches, (match) => match.mvps),
    doubleKills: total(matches, (match) => match.doubleKills),
    tripleKills: total(matches, (match) => match.tripleKills),
    quadroKills: total(matches, (match) => match.quadroKills),
    pentaKills: total(matches, (match) => match.pentaKills),
    rating: average(matches, (match) => match.rating),
    survival: average(matches, (match) => match.survival),
  };
};

// Places for a list of values, highest first; ties share a place
export const rank = (entries: ReadonlyArray<{ id: string; value: number }>): Map<string, number> => {
  const sorted = entries.toSorted((a, b) => b.value - a.value);
  const ranks = new Map<string, number>();
  let previous: number | null = null;
  let current = 0;
  sorted.forEach((entry, index) => {
    if (previous === null || entry.value < previous) current = index + 1;
    previous = entry.value;
    ranks.set(entry.id, current);
  });
  return ranks;
};

// The average of every value with the ones before it in a window
export const rollingAverage = (values: readonly number[], window: number): number[] => {
  const result: number[] = [];
  let sum = 0;
  values.forEach((value, index) => {
    sum += value;
    const dropped = values[index - window];
    if (dropped !== undefined) sum -= dropped;
    result.push(sum / Math.min(index + 1, window));
  });
  return result;
};
