import type { Match, Player } from "@/features/squad/model/types";

import { makeMatch, makePlayer, newestFirst } from "./factories";

const DAY = 86_400_000;
const START = Date.UTC(2026, 8, 10, 18, 0);

// A match on a given day of the sample range
const on = (day: number, overrides: Partial<Match>): Match =>
  makeMatch({ finishedAt: START + day * DAY, ...overrides });

// Three players with solo matches and two matches played together
export const sampleSquad = (): Player[] => {
  const sharedWin = { id: "shared-win", map: "de_nuke", won: true };
  const sharedLoss = { id: "shared-loss", map: "de_mirage", won: false };

  const anna = makePlayer({
    nickname: "anna",
    elo: 2400,
    level: 10,
    lifetime: {
      matches: 1838,
      winRate: 51,
      longestWinStreak: 14,
      kd: 1.21,
      hsPercent: 48,
      adr: 82.4,
      entryRate: 20,
      entrySuccessRate: 53,
      oneVsOneWinRate: 38,
      oneVsTwoWinRate: 20,
      flashSuccessRate: 52,
      utilityDamagePerRound: 4.9,
      sniperKillRate: null,
    },
    maps: [{ map: "de_nuke", matches: 109, winRate: 51, kd: 1.14, adr: 84.2, hsPercent: 45, image: null }],
    matches: newestFirst([
      on(0, { map: "de_mirage", won: true, kd: 1.4, kills: 24 }),
      on(1, { map: "de_inferno", won: false, kd: 0.9, kills: 15 }),
      on(2, { ...sharedWin, kd: 1.6, kills: 28, pentaKills: 1 }),
      on(3, { ...sharedLoss, kd: 1.1, kills: 19 }),
      on(4, { map: "de_ancient", won: true, kd: 1.3, kills: 22 }),
    ]),
  });

  const bohdan = makePlayer({
    nickname: "bohdan",
    elo: 1800,
    level: 8,
    matches: newestFirst([
      on(0, { map: "de_dust2", won: false, kd: 0.8 }),
      on(2, { ...sharedWin, kd: 1.2 }),
      on(3, { ...sharedLoss, kd: 0.7 }),
      on(5, { map: "de_dust2", won: true, kd: 1.1 }),
    ]),
  });

  const chris = makePlayer({
    nickname: "chris",
    elo: 1500,
    level: 7,
    matches: newestFirst([
      on(1, { map: "de_anubis", won: true, kd: 2.4, kills: 33 }),
      on(4, { map: "de_anubis", won: true, kd: 2.1, kills: 30 }),
    ]),
  });

  return [anna, bohdan, chris];
};
