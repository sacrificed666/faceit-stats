import { describe, expect, it } from "vitest";

import { RANGES } from "@/features/squad/model/range";
import { sampleSquad } from "@/test/squad";

import { contextFor, profileData, withoutDetails, withoutMaps } from "./profile";

const players = sampleSquad();
const [anna, bohdan] = players;
const data = profileData(players, anna!, Date.UTC(2026, 8, 20, 12));

describe("profileData", () => {
  it("keeps only what the profile shows about the rest of the squad", () => {
    expect(data.squad[1]).toEqual({
      id: bohdan!.id,
      nickname: "bohdan",
      avatar: null,
      country: "ua",
      elo: 1800,
      level: 8,
    });
  });

  it("prepares every range up front", () => {
    expect(data.ranges.map((entry) => entry.range)).toEqual([...RANGES]);
  });

  it("finds the squad mates of every match played together", () => {
    const context = contextFor(data, "20");
    expect(context?.mates.toSorted()).toEqual([
      ["shared-loss", [bohdan!.id]],
      ["shared-win", [bohdan!.id]],
    ]);
    expect(context?.teammates).toEqual([{ id: bohdan!.id, matches: 2, wins: 1, winRate: 50 }]);
  });

  it("narrows period ranges to the matches of those days", () => {
    expect(contextFor(data, "7d")?.mates).toEqual([["shared-loss", [bohdan!.id]]]);
    expect(contextFor(data, "7d")?.averages.kd).not.toBe(contextFor(data, "20")?.averages.kd);
  });
});

describe("slimmer players for the browser", () => {
  it("drops the lifetime and map details without touching the player", () => {
    expect(withoutDetails(anna!)).toMatchObject({ nickname: "anna", lifetime: null, maps: [] });
    expect(anna!.maps).toHaveLength(1);
  });

  it("keeps the lifetime numbers for the comparison", () => {
    expect(withoutMaps(anna!)).toMatchObject({ lifetime: { matches: 1838 }, maps: [] });
  });
});
