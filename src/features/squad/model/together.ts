import type { Match } from "./types";

export interface SquadMember {
  id: string;
  matches: readonly Match[];
}

export interface Lineup {
  matchId: string;
  playerIds: string[];
  won: boolean;
  finishedAt: number;
  map: string;
}

export interface WinRecord {
  matches: number;
  wins: number;
  winRate: number;
}

export interface Duo extends WinRecord {
  ids: [string, string];
  lastPlayedAt: number;
}

export interface Teammate extends WinRecord {
  id: string;
}

export interface PartySize extends WinRecord {
  size: number;
}

// Adds the win rate in percent
const withWinRate = <T extends { matches: number; wins: number }>(entry: T): T & { winRate: number } => ({
  ...entry,
  winRate: entry.matches === 0 ? 0 : (entry.wins / entry.matches) * 100,
});

// Squad members who shared a match and its result were one team
export const lineups = (members: readonly SquadMember[]): Lineup[] => {
  const byTeam = new Map<string, Lineup>();
  for (const member of members) {
    for (const match of member.matches) {
      const key = `${match.id}:${match.won ? "win" : "loss"}`;
      const existing = byTeam.get(key);
      if (!existing) {
        byTeam.set(key, {
          matchId: match.id,
          playerIds: [member.id],
          won: match.won,
          finishedAt: match.finishedAt,
          map: match.map,
        });
      } else if (!existing.playerIds.includes(member.id)) {
        existing.playerIds.push(member.id);
      }
    }
  }
  return [...byTeam.values()].toSorted((a, b) => b.finishedAt - a.finishedAt);
};

// Every pair of squad members inside a lineup, most matches first
export const duos = (lineupList: readonly Lineup[]): Duo[] => {
  const pairs = new Map<string, Omit<Duo, "winRate">>();
  for (const lineup of lineupList) {
    const ids = lineup.playerIds.toSorted();
    ids.forEach((first, index) => {
      for (const second of ids.slice(index + 1)) {
        const key = `${first}:${second}`;
        const pair = pairs.get(key) ?? { ids: [first, second], matches: 0, wins: 0, lastPlayedAt: 0 };
        pair.matches += 1;
        pair.wins += lineup.won ? 1 : 0;
        pair.lastPlayedAt = Math.max(pair.lastPlayedAt, lineup.finishedAt);
        pairs.set(key, pair);
      }
    });
  }
  return [...pairs.values()]
    .map((pair) => withWinRate(pair))
    .toSorted((a, b) => b.matches - a.matches || b.winRate - a.winRate || b.lastPlayedAt - a.lastPlayedAt);
};

// The duos of one player as teammates
export const teammates = (playerId: string, duoList: readonly Duo[]): Teammate[] =>
  duoList
    .filter((duo) => duo.ids.includes(playerId))
    .map((duo) => ({
      id: duo.ids[0] === playerId ? duo.ids[1] : duo.ids[0],
      matches: duo.matches,
      wins: duo.wins,
      winRate: duo.winRate,
    }));

// Matches and wins by the number of squad members in the team
export const partySizes = (lineupList: readonly Lineup[]): PartySize[] => {
  const sizes = new Map<number, { size: number; matches: number; wins: number }>();
  for (const lineup of lineupList) {
    const size = lineup.playerIds.length;
    const entry = sizes.get(size) ?? { size, matches: 0, wins: 0 };
    entry.matches += 1;
    entry.wins += lineup.won ? 1 : 0;
    sizes.set(size, entry);
  }
  return [...sizes.values()].map((entry) => withWinRate(entry)).toSorted((a, b) => a.size - b.size);
};
