import { describe, expect, it } from "vitest";

import { matchRating, survivalRate } from "./rating";

const line = { rounds: 24, kills: 24, deaths: 16, doubleKills: 3, tripleKills: 1, quadroKills: 0, pentaKills: 0 };

describe("survivalRate", () => {
  it("is the share of rounds the player lived through", () => {
    expect(survivalRate({ rounds: 24, deaths: 18 })).toBe(25);
  });

  it("stays between 0 and 100", () => {
    expect(survivalRate({ rounds: 13, deaths: 15 })).toBe(0);
    expect(survivalRate({ rounds: 0, deaths: 0 })).toBe(0);
  });
});

describe("matchRating", () => {
  it("weighs kills, survival and multi-kill rounds per round", () => {
    expect(matchRating(line)).toBeCloseTo(1.253, 3);
  });

  it("rewards the same kills more when they come in multi-kill rounds", () => {
    expect(matchRating({ ...line, doubleKills: 0, tripleKills: 0, quadroKills: 1 })).toBeGreaterThan(
      matchRating({ ...line, doubleKills: 0, tripleKills: 0 }),
    );
  });

  it("is zero without rounds and never counts negative single kills", () => {
    expect(matchRating({ ...line, rounds: 0 })).toBe(0);
    const multiKillsOnly = (3 / 24 / 0.679 + (3 * 4 + 9) / 24 / 1.277) / 2.7;
    expect(matchRating({ ...line, kills: 3, deaths: 24 })).toBeCloseTo(multiKillsOnly, 5);
  });
});
