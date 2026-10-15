import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFaceitClient, FaceitError, request } from "./faceit";

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

// A JSON response with a status
const respond = (status: number, body: unknown = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// Waits for a promise while fake timers run
const settle = async <T>(promise: Promise<T>): Promise<PromiseSettledResult<T>> => {
  const outcome = Promise.allSettled([promise]);
  await vi.runAllTimersAsync();
  const [result] = await outcome;
  if (!result) throw new Error("The promise did not settle");
  return result;
};

describe("FACEIT client", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends the API key and returns the JSON body", async () => {
    const fetchMock = vi.fn<Fetch>().mockResolvedValue(respond(200, { nickname: "sacrificed" }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await settle(request("players?nickname=sacrificed", "secret"));
    expect(result).toEqual({ status: "fulfilled", value: { nickname: "sacrificed" } });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://open.faceit.com/data/v4/players?nickname=sacrificed",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer secret" }) }),
    );
  });

  it("returns null for unknown players", async () => {
    vi.stubGlobal("fetch", vi.fn<Fetch>().mockResolvedValue(respond(404)));
    expect(await settle(request("players?nickname=ghost", "secret"))).toEqual({ status: "fulfilled", value: null });
  });

  it("fails fast when FACEIT rejects the key", async () => {
    const fetchMock = vi.fn<Fetch>().mockResolvedValue(respond(401));
    vi.stubGlobal("fetch", fetchMock);
    const result = await settle(request("players?nickname=sacrificed", "wrong"));
    expect(result).toEqual({ status: "rejected", reason: expect.any(FaceitError) });
    expect(result).toMatchObject({ reason: { kind: "unauthorized", status: 401 } });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("retries rate limited requests and then gives up", async () => {
    const fetchMock = vi.fn<Fetch>().mockResolvedValue(respond(429));
    vi.stubGlobal("fetch", fetchMock);
    const result = await settle(request("players?nickname=sacrificed", "secret"));
    expect(result).toMatchObject({ status: "rejected", reason: { kind: "rate-limited", status: 429 } });
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("recovers from a temporary failure", async () => {
    const fetchMock = vi
      .fn<Fetch>()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(respond(503))
      .mockResolvedValueOnce(respond(200, { position: 7 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await settle(request("rankings", "secret"))).toEqual({ status: "fulfilled", value: { position: 7 } });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("reports network failures as unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn<Fetch>().mockRejectedValue(new TypeError("fetch failed")));
    expect(await settle(request("players?nickname=sacrificed", "secret"))).toMatchObject({
      status: "rejected",
      reason: { kind: "unreachable", status: null },
    });
  });

  it("builds the endpoint paths", async () => {
    const fetchMock = vi.fn<Fetch>().mockResolvedValue(respond(200));
    vi.stubGlobal("fetch", fetchMock);
    const client = createFaceitClient("secret");
    await settle(
      Promise.all([
        client.player("s1mple"),
        client.matches("abc"),
        client.lifetime("abc"),
        client.ranking("EU", "abc"),
      ]),
    );
    expect(fetchMock.mock.calls.map(([url]) => url.replace("https://open.faceit.com/data/v4/", ""))).toEqual([
      "players?nickname=s1mple",
      "players/abc/games/cs2/stats?offset=0&limit=100",
      "players/abc/stats/cs2",
      "rankings/games/cs2/regions/EU/players/abc?limit=1",
    ]);
  });
});
