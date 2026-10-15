import { describe, expect, it } from "vitest";

import { makeMatch } from "@/test/factories";

import { duos, lineups, partySizes, teammates } from "./together";

const shared = makeMatch({ id: "shared", won: true, finishedAt: 3000 });
const sharedLoss = makeMatch({ id: "shared-loss", won: false, finishedAt: 2000 });
const rival = makeMatch({ id: "shared", won: false, finishedAt: 3000 });

const squad = [
  { id: "anna", matches: [shared, sharedLoss, makeMatch({ id: "anna-solo", finishedAt: 1000 })] },
  { id: "bohdan", matches: [shared, sharedLoss] },
  { id: "chris", matches: [shared] },
  { id: "dana", matches: [rival] },
];

describe("lineups", () => {
  it("groups squad members who were on the same team", () => {
    const result = lineups(squad);
    expect(result.map((lineup) => [lineup.matchId, lineup.won, lineup.playerIds])).toEqual([
      ["shared", true, ["anna", "bohdan", "chris"]],
      ["shared", false, ["dana"]],
      ["shared-loss", false, ["anna", "bohdan"]],
      ["anna-solo", true, ["anna"]],
    ]);
  });

  it("counts a member only once per lineup", () => {
    const result = lineups([{ id: "anna", matches: [shared, shared] }]);
    expect(result[0]?.playerIds).toEqual(["anna"]);
  });
});

describe("duos and lineup sizes", () => {
  const lineupList = lineups(squad);

  it("pairs squad members and sorts by matches together", () => {
    const pairs = duos(lineupList);
    expect(pairs[0]).toMatchObject({ ids: ["anna", "bohdan"], matches: 2, wins: 1, winRate: 50, lastPlayedAt: 3000 });
    expect(pairs.map((pair) => pair.ids.join("+"))).toEqual(["anna+bohdan", "anna+chris", "bohdan+chris"]);
  });

  it("lists the teammates of one player", () => {
    expect(teammates("chris", duos(lineupList))).toEqual([
      { id: "anna", matches: 1, wins: 1, winRate: 100 },
      { id: "bohdan", matches: 1, wins: 1, winRate: 100 },
    ]);
  });

  it("splits results by the number of squad members in the team", () => {
    expect(partySizes(lineupList)).toEqual([
      { size: 1, matches: 2, wins: 1, winRate: 50 },
      { size: 2, matches: 1, wins: 0, winRate: 0 },
      { size: 3, matches: 1, wins: 1, winRate: 100 },
    ]);
  });
});
