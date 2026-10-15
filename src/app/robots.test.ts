import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "./robots";

describe("robots.txt", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows every page and points to the sitemap", () => {
    vi.stubEnv("SITE_URL", "https://faceit.example");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://faceit.example/sitemap.xml",
      host: "https://faceit.example",
    });
  });

  it("keeps preview deployments out of search engines", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
