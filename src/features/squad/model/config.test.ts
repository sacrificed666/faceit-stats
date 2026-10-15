import { describe, expect, it } from "vitest";

import { MAX_PLAYERS, missingVariables, parseNicknames, readSquadConfig } from "./config";
import { isRange, parseRange, rangeSpec } from "./range";

describe("parseNicknames", () => {
  it("splits on commas and whitespace", () => {
    expect(parseNicknames("sacrificed, JACKSONGG ,qsevennn\nNitron")).toEqual([
      "sacrificed",
      "JACKSONGG",
      "qsevennn",
      "Nitron",
    ]);
  });

  it("drops duplicates regardless of case and keeps the first spelling", () => {
    expect(parseNicknames("Nitron,nitron,NITRON,z0nGa")).toEqual(["Nitron", "z0nGa"]);
  });

  it("caps the squad size", () => {
    const many = Array.from({ length: MAX_PLAYERS + 5 }, (_, index) => `player${index}`).join(",");
    expect(parseNicknames(many)).toHaveLength(MAX_PLAYERS);
    expect(parseNicknames("")).toEqual([]);
    expect(readSquadConfig({}).nicknames).toEqual([]);
  });
});

describe("readSquadConfig", () => {
  it("trims the API key and reports missing variables", () => {
    const config = readSquadConfig({ FACEIT_API_KEY: "  key  ", FACEIT_PLAYERS: "sacrificed" });
    expect(config).toEqual({ apiKey: "key", nicknames: ["sacrificed"] });
    expect(missingVariables(config)).toEqual([]);
  });

  it("treats blank values as missing", () => {
    const config = readSquadConfig({ FACEIT_API_KEY: " ", FACEIT_PLAYERS: " , " });
    expect(missingVariables(config)).toEqual(["FACEIT_API_KEY", "FACEIT_PLAYERS"]);
  });
});

describe("ranges", () => {
  it("accepts only the offered periods and match counts", () => {
    expect(isRange("50")).toBe(true);
    expect(isRange("30d")).toBe(true);
    expect(isRange("5")).toBe(false);
    expect(isRange(50)).toBe(false);
    expect(parseRange("100")).toBe("100");
    expect(parseRange("7d")).toBe("7d");
    expect(parseRange("abc")).toBeNull();
    expect(parseRange(null)).toBeNull();
  });

  it("describes each range", () => {
    expect(rangeSpec("90d")).toEqual({ unit: "days", count: 90 });
    expect(rangeSpec("20")).toEqual({ unit: "matches", count: 20 });
  });
});
