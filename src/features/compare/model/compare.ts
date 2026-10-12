import type { Match } from "@/features/squad/model/types";

export interface SharedMatch {
  id: string;
  finishedAt: number;
  map: string;
  together: boolean;
  first: Match;
  second: Match;
}

export interface Rivalry {
  together: { matches: number; wins: number };
  against: { matches: number; firstWins: number; secondWins: number };
}

export type Leader = "first" | "second" | null;

// Matches both players played, newest first, and whether on one team
export const sharedMatches = (first: readonly Match[], second: readonly Match[]): SharedMatch[] => {
  const byId = new Map(second.map((match) => [match.id, match]));
  return first
    .flatMap((match) => {
      const other = byId.get(match.id);
      if (!other) return [];
      return [
        {
          id: match.id,
          finishedAt: match.finishedAt,
          map: match.map,
          together: match.won === other.won,
          first: match,
          second: other,
        },
      ];
    })
    .toSorted((a, b) => b.finishedAt - a.finishedAt);
};

// Record on the same team and the score against each other
export const rivalry = (shared: readonly SharedMatch[]): Rivalry => {
  const together = shared.filter((match) => match.together);
  const against = shared.filter((match) => !match.together);
  return {
    together: { matches: together.length, wins: together.filter((match) => match.first.won).length },
    against: {
      matches: against.length,
      firstWins: against.filter((match) => match.first.won).length,
      secondWins: against.filter((match) => match.second.won).length,
    },
  };
};

// Which side of a row is ahead, or null on a tie or missing value
export const leader = (first: number | null, second: number | null, higherIsBetter = true): Leader => {
  if (first === null || second === null || first === second) return null;
  return first > second === higherIsBetter ? "first" : "second";
};

// The two players from the address, falling back to the top two
export const pickPair = (
  nicknames: readonly string[],
  first: string | null,
  second: string | null,
): [string, string] | null => {
  // The player with this nickname, or null
  const find = (value: string | null) =>
    value === null ? undefined : nicknames.find((nickname) => nickname.toLowerCase() === value.toLowerCase());
  const a = find(first) ?? nicknames[0];
  const chosen = find(second);
  const b = chosen !== undefined && chosen !== a ? chosen : nicknames.find((nickname) => nickname !== a);
  return a === undefined || b === undefined ? null : [a, b];
};
