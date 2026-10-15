import { describe, expect, it } from "vitest";

import { makeMatch } from "@/test/factories";

import { EMPTY_SUMMARY, rank, rollingAverage, summarize } from "./stats";

describe("summarize", () => {
  it("returns an empty summary without matches", () => {
    expect(summarize([])).toBe(EMPTY_SUMMARY);
  });

  it("averages per-match ratios and totals the rest", () => {
    const summary = summarize([
      makeMatch({ won: true, kd: 2, kr: 1, adr: 100, hsPercent: 60, kills: 30, mvps: 4, pentaKills: 1 }),
      makeMatch({ won: false, kd: 0.5, kr: 0.4, adr: 60, hsPercent: 40, kills: 10, mvps: 1, tripleKills: 2 }),
    ]);
    expect(summary).toMatchObject({
      matches: 2,
      wins: 1,
      losses: 1,
      winRate: 50,
      kd: 1.25,
      kr: 0.7,
      adr: 80,
      hsPercent: 50,
      kills: 20,
      mvps: 5,
      tripleKills: 2,
      pentaKills: 1,
    });
  });
});

describe("rank", () => {
  it("gives tied values the same rank and skips the next places", () => {
    const ranks = rank([
      { id: "a", value: 3 },
      { id: "b", value: 5 },
      { id: "c", value: 5 },
      { id: "d", value: 1 },
    ]);
    expect(Object.fromEntries(ranks)).toEqual({ b: 1, c: 1, a: 3, d: 4 });
  });
});

describe("rollingAverage", () => {
  it("averages a sliding window and shortens it at the start", () => {
    expect(rollingAverage([1, 2, 3, 4, 5, 6], 3)).toEqual([1, 1.5, 2, 3, 4, 5]);
  });
});
