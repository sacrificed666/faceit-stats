import { describe, expect, it } from "vitest";

import { mapId, mapImages, mapKey, mapName } from "./maps";

describe("maps", () => {
  it("uses the official names of known maps", () => {
    expect(mapName("de_dust2")).toBe("Dust II");
    expect(mapName("de_mirage")).toBe("Mirage");
  });

  it("builds readable names for maps it does not know yet", () => {
    expect(mapName("de_eldorado")).toBe("Eldorado");
    expect(mapName("de_some_new_map")).toBe("Some New Map");
  });

  it("matches FACEIT segment labels to match map keys", () => {
    expect(mapId("de_dust2")).toBe(mapId("Dust 2"));
    expect(mapKey("Dust2")).toBe("de_dust2");
    expect(mapKey("Mirage")).toBe("de_mirage");
    expect(mapKey("Poseidon")).toBe("de_poseidon");
  });
});

// A map segment as the FACEIT API sends it
const segment = (map: string, image: string | null) => ({
  map,
  image,
  matches: 1,
  winRate: 50,
  kd: 1,
  adr: null,
  hsPercent: 40,
});

describe("mapImages", () => {
  it("takes the first picture of every map from the squad's lifetime stats", () => {
    expect(
      mapImages([
        { maps: [segment("de_mirage", "a.jpg"), segment("de_nuke", null)] },
        { maps: [segment("de_mirage", "b.jpg"), segment("de_nuke", "c.jpg")] },
      ]),
    ).toEqual({ de_mirage: "a.jpg", de_nuke: "c.jpg" });
  });
});
