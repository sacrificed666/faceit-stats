import { afterEach, describe, expect, it, vi } from "vitest";

import { getSquad } from "@/features/squad/api/loader";
import type { SquadSnapshot } from "@/features/squad/model/types";
import { makePlayer } from "@/test/factories";

import { GET } from "./route";

vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/features/squad/api/loader", () => ({ getSquad: vi.fn<() => Promise<SquadSnapshot>>() }));

describe("GET /healthz/squad", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("tells how many players loaded and how old the data is", async () => {
    vi.useFakeTimers({ now: Date.parse("2026-10-10T12:10:00Z") });
    vi.mocked(getSquad).mockResolvedValue({
      status: "ready",
      players: [makePlayer()],
      failed: [{ nickname: "gone", reason: "not-found" }],
      updatedAt: Date.parse("2026-10-10T12:00:00Z"),
    });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      status: "ready",
      players: 1,
      failed: 1,
      updatedAt: "2026-10-10T12:00:00.000Z",
      ageSeconds: 600,
    });
  });

  it("fails while the squad is unavailable or cannot load", async () => {
    vi.mocked(getSquad).mockResolvedValueOnce({ status: "unavailable", reason: "unauthorized", updatedAt: 0 });
    const unavailable = await GET();
    expect(unavailable.status).toBe(503);
    await expect(unavailable.json()).resolves.toEqual({ status: "unavailable" });

    vi.mocked(getSquad).mockRejectedValueOnce(new Error("FACEIT is down"));
    const broken = await GET();
    expect(broken.status).toBe(503);
    await expect(broken.json()).resolves.toEqual({ status: "error" });
  });
});
