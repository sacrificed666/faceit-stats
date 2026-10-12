import { describe, expect, it } from "vitest";

import { makeMatch } from "@/test/factories";

import { activityFeed } from "./activity";

// The players on each side of every match
const sides = (feed: ReturnType<typeof activityFeed>) =>
  feed.map((entry) => entry.sides.map((side) => [side.won, side.players.map((player) => player.playerId)]));

describe("activityFeed", () => {
  it("shows a match played together once, newest first", () => {
    const shared = makeMatch({ id: "shared", finishedAt: 3000 });
    const feed = activityFeed([
      { id: "anna", matches: [shared, makeMatch({ id: "solo", finishedAt: 1000 })] },
      { id: "bohdan", matches: [{ ...shared, kills: 9 }] },
    ]);
    expect(feed.map((entry) => entry.matchId)).toEqual(["shared", "solo"]);
    expect(sides(feed)[0]).toEqual([[true, ["anna", "bohdan"]]]);
    expect(feed[0]?.sides[0]?.players[1]?.match.kills).toBe(9);
  });

  it("splits squad members who played against each other, larger side first", () => {
    const loss = makeMatch({ id: "derby", won: false, teamScore: 10, opponentScore: 13 });
    const win = { ...loss, won: true, teamScore: 13, opponentScore: 10 };
    const feed = activityFeed([
      { id: "anna", matches: [loss] },
      { id: "bohdan", matches: [win] },
      { id: "chris", matches: [win] },
    ]);
    expect(sides(feed)).toEqual([
      [
        [true, ["bohdan", "chris"]],
        [false, ["anna"]],
      ],
    ]);
    expect(feed[0]?.sides.map((side) => side.teamScore)).toEqual([13, 10]);
  });

  it("puts the winners first when both sides are the same size", () => {
    const loss = makeMatch({ id: "derby", won: false });
    const feed = activityFeed([
      { id: "anna", matches: [loss] },
      { id: "bohdan", matches: [{ ...loss, won: true }] },
    ]);
    expect(sides(feed)).toEqual([
      [
        [true, ["bohdan"]],
        [false, ["anna"]],
      ],
    ]);
  });

  it("lists a player once when a match repeats", () => {
    const match = makeMatch({ id: "repeat" });
    expect(sides(activityFeed([{ id: "anna", matches: [match, match] }]))).toEqual([[[true, ["anna"]]]]);
  });
});
