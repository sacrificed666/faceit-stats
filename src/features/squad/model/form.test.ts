import { describe, expect, it } from "vitest";

import { makeMatch } from "@/test/factories";

import { currentStreak, longestStreak } from "./form";

// A won match
const win = () => makeMatch({ won: true });
// A lost match
const loss = () => makeMatch({ won: false });

describe("form", () => {
  it("has no streak without matches", () => {
    expect(currentStreak([])).toBeNull();
  });

  it("counts the current streak from the newest match", () => {
    expect(currentStreak([win(), win(), loss(), win()])).toEqual({ won: true, length: 2 });
    expect(currentStreak([loss(), loss(), loss()])).toEqual({ won: false, length: 3 });
  });

  it("finds the longest streak in chronological order", () => {
    expect(longestStreak([win(), win(), loss(), win(), win(), win()], true)).toBe(3);
    expect(longestStreak([win(), loss(), loss(), win()], false)).toBe(2);
  });
});
