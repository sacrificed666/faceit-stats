import { describe, expect, it } from "vitest";

import { niceScale, position } from "./scale";

describe("niceScale", () => {
  it("rounds the domain to friendly ticks that start at zero", () => {
    expect(niceScale([0.43, 2.08], 3)).toEqual({ domain: [0, 3], ticks: [0, 1, 2, 3] });
    expect(niceScale([55.9, 119.8], 4)).toEqual({ domain: [0, 150], ticks: [0, 50, 100, 150] });
  });

  it("supports decimal steps", () => {
    expect(niceScale([0.19, 0.95], 4)).toEqual({ domain: [0, 1], ticks: [0, 0.25, 0.5, 0.75, 1] });
  });

  it("can leave zero out", () => {
    expect(niceScale([1400, 1700], 3, false)).toEqual({ domain: [1400, 1700], ticks: [1400, 1500, 1600, 1700] });
  });

  it("falls back to a unit domain without values", () => {
    expect(niceScale([])).toEqual({ domain: [0, 1], ticks: [0, 0.25, 0.5, 0.75, 1] });
  });
});

describe("position", () => {
  it("places a value inside the domain", () => {
    expect(position(5, [0, 10])).toBe(0.5);
    expect(position(3, [3, 3])).toBe(0.5);
  });
});
