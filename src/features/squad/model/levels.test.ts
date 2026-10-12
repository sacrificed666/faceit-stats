import { describe, expect, it } from "vitest";

import { LEVELS, levelForElo, levelOf, levelProgress } from "./levels";

describe("levels", () => {
  it("covers ten levels without gaps", () => {
    expect(LEVELS).toHaveLength(10);
    LEVELS.slice(1).forEach((level, index) => {
      expect(level.min).toBe((LEVELS[index]?.max ?? 0) + 1);
    });
  });

  it("maps ELO to the matching level", () => {
    expect([100, 500, 501, 1350, 1351, 2000, 2001, 3500].map((elo) => levelForElo(elo).level)).toEqual([
      1, 1, 2, 6, 7, 9, 10, 10,
    ]);
  });

  it("clamps unknown levels", () => {
    expect(levelOf(0).level).toBe(1);
    expect(levelOf(14).level).toBe(10);
    expect(levelOf(4).color).toBe("#ffc800");
  });

  it("measures the progress towards the next level", () => {
    const progress = levelProgress(1688);
    expect(progress.current.level).toBe(8);
    expect(progress.next?.level).toBe(9);
    expect(progress.eloToNext).toBe(63);
    expect(progress.progress).toBeCloseTo(157 / 220);
  });

  it("treats level 10 as complete", () => {
    expect(levelProgress(2404)).toMatchObject({ next: null, progress: 1, eloToNext: null });
  });
});
