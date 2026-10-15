import type { Match, Player } from "@/features/squad/model/types";

const START = Date.UTC(2026, 8, 1, 18, 0);
const HOUR = 3_600_000;

let sequence = 0;

// A match with sensible numbers, with fields to override
export const makeMatch = (overrides: Partial<Match> = {}): Match => {
  sequence += 1;
  return {
    id: `1-match-${sequence}`,
    finishedAt: START + sequence * HOUR,
    map: "de_mirage",
    won: true,
    teamScore: 13,
    opponentScore: 9,
    rounds: 22,
    kills: 20,
    deaths: 15,
    assists: 4,
    kd: 1.33,
    kr: 0.91,
    adr: 85,
    hsPercent: 50,
    mvps: 3,
    doubleKills: 2,
    tripleKills: 0,
    quadroKills: 0,
    pentaKills: 0,
    rating: 1.15,
    survival: 31.8,
    ...overrides,
  };
};

// Matches sorted the way FACEIT returns them
export const newestFirst = (matches: Match[]): Match[] => matches.toSorted((a, b) => b.finishedAt - a.finishedAt);

// A player with sensible defaults, with fields to override
export const makePlayer = (overrides: Partial<Player> = {}): Player => {
  sequence += 1;
  return {
    id: `player-${sequence}`,
    nickname: `player${sequence}`,
    avatar: null,
    country: "ua",
    elo: 2000,
    level: 9,
    region: "EU",
    regionRank: 1000 + sequence,
    steamId: "76561198000000000",
    lifetime: null,
    maps: [],
    matches: [],
    ...overrides,
  };
};
