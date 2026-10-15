import { describe, expect, it } from "vitest";

import { makeMatch } from "@/test/factories";

import { leader, pickPair, rivalry, sharedMatches } from "./compare";

describe("sharedMatches", () => {
  const together = makeMatch({ id: "together", finishedAt: 3000, won: true });
  const derby = makeMatch({ id: "derby", finishedAt: 2000, won: true });
  const first = [derby, together, makeMatch({ id: "solo", finishedAt: 1000 })];
  const second = [
    { ...together, kills: 9 },
    { ...derby, won: false },
  ];

  it("finds the matches both players played, newest first", () => {
    const shared = sharedMatches(first, second);
    expect(shared.map((match) => [match.id, match.together])).toEqual([
      ["together", true],
      ["derby", false],
    ]);
    expect(shared[0]?.second.kills).toBe(9);
  });

  it("counts wins together and head to head", () => {
    expect(rivalry(sharedMatches(first, second))).toEqual({
      together: { matches: 1, wins: 1 },
      against: { matches: 1, firstWins: 1, secondWins: 0 },
    });
  });
});

describe("leader", () => {
  it("names the better value", () => {
    expect(leader(1.2, 0.9)).toBe("first");
    expect(leader(1.2, 1.4)).toBe("second");
    expect(leader(40, 30, false)).toBe("second");
  });

  it("has no leader on a tie or without data", () => {
    expect(leader(1, 1)).toBeNull();
    expect(leader(null, 1)).toBeNull();
  });
});

describe("pickPair", () => {
  const nicknames = ["sacrificed", "Nitron", "z0nGa"];

  it("matches nicknames regardless of case", () => {
    expect(pickPair(nicknames, "nitron", "Z0NGA")).toEqual(["Nitron", "z0nGa"]);
  });

  it("fills in missing, unknown or repeated players", () => {
    expect(pickPair(nicknames, null, null)).toEqual(["sacrificed", "Nitron"]);
    expect(pickPair(nicknames, "ghost", "z0nGa")).toEqual(["sacrificed", "z0nGa"]);
    expect(pickPair(nicknames, "z0nGa", null)).toEqual(["z0nGa", "sacrificed"]);
    expect(pickPair(nicknames, "Nitron", "nitron")).toEqual(["Nitron", "sacrificed"]);
  });

  it("needs at least two players", () => {
    expect(pickPair(["solo"], null, null)).toBeNull();
  });
});
