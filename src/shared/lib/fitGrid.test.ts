import { describe, expect, it } from "vitest";

import { fitColumns, fitGrid } from "./fitGrid";

describe("fitColumns", () => {
  it("picks the column count that leaves no hole, the widest on a tie", () => {
    expect(fitColumns(10, [4, 5])).toBe(5);
    expect(fitColumns(10, [2, 3])).toBe(2);
    expect(fitColumns(8, [4, 5])).toBe(4);
    expect(fitColumns(9, [3, 4])).toBe(3);
  });

  it("counts a short last row that shares the width as full", () => {
    expect(fitColumns(10, [3, 4])).toBe(4);
    expect(fitColumns(7, [3, 4])).toBe(4);
  });
});

describe("fitGrid", () => {
  it("sets the columns per breakpoint and widens the cards of a short last row", () => {
    const grid = fitGrid(10, { md: [2, 3], lg: [3, 4], xl: [4, 5] });
    expect(grid.list).toEqual({ "--cols-md": 2, "--cols-lg": 4, "--cols-xl": 5 });
    expect(grid.item(0)).toBeUndefined();
    expect(grid.item(8)).toEqual({ "--span-lg": 2 });
    expect(grid.item(9)).toEqual({ "--span-lg": 2 });
  });
});
