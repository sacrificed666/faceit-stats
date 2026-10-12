import { waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BOOT_SCRIPT } from "./boot";
import { EFFECTS_STORAGE_KEY } from "./effects";
import { DATE_FORMATS } from "./format";
import { SITE } from "./site";
import { THEME_STORAGE_KEY } from "./theme";

const FINISHED = "2026-10-03T21:30:00.000Z";

// Runs the boot script
const boot = (): void => {
  const script = document.createElement("script");
  script.textContent = BOOT_SCRIPT;
  document.head.append(script);
  script.remove();
};

// Says that the document has loaded
const loaded = (): void => {
  document.dispatchEvent(new Event("DOMContentLoaded"));
};

// A time element for the script to format
const time = (format: string, dateTime: string): HTMLTimeElement => {
  const element = document.createElement("time");
  element.dataset.format = format;
  element.dateTime = dateTime;
  element.textContent = "server";
  return element;
};

afterEach(() => {
  loaded();
  document.head.replaceChildren();
  document.body.replaceChildren();
  document.documentElement.lang = "";
  delete document.documentElement.dataset.pending;
});

describe("boot script", () => {
  it("restores a saved theme and ignores anything else", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    boot();
    expect(document.documentElement.dataset.theme).toBe("dark");

    delete document.documentElement.dataset.theme;
    localStorage.setItem(THEME_STORAGE_KEY, "purple");
    boot();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("applies the saved effects level or picks one for the device", () => {
    boot();
    expect(document.documentElement.dataset.effects).toBe("reduced");

    localStorage.setItem(EFFECTS_STORAGE_KEY, "full");
    boot();
    expect(document.documentElement.dataset.effects).toBe("full");

    localStorage.setItem(EFFECTS_STORAGE_KEY, "turbo");
    boot();
    expect(document.documentElement.dataset.effects).toBe("reduced");
  });

  it("marks the page as pending while the address selects other data", () => {
    window.history.replaceState(null, "", "/en?utm_source=chat");
    boot();
    expect(document.documentElement.dataset.pending).toBeUndefined();

    window.history.replaceState(null, "", "/en/compare?a=anna&b=bohdan");
    boot();
    expect(document.documentElement.dataset.pending).toBe("");
  });

  it("formats dates in the page language and the reader's time zone", async () => {
    document.documentElement.lang = "uk";
    boot();
    const element = time("datetime", FINISHED);
    document.body.append(element);
    const expected = new Intl.DateTimeFormat("uk-UA", DATE_FORMATS.datetime).format(Date.parse(FINISHED));
    await waitFor(() => expect(element).toHaveTextContent(expected));
  });

  it("formats relative times", async () => {
    document.documentElement.lang = "en";
    boot();
    const element = time("relative", new Date(Date.now() - 5 * 60_000).toISOString());
    document.body.append(element);
    await waitFor(() => expect(element).toHaveTextContent("5 minutes ago"));
  });

  it("colours the browser interface for a forced theme", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    boot();
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = SITE.themeColor.light;
    meta.media = "(prefers-color-scheme: light)";
    document.head.append(meta);
    await waitFor(() => expect(meta.content).toBe(SITE.themeColor.dark));
  });

  it("stops watching the page once it has loaded", async () => {
    boot();
    loaded();
    const element = time("date", FINISHED);
    document.body.append(element);
    await Promise.resolve();
    expect(element).toHaveTextContent("server");
  });
});
