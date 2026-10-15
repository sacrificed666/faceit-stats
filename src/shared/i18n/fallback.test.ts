import { describe, expect, it } from "vitest";

import { CATALOG } from "@/test/render";

import { FALLBACK_MESSAGES } from "./fallback";
import { LOCALES } from "./locales";
import { en } from "./messages/en";
import type { MessageKey } from "./translate";

describe("FALLBACK_MESSAGES", () => {
  it.each(LOCALES)("copies the %s catalog word for word", (locale) => {
    const keys = Object.keys(FALLBACK_MESSAGES.en).filter((key): key is MessageKey => Object.hasOwn(en, key));
    expect(FALLBACK_MESSAGES[locale]).toEqual(Object.fromEntries(keys.map((key) => [key, CATALOG[locale][key]])));
  });
});
