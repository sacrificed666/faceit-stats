import { longestStreak } from "@/features/squad/model/form";
import type { SquadMember } from "@/features/squad/model/together";
import type { Match } from "@/features/squad/model/types";

export type MatchRecordKind = "rating" | "kills" | "adr" | "kd" | "headshots" | "mvps";

export interface MatchRecord {
  kind: MatchRecordKind;
  playerId: string;
  match: Match;
  value: number;
}

export interface PlayerRecord {
  playerId: string;
  value: number;
}

interface RecordRule {
  value: (match: Match) => number;
  eligible: (match: Match) => boolean;
}

const MIN_HEADSHOT_KILLS = 15;
const MIN_ROUNDS = 13;

// Rates need a full match, so short matches cannot set them
const RULES: Record<MatchRecordKind, RecordRule> = {
  rating: { value: (match) => match.rating, eligible: (match) => match.rounds >= MIN_ROUNDS },
  kills: { value: (match) => match.kills, eligible: () => true },
  adr: { value: (match) => match.adr, eligible: (match) => match.rounds >= MIN_ROUNDS },
  kd: { value: (match) => match.kd, eligible: (match) => match.rounds >= MIN_ROUNDS },
  headshots: { value: (match) => match.hsPercent, eligible: (match) => match.kills >= MIN_HEADSHOT_KILLS },
  mvps: { value: (match) => match.mvps, eligible: () => true },
};

// The best single match for a record, the newest one on a tie
export const matchRecord = (kind: MatchRecordKind, members: readonly SquadMember[]): MatchRecord | null => {
  const rule = RULES[kind];
  let best: MatchRecord | null = null;
  for (const member of members) {
    for (const match of member.matches) {
      if (!rule.eligible(match)) continue;
      const value = rule.value(match);
      if (!best || value > best.value || (value === best.value && match.finishedAt > best.match.finishedAt)) {
        best = { kind, playerId: member.id, match, value };
      }
    }
  }
  return best && best.value > 0 ? best : null;
};

// The longest run of wins by one player within the range
export const longestWinStreak = (members: readonly SquadMember[]): PlayerRecord | null => {
  let best: PlayerRecord | null = null;
  for (const member of members) {
    const value = longestStreak(member.matches.toReversed(), true);
    if (value > 0 && (!best || value > best.value)) best = { playerId: member.id, value };
  }
  return best;
};

// The player with the most aces within the range
export const mostAces = (members: readonly SquadMember[]): PlayerRecord | null => {
  let best: PlayerRecord | null = null;
  for (const member of members) {
    const value = member.matches.reduce((sum, match) => sum + match.pentaKills, 0);
    if (value > 0 && (!best || value > best.value)) best = { playerId: member.id, value };
  }
  return best;
};
