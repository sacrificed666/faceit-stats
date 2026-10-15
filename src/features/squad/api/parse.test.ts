import { describe, expect, it } from "vitest";

import { LIFETIME, matchItem, PROFILE } from "@/test/faceit";

import {
  buildPlayer,
  parseLifetime,
  parseMapSegments,
  parseMatch,
  parseMatches,
  parseProfile,
  parseRanking,
} from "./parse";

describe("parseProfile", () => {
  it("reads the CS2 profile", () => {
    expect(parseProfile(PROFILE)).toEqual({
      id: PROFILE.player_id,
      nickname: "sacrificed",
      avatar: PROFILE.avatar,
      country: "ua",
      elo: 2404,
      level: 10,
      region: "EU",
      steamId: "76561199147388137",
    });
  });

  it("rejects responses without an id or nickname", () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile({ nickname: "ghost" })).toBeNull();
    expect(parseProfile("not json")).toBeNull();
  });

  it("drops images from unknown hosts and invalid fields", () => {
    const profile = parseProfile({
      ...PROFILE,
      avatar: "https://evil.example.com/a.png",
      country: "Ukraine",
      steam_id_64: "STEAM_0:1:1",
      games: {},
    });
    expect(profile).toMatchObject({ avatar: null, country: null, steamId: null, elo: 0, level: 0, region: null });
  });
});

describe("parseMatch", () => {
  it("puts the player's own team score first", () => {
    expect(parseMatch(matchItem().stats)).toMatchObject({
      id: "1-194343b4-6a43-443b-87dd-5ae99b90ed13",
      map: "de_ancient",
      won: false,
      teamScore: 10,
      opponentScore: 13,
      rounds: 23,
      kills: 9,
      kd: 0.43,
      adr: 56.3,
      hsPercent: 78,
    });
  });

  it("adds the rating and the share of rounds survived", () => {
    const match = parseMatch(matchItem({ "Double Kills": "2", "Triple Kills": "1" }).stats);
    expect(match).toMatchObject({ doubleKills: 2, tripleKills: 1 });
    expect(match?.survival).toBeCloseTo(8.7, 1);
    expect(match?.rating).toBeCloseTo(0.524, 3);
  });

  it("derives the team score from the result when the final score is missing", () => {
    const stats = matchItem({ Result: "1", Score: "13 / 7" }).stats;
    const { ["Final Score"]: _omitted, ...withoutFinal } = stats;
    expect(parseMatch(withoutFinal)).toMatchObject({ won: true, teamScore: 13, opponentScore: 7 });
  });

  it("skips other game modes and broken rows", () => {
    expect(parseMatch(matchItem({ "Game Mode": "Wingman" }).stats)).toBeNull();
    expect(parseMatch(matchItem({ "Match Id": "" }).stats)).toBeNull();
    expect(parseMatch(null)).toBeNull();
  });

  it("removes duplicates and sorts the newest match first", () => {
    const matches = parseMatches({
      items: [
        matchItem({ "Match Id": "old", "Match Finished At": 1000 }),
        matchItem({ "Match Id": "new", "Match Finished At": 3000 }),
        matchItem({ "Match Id": "old", "Match Finished At": 1000 }),
        matchItem({ "Match Id": "wingman", "Game Mode": "Wingman" }),
      ],
    });
    expect(matches.map((match) => match.id)).toEqual(["new", "old"]);
    expect(parseMatches(null)).toEqual([]);
  });
});

describe("lifetime statistics", () => {
  it("turns rates into percentages", () => {
    expect(parseLifetime(LIFETIME)).toEqual({
      matches: 1838,
      winRate: 51,
      longestWinStreak: 14,
      kd: 1.21,
      hsPercent: 48,
      adr: 82.43,
      entryRate: 20,
      entrySuccessRate: 53,
      oneVsOneWinRate: 38,
      oneVsTwoWinRate: 20,
      flashSuccessRate: 52,
      utilityDamagePerRound: 4.89,
      sniperKillRate: 13,
    });
    expect(parseLifetime({})).toBeNull();
  });

  it("keeps 5v5 map segments with matches, most played first", () => {
    expect(parseMapSegments(LIFETIME)).toEqual([
      { map: "de_mirage", matches: 120, winRate: 51, kd: 1.1, adr: null, hsPercent: 47, image: null },
      {
        map: "de_dust2",
        matches: 40,
        winRate: 55,
        kd: 1.3,
        adr: 88.1,
        hsPercent: 50,
        image: "https://distribution.faceit-cdn.net/images/dust2.jpeg",
      },
    ]);
  });

  it("reads the region ranking", () => {
    expect(parseRanking({ position: 65_552 })).toBe(65_552);
    expect(parseRanking({ position: 0 })).toBeNull();
    expect(parseRanking(null)).toBeNull();
  });
});

describe("buildPlayer", () => {
  it("combines all sources into one player", () => {
    const profile = parseProfile(PROFILE);
    if (!profile) throw new Error("The profile fixture must parse");
    const player = buildPlayer(profile, {
      matches: { items: [matchItem()] },
      lifetime: LIFETIME,
      ranking: { position: 12 },
    });
    expect(player).toMatchObject({ nickname: "sacrificed", regionRank: 12 });
    expect(player.matches).toHaveLength(1);
    expect(player.maps).toHaveLength(2);
    expect(player.lifetime?.matches).toBe(1838);
  });
});
