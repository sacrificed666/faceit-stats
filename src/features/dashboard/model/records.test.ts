import { describe, expect, it } from "vitest";

import { makeMatch } from "@/test/factories";

import { longestWinStreak, matchRecord, mostAces } from "./records";

describe("match records", () => {
  it("finds the best single match across the squad", () => {
    const best = makeMatch({ kills: 41 });
    const record = matchRecord("kills", [
      { id: "anna", matches: [makeMatch({ kills: 20 })] },
      { id: "bohdan", matches: [best, makeMatch({ kills: 12 })] },
    ]);
    expect(record).toMatchObject({ kind: "kills", playerId: "bohdan", value: 41 });
    expect(record?.match).toBe(best);
  });

  it("prefers the more recent match on a tie", () => {
    const older = makeMatch({ mvps: 6, finishedAt: 1000 });
    const newer = makeMatch({ mvps: 6, finishedAt: 2000 });
    expect(matchRecord("mvps", [{ id: "anna", matches: [older, newer] }])?.match).toBe(newer);
  });

  it("finds the best rating over a full match", () => {
    const short = makeMatch({ rating: 2.4, rounds: 10 });
    const full = makeMatch({ rating: 1.8, rounds: 24 });
    expect(matchRecord("rating", [{ id: "anna", matches: [short, full] }])?.match).toBe(full);
  });

  it("ignores headshot rates from low-kill matches", () => {
    const lucky = makeMatch({ hsPercent: 100, kills: 3 });
    const solid = makeMatch({ hsPercent: 70, kills: 22 });
    expect(matchRecord("headshots", [{ id: "anna", matches: [lucky, solid] }])?.match).toBe(solid);
  });

  it("has no record when nothing qualifies", () => {
    expect(matchRecord("kd", [{ id: "anna", matches: [makeMatch({ rounds: 9 })] }])).toBeNull();
    expect(matchRecord("mvps", [{ id: "anna", matches: [makeMatch({ mvps: 0 })] }])).toBeNull();
  });
});

// Matches with these results
const fromResults = (results: boolean[]) => results.map((won) => makeMatch({ won }));

describe("player records", () => {
  it("finds the longest win streak", () => {
    expect(
      longestWinStreak([
        { id: "anna", matches: fromResults([true, true, false, true]) },
        { id: "bohdan", matches: fromResults([false, true, true, true]) },
      ]),
    ).toEqual({ playerId: "bohdan", value: 3 });
  });

  it("counts aces", () => {
    expect(
      mostAces([
        { id: "anna", matches: [makeMatch({ pentaKills: 1 }), makeMatch({ pentaKills: 1 })] },
        { id: "bohdan", matches: [makeMatch({ pentaKills: 1 })] },
      ]),
    ).toEqual({ playerId: "anna", value: 2 });
    expect(mostAces([{ id: "anna", matches: [makeMatch()] }])).toBeNull();
  });
});
