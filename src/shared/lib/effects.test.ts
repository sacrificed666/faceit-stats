import { describe, expect, it } from "vitest";

import { isEffects, prefersRichEffects, resolveEffects } from "./effects";

describe("effects", () => {
  it("resolves auto from the device and keeps explicit levels", () => {
    expect(resolveEffects("auto", true)).toBe("full");
    expect(resolveEffects("auto", false)).toBe("reduced");
    expect(resolveEffects("full", false)).toBe("full");
    expect(resolveEffects("reduced", true)).toBe("reduced");
  });

  it("prefers rich effects only on Apple devices", () => {
    expect(prefersRichEffects("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(true);
    expect(prefersRichEffects("Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)")).toBe(true);
    expect(prefersRichEffects("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(false);
    expect(prefersRichEffects("Mozilla/5.0 (Linux; Android 16; Pixel 9)")).toBe(false);
  });

  it("accepts only known preferences", () => {
    expect(isEffects("reduced")).toBe(true);
    expect(isEffects("lite")).toBe(false);
    expect(isEffects(null)).toBe(false);
  });
});
