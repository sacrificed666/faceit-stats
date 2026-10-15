import type { SquadMember } from "@/features/squad/model/together";
import type { Match } from "@/features/squad/model/types";

export interface FeedPlayer {
  playerId: string;
  match: Match;
}

export interface FeedSide {
  won: boolean;
  teamScore: number;
  opponentScore: number;
  players: FeedPlayer[];
}

export interface FeedEntry {
  matchId: string;
  finishedAt: number;
  map: string;
  sides: FeedSide[];
}

// Larger sides first, then the winning side
const bySize = (a: FeedSide, b: FeedSide): number =>
  b.players.length - a.players.length || Number(b.won) - Number(a.won);

// One entry per match with every squad member on their side
export const activityFeed = (members: readonly SquadMember[]): FeedEntry[] => {
  const entries = new Map<string, FeedEntry>();
  for (const member of members) {
    for (const match of member.matches) {
      const entry = entries.get(match.id) ?? {
        matchId: match.id,
        finishedAt: match.finishedAt,
        map: match.map,
        sides: [],
      };
      entries.set(match.id, entry);
      let side = entry.sides.find((candidate) => candidate.won === match.won);
      if (!side) {
        side = { won: match.won, teamScore: match.teamScore, opponentScore: match.opponentScore, players: [] };
        entry.sides.push(side);
      }
      if (!side.players.some((player) => player.playerId === member.id))
        side.players.push({ playerId: member.id, match });
    }
  }
  for (const entry of entries.values()) entry.sides.sort(bySize);
  return [...entries.values()].toSorted((a, b) => b.finishedAt - a.finishedAt);
};
