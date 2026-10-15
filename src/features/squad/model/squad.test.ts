import { describe, expect, it } from "vitest";

import { makeMatch, makePlayer, newestFirst } from "@/test/factories";

import { averageElo, mapCells, mapColumns, metricRanks, squadAverage, trendSeries, viewPlayers } from "./squad";

const NOW = Date.UTC(2026, 9, 3);

const anna = makePlayer({
  elo: 2400,
  matches: newestFirst([
    makeMatch({ map: "de_mirage", kd: 1.5, won: true }),
    makeMatch({ map: "de_mirage", kd: 0.5, won: false }),
    makeMatch({ map: "de_nuke", kd: 1, won: true }),
  ]),
});
const bohdan = makePlayer({ elo: 1800, matches: newestFirst([makeMatch({ map: "de_nuke", kd: 2, won: true })]) });
const idle = makePlayer({ elo: 1000, matches: [] });

describe("viewPlayers", () => {
  it("keeps only the newest matches of the range", () => {
    const busy = makePlayer({ matches: newestFirst(Array.from({ length: 25 }, () => makeMatch())) });
    const [view] = viewPlayers([busy], "20", NOW);
    expect(view?.matches).toHaveLength(20);
    expect(view?.matches[0]).toBe(busy.matches[0]);
  });

  it("keeps the matches of the last days when the range is a period", () => {
    const DAY = 86_400_000;
    const player = makePlayer({
      matches: [
        makeMatch({ finishedAt: NOW - DAY }),
        makeMatch({ finishedAt: NOW - 6 * DAY }),
        makeMatch({ finishedAt: NOW - 8 * DAY }),
        makeMatch({ finishedAt: NOW - 40 * DAY }),
      ],
    });
    expect(viewPlayers([player], "7d", NOW)[0]?.matches).toHaveLength(2);
    expect(viewPlayers([player], "30d", NOW)[0]?.matches).toHaveLength(3);
    expect(viewPlayers([player], "90d", NOW)[0]?.matches).toHaveLength(4);
  });

  it("summarises the matches and the current streak", () => {
    const [view] = viewPlayers([anna], "20", NOW);
    expect(view?.summary.matches).toBe(3);
    expect(view?.summary.kd).toBeCloseTo(1);
    expect(view?.streak).toEqual({ won: true, length: 1 });
  });
});

describe("squad helpers", () => {
  const views = viewPlayers([anna, bohdan, idle], "20", NOW);

  it("averages players who played, each counted once", () => {
    expect(squadAverage(views, "kd")).toBeCloseTo(1.5);
    expect(averageElo(views)).toBeCloseTo(1733.33, 1);
  });

  it("ranks players by a metric and leaves inactive players out", () => {
    const ranks = metricRanks(views, "kd");
    expect(ranks.get(bohdan.id)).toBe(1);
    expect(ranks.get(anna.id)).toBe(2);
    expect(ranks.has(idle.id)).toBe(false);
  });

  it("ranks ELO for every player, because it does not depend on the range", () => {
    const ranks = metricRanks(views, "elo");
    expect(ranks.get(anna.id)).toBe(1);
    expect(ranks.get(idle.id)).toBe(3);
  });

  it("orders map columns by how often the squad plays them", () => {
    expect(mapColumns(views)).toEqual([
      { map: "de_mirage", name: "Mirage", matches: 2 },
      { map: "de_nuke", name: "Nuke", matches: 2 },
    ]);
  });

  it("summarises each map for a player", () => {
    const cells = mapCells(views[0]!);
    expect(cells.get("de_mirage")).toMatchObject({ matches: 2, winRate: 50, kd: 1 });
    expect(cells.get("de_nuke")).toMatchObject({ matches: 1, winRate: 100 });
  });

  it("builds chronological trend series with a rolling average", () => {
    const trend = trendSeries(anna.matches, "kd");
    expect(trend.perMatch).toEqual([1.5, 0.5, 1]);
    expect(trend.rolling).toEqual([1.5, 1, 1]);
    expect(trend.matches.map((match) => match.map)).toEqual(["de_mirage", "de_mirage", "de_nuke"]);
  });
});
