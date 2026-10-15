import { afterEach, describe, expect, it, vi } from "vitest";

import type { SquadSnapshot } from "@/features/squad/model/types";
import { LOCALES } from "@/shared/i18n/locales";
import { makePlayer } from "@/test/factories";

import sitemap from "./sitemap";

const getSquad = vi.hoisted(() => vi.fn<() => Promise<SquadSnapshot>>());

vi.mock("@/features/squad/api/loader", () => ({ getSquad }));

const UPDATED_AT = Date.UTC(2026, 9, 1);

describe("sitemap.xml", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lists the overview and the comparison in every language with their alternates", async () => {
    vi.stubEnv("SITE_URL", "https://faceit.example");
    getSquad.mockResolvedValue({ status: "unavailable", reason: "unreachable", updatedAt: UPDATED_AT });
    const entries = await sitemap();
    expect(entries.map((entry) => entry.url)).toEqual([
      ...LOCALES.map((locale) => `https://faceit.example/${locale}`),
      ...LOCALES.map((locale) => `https://faceit.example/${locale}/compare`),
    ]);
    expect(entries[0]?.lastModified).toBeUndefined();
    expect(entries[0]?.alternates?.languages).toMatchObject({
      uk: "https://faceit.example/uk",
      "x-default": "https://faceit.example/",
    });
  });

  it("lists every player with the avatar, escaped for XML", async () => {
    vi.stubEnv("SITE_URL", "https://faceit.example");
    const players = [makePlayer({ nickname: "anna", avatar: "https://cdn.example/a.jpg?w=1&h=1" })];
    getSquad.mockResolvedValue({ status: "ready", players, failed: [], updatedAt: UPDATED_AT });
    const entries = await sitemap();
    expect(entries).toHaveLength(LOCALES.length * 3);
    const anna = entries.find((entry) => entry.url === "https://faceit.example/de/players/anna");
    expect(anna).toMatchObject({
      lastModified: new Date(UPDATED_AT),
      priority: 0.8,
      images: ["https://cdn.example/a.jpg?w=1&amp;h=1"],
    });
  });
});
