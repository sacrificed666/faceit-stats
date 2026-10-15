import { describe, expect, it } from "vitest";

import { isIndexable, siteUrl } from "./site";

describe("siteUrl", () => {
  it("prefers an explicit address, then the Vercel production domain", () => {
    expect(siteUrl({ SITE_URL: "https://stats.example.com" }).href).toBe("https://stats.example.com/");
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "faceit-stats.vercel.app" }).href).toBe(
      "https://faceit-stats.vercel.app/",
    );
    expect(siteUrl({ PORT: "3100" }).href).toBe("http://localhost:3100/");
  });
});

describe("isIndexable", () => {
  it("keeps preview deployments out of search results", () => {
    expect(isIndexable({})).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
  });

  it("follows APP_ENV in Docker", () => {
    expect(isIndexable({ APP_ENV: "production" })).toBe(true);
    expect(isIndexable({ APP_ENV: "staging" })).toBe(false);
    expect(isIndexable({ APP_ENV: "development" })).toBe(false);
  });
});
