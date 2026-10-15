import { describe, expect, it } from "vitest";

import { makePlayer } from "@/test/factories";

import { decodeNickname, findPlayer } from "./players";

describe("findPlayer", () => {
  const players = [makePlayer({ nickname: "JACKSONGG" }), makePlayer({ nickname: "z0nGa" })];

  it("finds squad members regardless of the case in the address", () => {
    expect(findPlayer(players, "jacksongg")?.nickname).toBe("JACKSONGG");
    expect(findPlayer(players, "Z0NGA")?.nickname).toBe("z0nGa");
    expect(findPlayer(players, "ghost")).toBeNull();
  });

  it("decodes escaped nicknames and tolerates broken escapes", () => {
    expect(decodeNickname("a%20b")).toBe("a b");
    expect(decodeNickname("100%")).toBe("100%");
  });
});
