import { cacheLife } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LIFETIME, matchItem, PROFILE } from "@/test/faceit";

import { getSquad, squadNicknames } from "./loader";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn<(profile: string) => void>(),
  cacheTag: vi.fn<(tag: string) => void>(),
}));

// A JSON response with a status
const respond = (status: number, body: unknown = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

interface FaceitMock {
  status?: number;
  avatarStatus?: number;
}

// Answers the FACEIT requests for the sample players
const mockFaceit = ({ status, avatarStatus = 200 }: FaceitMock = {}) => {
  const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(async (input, init) => {
    if (init?.method === "HEAD") return new Response(null, { status: avatarStatus });
    if (status) return respond(status);
    const url = new URL(input);
    if (url.pathname.endsWith("/players")) {
      const nickname = url.searchParams.get("nickname") ?? "";
      return nickname === "ghost" ? respond(404) : respond(200, { ...PROFILE, nickname, player_id: `id-${nickname}` });
    }
    if (url.pathname.endsWith("/games/cs2/stats")) return respond(200, { items: [matchItem()] });
    if (url.pathname.endsWith("/stats/cs2")) return respond(200, LIFETIME);
    if (url.pathname.includes("/rankings/")) return respond(200, { position: 42 });
    return respond(404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

// Waits for a promise while fake timers run
const settled = async <T>(promise: Promise<T>): Promise<T> => {
  const outcome = Promise.allSettled([promise]);
  await vi.runAllTimersAsync();
  const [result] = await outcome;
  if (result?.status !== "fulfilled") throw new Error("The squad could not be loaded");
  return result.value;
};

describe("getSquad", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("asks for configuration when variables are missing", async () => {
    vi.stubEnv("FACEIT_API_KEY", "");
    vi.stubEnv("FACEIT_PLAYERS", "");
    const fetchMock = mockFaceit();
    expect(await settled(getSquad())).toEqual({
      status: "unconfigured",
      missing: ["FACEIT_API_KEY", "FACEIT_PLAYERS"],
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });

  it("loads every player and reports the ones FACEIT does not know", async () => {
    vi.stubEnv("FACEIT_API_KEY", "secret");
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed, ghost, Nitron");
    mockFaceit();
    const squad = await settled(getSquad());
    expect(squad.status).toBe("ready");
    if (squad.status !== "ready") return;
    expect(squad.players.map((player) => player.nickname)).toEqual(["sacrificed", "Nitron"]);
    expect(squad.failed).toEqual([{ nickname: "ghost", reason: "not-found" }]);
    expect(squad.players[0]).toMatchObject({ regionRank: 42, avatar: PROFILE.avatar });
    expect(squad.players[0]?.matches).toHaveLength(1);
    expect(cacheLife).toHaveBeenCalledWith("faceit");
  });

  it("drops avatars the CDN cannot serve", async () => {
    vi.stubEnv("FACEIT_API_KEY", "secret");
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed");
    mockFaceit({ avatarStatus: 405 });
    const squad = await settled(getSquad());
    expect(squad.status === "ready" && squad.players[0]?.avatar).toBeNull();
  });

  it("reports a rejected API key", async () => {
    vi.stubEnv("FACEIT_API_KEY", "wrong");
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed");
    mockFaceit({ status: 401 });
    expect(await settled(getSquad())).toMatchObject({ status: "unavailable", reason: "unauthorized" });
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });

  it("reports an outage when no player could be loaded", async () => {
    vi.stubEnv("FACEIT_API_KEY", "secret");
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed");
    mockFaceit({ status: 503 });
    expect(await settled(getSquad())).toMatchObject({ status: "unavailable", reason: "unreachable" });
  });

  it("keeps the last published squad when FACEIT goes down in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("FACEIT_API_KEY", "secret");
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed");
    mockFaceit({ status: 503 });
    const outcome = Promise.allSettled([getSquad()]);
    await vi.runAllTimersAsync();
    expect((await outcome)[0]).toMatchObject({
      status: "rejected",
      reason: { message: expect.stringContaining("unreachable") },
    });
  });

  it("still explains an outage while the site is being built", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.stubEnv("FACEIT_API_KEY", "secret");
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed");
    mockFaceit({ status: 503 });
    expect(await settled(getSquad())).toMatchObject({ status: "unavailable", reason: "unreachable" });
  });

  it("lists canonical nicknames for static pages and falls back to the configuration", async () => {
    vi.stubEnv("FACEIT_API_KEY", "secret");
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed");
    mockFaceit();
    expect(await settled(squadNicknames())).toEqual(["sacrificed"]);
    mockFaceit({ status: 401 });
    expect(await settled(squadNicknames())).toEqual(["sacrificed"]);
  });
});
